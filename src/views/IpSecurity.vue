<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import BaseCard from '../components/BaseCard.vue'
import BaseModal from '../components/BaseModal.vue'
import DataTable from '../components/DataTable.vue'
import FormInput from '../components/FormInput.vue'
import FormSelect from '../components/FormSelect.vue'
import {
  createIpRule,
  deleteIpRule,
  getIpFilterSettings,
  listIpRules,
  listRequests,
  promoteIpRule,
  requestStats,
  updateIpFilterSettings,
  type IpFilterSettings,
  type IpRule,
  type IpRuleMode,
  type RequestLog,
  type RequestStat
} from '../api/ipSecurity'
import type { ApiError } from '../api/index'

/* ---------------- 开关 ---------------- */
const settings = ref<IpFilterSettings>({ blacklistEnabled: true, whitelistEnabled: false })
const settingsLoading = ref(false)
const settingsSaving = ref(false)

/* ---------------- 名单 ---------------- */
const rules = ref<IpRule[]>([])
const rulesLoading = ref(false)
const rulePage = ref(1)
const ruleLimit = 20
const ruleTotal = ref(0)
const ruleMode = ref<'' | IpRuleMode>('')

/* ---------------- 批量导入 ---------------- */
const showBatch = ref(false)
const batchText = ref('')
const batchMode = ref<IpRuleMode>('black')
const batchRunning = ref(false)
const batchResult = ref<{ ok: number; failed: string[] } | null>(null)

const showCreate = ref(false)
const creating = ref(false)
const createForm = reactive({ pattern: '', mode: 'black' as IpRuleMode, note: '' })
const createError = ref('')

/* ---------------- 访问记录 ---------------- */
const stats = ref<RequestStat[]>([])
const statsLoading = ref(false)
const statsDays = ref(7)

const logs = ref<RequestLog[]>([])
const logsLoading = ref(false)
const logsPage = ref(1)
const logsTotal = ref(0)
const onlyBlocked = ref(false)
const logsLimit = 20

const message = ref('')
const errorMessage = ref('')

function notify(text: string) {
  message.value = text
  window.setTimeout(() => {
    if (message.value === text) message.value = ''
  }, 3000)
}

function fail(e: unknown) {
  errorMessage.value = (e as ApiError)?.message || '操作失败'
  window.setTimeout(() => (errorMessage.value = ''), 5000)
}

/* ---------------- 加载 ---------------- */

async function loadSettings() {
  settingsLoading.value = true
  try {
    settings.value = await getIpFilterSettings()
  } catch (e) {
    fail(e)
  } finally {
    settingsLoading.value = false
  }
}

async function loadRules() {
  rulesLoading.value = true
  try {
    const res = await listIpRules({
      page: rulePage.value,
      limit: ruleLimit,
      mode: ruleMode.value || undefined
    })
    rules.value = res.items
    ruleTotal.value = res.meta.totalItems
  } catch (e) {
    fail(e)
  } finally {
    rulesLoading.value = false
  }
}

async function loadStats() {
  statsLoading.value = true
  try {
    const res = await requestStats({ days: statsDays.value, limit: 30 })
    stats.value = res.items
  } catch (e) {
    fail(e)
  } finally {
    statsLoading.value = false
  }
}

async function loadLogs() {
  logsLoading.value = true
  try {
    const res = await listRequests({
      page: logsPage.value,
      limit: logsLimit,
      onlyBlocked: onlyBlocked.value ? '1' : undefined
    })
    logs.value = res.items
    logsTotal.value = res.meta.totalItems
  } catch (e) {
    fail(e)
  } finally {
    logsLoading.value = false
  }
}

onMounted(() => {
  void loadSettings()
  void loadRules()
  void loadStats()
  void loadLogs()
})

/* ---------------- 操作 ---------------- */

async function toggleSetting(key: keyof IpFilterSettings) {
  if (settingsSaving.value) return
  settingsSaving.value = true
  const next = { ...settings.value, [key]: !settings.value[key] }
  try {
    settings.value = await updateIpFilterSettings({ [key]: next[key] })
    notify('开关已保存')
  } catch (e) {
    fail(e)
  } finally {
    settingsSaving.value = false
  }
}

