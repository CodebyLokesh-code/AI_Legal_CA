const BILLING_TOOLS = [
    {
        type: "function",
        function: {
            name: "list_invoices",
            description: "List all invoices, optionally filtered by status",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["unpaid", "paid", "overdue", "cancelled", "all"],
                        description: "Filter invoices by status"
                    },
                    limit: {
                        type: "number",
                        description: "Number of invoices to return, default 10"
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_invoice_details",
            description: "Get complete details of a specific invoice by ID",
            parameters: {
                type: "object",
                properties: {
                    invoiceId: {
                        type: "string",
                        description: "MongoDB invoice ID"
                    }
                },
                required: ["invoiceId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "create_invoice",
            description: "Create a new invoice for a client",
            parameters: {
                type: "object",
                properties: {
                    clientId: {
                        type: "string",
                        description: "MongoDB client ID"
                    },
                    items: {
                        type: "array",
                        description: "List of invoice items",
                        items: {
                            type: "object",
                            properties: {
                                description: { type: "string" },
                                amount: { type: "number" }
                            }
                        }
                    },
                    dueDate: {
                        type: "string",
                        description: "Due date in ISO format e.g. 2026-06-01"
                    },
                    gst: {
                        type: "number",
                        description: "GST percentage e.g. 18"
                    }
                },
                required: ["clientId", "items", "dueDate"]
            }
        }
    }
]

module.exports = { BILLING_TOOLS }