// AI Service — Entry Point
// Kaam: Controller aur Orchestrator ke beech bridge
// Ye file bahut chhoti hai — sirf orchestrator ko expose karti hai
//
// Kal ko agar orchestrator replace karna ho ya
// koi pre-processing add karni ho — sirf yahan karo
// Controller ko chhuna nahi padega

const { orchestrate } = require("./agents/orchestrator")

// Main service function
// Controller yahi call karta hai
const processQuery = async ({ query, userId, sessionId }) => {

    // Input validation — basic checks
    if (!query || !query.trim()) {
        return {
            reply: "Kripya kuch poochein.",
            meta: { agent: "none", error: false }
        }
    }

    if (!userId) {
        return {
            reply: "Authentication required.",
            meta: { agent: "none", error: true }
        }
    }

    // Orchestrator ko bhejo — poori pipeline yahan se chalti hai
    return await orchestrate({
        query: query.trim(),
        userId,
        sessionId,
    })
}

module.exports = { processQuery }