function openCreate(mode: IpRuleMode) {
  createForm.pattern = ''
  createForm.mode = mode
  createForm.note = ''
  createError.value = ''
  showCreate.value = true
}

async function submitCreate() {
  const pattern = createForm.pattern.trim()
  if (!pattern) {
    createError.value = '请填写 IP 或网段'
    return
  }
  creating.value = true
  createError.value = ''
  try {
    await createIpRule({ pattern, mode: createForm.mode, note: createForm.note.trim() || undefined })
    showCreate.value = false
    notify('已添加')
    await loadRules()
  } catch (e) {
    createError.value = (e as ApiError)?.message || '添加失败'
  } finally {
    creating.value = false
  }
}

async function promote(row: IpRule) {
  try {
    await promoteIpRule(row.id)
    notify(`${row.pattern} 已转为白名单`)
    await loadRules()
  } catch (e) {
    fail(e)
  }
}

async function remove(row: IpRule) {
  if (!window.confirm(`确定删除规则 ${row.pattern}（${row.mode === 'black' ? '黑名单' : '白名单'}）？`)) return
  try {
    await deleteIpRule(row.id)
    notify('已删除')
    await loadRules()
  } catch (e) {
    fail(e)
  }
}

function prevRulePage() {
  if (rulePage.value <= 1) return
  rulePage.value -= 1
  void loadRules()
}

function nextRulePage() {
  if (rulePage.value * ruleLimit >= ruleTotal.value) return
  rulePage.value += 1
  void loadRules()
}

function onRuleModeChange() {
  rulePage.value = 1
  void loadRules()
}

function prevLogsPage() {
  if (logsPage.value <= 1) return
  logsPage.value -= 1
  void loadLogs()
}

function nextLogsPage() {
  if (logsPage.value * logsLimit >= logsTotal.value) return
  logsPage.value += 1
  void loadLogs()
}

function onBlockedFilterChange() {
  logsPage.value = 1
  void loadLogs()
}

function openBatch(mode: IpRuleMode) {
  batchMode.value = mode
  batchText.value = ''
  batchResult.value = null
  showBatch.value = true
}

/** 支持换行 / 逗号 / 空格分隔，自动去重、去空行 */
function parseBatchInput(text: string): string[] {
  const parts = text
    .split(/[\s,;，；]+/)
    .map((t) => t.trim())
    .filter(Boolean)
  return Array.from(new Set(parts))
}

async function runBatch() {
  const list = parseBatchInput(batchText.value)
  if (!list.length) {
    batchResult.value = { ok: 0, failed: ['没有解析到有效的 IP'] }
    return
  }
  if (list.length > 200) {
    batchResult.value = { ok: 0, failed: [`一次最多 200 条，当前 ${list.length} 条`] }
    return
  }

  batchRunning.value = true
  batchResult.value = null
  let ok = 0
  const failed: string[] = []

  for (const pattern of list) {
    try {
      await createIpRule({ pattern, mode: batchMode.value })
      ok += 1
    } catch (err) {
      failed.push(`${pattern}：${(err as ApiError)?.message || '失败'}`)
    }
  }

  batchResult.value = { ok, failed }
  batchRunning.value = false
  await loadRules()
}

function blockIp(ip: string) {
  createForm.pattern = ip
  createForm.mode = 'black'
  createForm.note = '从访问记录加入'
  createError.value = ''
  showCreate.value = true
}

/* ---------------- 表格列 ---------------- */

const ruleColumns = [
  { key: 'pattern', label: 'IP / 网段' },
  {
    key: 'mode',
    label: '类型',
    formatter: (v: string) => (v === 'black' ? '黑名单' : '白名单')
  },
  { key: 'note', label: '备注', formatter: (v: string | null) => v || '-' },
  { key: 'hitCount', label: '命中', formatter: (v: number) => String(v ?? 0) },
  {
    key: 'lastHitAt',
    label: '最近命中',
    formatter: (v: string | null) => (v ? new Date(v).toLocaleString() : '-')
  }
]

