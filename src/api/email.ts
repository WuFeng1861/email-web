import api from './index'

// 发送邮件的收件人类型
export interface EmailRecipient {
  email: string
  name?: string
}

// 发送邮件请求类型
export interface SendEmailRequest {
  app: string
  templateId: number
  templateData: Record<string, any>
  recipient: string
  recipientName?: string
  cc?: EmailRecipient[]
  bcc?: EmailRecipient[]
}

// 队列统计类型
export interface QueueStats {
  total: number
  pending: number
  sent: number
  failed: number
}

// 应用统计类型
export interface AppStats {
  [date: string]: {
    sent: number
    failed: number
  }
}

// 发送邮件
export const sendEmail = (data: SendEmailRequest) => {
  return api.post('/email/send', data)
}

// 获取队列统计
export const getQueueStats = () => {
  return api.get<QueueStats>('/email/stats')
}

// 获取应用统计
export const getAppStats = (app: string, startDate: string, endDate: string) => {
  return api.get<AppStats>('/email/app-stats', {
    params: { app, startDate, endDate }
  })
}