// Tree Builder Prompt
// Kaam: LLM ko batao document tree kaise banao
// Ye prompt treeBuilder.js mein use hota hai

// ── System Prompt ──
// LLM ka role define karta hai
const TREE_SYSTEM_PROMPT = `You are a document structure analyzer for Indian legal and CA documents.
Your job is to analyze document pages and create a hierarchical tree structure.
Always respond with valid JSON only — no explanation, no extra text.`

// ── Tree Build Prompt ──
// pages aur documentType dynamic hain
const buildTreePrompt = (formattedPages, documentType) => `
Analyze these document pages and create a tree structure like a Table of Contents.

Document Type: ${documentType}
Pages:
${formattedPages}

RULES:
1. Each node must have: title, startPage, endPage, summary
2. summary = 1 short sentence (same language as document)
3. Group related pages together — not page by page
4. Maximum 2 levels deep (parent → children only)
5. Return ONLY valid JSON — no explanation

Expected JSON format:
{
  "title": "Document main title",
  "nodes": [
    {
      "title": "Section title",
      "startPage": 1,
      "endPage": 3,
      "summary": "Brief description",
      "nodes": []
    }
  ]
}`.trim()

// ── Retry Prompt ──
// Jab pehla parse fail ho — simple tree banana
const buildRetryPrompt = (totalPages) => `
Create a simple 2-section JSON tree for a ${totalPages} page document.
Return ONLY this JSON (fill in actual titles from context):
{
  "title": "Document",
  "nodes": [
    {
      "title": "First Section",
      "startPage": 1,
      "endPage": ${Math.ceil(totalPages / 2)},
      "summary": "First half of document",
      "nodes": []
    },
    {
      "title": "Second Section", 
      "startPage": ${Math.ceil(totalPages / 2) + 1},
      "endPage": ${totalPages},
      "summary": "Second half of document",
      "nodes": []
    }
  ]
}`.trim()

module.exports = {
    TREE_SYSTEM_PROMPT,
    buildTreePrompt,
    buildRetryPrompt
}