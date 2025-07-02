<script setup>
import { useUserStore } from '@/stores/userStore'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const name = ref('')
const email = ref('')
const role = ref('')

const errors = ref({})

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().oneOf(['admin', 'viewer']).required('Role is required'),
})

// Fetch single user data
onMounted(async () => {
  await userStore.getUser(route.params.id)

  // Populate form with user data from store
  const user = userStore.user
  name.value = user.name
  email.value = user.email
  role.value = user.role
})

// Submit the edited user
const updateUser = async () => {
  errors.value = {} // Reset errors

  const userData = {
    id: userStore.user.id,
    name: name.value.trim(),
    email: email.value.trim(),
    role: role.value,
  }

  try {
    await schema.validate(userData, { abortEarly: false })

    await userStore.editUser(userData)

    // Optional: Reset fields after update
    name.value = ''
    email.value = ''
    role.value = 'admin'

    router.push('/')
  } catch (validationError) {
    if (validationError.inner) {
      validationError.inner.forEach((err) => {
        errors.value[err.path] = err.message
      })
    } else {
      alert('Validation failed')
    }
  }
}
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <div class="p-6 rounded shadow-xl w-96">
      <h2 class="text-2xl font-bold mb-4">Edit User</h2>
      <div class="space-y-4">
        <div>
          <input
            v-model="name"
            type="text"
            placeholder="Name"
            class="w-full border border-gray-300 rounded px-4 py-2"
          />
          <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full border border-gray-300 rounded px-4 py-2"
          />
          <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <select v-model="role" class="w-full border border-gray-300 rounded px-4 py-2">
            <option>admin</option>
            <option>viewer</option>
          </select>
          <p v-if="errors.role" class="text-red-500 text-sm mt-1">{{ errors.role }}</p>
        </div>

        <button
          @click="updateUser"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          Update User
        </button>
      </div>
    </div>
  </div>
</template>
