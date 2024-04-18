<template>
  <div class="dashboard-container" v-show="!waitingForGame">
    <div class="welcome-message">
      Welcome, {{ username }}!
    </div>
    <div class="stats">
      <div class="stats-item">Win: <span class="stats-value">{{ stats.wins }}</span></div>
      <div class="stats-item">Losses: <span class="stats-value">{{ stats.losses }}</span></div>
      <div class="stats-item">Draw: <span class="stats-value">{{ stats.draws }}</span></div>
    </div>
    <button @click="startGame" class="dashboard-button">Start</button>
    <button @click="logout" class="dashboard-button logout-button">Exit</button>
  </div>

  <div v-if="waitingForGame" class="overlay">
    <div class="loader">Looking for opponent...</div>
    <button @click="cancelSearch" class="cancel-button">Cancel</button>
  </div>
</template>



<script>
import axios from "axios";

export default {
  data() {
    return {
      username: '',
      stats: { wins: 0, losses: 0, draws: 0 },
      socket: null,
      waitingForGame: false,
    };
  },
  async mounted() {
    await this.fetchUserData();
    this.connectToWebSocket(localStorage.getItem('user_id'));
  },
  methods: {
    async fetchUserData() {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const userResponse = await axios.get(`http://127.0.0.1:8000/users/${userId}`);
        this.username = userResponse.data.nickname;
        const statsResponse = await axios.get(`http://127.0.0.1:8000/stats/${userId}`);
        this.stats = statsResponse.data;
      }
    },
    connectToWebSocket(userId) {
      this.$store.dispatch('initializeSocket', userId);
      this.$store.state.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.message && data.message.includes("Game started with")) {
          this.$router.push('/game');
        }
      };
    },
    startGame() {
      this.waitingForGame = true;
      this.$store.state.socket.send(JSON.stringify({ action: 'start_game' }));
    },
    cancelSearch() {
      this.waitingForGame = false;
      this.$store.state.socket.send(JSON.stringify({ action: 'cancel_search' }));
    },
    logout() {
      this.$store.state.socket.send(JSON.stringify({ action: 'logout' }));
      this.$store.state.socket.close();
      localStorage.removeItem('user_id');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
@import '../assets/auth-styles.css';

.dashboard-container {
  background: #FFFFFF;
  border-radius: 10px;
  padding: 40px;
  width: 300px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: auto;
  margin-top: 100px;
  text-align: center;
}

.welcome-message {
  margin-bottom: 30px;
}

.stats {
  margin-bottom: 30px;
}

.stats-item {
  font-size: 18px;
  margin: 10px 0;
}

.stats-value {
  font-weight: bold;
}

.dashboard-button {
  padding: 10px 0;
  width: 100%;
  border: none;
  background-color: #4CAF50;
  color: white;
  border-radius: 5px;
  margin-bottom: 20px;
  cursor: pointer;
}

.dashboard-button:hover {
  background-color: #45A049;
}

.dashboard-button.logout-button {
  background-color: #f44336;
}

.dashboard-button.logout-button:hover {
  background-color: #d32f2f;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.loader {
  color: white;
  font-size: 20px;
  margin-bottom: 20px;
}

.cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #f44336;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.cancel-button:hover {
  background-color: #d32f2f;
}

</style>
