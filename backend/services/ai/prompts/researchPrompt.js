// Research Agent Prompt
// Kaam: LLM ko batao kaunsa document relevant hai query ke liye

// ── System Prompt ──
const RESEARCH_SYSTEM_PROMPT = `You are a document selector for Indian legal and CA professionals.
Your job is to identify which document is most relevant to answer a user's query.
Always respond with valid JSON only — no explanation, no extra text.`

// ── Document Select Prompt ──
// Documents list dekho → kaunsa relevant hai?
const buildSelectPrompt = (documents, query) => `
User has these documents available:
${documents.map((d, i) => `${i + 1}. ID: ${d._id}, Name: ${d.fileName}, Type: ${d.documentType}`).join("\n")}

User Query: "${query}"

Which document is most relevant to answer this query?
Return ONLY a JSON object:
{
  "documentId": "document_id_here",
  "reason": "one line reason"
}

If no document seems relevant, return:
{
  "documentId": null,
  "reason": "no relevant document found"
}`.trim()

module.exports = {
    RESEARCH_SYSTEM_PROMPT,
    buildSelectPrompt
}