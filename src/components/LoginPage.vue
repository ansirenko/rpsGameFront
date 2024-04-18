<template>
  <div class="auth-container">
    <h1 class="auth-title">Login</h1>
    <form @submit.prevent="onSubmit" class="auth-form">
      <input type="text" v-model="username" placeholder="Login" required>
      <input type="password" v-model="password" placeholder="Password" required>
      <button type="submit" class="auth-button">Sign in</button>
    </form>
    <router-link to="/register" class="switch-link">Sign up</router-link>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    async onSubmit() {
      try {
        const response = await axios.post('http://127.0.0.1:8000/login/', {
          nickname: this.username,
          password: this.password
        });
        if (response.data.success) {
          console.log('Login successful:', response.data);
          localStorage.setItem('user_id', response.data.user_id);
          this.$router.push('/dashboard');
        } else {
          alert(response.data.message); // Показать сообщение об ошибке
        }
      } catch (error) {
        console.error('Login error:', error);
        if (error.response) {
          const message = error.response.data.detail || 'Unknown error';
          alert('Login failed: ' + message);
        } else {
          alert('Login failed: Server error or network issue');
        }
      }
    }
  }
};
</script>

<style scoped>
@import '../assets/auth-styles.css';
</style>
