import { defineStore } from 'pinia'
import { ref } from 'vue'

interface UserInfo {
  id: string | number
  username: string
  email?: string
  avatar?: string
  role?: string
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfo | null>(null)
  const isAuthenticated = ref<boolean>(!!token.value)

  // 初始化用户信息
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    try {
      userInfo.value = JSON.parse(storedUserInfo)
    } catch (e) {
      console.error('Failed to parse user info:', e)
    }
  }

  // 登录
  const login = async (username: string, password: string) => {
    try {
      // TODO: 替换为实际的 API 调用
      // const response = await loginAPI({ username, password })
      
      // 模拟登录成功
      const mockToken = 'mock_token_' + Date.now()
      const mockUser: UserInfo = {
        id: 1,
        username: username,
        email: `${username}@example.com`,
        role: 'admin'
      }

      // 保存 token 和用户信息
      token.value = mockToken
      userInfo.value = mockUser
      isAuthenticated.value = true

      // 持久化到 localStorage
      localStorage.setItem('token', mockToken)
      localStorage.setItem('userInfo', JSON.stringify(mockUser))

      return { success: true, message: '登录成功' }
    } catch (error: any) {
      return { success: false, message: error.message || '登录失败' }
    }
  }

  // 登出
  const logout = () => {
    token.value = null
    userInfo.value = null
    isAuthenticated.value = false

    // 清除 localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  // 更新用户信息
  const updateUserInfo = (info: Partial<UserInfo>) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  }

  // 检查认证状态
  const checkAuth = () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
      isAuthenticated.value = true
      
      const storedUserInfo = localStorage.getItem('userInfo')
      if (storedUserInfo) {
        try {
          userInfo.value = JSON.parse(storedUserInfo)
        } catch (e) {
          console.error('Failed to parse user info:', e)
        }
      }
    } else {
      logout()
    }
    return isAuthenticated.value
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    login,
    logout,
    updateUserInfo,
    checkAuth,
  }
})
