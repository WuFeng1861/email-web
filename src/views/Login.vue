<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '../components/BaseCard.vue'
import FormInput from '../components/FormInput.vue'
import { useAuthStore } from '../stores/auth'
import type { ApiError } from '../api/index'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')

const form = reactive({ username: '', password: '', confirm: '' })
const errors = reactive({ username: '', password: '', confirm: '' })

/** 没设置过管理员 → 显示「首次设置」，否则显示「登录」 */
const isSetup = computed(() => auth.initialized === false)
const title = computed(() => (isSetup.value ? '设置管理员账号' : '管理员登录'))
const subtitle = computed(() =>
  isSetup.value
    ? '第一次使用，请先创建管理员账号（账号密码可以之后在页面里修改）'
    : '查看凭证、模板、重启服务和图床管理都需要管理员登录'
)

onMounted(async () => {
  try {
    await auth.fetchStatus()
  } catch (e) {
    errorMessage.value = (e as ApiError).message || '无法连接后端服务'
  } finally {
    loading.value = false
  }
})

function validate(): boolean {
  errors.username = form.username.trim() ? '' : '请填写用户名'
  errors.password = form.password ? '' : '请填写密码'
  errors.confirm = isSetup.value && form.password !== form.confirm ? '两次输入的密码不一致' : ''
  if (isSetup.value && form.password && form.password.length < 8) {
    errors.password = '密码至少 8 位'
  }
  return !errors.username && !errors.password && !errors.confirm
}

async function submit() {
  if (!validate() || submitting.value) return
  submitting.value = true
  errorMessage.value = ''
  try {
    if (isSetup.value) {
      await auth.setup(form.username.trim(), form.password)
    } else {
      await auth.login(form.username.trim(), form.password)
    }
    router.replace('/')
  } catch (e) {
    errorMessage.value = (e as ApiError).message || '操作失败，请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">邮件服务管理后台</h1>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
      </div>

      <BaseCard :title="title" :loading="loading">
        <form @submit.prevent="submit" class="space-y-4">
          <FormInput
            v-model="form.username"
            label="用户名"
            placeholder="例如 admin"
            :error="errors.username"
            required
          />

          <FormInput
            v-model="form.password"
            type="password"
            label="密码"
            placeholder="至少 8 位，不能是纯数字"
            :error="errors.password"
            required
          />

          <FormInput
            v-if="isSetup"
            v-model="form.confirm"
            type="password"
            label="确认密码"
            placeholder="再输入一次"
            :error="errors.confirm"
            required
          />

          <div
            v-if="errorMessage"
            class="rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300"
          >
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary w-full justify-center" :disabled="submitting">
            <span v-if="submitting">处理中…</span>
            <span v-else>{{ isSetup ? '创建并登录' : '登录' }}</span>
          </button>
        </form>

        <p v-if="isSetup" class="mt-4 text-xs text-gray-500 dark:text-gray-400">
          提示：这个账号只在本地数据库里创建一次，创建后这个页面会变成登录页。
        </p>
      </BaseCard>
    </div>
  </div>
</template>
