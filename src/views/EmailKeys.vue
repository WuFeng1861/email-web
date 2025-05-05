<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from '../components/BaseCard.vue'
import DataTable from '../components/DataTable.vue'
import BaseModal from '../components/BaseModal.vue'
import FormInput from '../components/FormInput.vue'
import FormSelect from '../components/FormSelect.vue'
import { getAllEmailKeys, getEmailKey, createEmailKey, updateEmailKey, deleteEmailKey, EmailKey } from '../api/emailKeys'

const { t } = useI18n()

// 加载状态
const loading = ref(true)
// 邮件凭证列表
const emailKeys = ref<EmailKey[]>([])
// 显示创建/编辑模态框
const showModal = ref(false)
// 是否为编辑模式
const isEditMode = ref(false)
// 显示删除确认模态框
const showDeleteModal = ref(false)
// 当前操作的凭证ID
const currentKeyId = ref<number | null>(null)
// 操作加载状态
const actionLoading = ref(false)

// 表单数据
const formData = reactive<EmailKey>({
  user: '',
  pass: '',
  app: '',
  emailCompany: 'QQ',
  limitCount: 1000
})

// 表单错误信息
const formErrors = reactive({
  user: '',
  pass: '',
  app: '',
  limitCount: ''
})

// 表格列定义
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'user', label: t('emailKeys.user') },
  { key: 'app', label: t('emailKeys.app') },
  { 
    key: 'emailCompany', 
    label: t('emailKeys.emailCompany'),
    formatter: (value: string) => t(`emailKeys.${value}`)
  },
  { key: 'limitCount', label: t('emailKeys.limitCount') },
  { key: 'sentCount', label: t('emailKeys.sentCount') },
  { 
    key: 'lastResetDate', 
    label: t('emailKeys.lastResetDate'),
    formatter: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
  },
  { 
    key: 'createdAt', 
    label: t('emailKeys.createdAt'),
    formatter: (value: string) => new Date(value).toLocaleString()
  }
]

// 邮件服务商选项
const emailCompanyOptions = [
  { value: 'QQ', label: t('emailKeys.QQ') },
  { value: '163', label: t('emailKeys.163') },
  { value: 'ali', label: t('emailKeys.ali') },
  { value: 'gmail', label: t('emailKeys.gmail') },
  { value: 'outlook', label: t('emailKeys.outlook') },
  { value: 'other', label: t('emailKeys.other') }
]

// 获取所有邮件凭证
const fetchEmailKeys = async () => {
  try {
    loading.value = true
    emailKeys.value = await getAllEmailKeys()
  } catch (error) {
    console.error('获取邮件凭证失败:', error)
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.user = ''
  formData.pass = ''
  formData.app = ''
  formData.emailCompany = 'QQ'
  formData.limitCount = 1000
  
  formErrors.user = ''
  formErrors.pass = ''
  formErrors.app = ''
  formErrors.limitCount = ''
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
    currentKeyId.value = id
    actionLoading.value = true
    
    const keyData = await getEmailKey(id)
    
    formData.user = keyData.user
    formData.pass = keyData.pass
    formData.app = keyData.app
    formData.emailCompany = keyData.emailCompany
    formData.limitCount = keyData.limitCount
    
    isEditMode.value = true
    showModal.value = true
  } catch (error) {
    console.error('获取凭证详情失败:', error)
  } finally {
    actionLoading.value = false
  }
}

// 打开删除确认模态框
const openDeleteModal = (id: number) => {
  currentKeyId.value = id
  showDeleteModal.value = true
}

// 验证表单
const validateForm = (): boolean => {
  let isValid = true
  
  // 验证用户名
  if (!formData.user) {
    formErrors.user = t('emailKeys.user') + ' ' + t('common.required')
    isValid = false
  } else {
    formErrors.user = ''
  }
  
  // 验证密码
  if (!formData.pass) {
    formErrors.pass = t('emailKeys.pass') + ' ' + t('common.required')
    isValid = false
  } else {
    formErrors.pass = ''
  }
  
  // 验证应用名称
  if (!formData.app) {
    formErrors.app = t('emailKeys.app') + ' ' + t('common.required')
    isValid = false
  } else {
    formErrors.app = ''
  }
  
  // 验证限制数量
  if (!formData.limitCount || formData.limitCount <= 0) {
    formErrors.limitCount = t('emailKeys.limitCount') + ' ' + t('common.required')
    isValid = false
  } else {
    formErrors.limitCount = ''
  }
  
  return isValid
}

// 提交表单
const submitForm = async () => {
  if (!validateForm()) return
  
  try {
    actionLoading.value = true
    
    if (isEditMode.value && currentKeyId.value) {
      // 更新邮件凭证
      await updateEmailKey(currentKeyId.value, formData)
      alert(t('emailKeys.updateSuccess'))
    } else {
      // 创建邮件凭证
      await createEmailKey(formData)
      alert(t('emailKeys.createSuccess'))
    }
    
    showModal.value = false
    fetchEmailKeys()
  } catch (error) {
    console.error('保存凭证失败:', error)
  } finally {
    actionLoading.value = false
  }
}

// 删除邮件凭证
const confirmDelete = async () => {
  if (!currentKeyId.value) return
  
  try {
    actionLoading.value = true
    await deleteEmailKey(currentKeyId.value)
    showDeleteModal.value = false
    alert(t('emailKeys.deleteSuccess'))
    fetchEmailKeys()
  } catch (error) {
    console.error('删除凭证失败:', error)
  } finally {
    actionLoading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchEmailKeys()
})
</script>

<template>
  <BaseCard :title="t('emailKeys.list')">
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
      :data="emailKeys" 
      :loading="loading"
      :empty-text="t('common.noData')"
    >
      <template #actions="{ row }">
        <div class="flex space-x-2 justify-end">
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
      :title="isEditMode ? t('emailKeys.edit') : t('emailKeys.create')"
      @close="showModal = false"
    >
      <form @submit.prevent="submitForm">
        <FormInput
          v-model="formData.user"
          :label="t('emailKeys.user')"
          :placeholder="t('emailKeys.user')"
          :error="formErrors.user"
          required
        />
        
        <FormInput
          v-model="formData.pass"
          type="password"
          :label="t('emailKeys.pass')"
          :placeholder="t('emailKeys.pass')"
          :error="formErrors.pass"
          required
        />
        
        <FormInput
          v-model="formData.app"
          :label="t('emailKeys.app')"
          :placeholder="t('emailKeys.app')"
          :error="formErrors.app"
          required
        />
        
        <FormSelect
          v-model="formData.emailCompany"
          :options="emailCompanyOptions"
          :label="t('emailKeys.emailCompany')"
          required
        />
        
        <FormInput
          v-model="formData.limitCount"
          type="number"
          :label="t('emailKeys.limitCount')"
          :placeholder="t('emailKeys.limitCount')"
          :error="formErrors.limitCount"
          required
        />
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
    
    <!-- 删除确认模态框 -->
    <BaseModal 
      :show="showDeleteModal"
      :title="t('common.confirm')"
      @close="showDeleteModal = false"
    >
      <p class="text-gray-600 dark:text-gray-300">{{ t('emailKeys.deleteConfirm') }}</p>
      
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