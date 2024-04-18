<template>
  <div class="auth-container">
    <h1 class="auth-title">Регистрация</h1>
    <form @submit.prevent="register" class="auth-form">
      <input type="text" v-model="username" placeholder="Логин" required>
      <input type="password" v-model="password" placeholder="Пароль" required>
      <input type="password" v-model="confirmPassword" placeholder="Подтвердите пароль" required>
      <button type="submit" class="auth-button">Зарегистрироваться</button>
    </form>
    <router-link to="/login" class="switch-link">Уже есть аккаунт? Войти</router-link>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: ''
    };
  },
  methods: {
    register() {
      if (this.password !== this.confirmPassword) {
        alert("Passwords are not equal");
        return;
      }

      axios.post('http://127.0.0.1:8000/users/', {
        nickname: this.username,
        password: this.password
      })
          .then(response => {
            console.log('Server response:', response.data);
            alert("Successfully registered");
            this.$router.push('/login');
          })
          .catch(error => {
            if (error.response && error.response.data && error.response.data.detail) {
              console.error("Registration error: ", error.response.data.detail);
              alert(error.response.data.detail);
            } else {
              // Обработка ошибок, когда нет ответа от сервера
              console.error("Server is not available");
              alert("Server is not available");
            }
          });
    }

  }
};
</script>


<style scoped>
@import '../assets/auth-styles.css';
</style>
