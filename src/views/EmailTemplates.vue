<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from '../components/BaseCard.vue'
import DataTable from '../components/DataTable.vue'
import BaseModal from '../components/BaseModal.vue'
import FormInput from '../components/FormInput.vue'
import FormSelect from '../components/FormSelect.vue'
import FormTextarea from '../components/FormTextarea.vue'
import { getAllEmailTemplates, getEmailTemplate, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate, EmailTemplate } from '../api/emailTemplates'

const { t } = useI18n()

// 加载状态
const loading = ref(true)
// 邮件模板列表
const emailTemplates = ref<EmailTemplate[]>([])
// 显示创建/编辑模态框
const showModal = ref(false)
// 显示预览模态框
const showPreviewModal = ref(false)
// 是否为编辑模式
const isEditMode = ref(false)
// 显示删除确认模态框
const showDeleteModal = ref(false)
// 当前操作的模板ID
const currentTemplateId = ref<number | null>(null)
// 操作加载状态
const actionLoading = ref(false)

// 表单数据
const formData = reactive<EmailTemplate>({
  name: '',
  subject: '',
  content: '',
  type: 'html'
})

// 表单错误信息
const formErrors = reactive({
  name: '',
  subject: '',
  content: ''
})

// 表格列定义
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: t('emailTemplates.name') },
  { key: 'subject', label: t('emailTemplates.subject') },
  {
    key: 'type',
    label: t('emailTemplates.type'),
    formatter: (value: string) => t(`emailTemplates.${value}`)
  },
  {
    key: 'createdAt',
    label: t('emailTemplates.createdAt'),
    formatter: (value: string) => new Date(value).toLocaleString()
  }
]

// 内容类型选项
const contentTypeOptions = [
  { value: 'html', label: t('emailTemplates.html') },
  { value: 'text', label: t('emailTemplates.text') }
]

// 获取所有邮件模板
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

// 重置表单
const resetForm = () => {
  formData.name = ''
  formData.subject = ''
  formData.content = ''
  formData.type = 'html'

  formErrors.name = ''
  formErrors.subject = ''
  formErrors.content = ''
}

// 打开创建模态框
const openCreateModal = () => {
  resetForm()
  isEditMode.value = false
  showModal.value = true
}

// 打开编辑模态框
const openEditModal = async (id: number) => {
  try {
    currentTemplateId.value = id
    actionLoading.value = true

    const templateData = await getEmailTemplate(id)

    formData.name = templateData.name
    formData.subject = templateData.subject
    formData.content = templateData.content
    formData.type = templateData.type

    isEditMode.value = true
    showModal.value = true
  } catch (error) {
    console.error('获取模板详情失败:', error)
  } finally {
    actionLoading.value = false
  }
}

// 打开预览模态框
const openPreviewModal = async (id: number) => {
  try {
    currentTemplateId.value = id
    actionLoading.value = true

    const templateData = await getEmailTemplate(id)

    formData.name = templateData.name
    formData.subject = templateData.subject
    formData.content = templateData.content
    formData.type = templateData.type

    showPreviewModal.value = true
  } catch (error) {
    console.error('获取模板详情失败:', error)
  } finally {
    actionLoading.value = false
  }
}

// 打开删除确认模态框
const openDeleteModal = (id: number) => {
  currentTemplateId.value = id
  showDeleteModal.value = true
}

// 验证表单
const validateForm = (): boolean => {
  let isValid = true

  // 验证名称
  if (!formData.name) {
    formErrors.name = t('emailTemplates.name') + ' ' + t('common.required')
    isValid = false
  } else {
    formErrors.name = ''
  }

  // 验证主题
  if (!formData.subject) {
    formErrors.subject = t('emailTemplates.subject') + ' ' + t('common.required')
    isValid = false
  } else {
    formErrors.subject = ''
  }

  // 验证内容
  if (!formData.content) {
    formErrors.content = t('emailTemplates.content') + ' ' + t('common.required')
    isValid = false
  } else {
    formErrors.content = ''
  }

  return isValid
}

