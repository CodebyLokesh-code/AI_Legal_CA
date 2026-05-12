import api from "./axios"

export const getClientsApi = async () => {
  const res = await api.get("/clients")
  return res.data
}

export const addClientApi = async (data) => {
  const res = await api.post("/clients", data)
  return res.data
}

export const updateClientApi = async (id, data) => {
  const res = await api.patch(`/clients/${id}`, data)
  return res.data
}

export const deleteClientApi = async (id) => {
  const res = await api.delete(`/clients/${id}`)
  return res.data
}