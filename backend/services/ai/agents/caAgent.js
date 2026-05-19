// CA Agent
// Kaam: GST, ITR, Tax, Audit queries handle karna
// Files used:
//   llmRouter.js        → LLM call karne ke liye
//   caPrompt.js         → system prompt
//   complianceTools.js  → GST/Tax/Audit tool definitions
//   toonEngine.js       → results compress karna
//   Gst/Tax/Audit Model → MongoDB compliance data

const { callLLM } = require("../router/llmRouter")
const { CA_PROMPT } = require("../prompts/caPrompt")
const { COMPLIANCE_TOOLS } = require("../tools/complianceTools")
const { compress, isTabular } = require("../toon/toonEngine")
const Gst = require("../../../models/ca/gstModel")
const Tax = require("../../../models/ca/taxModel")
const Audit = require("../../../models/ca/auditModel")

// ── Constants ──
// Magic numbers ko ek jagah rakho — kal ko change karna ho to ek line
const CONFIG = {
    MAX_ITERATIONS: 5,        // Tool loop ki upper limit (infinite loop se bachao)
    DEFAULT_LIMIT: 10,        // MongoDB query ka default limit
}

// Har model ke liye konsi fields select karni hain (token save)
// Constants mein hain taaki kal ko field add karni ho to ek jagah ho
// 
// IMPORTANT: Ye fields actual MongoDB schemas se match karte hain
// gstModel:    gstNumber, returnType, period, status, totalTax, filedAt
// taxModel:    financialYear, itrType, status, taxPayable, taxPaid, filedAt
// auditModel:  auditType, financialYear, status, completedAt
const FIELDS = {
    gst: "gstNumber returnType period status totalTax filedAt",
    tax: "financialYear itrType status taxPayable taxPaid filedAt",
    audit: "auditType financialYear status completedAt",
}

// Complexity → model tier mapping
// Ye function modelConfig.js mein move ho sakta hai (advocateAgent bhi reuse karega)
const _getTierForComplexity = (complexity) => {
    if (complexity === "high") return "large"
    return "medium"
}

// ── Helper: List Query Builder ──
// Pattern jo har list tool mein same tha — ab ek hi jagah
// Model = Mongoose model (Gst/Tax/Audit)
// args = LLM se aaye arguments
// fields = konsi fields select karni hain
// extraFilters = optional filters (jaise returnType GST mein)
const _runListQuery = async (Model, args, userId, fields, extraFilters = {}) => {

    const filter = { userId, ...extraFilters }

    // "all" matlab koi filter nahi — DB query mein add mat karo
    if (args.status && args.status !== "all") {
        filter.status = args.status
    }

    const docs = await Model.find(filter)
        .limit(args.limit || CONFIG.DEFAULT_LIMIT)
        .select(fields)
        .lean()

    const result = { count: docs.length, items: docs }

    // TOON compress agar tabular hai (token save)
    if (isTabular(docs)) {
        result.items = compress(docs)
    }

    return result
}

// ── Helper: Single Document Fetch ──
// Pattern jo get_*_details mein same tha
const _runGetQuery = async (Model, id, userId, notFoundMsg) => {
    const doc = await Model.findOne({ _id: id, userId }).lean()
    if (!doc) return { error: notFoundMsg }
    return doc
}

// ── Tool Registry ──
// If-else chain ki jagah object lookup — clean aur scalable
// Har tool ek function hai jo (args, userId) leta hai
// Naya tool add karna ho? Bas yahan ek entry add karo
const TOOL_HANDLERS = {

    list_gst_filings: async (args, userId) => {
        // GST mein ek extra filter — returnType
        const extra = {}
        if (args.returnType && args.returnType !== "all") {
            extra.returnType = args.returnType
        }
        return _runListQuery(Gst, args, userId, FIELDS.gst, extra)
    },

    get_gst_details: async (args, userId) => {
        return _runGetQuery(Gst, args.gstId, userId, "GST filing not found")
    },

    list_tax_filings: async (args, userId) => {
        // Tax mein ek extra filter — itrType
        const extra = {}
        if (args.itrType && args.itrType !== "all") {
            extra.itrType = args.itrType
        }
        return _runListQuery(Tax, args, userId, FIELDS.tax, extra)
    },

    get_tax_details: async (args, userId) => {
        return _runGetQuery(Tax, args.taxId, userId, "Tax filing not found")
    },

    list_audits: async (args, userId) => {
        // Audit mein ek extra filter — auditType
        const extra = {}
        if (args.auditType && args.auditType !== "all") {
            extra.auditType = args.auditType
        }
        return _runListQuery(Audit, args, userId, FIELDS.audit, extra)
    },

    get_audit_details: async (args, userId) => {
        return _runGetQuery(Audit, args.auditId, userId, "Audit record not found")
    },
}