const statColumns = [
  { key: 'ip', label: 'IP' },
  { key: 'total', label: '请求数', formatter: (v: number) => String(v ?? 0) },
  { key: 'blocked', label: '被拦', formatter: (v: number) => String(v ?? 0) },
  { key: 'lastPath', label: '最后访问', formatter: (v: string) => v || '-' },
  { key: 'lastSeen', label: '时间' }
]

const logColumns = [
  { key: 'ip', label: 'IP' },
  { key: 'method', label: '方法' },
  { key: 'path', label: '路径' },
  { key: 'status', label: '状态码', formatter: (v: number) => String(v ?? '') },
  { key: 'blocked', label: '拦截', formatter: (v: number) => (v ? '是' : '否') },
  {
    key: 'createdAt',
    label: '时间',
    formatter: (v: string) => (v ? new Date(v).toLocaleString() : '-')
  }
]

const ruleModeOptions = computed(() => [
  { value: '', label: '全部' },
  { value: 'black', label: '黑名单' },
  { value: 'white', label: '白名单' }
])
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">IP 名单</h1>
      <div class="flex space-x-2">
        <button class="btn btn-secondary" @click="openBatch('white')">批量导入</button>
        <button class="btn btn-secondary" @click="openCreate('white')">加入白名单</button>
        <button class="btn btn-primary" @click="openCreate('black')">加入黑名单</button>
      </div>
    </div>

    <div
      v-if="message"
      class="rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-3 py-2 text-sm text-green-700 dark:text-green-300"
    >
      {{ message }}
    </div>
    <div
      v-if="errorMessage"
      class="rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300"
    >
      {{ errorMessage }}
    </div>

    <!-- 开关 -->
    <BaseCard title="过滤开关" :loading="settingsLoading">
      <div class="space-y-3">
        <label class="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            class="mt-1 h-4 w-4"
            :checked="settings.blacklistEnabled"
            :disabled="settingsSaving"
            @change="toggleSetting('blacklistEnabled')"
          />
          <span>
            <span class="font-medium text-gray-800 dark:text-gray-100">黑名单生效</span>
            <span class="block text-sm text-gray-500 dark:text-gray-400">
              命中黑名单的 IP 直接返回 403（管理接口不受影响，避免把自己锁在门外）
            </span>
          </span>
        </label>

        <label class="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            class="mt-1 h-4 w-4"
            :checked="settings.whitelistEnabled"
            :disabled="settingsSaving"
            @change="toggleSetting('whitelistEnabled')"
          />
          <span>
            <span class="font-medium text-gray-800 dark:text-gray-100">白名单生效</span>
            <span class="block text-sm text-gray-500 dark:text-gray-400">
              开启后只放行白名单里的 IP，其余全部拒绝。白名单为空时该开关不生效
            </span>
          </span>
        </label>
      </div>
    </BaseCard>

    <!-- 名单 -->
    <BaseCard title="名单规则" :loading="rulesLoading">
      <template #header>
        <FormSelect
          v-model="ruleMode"
          :options="ruleModeOptions"
          class="w-32"
          @update:model-value="onRuleModeChange"
        />
      </template>

      <DataTable :columns="ruleColumns" :data="rules" :loading="rulesLoading" empty-text="还没有规则">
        <template #actions="{ row }">
          <div class="flex justify-end space-x-3">
            <button
              v-if="row.mode === 'black'"
              class="text-primary-600 hover:text-primary-800 dark:text-primary-400"
              @click="promote(row)"
            >
              转白名单
            </button>
            <button class="text-red-600 hover:text-red-800 dark:text-red-400" @click="remove(row)">
              删除
            </button>
          </div>
        </template>
      </DataTable>

      <div class="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>共 {{ ruleTotal }} 条</span>
        <div class="space-x-2">
          <button class="btn btn-secondary" :disabled="rulePage <= 1" @click="prevRulePage">
            上一页
          </button>
          <span>{{ rulePage }}</span>
          <button
            class="btn btn-secondary"
            :disabled="rulePage * ruleLimit >= ruleTotal"
            @click="nextRulePage"
          >
            下一页
          </button>
        </div>
      </div>
    </BaseCard>

    <!-- 访问记录 -->
    <BaseCard title="可疑 IP（按请求数排序）" :loading="statsLoading">
      <template #header>
        <FormSelect
          v-model="statsDays"
          :options="[
            { value: 1, label: '最近 1 天' },
            { value: 7, label: '最近 7 天' },
            { value: 30, label: '最近 30 天' }
          ]"
          class="w-36"
          @update:model-value="loadStats"
        />
      </template>

      <DataTable :columns="statColumns" :data="stats" :loading="statsLoading" empty-text="暂无访问记录">
        <template #actions="{ row }">
          <button class="text-red-600 hover:text-red-800 dark:text-red-400" @click="blockIp(row.ip)">
            拉黑
          </button>
        </template>
      </DataTable>
    </BaseCard>

    <BaseCard title="访问明细" :loading="logsLoading">
      <template #header>
        <label class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <input
            v-model="onlyBlocked"
            type="checkbox"
            class="h-4 w-4"
            @change="onBlockedFilterChange"
          />
          <span>只看被拦截</span>
        </label>
      </template>

      <DataTable :columns="logColumns" :data="logs" :loading="logsLoading" empty-text="暂无记录" />

      <div class="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>共 {{ logsTotal }} 条</span>
        <div class="space-x-2">
          <button class="btn btn-secondary" :disabled="logsPage <= 1" @click="prevLogsPage">
            上一页
          </button>
          <span>{{ logsPage }}</span>
          <button
            class="btn btn-secondary"
            :disabled="logsPage * logsLimit >= logsTotal"
            @click="nextLogsPage"
          >
            下一页
          </button>
        </div>
      </div>
    </BaseCard>

    <!-- 批量导入 -->
    <BaseModal :show="showBatch" title="批量导入 IP" width="max-w-xl w-full" @close="showBatch = false">
      <div class="space-y-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          每行一个 IP 或网段（也可以用逗号分隔），自动去重，一次最多 200 条。
        </div>

        <textarea
          v-model="batchText"
          rows="8"
          class="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-mono"
          placeholder="203.0.113.9&#10;198.51.100.0/24&#10;192.0.2.15"
        ></textarea>

        <FormSelect
          v-model="batchMode"
          :options="[
            { value: 'black', label: '加入黑名单' },
            { value: 'white', label: '加入白名单' }
          ]"
          label="类型"
        />

        <div v-if="batchResult" class="text-sm">
          <div class="text-green-600 dark:text-green-400">成功 {{ batchResult.ok }} 条</div>
          <div v-if="batchResult.failed.length" class="mt-2 text-red-600 dark:text-red-400">
            <div>失败 {{ batchResult.failed.length }} 条：</div>
            <ul class="mt-1 max-h-32 overflow-y-auto list-disc pl-5 space-y-1">
              <li v-for="(msg, i) in batchResult.failed" :key="i">{{ msg }}</li>
            </ul>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <button class="btn btn-secondary" @click="showBatch = false">关闭</button>
          <button class="btn btn-primary" :disabled="batchRunning" @click="runBatch">
            {{ batchRunning ? '导入中…' : '开始导入' }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- 新增规则 -->
    <BaseModal :show="showCreate" title="添加 IP 规则" @close="showCreate = false">
      <div class="space-y-4">
        <FormInput
          v-model="createForm.pattern"
          label="IP 或网段"
          placeholder="例如 203.0.113.9 或 198.51.100.0/24"
          :error="createError"
          required
        />
        <FormSelect
          v-model="createForm.mode"
          :options="[
            { value: 'black', label: '黑名单（禁止访问）' },
            { value: 'white', label: '白名单（允许访问）' }
          ]"
          label="类型"
        />
        <FormInput v-model="createForm.note" label="备注" placeholder="可选，例如：扫描器" />
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <button class="btn btn-secondary" @click="showCreate = false">取消</button>
          <button class="btn btn-primary" :disabled="creating" @click="submitCreate">
            {{ creating ? '提交中…' : '确定' }}
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
