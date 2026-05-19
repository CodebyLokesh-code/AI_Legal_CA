// Advocate Agent
// Kaam: Legal cases, drafts, hearing queries handle karna
// Files used:
//   llmRouter.js        → LLM call karne ke liye
//   advocatePrompt.js   → system prompt
//   caseTools.js        → Case/Draft tool definitions
//   toonEngine.js       → results compress karna
//   Case Model          → MongoDB case data
//   Draft Model         → MongoDB draft data

const { callLLM } = require("../router/llmRouter")
const { ADVOCATE_PROMPT } = require("../prompts/advocatePrompt")
const { CASE_TOOLS } = require("../tools/caseTools")
const { compress, isTabular } = require("../toon/toonEngine")
const Case = require("../../../models/lawyer/caseModel")
const Draft = require("../../../models/lawyer/draftModel")

// ── Constants ──
const CONFIG = {
    MAX_ITERATIONS: 5,     // Tool loop ki upper limit
    DEFAULT_LIMIT: 10,     // MongoDB query ka default limit
}

// Har model ke liye konsi fields select karni hain (token save)
//
// IMPORTANT: Actual MongoDB schemas se match karte hain
// caseModel:  caseNumber, caseTitle, court, caseType, status, fillingDate
//             hearings[] → array (list mein sirf nextHearing dikhayenge)
// draftModel: title, type, status, isAIGenerated, caseId
//
// NOTE: hearings aur content (draft) heavy fields hain
//       list mein nahi chahiye — get_details mein milenge
const FIELDS = {
    // hearings nahi — heavy array, list mein zaroorat nahi
    // nextHearing manually compute karenge _getNextHearing se
    case: "caseNumber caseTitle court caseType status opposingParty fillingDate hearings",

    // content nahi — full legal document text ho sakta hai, bahut heavy
    // get_draft_details mein milega
    draft: "title type status isAIGenerated caseId createdAt",
}

// ── Helper: Next Hearing Date Nikalo ──
// hearings[] array mein se future ki sabse nazdik date nikalna
// Python mein: min(h['date'] for h in hearings if h['date'] > today)
const _getNextHearing = (hearings = []) => {
    const now = new Date()

    // Future hearings filter karo, phir sort karo ascending
    const upcoming = hearings
        .filter(h => h.date && new Date(h.date) > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))

    // Sabse pehli upcoming hearing return karo
    return upcoming.length > 0 ? upcoming[0] : null
}

// ── Helper: Cases ko list ke liye prepare karo ──
// hearings array heavy hota hai — list mein sirf next hearing dikhao
const _prepareCaseList = (cases) => {
    return cases.map(c => {
        const nextHearing = _getNextHearing(c.hearings)

        // hearings array hata do — heavy hai, list mein nahi chahiye
        // sirf nextHearing summary rakho
        const { hearings, ...caseData } = c

        return {
            ...caseData,
            nextHearing: nextHearing
                ? { date: nextHearing.date, nextDate: nextHearing.nextDate }
                : null,
            totalHearings: (hearings || []).length,
        }
    })
}

// ── Helper: List Query ──
// caAgent jaisa — DRY pattern
const _runListQuery = async (Model, args, userId, fields, extraFilters = {}) => {
    const filter = { userId, ...extraFilters }

    if (args.status && args.status !== "all") {
        filter.status = args.status
    }

    const docs = await Model.find(filter)
        .limit(args.limit || CONFIG.DEFAULT_LIMIT)
        .select(fields)
        .lean()

    return docs
}

// ── Helper: Single Document Fetch ──
const _runGetQuery = async (Model, id, userId, notFoundMsg) => {
    const doc = await Model.findOne({ _id: id, userId }).lean()
    if (!doc) return { error: notFoundMsg }
    return doc
}

