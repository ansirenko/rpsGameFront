import { createStore } from 'vuex';

export default createStore({
    state() {
        return {
            socket: null,
            user: null,
        };
    },
    mutations: {
        setSocket(state, socket) {
            state.socket = socket;
        },
        setUser(state, user) {
            state.user = user;
        },
    },
    actions: {
        initializeSocket({ commit }, userId) {
            const socket = new WebSocket(`ws://127.0.0.1:8000/ws/${userId}`);
            commit('setSocket', socket);
        },
        disconnectSocket({ state }) {
            if (state.socket) {
                state.socket.close();
                state.socket = null;
            }
        },
        sendMessage({ state }, message) {
            if (state.socket) {
                state.socket.send(JSON.stringify(message));
            }
        },
    },
});
