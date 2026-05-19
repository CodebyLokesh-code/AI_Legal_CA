const { callLLM } = require("../router/llmRouter")
const { DATA_PROMPT } = require("../prompts/dataPrompt")
const { CASE_TOOLS } = require("../tools/caseTools")
const { BILLING_TOOLS } = require("../tools/billingTools")
const { compress, isTabular } = require("../toon/toonEngine")
const Case = require("../../../models/lawyer/caseModel")
const Invoice = require("../../../models/common/invoiceModel")
const Client = require("../../../models/common/clientModel")

const DATA_TOOLS = [...CASE_TOOLS, ...BILLING_TOOLS]

// ── Tool execute karo — MongoDB se real data ──
const _executeTool = async (toolName, args, userId) => {

    if (toolName === "list_cases") {
        const filter = { userId }
        if (args.status && args.status !== "all") {
            filter.status = args.status
        }
        const cases = await Case.find(filter)
            .limit(args.limit || 10)
            .select("caseNumber caseTitle court status caseType hearings opposingParty fillingDate")
            .lean()

        // TOON compress karo — token savings
        const result = { count: cases.length, cases }
        if (isTabular(cases)) {
            result.cases = compress(cases)
        }
        return result
    }

    if (toolName === "get_case_details") {
        const caseData = await Case.findOne({
            _id: args.caseId,
            userId
        }).lean()
        if (!caseData) return { error: "Case not found" }
        return caseData
    }

    if (toolName === "update_case_status") {
        const updated = await Case.findOneAndUpdate(
            { _id: args.caseId, userId },
            { status: args.status },
            { new: true }
        ).lean()
        if (!updated) return { error: "Case not found" }
        return { success: true, case: updated }
    }

    if (toolName === "list_invoices") {
        const filter = { userId }
        if (args.status && args.status !== "all") {
            filter.status = args.status
        }
        const invoices = await Invoice.find(filter)
            .limit(args.limit || 10)
            .select("invoiceNumber total status dueDate clientId items")
            .lean()

        const result = { count: invoices.length, invoices }
        if (isTabular(invoices)) {
            result.invoices = compress(invoices)
        }
        return result
    }

    if (toolName === "get_invoice_details") {
        const invoice = await Invoice.findOne({
            _id: args.invoiceId,
            userId
        }).lean()
        if (!invoice) return { error: "Invoice not found" }
        return invoice
    }

    if (toolName === "create_invoice") {
        const subTotal = args.items.reduce((sum, item) => sum + item.amount, 0)
        const gstAmount = (subTotal * (args.gst || 0)) / 100
        const total = subTotal + gstAmount

        const invoice = await Invoice.create({
            userId,
            clientId: args.clientId,
            invoiceNumber: `INV-${Date.now()}`,
            items: args.items,
            subTotal,
            gst: args.gst || 0,
            total,
            dueDate: new Date(args.dueDate),
            status: "unpaid"
        })
        return { success: true, invoice }
    }

    return { error: `Unknown tool: ${toolName}` }
}

// ── Tool calling loop ──
const _runToolLoop = async (messages, userId) => {
    let loopMessages = [...messages]
    const MAX_ITERATIONS = 5

    for (let i = 0; i < MAX_ITERATIONS; i++) {

        const result = await callLLM({
            agentName: "data",
            messages: loopMessages,
            systemPrompt: DATA_PROMPT,
            tools: DATA_TOOLS
        })

        // LLM ne tool maanga?
        if (result.toolCalls && result.toolCalls.length > 0) {

            // Assistant message history mein daalo
            loopMessages.push({
                role: "assistant",
                content: result.content || "",
                tool_calls: result.toolCalls
            })

            // Har tool execute karo
            for (const toolCall of result.toolCalls) {
                const toolName = toolCall.function.name
                const args = JSON.parse(toolCall.function.arguments)

                const toolResult = await _executeTool(toolName, args, userId)

                // Tool result history mein daalo
                loopMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(toolResult)
                })
            }
            continue
        }

        // Tool nahi maanga — final answer aa gaya
        return result.content
    }

    return "Could not process your request. Please try again."
}

// ── Main function ──
const dataAgent = async ({ query, history = [], userId }) => {
    const messages = [
        ...history.slice(-4),
        { role: "user", content: query }
    ]
    return await _runToolLoop(messages, userId)
}

module.exports = { dataAgent }