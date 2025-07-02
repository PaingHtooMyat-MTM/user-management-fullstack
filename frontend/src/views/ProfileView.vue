<script setup>
import { useUserStore } from '@/stores/userStore'
import { onMounted } from 'vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.fetchProfile()
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Profile</h1>

    <div v-if="userStore.loading" class="text-blue-500">Loading...</div>
    <div v-if="userStore.error" class="text-red-500">{{ userStore.error }}</div>

    <div v-if="!userStore.loading && !userStore.error" class="bg-white p-6 rounded shadow">
      <p><strong>Name:</strong> {{ userStore.currentUser.name }}</p>
      <p><strong>Email:</strong> {{ userStore.currentUser.email }}</p>
      <p><strong>Role:</strong> {{ userStore.currentUser.role }}</p>
    </div>
  </div>
</template>
