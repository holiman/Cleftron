import Vue from 'vue';
import Vuex from 'vuex';

import broadcaster from './broadcaster';

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [broadcaster],
  strict: process.env.NODE_ENV !== 'production',
  state: {
    // A text description about what UI to use
    ui: null,
    // Log messages, from the clef binary
    logMessages: [],
    // Requests to be handled
    tasks: {},
    // The currently selected task
    selected: {}
  },
  mutations: {
    addTask(state, task) {
      if (!state.selected.id) {
        state.selected = task;
        state.ui = state.selected.ui;
      }

      // Since state.tasks in an object,
      // we need to use this construct instead of
      // state.tasks[task.id] = task
      // See https://vuejsdevelopers.com/2017/03/05/vue-js-reactivity/

      Vue.set(state.tasks, task.id, task);
    },
    // Signal that a task is done
    taskDone(state) {
      if (!state.selected.id) {
        return;
      }
      delete state.tasks[state.selected.id];
      state.selected = {};
      state.ui = null;
      // Go to next task, sort by rpc id (key)
      let keys = Object.keys(state.tasks).sort();
      if (!keys.length) {
        return;
      }
      state.selected = state.tasks[keys[0]];
      state.ui = state.selected.ui;
    },
    addLog(state, data) {
      state.logMessages.push(data);
    },
    setSelectedTask(state, data) {
      var id = Number(data);
      if (state.tasks[id]) {
        state.selected = state.tasks[id];
        state.ui = state.selected.ui;
      }
    },
    updateObject(state, data) {
      state.selected.obj = data;
    }
  },
  actions: {
    selectTask({ commit }, data) {
      // Select by RPC ID
      commit('setSelectedTask', Number(data));
    },
    taskDone({ commit }) {
      commit('taskDone');
    },
    addData({ commit }, data) {
      commit('addTask', {
        strData: JSON.stringify(data),
        ui: data.method,
        obj: data,
        id: data.id
      });
    },
    // Update an object with new data, e.g. setting gasPrice
    updateObject({ commit }, data) {
      commit('updateObject', data);
    },
    // addPassphrase({commit}, data){
    // 	commit('SAVE_PASS', data)
    // },
    logMsg({ commit }, data) {
      commit('addLog', data);
    }
  }
});
