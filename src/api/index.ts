import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:5777/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 这里可以添加一些请求前的处理，比如添加token等
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    // 处理错误响应
    if (error.response) {
      // 服务器返回错误响应
      console.error('API错误:', error.response.data)
    } else if (error.request) {
      // 请求已发送，但没有收到响应
      console.error('网络错误:', error.request)
    } else {
      // 设置请求时发生错误
      console.error('请求错误:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api
