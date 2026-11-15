import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 布局
import MainLayout from '../layouts/MainLayout.vue'
import { useAuthStore } from '../stores/auth'

// 页面
const Dashboard = () => import('../views/Dashboard.vue')
const EmailKeys = () => import('../views/EmailKeys.vue')
const EmailTemplates = () => import('../views/EmailTemplates.vue')
const EmailSending = () => import('../views/EmailSending.vue')
const Statistics = () => import('../views/Statistics.vue')
const NotFound = () => import('../views/NotFound.vue')
const Login = () => import('../views/Login.vue')
const IpSecurity = () => import('../views/IpSecurity.vue')
const Account = () => import('../views/Account.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: Dashboard,
        meta: {
          title: 'menu.dashboard',
          icon: 'dashboard'
        }
      },
      {
        path: 'email-keys',
        name: 'emailKeys',
        component: EmailKeys,
        meta: {
          title: 'menu.emailKeys',
          icon: 'key'
        }
      },
      {
        path: 'email-templates',
        name: 'emailTemplates',
        component: EmailTemplates,
        meta: {
          title: 'menu.emailTemplates',
          icon: 'template'
        }
      },
      {
        path: 'email-sending',
        name: 'emailSending',
        component: EmailSending,
        meta: {
          title: 'menu.emailSending',
          icon: 'send'
        }
      },
      {
        path: 'statistics',
        name: 'statistics',
        component: Statistics,
        meta: {
          title: 'menu.statistics',
          icon: 'chart'
        }
      },
      {
        path: 'ip-security',
        name: 'ipSecurity',
        component: IpSecurity,
        meta: {
          title: 'menu.ipSecurity',
          icon: 'shield'
        }
      },
      {
        path: 'account',
        name: 'account',
        component: Account,
        meta: {
          title: 'menu.account',
          icon: 'user'
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: 'menu.login'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: NotFound,
    meta: {
      title: 'common.notFound'
    }
  }
]

const router = createRouter({
  history: createWebHistory('/emailWeb/'),
  routes
})

// 未登录一律回登录页（登录页自身放行）
router.beforeEach((to) => {
  if (to.name === 'login') return true
  const auth = useAuthStore()
  if (auth.isLoggedIn) return true
  return { name: 'login', query: { redirect: to.fullPath } }
})

export default router
