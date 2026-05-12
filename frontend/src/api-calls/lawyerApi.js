import api from "./axios"

// CASES
export const getCasesApi = async () => {
  const res = await api.get("/lawyer/cases")
  return res.data
}
export const addCaseApi = async (data) => {
  const res = await api.post("/lawyer/cases", data)
  return res.data
}
export const updateCaseApi = async (id, data) => {
  const res = await api.patch(`/lawyer/cases/${id}`, data)
  return res.data
}
export const deleteCaseApi = async (id) => {
  const res = await api.delete(`/lawyer/cases/${id}`)
  return res.data
}
export const addHearingApi = async (id, data) => {
  const res = await api.post(`/lawyer/cases/${id}/hearing`, data)
  return res.data
}

// DRAFTS
export const getDraftsApi = async () => {
  const res = await api.get("/lawyer/drafts")
  return res.data
}
export const addDraftApi = async (data) => {
  const res = await api.post("/lawyer/drafts", data)
  return res.data
}
export const updateDraftApi = async (id, data) => {
  const res = await api.patch(`/lawyer/drafts/${id}`, data)
  return res.data
}
export const deleteDraftApi = async (id) => {
  const res = await api.delete(`/lawyer/drafts/${id}`)
  return res.data
}