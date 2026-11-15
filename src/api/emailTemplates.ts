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

export interface PageMeta {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

export interface TemplatePage {
  items: EmailTemplate[]
  meta: PageMeta
}

/** 分页查询（列表页用） */
export const getEmailTemplatesPage = (page = 1, limit = 20) =>
  api.get('/email-templates', { params: { page, limit } }) as unknown as Promise<TemplatePage>

/**
 * 取全部模板（下拉选用）。
 * 后端单页上限 100，模板量不大，取一页足够；超过 100 条要改成翻页累加。
 */
export const getAllEmailTemplates = async (): Promise<EmailTemplate[]> => {
  const res = await getEmailTemplatesPage(1, 100)
  return res.items
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