// Orchestrator — Sabka Boss
// Kaam: Poori AI pipeline coordinate karna
//
// Pipeline:
//   1. History load (hotMemory)
//   2. Planner — kaunsa agent chahiye?
//   3. Agent run — sahi specialist chalao
//   4. Validator — quality check
//   5. History save (hotMemory)
//   6. Final response return

const { plannerAgent } = require("./plannerAgent")
const { caAgent } = require("./caAgent")
const { advocateAgent } = require("./advocateAgent")
const { dataAgent } = require("./dataAgent")
const { validate } = require("./validatorAgent")
const { hotMemory } = require("../memory/hotMemory")
const { researchAgent } = require("./researchAgent")

const CONFIG = {
    ENABLE_VALIDATION: true,
    DEFAULT_AGENT: "data",
    DEFAULT_COMPLEXITY: "medium",
    HISTORY_FETCH_LIMIT: 6,
}

const AGENT_REGISTRY = {
    ca: caAgent,
    advocate: advocateAgent,
    data: dataAgent,
    research: researchAgent, 
}

// ── Step 1: History Load ──
const _loadHistory = async (sessionId) => {
    if (!sessionId) return []
    try {
        return await hotMemory.getHistory(sessionId, CONFIG.HISTORY_FETCH_LIMIT)
    } catch (err) {
        console.error("[orchestrator] History load failed:", err.message)
        return []
    }
}

// ── Step 2: Planner ──
// simpleResponse check NAHI hai yahan — orchestrate() mein handle hoga
const _runPlanner = async (query, history) => {
    const plan = await plannerAgent({ query, history })

    // next_agent validate karo — registry mein hai ya nahi?
    if (!plan.next_agent || !AGENT_REGISTRY[plan.next_agent]) {
        console.warn(`[orchestrator] Invalid agent from planner: ${plan.next_agent}. Using default.`)
        return {
            ...plan,
            next_agent: CONFIG.DEFAULT_AGENT,
            complexity: plan.complexity || CONFIG.DEFAULT_COMPLEXITY,
        }
    }

    return plan
}

// ── Step 3: Agent Run ──
const _runAgent = async (agentName, agentParams) => {
    const agentFn = AGENT_REGISTRY[agentName]
    const response = await agentFn(agentParams)
    return { response, agentFn }
}

// ── Step 4: Validator ──
const _runValidator = async ({ agentFn, agentParams, response }) => {
    if (!CONFIG.ENABLE_VALIDATION) {
        return { response, validated: false, skipped: true }
    }
    return await validate({ agentFn, agentParams, response })
}

// ── Step 5: History Save ──
const _saveHistory = async (sessionId, query, response) => {
    if (!sessionId) return
    try {
        await hotMemory.appendMessage(sessionId, { role: "user", content: query })
        await hotMemory.appendMessage(sessionId, { role: "assistant", content: response })
    } catch (err) {
        console.error("[orchestrator] History save failed:", err.message)
    }
}

// ── Step 6: Response Formatter ──
const _formatResponse = ({ plan, validation, sessionId }) => {
    return {
        reply: validation.response,
        meta: {
            agent: plan.next_agent,
            intent: plan.intent || null,
            complexity: plan.complexity,
            validated: validation.validated,
            score: validation.score || null,
            attempts: validation.attempts || 1,
            sessionId,
        },
    }
}

console.log("hsdfhskhfksuhfskuhfcksdu")

// ── Error Response ──
const _errorResponse = (err, sessionId) => {
    console.error("[orchestrator] Pipeline failed:", err)
    return {
        reply: "Maaf kijiye, aapki query process nahi ho payi. Kripya thoda baad mein try karein.",
        meta: { agent: "error", error: true, errorMessage: err.message, sessionId },
    }
}


console.log("HBFSJHBSHFSDDHB")

// ── Main Orchestrate Function ──
const orchestrate = async ({ query, userId, sessionId }) => {
    try {
        // Step 1: History load
        const history = await _loadHistory(sessionId)

        // Step 2: Planner
        const plan = await _runPlanner(query, history)

        // Step 3: Simple query check — hi/hello/thanks
        // plannerAgent simpleResponse set karta hai in cases mein
        if (plan.simpleResponse) {
            return {
                reply: plan.simpleResponse,
                meta: {
                    agent: "none",
                    intent: plan.intent,
                    complexity: "low",
                    validated: false,
                    sessionId,
                }
            }
        }

        // Step 4: Agent params
        const agentParams = {
            query,
            history,
            userId,
            complexity: plan.complexity || CONFIG.DEFAULT_COMPLEXITY,
        }

        // Step 5: Agent chalao
        const { response, agentFn } = await _runAgent(plan.next_agent, agentParams)

        // Step 6: Validator
        const validation = await _runValidator({ agentFn, agentParams, response })

        // Step 7: History save (background)
        _saveHistory(sessionId, query, validation.response)
            .catch(err => console.error("[orchestrator] Async history save failed:", err.message))

        // Step 8: Final response
        return _formatResponse({ plan, validation, sessionId })

    } catch (err) {
        return _errorResponse(err, sessionId)
    }
}

module.exports = { orchestrate }