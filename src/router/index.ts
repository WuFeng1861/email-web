import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 布局
import MainLayout from '../layouts/MainLayout.vue'

// 页面
const Dashboard = () => import('../views/Dashboard.vue')
const EmailKeys = () => import('../views/EmailKeys.vue')
const EmailTemplates = () => import('../views/EmailTemplates.vue')
const EmailSending = () => import('../views/EmailSending.vue')
const Statistics = () => import('../views/Statistics.vue')
const NotFound = () => import('../views/NotFound.vue')

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
      }
    ]
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

export default router
