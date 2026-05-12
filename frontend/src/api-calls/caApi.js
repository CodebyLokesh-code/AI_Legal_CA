import api from "./axios"

// TAX
export const getTaxesApi = async () => {
  const res = await api.get("/ca/tax")
  return res.data
}
export const addTaxApi = async (data) => {
  const res = await api.post("/ca/tax", data)
  return res.data
}
export const updateTaxApi = async (id, data) => {
  const res = await api.patch(`/ca/tax/${id}`, data)
  return res.data
}
export const deleteTaxApi = async (id) => {
  const res = await api.delete(`/ca/tax/${id}`)
  return res.data
}

// GST
export const getGSTsApi = async () => {
  const res = await api.get("/ca/gst")
  return res.data
}
export const addGSTApi = async (data) => {
  const res = await api.post("/ca/gst", data)
  return res.data
}
export const updateGSTApi = async (id, data) => {
  const res = await api.patch(`/ca/gst/${id}`, data)
  return res.data
}
export const deleteGSTApi = async (id) => {
  const res = await api.delete(`/ca/gst/${id}`)
  return res.data
}

// AUDIT
export const getAuditsApi = async () => {
  const res = await api.get("/ca/audit")
  return res.data
}
export const addAuditApi = async (data) => {
  const res = await api.post("/ca/audit", data)
  return res.data
}
export const updateAuditApi = async (id, data) => {
  const res = await api.patch(`/ca/audit/${id}`, data)
  return res.data
}
export const deleteAuditApi = async (id) => {
  const res = await api.delete(`/ca/audit/${id}`)
  return res.data
}