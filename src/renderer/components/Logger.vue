<template>
  <b-card
    title="Log"
    bg-variant="light"
    style="height: 100vh; overflow: auto">
    <b-container class="h-50 d-inline-block">
      <div style="max-height: 500px; overflow: scroll">
        <samp
          v-for="(item, key) in store.state.logMessages"
          :key="key">
          {{ item }}
          <br>
        </samp>
      </div>
    </b-container>
  </b-card>
</template>

<script>
import { ipcRenderer } from 'electron';
import store from '@/store';
import ansicolor from 'ansicolor';

export default {
  data() {
    return {
      store: store
    };
  },
  created: function() {
    ipcRenderer.on('message', (e, m) => {
      this.logMessage(m);
    });
    ipcRenderer.on('stderr', (e, m) => {
      this.logMessage(m);
    });
  },
  methods: {
    logMessage(msg) {
      msg = String(msg);
      msg.split('\n').forEach(a => {
        store.dispatch('logMsg', ansicolor.strip(a.trim()));
      });
    }
  }
};
</script>
