import { createRouter, createWebHistory } from 'vue-router'
import Checklists from '../views/Checklists.vue'
import ProjectsMenu from '../views/ProjectsMenu.vue'
import ProjectView from '../views/ProjectView.vue'
import UserView from '../views/UserView.vue'
import DocumentsView from '../views/DocumentsView.vue'

const routes = [
  {
    path: '/',
    name: 'UserView',
    component: UserView 
  },
  {
    path: '/checklists',
    name: 'Checklists',
    component: Checklists
  },
  {
    path: '/projects_menu',
    name: 'ProjectsMenu',
    component: ProjectsMenu
  },
  {
    path: '/project/:id_project',
    name: 'ProjectView',
    component: ProjectView
  },
  {
    path: '/documents',
    name: 'DocumentsView',
    component: DocumentsView
  },
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  // }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
