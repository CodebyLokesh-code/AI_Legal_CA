// Hot Memory — Redis Conversation History
// Kaam: Har session ki conversation history store karna
//
// API (Modern):
//   getHistory(sessionId, limit)              → messages array
//   appendMessage(sessionId, { role, content }) → message add karo
//   clearSession(sessionId)                   → session delete karo
//
// TTL: 24 hours — purane sessions auto delete
// Max: 20 messages per session

const redis = require("redis")

const MAX_MESSAGES = 20
const TTL_SECONDS = 86400  // 24 hours

class HotMemory {

    constructor() {
        this.client = null
        this._connect()
    }

    // ── Redis Connect ──
    async _connect() {
        try {
            this.client = redis.createClient({
                url: process.env.REDIS_URL || "redis://localhost:6379"
            })

            this.client.on("error", (err) => {
                console.warn(`[HotMemory] Redis error: ${err.message}`)
                this.client = null
            })

            await this.client.connect()
            console.log("[HotMemory] Redis connected")

        } catch (err) {
            console.warn(`[HotMemory] Redis connect failed: ${err.message}`)
            // Graceful degradation — Redis ke bina bhi system chalega
            // Sirf conversation history nahi milegi
            this.client = null
        }
    }

    // ── Get History ──
    // sessionId ke liye last N messages return karo
    //
    // Python comparison:
    //   redis.lrange(key, -limit, -1)  jaisa
    //
    // Returns: [{ role: "user", content: "..." }, ...]
    async getHistory(sessionId, limit = MAX_MESSAGES) {
        if (!sessionId || !this.client) return []

        const key = `session:${sessionId}:messages`

        try {
            const existing = await this.client.get(key)
            if (!existing) return []

            const messages = JSON.parse(existing)

            // Sirf role aur content — timestamp strip karo (token save)
            const history = messages.map(m => ({
                role: m.role,
                content: m.content
            }))

            // Limit apply karo — last N messages
            return history.length > limit
                ? history.slice(-limit)
                : history

        } catch (err) {
            console.warn(`[HotMemory] getHistory failed: ${err.message}`)
            return []
        }
    }

    // ── Append Message ──
    // Ek naya message history mein add karo
    //
    // message = { role: "user" | "assistant", content: "..." }
    //
    // Object-based params — scalable
    // Kal ko metadata/timestamp add karna ho to easy
    async appendMessage(sessionId, message) {
        if (!sessionId || !this.client) return
        if (!message?.role || !message?.content) return

        const key = `session:${sessionId}:messages`

        try {
            const existing = await this.client.get(key)
            const messages = existing ? JSON.parse(existing) : []

            // Message add karo with timestamp
            messages.push({
                role: message.role,
                content: message.content,
                timestamp: new Date().toISOString()
            })

            // MAX_MESSAGES se zyada hue to purane hato
            // Slice from end — latest messages rakho
            if (messages.length > MAX_MESSAGES) {
                messages.splice(0, messages.length - MAX_MESSAGES)
            }

            // Redis mein save karo with TTL
            await this.client.setEx(key, TTL_SECONDS, JSON.stringify(messages))

        } catch (err) {
            console.warn(`[HotMemory] appendMessage failed: ${err.message}`)
        }
    }

    // ── Clear Session ──
    // Session ki poori history delete karo
    // Use case: User "clear chat" button dabaye
    async clearSession(sessionId) {
        if (!sessionId || !this.client) return

        const key = `session:${sessionId}:messages`

        try {
            await this.client.del(key)
            console.log(`[HotMemory] Session cleared: ${sessionId}`)
        } catch (err) {
            console.warn(`[HotMemory] clearSession failed: ${err.message}`)
        }
    }
}

// Singleton — ek hi instance poore app mein
// Python mein: module-level instance (same concept)
const hotMemory = new HotMemory()
module.exports = { hotMemory }