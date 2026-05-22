// Tree Retriever
// Kaam: User query → Relevant pages → Final answer
//
// Flow:
//   1. MongoDB se document + tree fetch karo
//   2. LLM Call 1 → Tree navigate karo (kaunsa node?)
//   3. Relevant pages fetch karo
//   4. LLM Call 2 → Answer do
//
// Pattern: caAgent jaisa tool loop nahi — 2 fixed LLM calls

const { callLLM } = require("../../ai/router/llmRouter")
const PiDocument = require("../../../models/pageindex/piDocumentModel")
const {
    RETRIEVER_SYSTEM_PROMPT,
    buildNavigatePrompt,
    buildAnswerPrompt
} = require("../prompts/retrieverPrompt")

// ── Helper: NodeId se pages range nikalo ──
// Tree mein nodeId dhundho → startPage, endPage nikalo
const _findNodeRange = (nodes, targetNodeId) => {

    for (const node of nodes) {

        // Ye node hai?
        if (node.nodeId === targetNodeId) {
            return { startPage: node.startPage, endPage: node.endPage }
        }

        // Child nodes mein dhundho (recursive)
        if (node.nodes && node.nodes.length > 0) {
            const found = _findNodeRange(node.nodes, targetNodeId)
            if (found) return found
        }
    }

    return null  // nahi mila
}

// ── Helper: Pages content extract karo ──
// pages array mein se startPage to endPage ka content nikalo
const _extractPageContent = (pages, startPage, endPage) => {
    return pages
        .filter(p => p.pageNo >= startPage && p.pageNo <= endPage)
        .map(p => `[Page ${p.pageNo}]\n${p.content}`)
        .join("\n\n")
}

// ── LLM Call 1: Tree Navigate ──
// Tree dekho → Kaunse nodeIds relevant hain?
const _navigateTree = async (tree, query) => {

    const result = await callLLM({
        agentName: "treeRetriever",
        messages: [{ role: "user", content: buildNavigatePrompt(tree, query) }],
        systemPrompt: RETRIEVER_SYSTEM_PROMPT,
        tools: [],
        forceTier: "small"   // Simple task → small model (token save)
    })

    try {
        // LLM ne array diya: ["0001", "0002"]
        const cleaned = result.content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim()

        const nodeIds = JSON.parse(cleaned)

        if (!Array.isArray(nodeIds)) return []

        return nodeIds

    } catch (err) {
        console.error("[treeRetriever] Navigate parse failed:", err.message)
        return []
    }
}

// ── LLM Call 2: Answer Generate ──
// Relevant content dekho → Answer do
const _generateAnswer = async (pageContents, query) => {

    const result = await callLLM({
        agentName: "treeRetriever",
        messages: [{ role: "user", content: buildAnswerPrompt(pageContents, query) }],
        systemPrompt: RETRIEVER_SYSTEM_PROMPT,
        tools: [],
        forceTier: "medium"
    })

    return result.content
}

// ── Main Function ──
const retrieveAnswer = async ({ documentId, query, userId }) => {

    // Step 1: MongoDB se document fetch karo
    const doc = await PiDocument.findOne({
        _id: documentId,
        userId          // Security — sirf apna document
    })

    if (!doc) {
        return {
            success: false,
            answer: "Document nahi mila."
        }
    }

    // Document ready hai?
    if (doc.status !== "ready") {
        return {
            success: false,
            answer: "Document abhi process ho raha hai. Thodi der baad try karein."
        }
    }

    // Tree hai?
    if (!doc.tree || !doc.tree.nodes) {
        return {
            success: false,
            answer: "Document ka index nahi bana. Dobara upload karein."
        }
    }

    console.log(`[treeRetriever] Query: "${query}" on doc: ${documentId}`)

    // Step 2: LLM Call 1 — Tree navigate karo
    const relevantNodeIds = await _navigateTree(doc.tree, query)

    console.log(`[treeRetriever] Relevant nodes: ${relevantNodeIds}`)

    // Koi node nahi mila?
    if (relevantNodeIds.length === 0) {
        return {
            success: true,
            answer: "Is document mein aapke sawaal ka jawab nahi mila."
        }
    }

    // Step 3: Relevant pages ka content nikalo
    let combinedContent = ""

    for (const nodeId of relevantNodeIds) {

        // Node ki page range nikalo
        const range = _findNodeRange(doc.tree.nodes, nodeId)

        if (!range) continue

        // Pages se content extract karo
        const content = _extractPageContent(
            doc.pages,
            range.startPage,
            range.endPage
        )

        combinedContent += content + "\n\n"
    }

    if (!combinedContent.trim()) {
        return {
            success: false,
            answer: "Document content nahi mila."
        }
    }

    // Step 4: LLM Call 2 — Answer generate karo
    const answer = await _generateAnswer(combinedContent, query)

    console.log(`[treeRetriever] Answer generated`)

    return {
        success: true,
        answer,
        nodesUsed: relevantNodeIds
    }
}

module.exports = { retrieveAnswer }