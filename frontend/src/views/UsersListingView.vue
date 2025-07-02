<script setup>
import { useUserStore } from '@/stores/userStore'
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const userStore = useUserStore()

const role = userStore.userRole

onMounted(() => {
  userStore.fetchUsers()
})

const banUser = (userId) => {
  userStore.removeUser(userId)
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">User List</h1>

    <div
      v-if="!userStore.loading && userStore.users.length === 0"
      class="text-center text-gray-500 mt-4"
    >
      No users found.
    </div>

    <div v-if="userStore.loading" class="text-blue-500">Loading...</div>

    <div v-else>
      <!-- Table Header -->
      <div
        class="grid font-semibold bg-gray-200 p-3 rounded-t"
        :class="role === 'viewer' || !role ? 'grid-cols-3' : 'grid-cols-4'"
      >
        <div>Name</div>
        <div>Email</div>
        <div>Role</div>
        <div v-if="role === 'admin'" class="text-center">Actions</div>
      </div>

      <!-- Table Rows -->
      <div
        v-for="user in userStore.users"
        :key="user.id"
        class="grid border-b border-gray-200 p-3 hover:bg-gray-50 items-center"
        :class="role === 'viewer' || !role ? 'grid-cols-3' : 'grid-cols-4'"
      >
        <div>{{ user.name }}</div>
        <div>{{ user.email }}</div>
        <div>{{ user.role }}</div>

        <div v-if="role === 'admin'" class="flex justify-center">
          <RouterLink :to="`/edit/${user.id}`">
            <button class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 mr-2">
              Edit
            </button>
          </RouterLink>

          <button
            v-if="role === 'admin'"
            @click="banUser(user.id)"
            class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Ban
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-4">
        <span class="font-medium">Total Users:</span> {{ userStore.totalUsers }}
      </div>
    </div>
  </div>
</template>
