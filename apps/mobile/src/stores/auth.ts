import { defineStore } from 'pinia'
import { ref } from 'vue'
import { showToast } from 'vant'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const isAuthenticated = ref(!!token.value)

  const login = async (user: string, password: string) => {
    // 模拟登录（实际项目替换为真实API）
    if (user && password.length >= 6) {
      token.value = 'mock-token-' + Date.now()
      username.value = user
      isAuthenticated.value = true
      
      localStorage.setItem('token', token.value)
      localStorage.setItem('username', user)
      
      return { success: true, message: '登录成功' }
    }
    return { success: false, message: '用户名或密码错误' }
  }

  const logout = () => {
    token.value = ''
    username.value = ''
    isAuthenticated.value = false
    
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    
    showToast('退出成功')
  }

  const checkAuth = () => {
    const storedToken = localStorage.getItem('token') || ''
    const storedUsername = localStorage.getItem('username') || ''

    token.value = storedToken
    username.value = storedUsername
    isAuthenticated.value = !!storedToken

    return isAuthenticated.value
  }

  return {
    token,
    username,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  }
})
