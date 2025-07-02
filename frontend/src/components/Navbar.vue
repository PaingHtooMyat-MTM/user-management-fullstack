<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav
    class="fixed top-0 left-0 w-full bg-blue-500 shadow px-6 py-4 flex justify-between items-center"
  >
    <RouterLink to="/">
      <div class="text-2xl font-bold text-white">User Management</div>
    </RouterLink>
    <div class="flex space-x-6 text-white">
      <!-- Home Link -->
      <RouterLink
        to="/"
        class="hover:text-gray-200"
        :class="{ 'font-semibold underline': route.path === '/' }"
      >
        Home
      </RouterLink>

      <!-- Login (if not authenticated) -->
      <RouterLink
        v-if="!userStore.isAuthenticated"
        to="/login"
        class="hover:text-gray-200"
        :class="{ 'font-semibold underline': route.path === '/login' }"
      >
        Login
      </RouterLink>

      <!-- Profile (if authenticated) -->
      <RouterLink
        v-if="userStore.isAuthenticated"
        to="/profile"
        class="hover:text-gray-200"
        :class="{ 'font-semibold underline': route.path === '/profile' }"
      >
        Profile
      </RouterLink>

      <!-- Logout Button (if authenticated) -->
      <button
        v-if="userStore.isAuthenticated"
        @click="handleLogout"
        class="hover:text-gray-200 cursor-pointer"
      >
        Logout
      </button>
    </div>
  </nav>
</template>
