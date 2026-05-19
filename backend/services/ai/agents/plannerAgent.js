const { callLLM } = require("../router/llmRouter")
const { PLANNER_PROMPT } = require("../prompts/plannerPrompt")

const SIMPLE_PATTERNS = [
    "hi", "hello", "hey", "namaste", "hii",
    "good morning", "good afternoon", "good evening",
    "how are you", "kaise ho", "kya haal",
    "thanks", "thank you", "shukriya",
    "bye", "goodbye", "alvida",
    "ok", "okay", "got it", "accha", "theek hai", "hmm"
]

const SIMPLE_RESPONSES = {
    "hi": "Hello! How can I help you today?",
    "hello": "Hello! What can I assist you with?",
    "hey": "Hey! What do you need help with?",
    "namaste": "Namaste! Aaj kya kaam karna hai?",
    "hii": "Hi there! How can I help?",
    "good morning": "Good morning! What would you like to work on today?",
    "good afternoon": "Good afternoon! How can I assist you?",
    "good evening": "Good evening! What do you need help with?",
    "how are you": "Doing well! What can I help you with?",
    "kaise ho": "Bilkul theek hoon! Batao, kya kaam hai?",
    "kya haal": "Sab theek hai! Aaj kya karna hai?",
    "thanks": "You're welcome! Anything else?",
    "thank you": "Happy to help! Anything else?",
    "shukriya": "Koi baat nahi! Aur kuch chahiye?",
    "bye": "Take care! Have a productive day.",
    "goodbye": "Goodbye! Let me know if you need anything.",
    "alvida": "Alvida! Kuch kaam ho toh zaroor poochho.",
    "ok": "Got it! Let me know if you need anything.",
    "okay": "Sure! Let me know if there is anything else.",
    "got it": "Great! Anything else?",
    "accha": "Theek hai! Aur kuch?",
    "theek hai": "Bilkul! Kuch aur chahiye?",
    "hmm": "Take your time, I am here when you are ready."
}

const KEYWORD_ROUTES = {
    ca: [
        "gst", "itr", "tds", "tax", "audit", "compliance",
        "gstr", "income tax", "advance tax", "80c", "80d",
        "challan", "refund", "assessment", "notice 143",
        "tax return", "filing", "financial year"
    ],
    advocate: [
        "draft", "notice", "legal", "court", "hearing",
        "vakalatnama", "petition", "affidavit", "bail",
        "fir", "complaint", "suit", "plaint", "appeal",
        "judgment", "order", "stay", "injunction"
    ],
    research: [
        "precedent", "statute", "section", "act", "bare act",
        "case law", "judgment", "ipc", "crpc", "cpc",
        "constitution", "article", "high court", "supreme court"
    ],
    automation: [
        "create", "add", "new", "make", "generate",
        "update", "change", "edit", "modify",
        "delete", "remove", "cancel"
    ],
    data: [
        "list", "show", "get", "fetch", "display",
        "all cases", "my cases", "pending", "active",
        "invoices", "clients", "details", "status"
    ]
}

const MODULE_MAP = {
    ca: "compliance",
    advocate: "case_management",
    research: "legal_research",
    automation: "billing",
    data: "dashboard"
}

const COMPLEXITY_KEYWORDS = {
    high: [
        "analyze", "analysis", "research", "draft", "strategy",
        "risk", "audit", "precedent", "explain", "advise"
    ],
    medium: [
        "calculate", "check", "compare", "filter", "search"
    ]
}

// ── Fast Track — keyword se route karo, LLM call nahi ──
const _keywordRoute = (query) => {
    const q = query.toLowerCase()

    for (const [agent, keywords] of Object.entries(KEYWORD_ROUTES)) {
        for (const keyword of keywords) {
            if (q.includes(keyword)) {
                const complexity = _detectComplexity(q)
                return {
                    intent: query,
                    module: _detectModule(q, agent),
                    next_agent: agent,
                    complexity,
                    fastTrack: true
                }
            }
        }
    }
    return null
}

// ── Module detect karo query se ──
const _detectModule = (q, agent) => {
    if (q.includes("invoice") || q.includes("billing") || q.includes("payment")) return "billing"
    if (q.includes("case") || q.includes("hearing") || q.includes("court")) return "case_management"
    if (q.includes("client")) return "client_management"
    if (q.includes("gst") || q.includes("itr") || q.includes("tax")) return "compliance"
    if (q.includes("research") || q.includes("precedent") || q.includes("statute")) return "legal_research"
    return MODULE_MAP[agent] || "dashboard"
}

// ── Complexity detect karo ──
const _detectComplexity = (q) => {
    for (const keyword of COMPLEXITY_KEYWORDS.high) {
        if (q.includes(keyword)) return "high"
    }
    for (const keyword of COMPLEXITY_KEYWORDS.medium) {
        if (q.includes(keyword)) return "medium"
    }
    return "low"
}

// ── Simple query check ──
const _isSimpleQuery = (query) => {
    const q = query.toLowerCase().trim().replace(/[?!.]/g, "")
    return SIMPLE_PATTERNS.includes(q)
}

// ── LLM response parse karo ──
const _parseResponse = (raw, originalQuery) => {
    try {
        const cleaned = raw.replace(/```json|```/g, "").trim()
        const parsed = JSON.parse(cleaned)
        parsed.fastTrack = false
        return parsed
    } catch {
        try {
            const match = raw.match(/\{.*\}/s)
            if (match) {
                const parsed = JSON.parse(match[0])
                parsed.fastTrack = false
                return parsed
            }
        } catch {}
        return _keywordRoute(originalQuery) || {
            intent: originalQuery,
            module: "dashboard",
            next_agent: "data",
            complexity: "low",
            fastTrack: false
        }
    }
}

// ── Main planner function ──
const plannerAgent = async ({ query, history = [] }) => {

    // Step 1: Simple query check — zero LLM calls
    if (_isSimpleQuery(query)) {
        const q = query.toLowerCase().trim().replace(/[?!.]/g, "")
        return {
            intent: query,
            module: "dashboard",
            next_agent: null,
            complexity: "low",
            fastTrack: true,
            simpleResponse: SIMPLE_RESPONSES[q] || "Hello! How can I help you?"
        }
    }

    // Step 2: Keyword fast track — zero LLM calls
    const keywordResult = _keywordRoute(query)
    if (keywordResult) return keywordResult

    // Step 3: LLM call — sirf tab jab keywords se route na ho
    // History compress karo — sirf last 2 messages
    const compressedHistory = history.slice(-2).map(m => ({
        role: m.role,
        content: m.content.slice(0, 100)  // sirf pehle 100 chars — token save
    }))

    const messages = [
        ...compressedHistory,
        { role: "user", content: query }
    ]

    const result = await callLLM({
        agentName: "planner",
        messages,
        systemPrompt: PLANNER_PROMPT,
        forceTier: "small"
    })

    return _parseResponse(result.content, query)
}

module.exports = { plannerAgent }