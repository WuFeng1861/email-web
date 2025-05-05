import api from './index'

// 系统统计响应类型
export interface SystemStatistics {
  emailQueue: {
    total: number
    pending: number
    sent: number
    failed: number
  }
  emailKeys: {
    total: number
    byApp: {
      [appName: string]: {
        count: number
        totalDailyLimit: number
      }
    }
  }
  templates: {
    total: number
  }
}

// 应用统计类型
export interface AppStatistics {
  emailsSent: {
    total: number
    byDate: {
      [date: string]: number
    }
  }
  emailsFailed: {
    total: number
    byDate: {
      [date: string]: number
    }
  }
}

// 获取系统统计
export const getSystemStatistics = () => {
  return api.get<SystemStatistics>('/statistics')
}

// 获取应用统计
export const getAppStatistics = (app: string, startDate: string, endDate: string) => {
  return api.get<AppStatistics>('/statistics/app', {
    params: { app, startDate, endDate }
  })
}

// 重启系统
export const restartSystem = (password: string) => {
  return api.post('/system/restart-p', { password })
}