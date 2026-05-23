// Cache utility — Redis wrapper jo graceful degrade hota hai
// New file: backend/utils/cache.js
//
// Redis down ho jaye to bhi app chalega — bas cache miss hoga
// Phase 1 mein heavily use karenge — abhi setup ready rakh rahe

const redis = require("redis")

let client = null
let isReady = false

const init = async () => {
    try {
        client = redis.createClient({
            url: process.env.REDIS_URL || "redis://localhost:6379",
            socket: {
                reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
            },
        })

        client.on("error", (err) => {
            // Don't crash  log karo
            if (isReady) console.warn("[cache] Redis error:", err.message)
            isReady = false
        })

        client.on("ready", () => {
            isReady = true
            console.log("[cache] Redis ready")
        })

        await client.connect()
    } catch (err) {
        console.warn("[cache] Redis init failed, running without cache:", err.message)
        client = null
    }
}

// Initialize on module load (non-blocking)
init()

const cache = {
    async get(key) {
        if (!isReady || !client) return null
        try {
            const v = await client.get(key)
            return v ? JSON.parse(v) : null
        } catch {
            return null
        }
    },

    async set(key, value, ttlSec = 300) {
        if (!isReady || !client) return
        try {
            await client.setEx(key, ttlSec, JSON.stringify(value))
        } catch {}
    },

    async del(key) {
        if (!isReady || !client) return
        try {
            await client.del(key)
        } catch {}
    },

    // Pattern delete — invalidation ke liye
    // e.g. cache.delPattern("clients:user123:*")
    async delPattern(pattern) {
        if (!isReady || !client) return
        try {
            const keys = await client.keys(pattern)
            if (keys.length) await client.del(keys)
        } catch {}
    },

    // For external access (rate limiter etc.)
    getClient() {
        return isReady ? client : null
    },
}

module.exports = { cache }
