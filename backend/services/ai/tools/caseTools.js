// Case Tools — Advocate Agent ke liye LLM "menu card"
// Ye file batati hai LLM ko — kya kya actions le sakta hai
//
// Tools:
//   Cases  → list_cases, get_case_details
//   Drafts → list_drafts, get_draft_details

const CASE_TOOLS = [

    // ─── CASE TOOLS ───
    {
        type: "function",
        function: {
            name: "list_cases",
            description: "List all legal cases, optionally filtered by status or case type",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["active", "closed", "adjourned", "won", "lost", "settled", "all"],
                        description: "Filter by case status"
                    },
                    caseType: {
                        type: "string",
                        enum: ["civil", "criminal", "family", "corporate", "tax", "other", "all"],
                        description: "Filter by case type"
                    },
                    limit: {
                        type: "number",
                        description: "Number of cases to return (default 10)"
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_case_details",
            description: "Get complete details of a specific case by ID, including all hearings history",
            parameters: {
                type: "object",
                properties: {
                    caseId: {
                        type: "string",
                        description: "MongoDB case ID"
                    }
                },
                required: ["caseId"]
            }
        }
    },

    // ─── DRAFT TOOLS ───
    {
        type: "function",
        function: {
            name: "list_drafts",
            description: "List all legal drafts, optionally filtered by status or document type",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["draft", "final", "sent", "all"],
                        description: "Filter by draft status"
                    },
                    type: {
                        type: "string",
                        enum: ["notice", "agreement", "petition", "affidavit", "contract", "other", "all"],
                        description: "Filter by document type"
                    },
                    limit: {
                        type: "number",
                        description: "Number of drafts to return (default 10)"
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_draft_details",
            description: "Get complete details of a specific draft by ID, including full content",
            parameters: {
                type: "object",
                properties: {
                    draftId: {
                        type: "string",
                        description: "MongoDB draft ID"
                    }
                },
                required: ["draftId"]
            }
        }
    }
]

module.exports = { CASE_TOOLS }