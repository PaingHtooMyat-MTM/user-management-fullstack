import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

export const useUserStore = defineStore('userStore', () => {
  const users = ref([])
  const user = ref({})
  const loading = ref(false)
  const error = ref(null)

  const token = ref(localStorage.getItem('token') || '')
  const currentUser = ref(token.value ? jwtDecode(token.value) : null)

  const totalUsers = computed(() => users.value.length)
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => currentUser.value?.role || '')

  // Fetch all users
  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get('http://localhost:5001/users')
      users.value = res.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  //  Fetch single user by ID
  const getUser = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5001/users/${userId}`)
      user.value = res.data
    } catch (err) {
      error.value = err.message
    }
  }

  //  Edit user
  const editUser = async (userData) => {
    try {
      const res = await axios.put(`http://localhost:5001/users/${userData.id}`, userData)
      const index = users.value.findIndex((u) => u.id === userData.id)
      if (index !== -1) users.value[index] = res.data

      // 🔥 Check if current user edited themselves
      if (userData.id === currentUser.value?.id) {
        alert('Your role has changed. Please log in again to apply changes.')
        logout()
        router.push('/login')
      }
    } catch (err) {
      error.value = err.message
    }
  }

  //  Remove user
  const removeUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5001/users/${userId}`)
      users.value = users.value.filter((u) => u.id !== userId)

      // 🔥 If the logged-in user banned themselves
      if (userId === currentUser.value?.id) {
        alert('You have deleted your own account. Logging out.')
        logout()
        router.push('/login')
      }
    } catch (err) {
      error.value = err.message
    }
  }

  // Register
  const register = async (userData) => {
    try {
      await axios.post('http://localhost:5001/register', userData)
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    }
  }

  // Login
  const login = async (credentials) => {
    try {
      const res = await axios.post('http://localhost:5001/login', credentials)
      token.value = res.data.token
      localStorage.setItem('token', token.value)
      currentUser.value = jwtDecode(token.value)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    }
  }

  // Logout
  const logout = () => {
    token.value = ''
    currentUser.value = null
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  // Fetch Profile
  const fetchProfile = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get('http://localhost:5001/profile')
      currentUser.value = res.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
    } finally {
      loading.value = false
    }
  }

  // Auto set axios token if token exists
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return {
    // State
    users,
    user,
    loading,
    error,
    token,
    currentUser,

    // Getters
    totalUsers,
    isAuthenticated,
    userRole,

    // Actions
    fetchUsers,
    getUser,
    editUser,
    removeUser,
    login,
    logout,
    register,
    fetchProfile, // Profile fetch
  }
})
