// Tree Builder
// Kaam: Pages array → PageIndex tree
//
// Input:  pages [{pageNo, content}]
// Output: { success, tree }
//
// Pattern: caAgent jaisa — prompt alag file mein

const { callLLM } = require("../../ai/router/llmRouter")
const {
    TREE_SYSTEM_PROMPT,
    buildTreePrompt,
    buildRetryPrompt
} = require("../prompts/treePrompt")

// ── Constants ──
const MAX_PAGES_PER_PROMPT = 20   // LLM context window limit
const MAX_CONTENT_PER_PAGE = 500  // token save

// ── Pages ko LLM ke liye format karo ──
const _formatPages = (pages) => {
    return pages
        .slice(0, MAX_PAGES_PER_PROMPT)
        .map(p => `--- Page ${p.pageNo} ---\n${p.content.slice(0, MAX_CONTENT_PER_PAGE)}`)
        .join("\n\n")
}

// ── LLM output se JSON nikalo ──
const _parseTree = (rawContent) => {
    try {
        const cleaned = rawContent
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim()

        const tree = JSON.parse(cleaned)

        if (!tree.title || !tree.nodes || !Array.isArray(tree.nodes)) {
            throw new Error("Invalid tree structure")
        }

        return { success: true, tree }

    } catch (err) {
        console.error("[treeBuilder] Parse failed:", err.message)
        return { success: false }
    }
}

// ── Node IDs add karo ──
const _addNodeIds = (nodes, prefix = "") => {
    return nodes.map((node, i) => {
        const nodeId = prefix
            ? `${prefix}-${i + 1}`
            : String(i + 1).padStart(4, "0")

        return {
            ...node,
            nodeId,
            nodes: node.nodes?.length > 0
                ? _addNodeIds(node.nodes, nodeId)
                : []
        }
    })
}

// ── Main Function ──
const buildTree = async (pages, documentType = "other") => {

    if (!pages || pages.length === 0) {
        return { success: false, error: "Pages array empty hai" }
    }

    const formattedPages = _formatPages(pages)

    console.log(`[treeBuilder] Building tree for ${pages.length} pages...`)

    // LLM Call 1 — Normal
    const result = await callLLM({
        agentName: "treeBuilder",
        messages: [{ role: "user", content: buildTreePrompt(formattedPages, documentType) }],
        systemPrompt: TREE_SYSTEM_PROMPT,
        tools: [],
        forceTier: "medium"
    })

    const parsed = _parseTree(result.content)

    if (parsed.success) {
        parsed.tree.nodes = _addNodeIds(parsed.tree.nodes)
        console.log(`[treeBuilder] Done — ${parsed.tree.nodes.length} nodes`)
        return { success: true, tree: parsed.tree }
    }

    // LLM Call 2 — Retry (simple tree)
    console.warn("[treeBuilder] Retrying with simple prompt...")

    const retryResult = await callLLM({
        agentName: "treeBuilder",
        messages: [{ role: "user", content: buildRetryPrompt(pages.length) }],
        systemPrompt: TREE_SYSTEM_PROMPT,
        tools: [],
        forceTier: "medium"
    })

    const retryParsed = _parseTree(retryResult.content)

    if (!retryParsed.success) {
        return { success: false, error: "Tree build nahi ho paya." }
    }

    retryParsed.tree.nodes = _addNodeIds(retryParsed.tree.nodes)
    console.log(`[treeBuilder] Done (retry) — ${retryParsed.tree.nodes.length} nodes`)

    return { success: true, tree: retryParsed.tree }
}

module.exports = { buildTree }