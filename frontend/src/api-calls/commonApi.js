import api from "./axios"

// INVOICES
export const getInvoicesApi = async () => {
  const res = await api.get("/invoices")
  return res.data
}
export const addInvoiceApi = async (data) => {
  const res = await api.post("/invoices", data)
  return res.data
}
export const updateInvoiceApi = async (id, data) => {
  const res = await api.patch(`/invoices/${id}`, data)
  return res.data
}
export const deleteInvoiceApi = async (id) => {
  const res = await api.delete(`/invoices/${id}`)
  return res.data
}

// DOCUMENTS
export const getDocumentsApi = async () => {
  const res = await api.get("/documents")
  return res.data
}
export const deleteDocumentApi = async (id) => {
  const res = await api.delete(`/documents/${id}`)
  return res.data
}