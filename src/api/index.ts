import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

/**
 * 后端基地址：优先取 VITE_API_BASE_URL，没配就用生产路径。
 * 本地开发可在 .env.local 里写 VITE_API_BASE_URL=http://127.0.0.1:5777/api
 */
const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  'https://wufeng98.cn/emailServerApi2/api'

/** 前端挂在 /emailWeb/ 下，登录页也在这个前缀里 */
const APP_BASE = '/emailWeb/'

const TOKEN_KEY = 'email_admin_token'

export const getToken = (): string => localStorage.getItem(TOKEN_KEY) || ''
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY)

/** token 失效时统一跳登录页（避免多处重复写） */
export function redirectToLogin(): void {
  clearToken()
  if (!window.location.pathname.startsWith(`${APP_BASE}login`)) {
    window.location.replace(`${APP_BASE}login`)
  }
}

export interface ApiError {
  status?: number
  message: string
  raw?: unknown
}

/** 后端错误体可能是 { message: string } 或 { message: string[] } */
function pickMessage(data: unknown): string {
  const raw = (data as { message?: unknown } | undefined)?.message
  if (Array.isArray(raw)) return String(raw[0] ?? '')
  if (typeof raw === 'string') return raw
  return ''
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// 所有管理接口都要带 token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response.data,
  (error: AxiosError) => {
    const status = error.response?.status
    let message = pickMessage(error.response?.data)

    if (status === 401) {
      redirectToLogin()
      message = message || '登录已过期，请重新登录'
    } else if (status === 403) {
      // IP 黑白名单拦截：登录也没用，只提示不跳转
      message = message || '来源 IP 已被限制访问'
    } else if (status === 429) {
      message = message || '操作过于频繁，请稍后再试'
    } else if (status === 400) {
      message = message || '请求参数有误'
    } else if (!error.response) {
      message = error.code === 'ECONNABORTED' ? '请求超时' : '无法连接到服务器'
    }

    if (message) console.warn('[api]', status ?? '-', message)
    return Promise.reject({ status, message, raw: error } as ApiError)
  }
)

export default api
