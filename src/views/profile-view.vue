<template>
  <div class="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-3xl">
      <div class="rounded-lg bg-white shadow">
        <!-- Header -->
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Thông tin tài khoản</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Quản lý thông tin cá nhân và bảo mật tài khoản
          </p>
        </div>

        <!-- Profile Form -->
        <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form @submit.prevent="handleUpdateProfile">
            <div class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
              <div class="sm:col-span-3">
                <label for="name" class="block text-sm font-medium text-gray-700"> Họ tên </label>
                <div class="mt-1">
                  <input
                    id="name"
                    v-model="profileForm.ten"
                    type="text"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div class="sm:col-span-3">
                <label for="email" class="block text-sm font-medium text-gray-700"> Email </label>
                <div class="mt-1">
                  <input
                    id="email"
                    v-model="profileForm.email"
                    type="email"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div v-if="profileError" class="mt-4 text-sm text-red-600">
              {{ profileError }}
            </div>

            <div class="mt-6">
              <button
                type="submit"
                :disabled="profileLoading"
                class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                {{ profileLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Change Password Section -->
        <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
          <h4 class="mb-4 text-lg leading-6 font-medium text-gray-900">Đổi mật khẩu</h4>

          <form @submit.prevent="handleChangePassword">
            <div class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
              <div class="sm:col-span-3">
                <label for="oldPassword" class="block text-sm font-medium text-gray-700">
                  Mật khẩu cũ
                </label>
                <div class="mt-1">
                  <input
                    id="oldPassword"
                    v-model="passwordForm.oldPassword"
                    type="password"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div class="sm:col-span-3">
                <label for="newPassword" class="block text-sm font-medium text-gray-700">
                  Mật khẩu mới
                </label>
                <div class="mt-1">
                  <input
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    type="password"
                    required
                    minlength="6"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div v-if="passwordError" class="mt-4 text-sm text-red-600">
              {{ passwordError }}
            </div>

            <div class="mt-6">
              <button
                type="submit"
                :disabled="passwordLoading"
                class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                {{ passwordLoading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Logout Section -->
        <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-lg leading-6 font-medium text-gray-900">Đăng xuất</h4>
              <p class="mt-1 text-sm text-gray-500">Đăng xuất khỏi tài khoản hiện tại</p>
            </div>
            <button
              @click="handleLogout"
              class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, updateProfile, changePassword, logout } = useAuth()

const profileLoading = ref(false)
const profileError = ref('')
const passwordLoading = ref(false)
const passwordError = ref('')

const profileForm = reactive({
  ten: '',
  email: '',
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
})

onMounted(() => {
  if (user) {
    profileForm.ten = user.ten
    profileForm.email = user.email
  }
})

const handleUpdateProfile = async () => {
  profileLoading.value = true
  profileError.value = ''

  try {
    const result = await updateProfile({
      ten: profileForm.ten,
      email: profileForm.email,
    })

    if (result.success) {
      // Clear form
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
    } else {
      profileError.value = result.error || 'Cập nhật thất bại'
    }
  } catch {
    profileError.value = 'Có lỗi xảy ra, vui lòng thử lại'
  } finally {
    profileLoading.value = false
  }
}

const handleChangePassword = async () => {
  passwordLoading.value = true
  passwordError.value = ''

  try {
    const result = await changePassword(passwordForm.oldPassword, passwordForm.newPassword)

    if (result.success) {
      // Clear form
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
    } else {
      passwordError.value = result.error || 'Đổi mật khẩu thất bại'
    }
  } catch {
    passwordError.value = 'Có lỗi xảy ra, vui lòng thử lại'
  } finally {
    passwordLoading.value = false
  }
}

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>
