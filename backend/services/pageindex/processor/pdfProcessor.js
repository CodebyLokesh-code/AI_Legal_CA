// PDF Processor
// Kaam: PDF buffer → pages array (plain text)
//
// Input:  PDF file buffer (multer se aaya)
// Output: { pages: [{pageNo, content}], totalPages, success }
//
// Technology: pdf-parse v1.1.1

const pdfParse = require("pdf-parse")

const MIN_PAGE_CONTENT = 10

// ── Main Function ──
const extractPages = async (buffer) => {
    try {

        const pageTexts = []

        const renderOptions = {
            pagerender: (pageData) => {
                return pageData.getTextContent().then((textContent) => {
                    let pageText = ""
                    textContent.items.forEach((item) => {
                        pageText += item.str + " "
                    })
                    pageTexts.push({
                        pageNo: pageData.pageIndex + 1,
                        content: pageText.trim()
                    })
                    return ""
                })
            }
        }

        // pdf-parse v1 — seedha function call
        const data = await pdfParse(buffer, renderOptions)

        // Sort by page number
        pageTexts.sort((a, b) => a.pageNo - b.pageNo)

        // Empty pages filter
        const validPages = pageTexts.filter(
            p => p.content.length >= MIN_PAGE_CONTENT
        )

        // Agar pagerender se kuch nahi aaya — fallback
        if (validPages.length === 0) {
            const fallbackData = await pdfParse(buffer)

            if (!fallbackData.text || fallbackData.text.trim().length < 10) {
                return {
                    success: false,
                    error: "PDF mein text nahi mila. Scanned PDF support nahi hai.",
                    pages: [],
                    totalPages: 0
                }
            }

            return {
                success: true,
                pages: [{ pageNo: 1, content: fallbackData.text.trim() }],
                totalPages: 1,
                metadata: {}
            }
        }

        console.log(`[pdfProcessor] Extracted ${validPages.length} pages`)

        return {
            success: true,
            pages: validPages,
            totalPages: data.numpages,
            metadata: {
                title: data.info?.Title || null,
                author: data.info?.Author || null,
            }
        }

    } catch (err) {
        console.error("[pdfProcessor] Failed:", err.message)
        return {
            success: false,
            error: `PDF process nahi ho paya: ${err.message}`,
            pages: [],
            totalPages: 0
        }
    }
}

module.exports = { extractPages }