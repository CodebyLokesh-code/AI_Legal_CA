import api from "./axios"

export const chatApi = async (message) => {
  const res = await api.post("/ai/chat", { message })
  console.log("response: ",res)
  return res.data
}

export const generateDraftApi = async (data) => {
  const res = await api.post("/ai/draft", data)
  return res.data
}

export const summarizeDocumentApi = async (data) => {
  const res = await api.post("/ai/summarize", data)
  return res.data
}

export const taxSuggestApi = async (data) => {
  const res = await api.post("/ai/tax-suggest", data)
  return res.data
}