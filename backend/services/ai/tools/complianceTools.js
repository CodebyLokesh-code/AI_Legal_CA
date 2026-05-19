// Compliance Tools — LLM ke liye "menu card"
// Ye file batati hai ki LLM kya kya actions le sakta hai
// 
// Tools categories:
//   GST    → list_gst_filings, get_gst_details
//   Tax    → list_tax_filings, get_tax_details
//   Audit  → list_audits, get_audit_details

const COMPLIANCE_TOOLS = [

    // ─── GST TOOLS ───
    {
        type: "function",
        function: {
            name: "list_gst_filings",
            description: "List all GST filings, optionally filtered by status or return type",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["draft", "filed", "nil", "all"],
                        description: "Filter by filing status"
                    },
                    returnType: {
                        type: "string",
                        enum: ["GSTR-1", "GSTR-3B", "GSTR-9", "GSTR-9C", "all"],
                        description: "Filter by GST return type"
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_gst_details",
            description: "Get complete details of a specific GST filing by ID",
            parameters: {
                type: "object",
                properties: {
                    gstId: {
                        type: "string",
                        description: "MongoDB GST filing ID"
                    }
                },
                required: ["gstId"]
            }
        }
    },

    // ─── TAX (ITR) TOOLS ───
    {
        type: "function",
        function: {
            name: "list_tax_filings",
            description: "List all income tax (ITR) filings, optionally filtered by status or ITR type",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["draft", "review", "filed", "acknowledged", "all"],
                        description: "Filter by filing status"
                    },
                    itrType: {
                        type: "string",
                        enum: ["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "all"],
                        description: "Filter by ITR form type"
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_tax_details",
            description: "Get complete details of a specific tax filing by ID",
            parameters: {
                type: "object",
                properties: {
                    taxId: {
                        type: "string",
                        description: "MongoDB tax filing ID"
                    }
                },
                required: ["taxId"]
            }
        }
    },

    // ─── AUDIT TOOLS ───
    {
        type: "function",
        function: {
            name: "list_audits",
            description: "List all audits, optionally filtered by status or audit type",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["draft", "inprogress", "completed", "all"],
                        description: "Filter by audit status"
                    },
                    auditType: {
                        type: "string",
                        enum: ["internal", "external", "tax", "all"],
                        description: "Filter by audit type"
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_audit_details",
            description: "Get complete details of a specific audit by ID, including observations",
            parameters: {
                type: "object",
                properties: {
                    auditId: {
                        type: "string",
                        description: "MongoDB audit ID"
                    }
                },
                required: ["auditId"]
            }
        }
    }
]

module.exports = { COMPLIANCE_TOOLS }