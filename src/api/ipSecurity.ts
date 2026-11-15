import api from './index'

export type IpRuleMode = 'black' | 'white'

export interface IpRule {
  id: number
  pattern: string
  mode: IpRuleMode
  note?: string | null
  hitCount?: number
  lastHitAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Paged<T> {
  items: T[]
  meta: {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}

export interface IpFilterSettings {
  blacklistEnabled: boolean
  whitelistEnabled: boolean
}

export interface RequestLog {
  id: number
  ip: string
  method: string
  path: string
  status: number
  blocked: number
  userAgent?: string
  createdAt: string
}

export interface RequestStat {
  ip: string
  total: number
  blocked: number
  lastSeen: string
  lastPath: string
}

/* ---------------- 名单 ---------------- */

export const listIpRules = (params: { page?: number; limit?: number; mode?: IpRuleMode; q?: string } = {}) =>
  api.get('/admin/ip-rules', { params }) as unknown as Promise<Paged<IpRule>>

export const createIpRule = (payload: { pattern: string; mode: IpRuleMode; note?: string }) =>
  api.post('/admin/ip-rules', payload) as unknown as Promise<IpRule>

/** 传 mode='white' 就是「黑名单转白名单」 */
export const updateIpRule = (id: number, payload: { mode?: IpRuleMode; note?: string }) =>
  api.patch(`/admin/ip-rules/${id}`, payload) as unknown as Promise<IpRule>

export const promoteIpRule = (id: number) =>
  api.post(`/admin/ip-rules/${id}/promote`) as unknown as Promise<IpRule>

export const deleteIpRule = (id: number) => api.delete(`/admin/ip-rules/${id}`) as unknown as Promise<void>

/* ---------------- 开关 ---------------- */

export const getIpFilterSettings = () =>
  api.get('/admin/ip-filter/settings') as unknown as Promise<IpFilterSettings>

export const updateIpFilterSettings = (payload: Partial<IpFilterSettings>) =>
  api.patch('/admin/ip-filter/settings', payload) as unknown as Promise<IpFilterSettings>

/* ---------------- 访问记录 ---------------- */

export const listRequests = (params: { page?: number; limit?: number; ip?: string; onlyBlocked?: string } = {}) =>
  api.get('/admin/requests', { params }) as unknown as Promise<Paged<RequestLog>>

export const requestStats = (params: { days?: number; limit?: number } = {}) =>
  api.get('/admin/requests/stats', { params }) as unknown as Promise<{
    days: number
    total: number
    items: RequestStat[]
  }>
