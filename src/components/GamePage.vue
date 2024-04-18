<template>
  <div class="game-container">
    <h1 class="game-title">Rock Paper Scissors</h1>

    <div v-if="showTimer" class="timer">
      Time left: {{ timerCount }}
    </div>

    <div v-if="awaitingOpponent" class="awaiting-opponent">
      Waiting for opponent...
    </div>

    <div v-if="gameResult" class="game-result">
      <p>{{ gameResult }}</p>
      <button v-if="!awaitingOpponent" @click="playAgain" class="play-again-button">Play again</button>
    </div>

    <div v-if="!gameStarted && !gameResult" class="move-selection">
      <button @click="makeMove('rock')" class="move-button">Rock</button>
      <button @click="makeMove('paper')" class="move-button">Paper</button>
      <button @click="makeMove('scissors')" class="move-button">Scissors</button>
    </div>

    <div v-else class="move-selection disabled">
      <button disabled class="move-button">Rock</button>
      <button disabled class="move-button">Paper</button>
      <button disabled class="move-button">Scissors</button>
    </div>

    <div v-if="showPlayAgainInvitation" class="modal-overlay">
      <div class="modal">
        <p>Player {{ invitingPlayerName }} wants to play again.</p>
        <button @click="acceptPlayAgain" class="play-again-button">Accept</button>
        <button @click="declinePlayAgain" class="exit-game-button">Decline</button>
      </div>
    </div>

    <div v-if="playAgainResponseWaiting" class="modal-overlay">
      <div class="modal">
        <div class="loader">Wait for opponent decision...</div>
        <div>
          <button @click="exitGame" class="exit-game-button">Exit game</button>
        </div>
      </div>
    </div>

    <div v-if="opponentLeftTheGame" class="modal-overlay">
      <div class="modal">
        <div class="loader">Opponent left the game</div>
        <div>
          <button @click="exitGame" class="exit-game-button">Exit game</button>
        </div>
      </div>
    </div>

    <button @click="exitGame" class="exit-game-button">Exit game</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      timer: null,
      timerCount: 10,
      gameResult: null,
      awaitingOpponent: false,
      showTimer: false,
      gameStarted: false,
      showPlayAgainInvitation: false,
      invitingPlayerName: null,
      playAgainResponseWaiting: false,
      opponentLeftTheGame: false,
    };
  },
  methods: {
    makeMove(move) {
      this.resetTimer()
      this.gameStarted = true;
      this.awaitingOpponent = true;
      this.$store.state.socket.send(JSON.stringify({
        action: 'make_move',
        move: move
      }));
    },
    startTimer() {
      this.showTimer = true;
      this.timerCount = 10;
      this.timer = setInterval(() => {
        if (this.timerCount > 0) {
          this.timerCount -= 1;
          console.log("timerCount", this.timerCount);
        } else {
          this.gameTimeout();
        }
      }, 1000);
    },
    gameTimeout() {
      this.resetTimer();
      this.$store.state.socket.send(JSON.stringify({ action: 'timeout' }));
      this.gameResult = 'Time left!';
      this.awaitingOpponent = false;
      this.gameStarted = false;
    },
    playAgain() {
      this.gameResult = null;
      this.gameStarted = false;
      this.playAgainResponseWaiting = true;
      this.$store.state.socket.send(JSON.stringify({ action: 'play_again' }));
    },
    resetTimer() {
      clearInterval(this.timer);
      this.timer = null
      this.showTimer = false;
      console.log("Timer reset", this.showTimer);
    },
    handleSocketMessage(data) {
      console.log("We got data in handleSocketMessage", data);
      if (data.action === "game_result") {
        this.gameResult = data.result;
        this.awaitingOpponent = false;
        this.gameStarted = false;
      } else if (data.action === "timeout") {
        this.resetTimer()
        if (data.timed_out_user_id.toString() === localStorage.getItem('user_id').toString()) {
          this.gameResult = 'Time left!';
        } else {
          this.gameResult = 'Opponent time left';
        }
        this.awaitingOpponent = false;
        this.gameStarted = false;
      } else if (data.action === "play_again_request") {
        this.invitingPlayerName = data.user_info;
        this.showPlayAgainInvitation = true;
      } else if (data.action === "play_again_accepted") {
        this.resetGame()
      } else if (data.action === "game_over") {
        this.resetTimer()
        this.opponentLeftTheGame = true;
      }
    },
    acceptPlayAgain() {
      this.$store.state.socket.send(JSON.stringify({ action: 'accepted_play_again' }));
      this.resetGame();
    },
    declinePlayAgain() {
      this.exitGame();
    },
    resetGame() {
      this.gameResult = null;
      this.showPlayAgainInvitation = false;
      this.playAgainResponseWaiting = false;
      this.startTimer();
    },
    exitGame() {
      this.resetTimer();
      this.$store.state.socket.send(JSON.stringify({ action: 'exit_game' }));
      this.$router.push('/dashboard');
    }
  },
  mounted() {
    this.$store.state.socket.onmessage = (event) => {
      console.log("Soket received data: ", event.data);
      const data = JSON.parse(event.data);
      this.handleSocketMessage(data);
    };
    this.startTimer();
  }
};
</script>

<style scoped>
.game-container {
  position: relative;
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.game-title {
  margin-bottom: 20px;
}

.timer, .awaiting-opponent, .game-result {
  margin-bottom: 20px;
}

.move-selection .move-button {
  background-color: #e0e0e0;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  margin: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.move-selection .move-button:hover {
  background-color: #bdbdbd;
}

.play-again-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  margin: 10px;
}

.play-again-button:hover {
  background-color: #45A049;
}

.exit-game-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  margin-top: 20px;
  cursor: pointer;
  margin-left: 10px;
}

.exit-game-button:hover {
  background-color: #d32f2f;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
}
</style>
