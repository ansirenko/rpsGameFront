import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../components/LoginPage.vue';
import RegisterPage from '../components/RegisterPage.vue';
import DashboardPage from "@/components/DashboardPage.vue";
import GamePage from "@/components/GamePage.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/login', component: LoginPage },
        { path: '/register', component: RegisterPage },
        { path: '/dashboard', component: DashboardPage },
        { path: '/game', component: GamePage },
        { path: '/', redirect: '/login' }
    ]
});

export default router;