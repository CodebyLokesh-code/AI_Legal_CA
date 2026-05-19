// Validator Agent
// Kaam: Har agent response ki quality check karna
// Agar response fail ho → original agent ko dobara bulao
//
// Files used:
//   llmRouter.js        → LLM call karne ke liye
//   validatorPrompt.js  → system prompt

const { callLLM } = require("../router/llmRouter")
const { VALIDATOR_PROMPT } = require("../prompts/validatorPrompt")

// ── Constants ──
const CONFIG = {
    MAX_RETRY: 2,       // Agent ko kitni baar dobara bulao FAIL pe
    PASS_SCORE: 80,     // Is score se upar → PASS
    FIX_SCORE: 50,      // Is score se upar → FIX, neeche → FAIL
}

// ── Safe JSON Parse ──
// Validator ka response JSON format mein hona chahiye
// Agar nahi hai (LLM ne plain text diya) → default PASS return karo
// Reason: Validator ki failure se user experience block nahi hona chahiye
const _parseValidatorResponse = (content) => {
    try {
        // LLM kabhi kabhi ```json ... ``` mein wrap karta hai — clean karo
        const cleaned = content.replace(/```json|```/g, "").trim()
        return JSON.parse(cleaned)
    } catch (err) {
        console.error("[validatorAgent] JSON parse failed:", content)

        // Parse fail → assume PASS — better than blocking user
        return {
            status: "PASS",
            score: 75,
            issues: [],
            fixedResponse: null,
            failReason: null,
        }
    }
}

// ── Validator LLM Call ──
// Agent ka response + original query + tool data → validator ko bhejo
// Validator decide karta hai PASS / FIX / FAIL
const _runValidation = async (query, agentResponse, toolDataSummary) => {

    // Validator ko context do:
    // 1. User ne kya poocha
    // 2. Agent ne kya jawab diya
    // 3. Tool se kya data aaya (ground truth)
    const validationPrompt = `
## USER QUERY
${query}

## AGENT RESPONSE (to validate)
${agentResponse}

## TOOL DATA (ground truth)
${toolDataSummary || "No tool data — conversational response"}

Validate the agent response against the tool data and user query.
Respond ONLY in the specified JSON format.
`.trim()

    const result = await callLLM({
        agentName: "validator",
        messages: [{ role: "user", content: validationPrompt }],
        systemPrompt: VALIDATOR_PROMPT,
        tools: [],          // Validator ko koi tool nahi chahiye
        forceTier: "small", // Simple task → small model (token save)
    })

    return _parseValidatorResponse(result.content)
}

// ── Main Validate Function ──
// agentFn     → jo agent hai (caAgent ya advocateAgent) — retry ke liye
// agentParams → agent ke original params (query, history, userId, complexity)
// response    → agent ka pehla response
// toolData    → agent ne kya data fetch kiya (ground truth)
const validate = async ({ agentFn, agentParams, response, toolData = null }) => {

    let currentResponse = response

    // Tool data ko readable string mein convert karo validator ke liye
    const toolDataSummary = toolData
        ? JSON.stringify(toolData, null, 2)
        : null

    // MAX_RETRY tak try karo
    for (let attempt = 0; attempt < CONFIG.MAX_RETRY; attempt++) {

        // Validation run karo
        const validation = await _runValidation(
            agentParams.query,
            currentResponse,
            toolDataSummary
        )

        console.log(`[validatorAgent] Attempt ${attempt + 1} — Status: ${validation.status}, Score: ${validation.score}`)

        // ── PASS ──
        // Response theek hai — seedha return karo
        if (validation.status === "PASS") {
            return {
                response: currentResponse,
                validated: true,
                score: validation.score,
                attempts: attempt + 1,
            }
        }

        // ── FIX ──
        // Validator ne khud fix kar diya — fixedResponse use karo
        if (validation.status === "FIX" && validation.fixedResponse) {
            return {
                response: validation.fixedResponse,
                validated: true,
                score: validation.score,
                attempts: attempt + 1,
                fixed: true,
            }
        }

        // ── FAIL ──
        // Agent ko dobara bulao — failReason ke saath
        // Last attempt pe dobara nahi bulayenge — loop khatam
        if (attempt < CONFIG.MAX_RETRY - 1) {

            console.warn(`[validatorAgent] FAIL — Retrying agent. Reason: ${validation.failReason}`)

            // Agent ke params mein failReason add karo
            // Agent samjhega kya galat tha aur fix karega
            const retryParams = {
                ...agentParams,
                query: `${agentParams.query}

[CORRECTION NEEDED]: ${validation.failReason}
Previous response was incorrect. Please provide a corrected response.`,
            }

            // Agent dobara chalao
            currentResponse = await agentFn(retryParams)
        }
    }

    // MAX_RETRY ke baad bhi FAIL — best available response return karo
    // User ko block nahi karna chahiye
    console.error(`[validatorAgent] All retries failed for user: ${agentParams.userId}`)
    return {
        response: currentResponse,
        validated: false,
        score: 0,
        attempts: CONFIG.MAX_RETRY,
        warning: "Response could not be fully validated",
    }
}

module.exports = { validate }