// 提交表单
const submitForm = async () => {
  if (!validateForm()) return

  try {
    actionLoading.value = true

    if (isEditMode.value && currentTemplateId.value) {
      // 更新邮件模板
      await updateEmailTemplate(currentTemplateId.value, formData)
      alert(t('emailTemplates.updateSuccess'))
    } else {
      // 创建邮件模板
      await createEmailTemplate(formData)
      alert(t('emailTemplates.createSuccess'))
    }

    showModal.value = false
    fetchEmailTemplates()
  } catch (error) {
    console.error('保存模板失败:', error)
  } finally {
    actionLoading.value = false
  }
}

// 删除邮件模板
const confirmDelete = async () => {
  if (!currentTemplateId.value) return

  try {
    actionLoading.value = true
    await deleteEmailTemplate(currentTemplateId.value)
    showDeleteModal.value = false
    alert(t('emailTemplates.deleteSuccess'))
    fetchEmailTemplates()
  } catch (error) {
    console.error('删除模板失败:', error)
  } finally {
    actionLoading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchEmailTemplates()
})
</script>

<template>
  <BaseCard :title="t('emailTemplates.list')">
    <div class="mb-4 flex justify-between items-center">
      <div>
        <!-- 搜索功能可在这里添加 -->
      </div>
      <button @click="openCreateModal" class="btn btn-primary">
        {{ t('common.add') }}
      </button>
    </div>

    <DataTable
      :columns="columns"
      :data="emailTemplates"
      :loading="loading"
      :empty-text="t('common.noData')"
    >
      <template #actions="{ row }">
        <div class="flex space-x-2 justify-end">
          <button
            @click="openPreviewModal(row.id)"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {{ t('emailTemplates.preview') }}
          </button>
          <button
            @click="openEditModal(row.id)"
            class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {{ t('common.edit') }}
          </button>
          <button
            @click="openDeleteModal(row.id)"
            class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </template>
    </DataTable>

    <!-- 创建/编辑模态框 -->
    <BaseModal
      :show="showModal"
      :title="isEditMode ? t('emailTemplates.edit') : t('emailTemplates.create')"
      width="max-w-2xl w-full"
      @close="showModal = false"
    >
      <form @submit.prevent="submitForm">
        <FormInput
          v-model="formData.name"
          :label="t('emailTemplates.name')"
          :placeholder="t('emailTemplates.name')"
          :error="formErrors.name"
          required
        />

        <FormInput
          v-model="formData.subject"
          :label="t('emailTemplates.subject')"
          :placeholder="t('emailTemplates.subject')"
          :error="formErrors.subject"
          required
        />

        <FormSelect
          v-model="formData.type"
          :options="contentTypeOptions"
          :label="t('emailTemplates.type')"
          required
        />

        <FormTextarea
          v-model="formData.content"
          :label="t('emailTemplates.content')"
          :placeholder="t('emailTemplates.content')"
          :error="formErrors.content"
          :rows="10"
          required
        />

        <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('emailTemplates.templateVariables') }}
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('emailTemplates.variableDesc', {first: '\{\{', second: '\}\}'}) }}
          </p>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="showModal = false" class="btn btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button @click="submitForm" class="btn btn-primary" :disabled="actionLoading">
            <span v-if="actionLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('common.loading') }}
            </span>
            <span v-else>{{ t('common.save') }}</span>
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- 预览模态框 -->
    <BaseModal
      :show="showPreviewModal"
      :title="t('emailTemplates.preview')"
      width="max-w-2xl w-full"
      @close="showPreviewModal = false"
    >
      <div class="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
        <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">{{ formData.name }}</h3>
        <p class="text-gray-600 dark:text-gray-400">{{ formData.subject }}</p>
      </div>

      <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 min-h-[200px] overflow-auto">
        <div v-if="formData.type === 'html'" v-html="formData.content"></div>
        <pre v-else class="whitespace-pre-wrap">{{ formData.content }}</pre>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <button @click="showPreviewModal = false" class="btn btn-secondary">
            {{ t('common.close') }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- 删除确认模态框 -->
    <BaseModal
      :show="showDeleteModal"
      :title="t('common.confirm')"
      @close="showDeleteModal = false"
    >
      <p class="text-gray-600 dark:text-gray-300">{{ t('emailTemplates.deleteConfirm') }}</p>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteModal = false" class="btn btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button @click="confirmDelete" class="btn btn-danger" :disabled="actionLoading">
            <span v-if="actionLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('common.loading') }}
            </span>
            <span v-else>{{ t('common.delete') }}</span>
          </button>
        </div>
      </template>
    </BaseModal>
  </BaseCard>
</template>
