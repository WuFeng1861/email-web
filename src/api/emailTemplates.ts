import api from './index'

// 定义邮件模板类型
export interface EmailTemplate {
  id?: number
  name: string
  subject: string
  content: string
  type: 'html' | 'text'
  createdAt?: string
  updatedAt?: string
}

// 获取所有邮件模板
export const getAllEmailTemplates = () => {
  return api.get<EmailTemplate[]>('/email-templates')
}

// 获取特定邮件模板
export const getEmailTemplate = (id: number) => {
  return api.get<EmailTemplate>(`/email-templates/${id}`)
}

// 创建邮件模板
export const createEmailTemplate = (data: EmailTemplate) => {
  return api.post<EmailTemplate>('/email-templates', data)
}

// 更新邮件模板
export const updateEmailTemplate = (id: number, data: Partial<EmailTemplate>) => {
  return api.patch<EmailTemplate>(`/email-templates/${id}`, data)
}

// 删除邮件模板
export const deleteEmailTemplate = (id: number) => {
  return api.delete(`/email-templates/${id}`)
}