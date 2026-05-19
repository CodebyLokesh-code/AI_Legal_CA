const MODEL_TIERS = {
    small: {
        primary: "google/gemini-2.0-flash-lite-001",
        fallback: "google/gemini-2.0-flash-001",
        maxTokens: 2048,
        temperature: 0.3,
    },
    medium: {
        primary: "google/gemini-2.0-flash-001",
        fallback: "google/gemini-2.0-flash-lite-001",
        maxTokens: 4096,
        temperature: 0.5,
    },
    // Development mein Claude nahi — Gemini free hai
    // Production mein wapas Claude laga dena
    large: {
        primary: "google/gemini-2.0-flash-001",
        fallback: "google/gemini-2.0-flash-lite-001",
        maxTokens: 8192,
        temperature: 0.5,
    },
}

const AGENT_TIER_MAP = {
    planner:    "small",
    validator:  "small",
    data:       "medium",
    automation: "medium",
    ca:         "medium",
    advocate:   "medium",  // large → medium (development)
    research:   "medium",  // large → medium (development)
}

module.exports = { MODEL_TIERS, AGENT_TIER_MAP }