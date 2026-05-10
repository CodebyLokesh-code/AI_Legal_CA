const Groq = require("groq-sdk")

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
})

const chatWithAI = async (userMessage, contextData) => {
    const systemPrompt = `
You are a personal AI assistant for a ${contextData.role}.
You have access to their data:
${JSON.stringify(contextData)}

STRICT RULES:
1. Only answer questions related to the user's own data
2. If user asks about other roles data, just say:
   "Aap ${contextData.role} hain, main sirf aapka data access kar sakta hun"
3. Keep answers short and concise
4. Never share data of other roles
5. Always respond in the same language as the user
`

    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ]
    })

    return response.choices[0].message.content
}

module.exports = { chatWithAI }