// ── Tool Execute ──
// Object lookup — O(1), if-else chain se fast aur clean
// Try-catch — DB fail ho ya kuch bhi, request crash nahi karega
const _executeTool = async (toolName, args, userId) => {

    const handler = TOOL_HANDLERS[toolName]

    // Unknown tool — log karo taaki debug ho sake
    if (!handler) {
        console.error(`[caAgent] Unknown tool requested: ${toolName}`)
        return { error: `Unknown tool: ${toolName}` }
    }

    try {
        return await handler(args, userId)
    } catch (err) {
        // DB error, network error, kuch bhi — log + graceful error
        console.error(`[caAgent] Tool execution failed: ${toolName}`, err.message)
        return { error: `Tool execution failed: ${err.message}` }
    }
}

// ── Safe JSON Parse ──
// LLM kabhi-kabhi malformed JSON bhejta hai — crash nahi karna chahiye
const _safeJsonParse = (str) => {
    try {
        return JSON.parse(str)
    } catch (err) {
        console.error(`[caAgent] JSON parse failed:`, str)
        return {}  // Empty object — tool execute will handle missing args
    }
}

// ── Tool Calling Loop ──
// Kaam: LLM aur tools ke beech bridge
// LLM tool maange → execute karo → result wapas do → repeat
const _runToolLoop = async (messages, userId, complexity) => {

    const loopMessages = [...messages]
    const forceTier = _getTierForComplexity(complexity)

    for (let i = 0; i < CONFIG.MAX_ITERATIONS; i++) {

        const result = await callLLM({
            agentName: "ca",
            messages: loopMessages,
            systemPrompt: CA_PROMPT,
            tools: COMPLIANCE_TOOLS,
            forceTier,
        })

        // LLM ne tool maanga?
        if (result.toolCalls && result.toolCalls.length > 0) {

            // Assistant ka message history mein daalo
            loopMessages.push({
                role: "assistant",
                content: result.content || "",
                tool_calls: result.toolCalls,
            })

            // Har tool execute karo (parallel kar sakte hain — Promise.all)
            // Parallel = saare tools ek saath chalenge, fast
            const toolResults = await Promise.all(
                result.toolCalls.map(async (toolCall) => {
                    const toolName = toolCall.function.name
                    const args = _safeJsonParse(toolCall.function.arguments)
                    const toolResult = await _executeTool(toolName, args, userId)

                    return {
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolResult),
                    }
                })
            )

            // Saare tool results history mein daalo
            loopMessages.push(...toolResults)
            continue
        }

        // LLM ne koi tool nahi maanga — final answer aa gaya
        return result.content
    }

    // 5 iterations baad bhi answer nahi mila — kuch gadbad hai
    console.warn(`[caAgent] Max iterations reached for user: ${userId}`)
    return "Aapki request process nahi ho payi. Kripya thoda simple sawaal poochein ya dobara try karein."
}

// ── Main Function ──
const caAgent = async ({ query, history = [], userId, complexity = "medium" }) => {

    // Note: history slicing ideally hotMemory.js mein hona chahiye
    // Yahan abhi ke liye safety net rakha hai
    const messages = [
        ...history,
        { role: "user", content: query },
    ]

    return await _runToolLoop(messages, userId, complexity)
}

module.exports = { caAgent }