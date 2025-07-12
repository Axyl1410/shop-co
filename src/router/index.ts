import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home-view.vue'

import { requireAuth } from './guards'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/about',
			name: 'about',
			// route level code-splitting
			// this generates a separate chunk (About.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import('@/views/about-view.vue'),
		},
		{
			path: '/login',
			name: 'login',
			component: () => import('@/views/login-view.vue'),
		},
		{
			path: '/register',
			name: 'register',
			component: () => import('@/views/register-view.vue'),
		},
		{
			path: '/profile',
			name: 'profile',
			component: () => import('@/views/profile-view.vue'),
			beforeEnter: requireAuth,
		},
		{
			path: '/:pathMatch(.*)*',
			name: 'not-found',
			component: () => import('@/views/not-found-view.vue'),
		},
	],
})

export default router
