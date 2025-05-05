import api from './index'

// 定义邮件凭证类型
export interface EmailKey {
  id?: number
  user: string
  pass: string
  app: string
  emailCompany: 'QQ' | '163' | 'ali' | 'gmail' | 'outlook' | 'other'
  limitCount: number
  sentCount?: number
  lastResetDate?: string
  createdAt?: string
  updatedAt?: string
}

// 获取所有邮件凭证
export const getAllEmailKeys = () => {
  return api.get<EmailKey[]>('/email-keys')
}

// 获取特定邮件凭证
export const getEmailKey = (id: number) => {
  return api.get<EmailKey>(`/email-keys/${id}`)
}

// 获取应用的邮件凭证
export const getAppEmailKeys = (app: string) => {
  return api.get<EmailKey[]>(`/email-keys/app/${app}`)
}

// 创建邮件凭证
export const createEmailKey = (data: EmailKey) => {
  return api.post<EmailKey>('/email-keys', data)
}

// 更新邮件凭证
export const updateEmailKey = (id: number, data: Partial<EmailKey>) => {
  return api.patch<EmailKey>(`/email-keys/${id}`, data)
}

// 删除邮件凭证
export const deleteEmailKey = (id: number) => {
  return api.delete(`/email-keys/${id}`)
}