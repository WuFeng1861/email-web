import api from './index'

export interface AdminStatus {
  initialized: boolean
}

export interface LoginResult {
  token: string
  expiresAt: string
  username: string
}

/** 是否已经设置过管理员（决定显示「设置」还是「登录」） */
export const getAdminStatus = () => api.get('/admin/status') as unknown as Promise<AdminStatus>

/** 首次设置管理员：仅在 initialized=false 时可用，成功即视为登录 */
export const setupAdmin = (username: string, password: string) =>
  api.post('/admin/setup', { username, password }) as unknown as Promise<LoginResult>

export const login = (username: string, password: string) =>
  api.post('/admin/login', { username, password }) as unknown as Promise<LoginResult>

export const logout = () => api.post('/admin/logout') as unknown as Promise<void>

export const getMe = () =>
  api.get('/admin/me') as unknown as Promise<{ id: number; username: string }>

export interface ChangeCredentialsPayload {
  currentPassword: string
  newUsername?: string
  newPassword?: string
}

/** 改完所有旧会话失效，返回新 token（必须替换本地存的） */
export const changeCredentials = (payload: ChangeCredentialsPayload) =>
  api.post('/admin/change-credentials', payload) as unknown as Promise<LoginResult>
