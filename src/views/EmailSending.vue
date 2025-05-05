<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from '../components/BaseCard.vue'
import FormInput from '../components/FormInput.vue'
import FormSelect from '../components/FormSelect.vue'
import FormTextarea from '../components/FormTextarea.vue'
import { sendEmail, EmailRecipient } from '../api/email'
import { getAllEmailTemplates, EmailTemplate } from '../api/emailTemplates'
import {getAppEmailKeys, EmailKey, getAllEmailKeys} from '../api/emailKeys';

const { t } = useI18n()

// 加载状态
const loading = ref(false)
// 发送加载状态
const sendLoading = ref(false)
// 邮件模板列表
const emailTemplates = ref<EmailTemplate[]>([])
// 应用列表
const apps = ref<string[]>([])

// 邮件发送表单
const formData = reactive({
  app: '',
  templateId: '',
  templateData: '',
  recipient: '',
  recipientName: '',
  cc: [] as EmailRecipient[],
  bcc: [] as EmailRecipient[]
})

// 表单错误信息
const formErrors = reactive({
  app: '',
  templateId: '',
  templateData: '',
  recipient: '',
  recipientName: ''
})

// 获取邮件模板列表
const fetchEmailTemplates = async () => {
  try {
    loading.value = true
    emailTemplates.value = await getAllEmailTemplates()
  } catch (error) {
    console.error('获取邮件模板失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取应用列表
const fetchApps = async () => {
  try {
    loading.value = true
    const keys = await getAllEmailKeys()
    // 提取不重复的应用名称
    const appSet = new Set<string>()
    keys.forEach((key: EmailKey) => {
      appSet.add(key.app)
    })
    apps.value = Array.from(appSet)
  } catch (error) {
    console.error('获取应用列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 添加抄送
const addCc = () => {
  formData.cc.push({ email: '', name: '' })
}

// 删除抄送
const removeCc = (index: number) => {
  formData.cc.splice(index, 1)
}

// 添加密送
const addBcc = () => {
  formData.bcc.push({ email: '', name: '' })
}

// 删除密送
const removeBcc = (index: number) => {
  formData.bcc.splice(index, 1)
}

// 验证表单
const validateForm = (): boolean => {
  let isValid = true

  // 验证应用名称
  if (!formData.app) {
    formErrors.app = t('emailSending.app') + ' ' + t('common.required')
    isValid = false
  } else {
    formErrors.app = ''
  }

  // 验证模板ID
  if (!formData.templateId) {
    formErrors.templateId = t('emailSending.templateId') + ' ' + t('common.required')
    isValid = false
  } else {
    formErrors.templateId = ''
  }

  // 验证模板数据
  if (!formData.templateData) {
    formErrors.templateData = t('emailSending.templateData') + ' ' + t('common.required')
    isValid = false
  } else {
    try {
      JSON.parse(formData.templateData)
      formErrors.templateData = ''
    } catch (e) {
      formErrors.templateData = t('emailSending.jsonError')
      isValid = false
    }
  }

  // 验证收件人
  if (!formData.recipient) {
    formErrors.recipient = t('emailSending.recipient') + ' ' + t('common.required')
    isValid = false
  } else {
    formErrors.recipient = ''
  }

  // 验证抄送和密送邮箱格式
  for (const cc of formData.cc) {
    if (cc.email && !validateEmail(cc.email)) {
      isValid = false
      alert(t('emailSending.email') + ' ' + cc.email + ' ' + t('common.invalid'))
      break
    }
  }

  for (const bcc of formData.bcc) {
    if (bcc.email && !validateEmail(bcc.email)) {
      isValid = false
      alert(t('emailSending.email') + ' ' + bcc.email + ' ' + t('common.invalid'))
      break
    }
  }

  return isValid
}

// 验证邮箱格式
const validateEmail = (email: string): boolean => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

// 发送邮件
const handleSendEmail = async () => {
  if (!validateForm()) return

  try {
    sendLoading.value = true

    // 过滤掉空的cc和bcc
    const cc = formData.cc.filter(item => item.email)
    const bcc = formData.bcc.filter(item => item.email)

    await sendEmail({
      app: formData.app,
      templateId: Number(formData.templateId),
      templateData: JSON.parse(formData.templateData),
      recipient: formData.recipient,
      recipientName: formData.recipientName,
      cc: cc.length > 0 ? cc : undefined,
      bcc: bcc.length > 0 ? bcc : undefined
    })

    alert(t('emailSending.sendSuccess'))

    // 重置部分表单数据
    formData.recipient = ''
    formData.recipientName = ''
    formData.cc = []
    formData.bcc = []
  } catch (error) {
    console.error('发送邮件失败:', error)
    alert(t('emailSending.sendFailed'))
  } finally {
    sendLoading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchEmailTemplates()
  fetchApps()
})
</script>

<template>
  <BaseCard :title="t('emailSending.send')">
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
    </div>

    <form v-else @submit.prevent="handleSendEmail" class="max-w-3xl mx-auto">
      <!-- 应用名称 -->
      <FormSelect
        v-model="formData.app"
        :options="apps.map(app => ({ value: app, label: app }))"
        :label="t('emailSending.app')"
        :placeholder="t('emailSending.app')"
        :error="formErrors.app"
        required
      />

      <!-- 模板ID -->
      <FormSelect
        v-model="formData.templateId"
        :options="emailTemplates.map(template => ({
          value: template.id?.toString() || '',
          label: `${template.id} - ${template.name}`
        }))"
        :label="t('emailSending.templateId')"
        :placeholder="t('emailSending.templateId')"
        :error="formErrors.templateId"
        required
      />

      <!-- 模板数据 -->
      <FormTextarea
        v-model="formData.templateData"
        :label="t('emailSending.templateData')"
        :placeholder="t('emailSending.enterJson')"
        :error="formErrors.templateData"
        required
      />

      <!-- 收件人 -->
      <FormInput
        v-model="formData.recipient"
        type="email"
        :label="t('emailSending.recipient')"
        :placeholder="t('emailSending.recipient')"
        :error="formErrors.recipient"
        required
      />

      <!-- 收件人姓名 -->
      <FormInput
        v-model="formData.recipientName"
        :label="t('emailSending.recipientName')"
        :placeholder="t('emailSending.recipientName')"
        :error="formErrors.recipientName"
      />

      <!-- 抄送 -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('emailSending.cc') }}
          </label>
          <button
            type="button"
            @click="addCc"
            class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {{ t('emailSending.addCc') }}
          </button>
        </div>

        <div v-for="(cc, index) in formData.cc" :key="'cc' + index" class="flex space-x-2 mb-2">
          <div class="flex-1">
            <input
              v-model="cc.email"
              type="email"
              :placeholder="t('emailSending.email')"
              class="input"
            />
          </div>
          <div class="flex-1">
            <input
              v-model="cc.name"
              type="text"
              :placeholder="t('emailSending.name')"
              class="input"
            />
          </div>
          <div class="flex items-center">
            <button
              type="button"
              @click="removeCc(index)"
              class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 密送 -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('emailSending.bcc') }}
          </label>
          <button
            type="button"
            @click="addBcc"
            class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {{ t('emailSending.addBcc') }}
          </button>
        </div>

        <div v-for="(bcc, index) in formData.bcc" :key="'bcc' + index" class="flex space-x-2 mb-2">
          <div class="flex-1">
            <input
              v-model="bcc.email"
              type="email"
              :placeholder="t('emailSending.email')"
              class="input"
            />
          </div>
          <div class="flex-1">
            <input
              v-model="bcc.name"
              type="text"
              :placeholder="t('emailSending.name')"
              class="input"
            />
          </div>
          <div class="flex items-center">
            <button
              type="button"
              @click="removeBcc(index)"
              class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="mt-6 flex justify-end">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="sendLoading"
        >
          <span v-if="sendLoading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ t('common.loading') }}
          </span>
          <span v-else>{{ t('emailSending.send') }}</span>
        </button>
      </div>
    </form>
  </BaseCard>
</template>