// ── Tool Registry ──
// Object lookup — if-else se clean aur scalable
const TOOL_HANDLERS = {

    list_cases: async (args, userId) => {
        // Extra filter — caseType
        const extra = {}
        if (args.caseType && args.caseType !== "all") {
            extra.caseType = args.caseType
        }

        const cases = await _runListQuery(Case, args, userId, FIELDS.case, extra)

        // Cases ko prepare karo — hearings array → nextHearing summary
        const prepared = _prepareCaseList(cases)

        const result = { count: prepared.length, cases: prepared }

        // TOON compress — flat list ban gayi after _prepareCaseList
        if (isTabular(prepared)) {
            result.cases = compress(prepared)
        }

        return result
    },

    get_case_details: async (args, userId) => {
        // Poori case — hearings bhi chahiye, isliye select nahi kar rahe
        const caseDoc = await Case.findOne({ _id: args.caseId, userId }).lean()
        if (!caseDoc) return { error: "Case not found" }

        // Hearings ko sort karo — latest pehle
        if (caseDoc.hearings && caseDoc.hearings.length > 0) {
            caseDoc.hearings.sort((a, b) => new Date(b.date) - new Date(a.date))
        }

        return caseDoc
    },

    list_drafts: async (args, userId) => {
        // Extra filter — document type
        const extra = {}
        if (args.type && args.type !== "all") {
            extra.type = args.type
        }

        const drafts = await _runListQuery(Draft, args, userId, FIELDS.draft, extra)

        const result = { count: drafts.length, drafts }

        // TOON compress
        if (isTabular(drafts)) {
            result.drafts = compress(drafts)
        }

        return result
    },

    get_draft_details: async (args, userId) => {
        // Poora draft — content bhi chahiye
        return _runGetQuery(Draft, args.draftId, userId, "Draft not found")
    },
}

// ── Tool Execute ──
const _executeTool = async (toolName, args, userId) => {
    const handler = TOOL_HANDLERS[toolName]

    if (!handler) {
        console.error(`[advocateAgent] Unknown tool requested: ${toolName}`)
        return { error: `Unknown tool: ${toolName}` }
    }

    try {
        return await handler(args, userId)
    } catch (err) {
        console.error(`[advocateAgent] Tool execution failed: ${toolName}`, err.message)
        return { error: `Tool execution failed: ${err.message}` }
    }
}

// ── Safe JSON Parse ──
const _safeJsonParse = (str) => {
    try {
        return JSON.parse(str)
    } catch (err) {
        console.error(`[advocateAgent] JSON parse failed:`, str)
        return {}
    }
}

// ── Tool Calling Loop ──
// Advocate agent → large tier (Claude Sonnet)
// Reason: Legal queries complex hoti hain — case strategy, hearing prep
// caAgent medium tha — CA queries data-heavy hoti hain, logic simple
const _runToolLoop = async (messages, userId, complexity) => {

    const loopMessages = [...messages]

    // Advocate always medium ya large — legal advice ke liye small model nahi
    const forceTier = complexity === "low" ? "medium" : "large"

    for (let i = 0; i < CONFIG.MAX_ITERATIONS; i++) {

        const result = await callLLM({
            agentName: "advocate",
            messages: loopMessages,
            systemPrompt: ADVOCATE_PROMPT,
            tools: CASE_TOOLS,
            forceTier,
        })

        if (result.toolCalls && result.toolCalls.length > 0) {

            loopMessages.push({
                role: "assistant",
                content: result.content || "",
                tool_calls: result.toolCalls,
            })

            // Parallel tool execution — fast
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

            loopMessages.push(...toolResults)
            continue
        }

        // Final answer
        return result.content
    }

    console.warn(`[advocateAgent] Max iterations reached for user: ${userId}`)
    return "Aapki legal query process nahi ho payi. Kripya dobara try karein."
}

// ── Main Function ──
const advocateAgent = async ({ query, history = [], userId, complexity = "medium" }) => {

    const messages = [
        ...history,
        { role: "user", content: query },
    ]

    return await _runToolLoop(messages, userId, complexity)
}

module.exports = { advocateAgent }