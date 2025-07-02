<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter, RouterLink } from 'vue-router'
import * as yup from 'yup'

const userStore = useUserStore()
const router = useRouter()

const email = ref('')
const password = ref('')

const errors = ref({})

// Validation schema
const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

const handleLogin = async () => {
  errors.value = {}

  const credentials = {
    email: email.value.trim(),
    password: password.value.trim(),
  }

  try {
    await schema.validate(credentials, { abortEarly: false })

    await userStore.login(credentials)

    email.value = ''
    password.value = ''

    router.push('/')
  } catch (validationError) {
    if (validationError.inner) {
      validationError.inner.forEach((err) => {
        errors.value[err.path] = err.message
      })
    } else {
      alert(userStore.error || 'Validation failed')
    }
  }
}
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <form @submit.prevent="handleLogin" class="p-6 rounded shadow-xl w-96 bg-white">
      <h2 class="text-2xl font-bold mb-4">Login</h2>
      <div class="space-y-4">
        <!-- Email -->
        <div>
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full border border-gray-300 rounded px-4 py-2"
          />
          <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div>
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="w-full border border-gray-300 rounded px-4 py-2"
          />
          <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          Login
        </button>

        <p class="text-sm text-center">
          Don't have an account?
          <RouterLink to="/register" class="text-blue-500 hover:underline">Register</RouterLink>
        </p>
      </div>
    </form>
  </div>
</template>
