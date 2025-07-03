<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter, RouterLink } from 'vue-router'
import * as yup from 'yup'

const userStore = useUserStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('viewer')

const errors = ref({})

// Validation schema
const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
  role: yup.string().oneOf(['admin', 'viewer']).required('Role is required'),
})

const handleRegister = async () => {
  errors.value = {}

  const userData = {
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value.trim(),
    role: role.value,
  }

  try {
    await schema.validate(userData, { abortEarly: false })

    await userStore.register(userData)

    name.value = ''
    email.value = ''
    password.value = ''
    role.value = 'viewer'

    alert('Registration successful!')
    router.push('/login')
  } catch (validationError) {
    if (validationError.inner) {
      validationError.inner.forEach((err) => {
        errors.value[err.path] = err.message
      })
    } else {
      errors.value.general = userStore.error || 'Invalid email or password'
    }
  }
}
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <form @submit.prevent="handleRegister" class="p-6 rounded shadow-xl w-96 bg-white">
      <h2 class="text-2xl font-bold mb-4">Register</h2>
      <p v-if="errors.general" class="text-red-500 text-sm mb-2">
        {{ errors.general }}
      </p>
      <div class="space-y-4">
        <!-- Name -->
        <div>
          <input
            v-model="name"
            type="text"
            placeholder="Name"
            class="w-full border border-gray-300 rounded px-4 py-2"
          />
          <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
        </div>

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

        <!-- Role -->
        <div>
          <select v-model="role" class="w-full border border-gray-300 rounded px-4 py-2">
            <option value="admin">admin</option>
            <option value="viewer">viewer</option>
          </select>
          <p v-if="errors.role" class="text-red-500 text-sm mt-1">{{ errors.role }}</p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          Register
        </button>

        <p class="text-sm text-center">
          Already have an account?
          <RouterLink to="/login" class="text-blue-500 hover:underline">Login</RouterLink>
        </p>
      </div>
    </form>
  </div>
</template>
