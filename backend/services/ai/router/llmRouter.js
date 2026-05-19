// Import karo modelConfig se
const { MODEL_TIERS, AGENT_TIER_MAP } = require("./modelConfig")

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

// Main function — agent ka naam lo, sahi model choose karo, call karo
const callLLM = async ({ agentName, messages, systemPrompt, tools = null, forceTier = null }) => {
    
    // Tier decide karo — forceTier > AGENT_TIER_MAP > default "medium"
    const tierName = forceTier || AGENT_TIER_MAP[agentName] || "medium"
    const tier = MODEL_TIERS[tierName]

    // Primary model try karo, fail ho toh fallback
    const result = await _callWithFallback({
        primary: tier.primary,
        fallback: tier.fallback,
        messages,
        systemPrompt,
        tools,
        maxTokens: tier.maxTokens,
        temperature: tier.temperature,
    })

    return result
}

// Primary try karo — fail ho toh fallback
const _callWithFallback = async ({ primary, fallback, messages, systemPrompt, tools, maxTokens, temperature }) => {
    try {
        return await _callModel({ model: primary, messages, systemPrompt, tools, maxTokens, temperature })
    } catch (error) {
        console.warn(`[LLMRouter] Primary failed: ${primary} — trying fallback`)
        return await _callModel({ model: fallback, messages, systemPrompt, tools, maxTokens, temperature })
    }
}

// Actual OpenRouter API call
const _callModel = async ({ model, messages, systemPrompt, tools, maxTokens, temperature }) => {
    const body = {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            ...messages   // purani history yahan aayegi
        ],
        max_tokens: maxTokens,
        temperature,
    }

    // Tools hain toh add karo
    if (tools && tools.length > 0) {
        body.tools = tools
        body.tool_choice = "auto"
    }

    // OpenRouter ko fetch karo
    const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)   // Object → JSON string
    })

    // Error check karo
    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenRouter error: ${response.status} — ${error}`)
    }

    // Response parse karo
    const data = await response.json()
    const message = data.choices[0].message
    const usage = data.usage || {}

    // Clean object return karo
    return {
        content: message.content,
        toolCalls: message.tool_calls || null,
        model,
        inputTokens: usage.prompt_tokens || 0,
        outputTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
    }
}

module.exports = { callLLM }