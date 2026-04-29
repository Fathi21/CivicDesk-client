import axios from 'axios'
import type { ServiceRequest, CreateServiceRequestDto, UpdateStatusDto, ChatResponse, LoginDto, ResidentLoginDto, AuthTokenDto } from '../types'

const ADMIN_TOKEN_KEY = 'civicdesk_admin_token'
const RESIDENT_TOKEN_KEY = 'civicdesk_resident_token'

export const tokenStore = {
  getAdmin: () => localStorage.getItem(ADMIN_TOKEN_KEY),
  setAdmin: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  clearAdmin: () => localStorage.removeItem(ADMIN_TOKEN_KEY),
  isAdmin: () => !!localStorage.getItem(ADMIN_TOKEN_KEY),
  getResident: () => localStorage.getItem(RESIDENT_TOKEN_KEY),
  setResident: (token: string) => localStorage.setItem(RESIDENT_TOKEN_KEY, token),
  clearResident: () => localStorage.removeItem(RESIDENT_TOKEN_KEY),
  isResident: () => !!localStorage.getItem(RESIDENT_TOKEN_KEY),
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

// Attach admin token unless the call already has an Authorization header (resident calls set their own)
client.interceptors.request.use(config => {
  if (!config.headers.Authorization) {
    const token = tokenStore.getAdmin()
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const residentAuthHeader = () => {
  const token = tokenStore.getResident()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const auth = {
  login: async (dto: LoginDto): Promise<AuthTokenDto> => {
    const res = await client.post<AuthTokenDto>('/auth/login', dto)
    tokenStore.setAdmin(res.data.token)
    return res.data
  },
  logout: () => {
    tokenStore.clearAdmin()
  },
  residentLogin: async (dto: ResidentLoginDto): Promise<AuthTokenDto> => {
    const res = await client.post<AuthTokenDto>('/auth/resident/login', dto)
    tokenStore.setResident(res.data.token)
    return res.data
  },
  residentLogout: () => {
    tokenStore.clearResident()
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

  getMy: async (): Promise<ServiceRequest[]> => {
    const res = await client.get<ServiceRequest[]>('/servicerequests/my', {
      headers: residentAuthHeader()
    })
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
