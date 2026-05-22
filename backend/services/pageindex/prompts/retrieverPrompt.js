// Retriever Prompts
// Kaam: Tree navigate karne aur answer dene ke liye prompts
// 2 prompts hain:
//   1. navigatePrompt → Kaunsa node relevant hai?
//   2. answerPrompt   → Answer do

// ── System Prompt ──
const RETRIEVER_SYSTEM_PROMPT = `You are an expert document analyzer for Indian legal and CA professionals.
You help find accurate information from legal documents like vakalatnama, court orders, FIR, contracts etc.
Always base your answers strictly on the provided document content — never make up information.`

// ── Navigate Prompt ──
// Tree dekho aur decide karo kaunsa node relevant hai
const buildNavigatePrompt = (tree, query) => `
You have a document tree structure (table of contents).
Find which node(s) are most relevant to answer the query.

Document Tree:
${JSON.stringify(tree, null, 2)}

User Query: "${query}"

Return ONLY a JSON array of relevant nodeIds:
["0001", "0002"]

Rules:
1. Return maximum 2-3 most relevant nodeIds
2. Return ONLY the JSON array — no explanation
3. If nothing relevant found, return empty array: []`.trim()

// ── Answer Prompt ──
// Relevant pages content dekho aur answer do
const buildAnswerPrompt = (pageContents, query) => `
Answer the user's query based ONLY on the document content provided below.
Do not make up any information. If the answer is not in the content, say so clearly.

Document Content:
${pageContents}

User Query: "${query}"

Answer in the same language as the query (Hindi/English/Hinglish).
Be precise and cite specific details from the document.`.trim()

module.exports = {
    RETRIEVER_SYSTEM_PROMPT,
    buildNavigatePrompt,
    buildAnswerPrompt
}