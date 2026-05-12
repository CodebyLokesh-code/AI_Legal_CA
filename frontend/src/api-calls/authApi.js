import api from "./axios"

export const loginApi = async (data) => {
  const res = await api.post("/auth/login", data)
  return res.data
}

export const signupApi = async (data) => {
  const res = await api.post("/auth/signup", data)
  return res.data
}

export const verifyOtpApi = async (data) => {
  const res = await api.post("/auth/verify-otp", data)
  return res.data
}