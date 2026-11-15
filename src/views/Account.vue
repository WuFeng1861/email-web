<script setup lang="ts">
import { reactive, ref } from 'vue'
import BaseCard from '../components/BaseCard.vue'
import FormInput from '../components/FormInput.vue'
import { useAuthStore } from '../stores/auth'
import type { ApiError } from '../api/index'

const auth = useAuthStore()

const form = reactive({
  currentPassword: '',
  newUsername: auth.username,
  newPassword: '',
  confirmPassword: ''
})

const errors = reactive({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' })
const saving = ref(false)
const okMessage = ref('')
const errorMessage = ref('')

function validate(): boolean {
  errors.currentPassword = form.currentPassword ? '' : '请输入当前密码'
  errors.newUsername = form.newUsername.trim() ? '' : '用户名不能为空'
  errors.newPassword =
    form.newPassword && form.newPassword.length < 8 ? '新密码至少 8 位' : ''
  errors.confirmPassword =
    form.newPassword && form.newPassword !== form.confirmPassword ? '两次输入的新密码不一致' : ''
  return !errors.currentPassword && !errors.newUsername && !errors.newPassword && !errors.confirmPassword
}

async function submit() {
  okMessage.value = ''
  errorMessage.value = ''
  if (!validate() || saving.value) return

  const usernameChanged = form.newUsername.trim() && form.newUsername.trim() !== auth.username
  if (!usernameChanged && !form.newPassword) {
    errorMessage.value = '用户名和密码都没有修改'
    return
  }

  saving.value = true
  try {
    await auth.changeCredentials({
      currentPassword: form.currentPassword,
      newUsername: usernameChanged ? form.newUsername.trim() : undefined,
      newPassword: form.newPassword || undefined
    })
    okMessage.value = '已保存。其它设备上的登录会立即失效，需要重新登录。'
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (e) {
    errorMessage.value = (e as ApiError)?.message || '保存失败'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">账号设置</h1>

    <div
      v-if="okMessage"
      class="rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-3 py-2 text-sm text-green-700 dark:text-green-300"
    >
      {{ okMessage }}
    </div>
    <div
      v-if="errorMessage"
      class="rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300"
    >
      {{ errorMessage }}
    </div>

    <BaseCard title="修改用户名 / 密码">
      <form class="space-y-4" @submit.prevent="submit">
        <FormInput
          v-model="form.currentPassword"
          type="password"
          label="当前密码"
          placeholder="修改前需要验证当前密码"
          :error="errors.currentPassword"
          required
        />

        <FormInput
          v-model="form.newUsername"
          label="用户名"
          placeholder="不想改就保持原样"
          :error="errors.newUsername"
        />

        <FormInput
          v-model="form.newPassword"
          type="password"
          label="新密码"
          placeholder="留空表示不修改，至少 8 位且不能纯数字"
          :error="errors.newPassword"
        />

        <FormInput
          v-model="form.confirmPassword"
          type="password"
          label="确认新密码"
          placeholder="再输入一次新密码"
          :error="errors.confirmPassword"
        />

        <div class="flex justify-end">
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? '保存中…' : '保存' }}
          </button>
        </div>
      </form>
    </BaseCard>

    <BaseCard title="说明">
      <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-5">
        <li>密码用 scrypt 加盐哈希存储，后端不保存明文，所以这里只能「重设」不能「查看」。</li>
        <li>保存成功后，所有旧的登录会话立即失效；当前页面会自动换上新的凭证，不用重新登录。</li>
        <li>账号只存在本地 SQLite（<code class="text-xs">admin_users</code> 表），忘记密码需要直接改数据库。</li>
      </ul>
    </BaseCard>
  </div>
</template>
