import axios from 'axios'
import type { ServiceRequest, CreateServiceRequestDto, UpdateStatusDto, ChatResponse, LoginDto, AuthTokenDto } from '../types'

const TOKEN_KEY = 'civicdesk_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5136/api',
})

client.interceptors.request.use(config => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const auth = {
  login: async (dto: LoginDto): Promise<AuthTokenDto> => {
    const res = await client.post<AuthTokenDto>('/auth/login', dto)
    tokenStore.set(res.data.token)
    return res.data
  },
  logout: () => {
    tokenStore.clear()
  },
}

export const serviceRequests = {
  create: async (dto: CreateServiceRequestDto): Promise<ServiceRequest> => {
    const res = await client.post<ServiceRequest>('/servicerequests', dto)
    return res.data
  },

  getAll: async (): Promise<ServiceRequest[]> => {
    const res = await client.get<ServiceRequest[]>('/servicerequests')
    return res.data
  },

  getByReference: async (reference: string): Promise<ServiceRequest> => {
    const res = await client.get<ServiceRequest>(`/servicerequests/reference/${reference}`)
    return res.data
  },

  updateStatus: async (id: number, dto: UpdateStatusDto): Promise<ServiceRequest> => {
    const res = await client.patch<ServiceRequest>(`/servicerequests/${id}/status`, dto)
    return res.data
  }
}

export const chat = {
  send: async (sessionId: string, message: string): Promise<ChatResponse> => {
    const res = await client.post<ChatResponse>('/chat', { sessionId, message })
    return res.data
  }
}
