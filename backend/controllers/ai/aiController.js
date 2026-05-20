// AI Controller
// Kaam: HTTP request lena, aiService ko call karna, response bhejnaa
// Route: POST /api/ai/chat
//
// Request format:
//   { message, sessionId }
//   Headers: Authorization: Bearer <JWT>
//
// Response format:
//   { success: true, data: { reply, meta } }

const { processQuery } = require("../../services/ai/aiService") 

const chat = async (req, res) => {
    try {
console.log("BoDY::::: ",req.body)
        // Request body se data lo


        const { message, sessionId } = req.body


        const userId = req.user?._id
        console.log("userId::: ",userId)

        // SessionId — JWT ke _id se banao agar frontend ne nahi bheja
        const effectiveSessionId = sessionId || `sess_${userId}`

        console.log(effectiveSessionId)

        // // Basic validation
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: "Message is required"
            })
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized"
            })
        }

        // AI Service call karo
        const result = await processQuery({
            query: message,
            userId: userId.toString(),
            // sessionId: sessionId || null,
            sessionId: effectiveSessionId ,
        })

        console.log("sessionId::::::: ",sessionId)

        // Success response
        return res.status(200).json({
            success: true,
            data: {
                reply: result.reply,
                intent: result.meta?.intent || null,
                module: result.meta?.module || null,
                agent: result.meta?.agent || null,
                sessionId: result.meta?.sessionId || sessionId,
            }
        })

    } catch (err) {
        console.error("[aiController] Unhandled error:", err.message)
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        })
    }
}

module.exports = { chat }