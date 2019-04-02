<template>
  <div>
    <taskQueue />
    <b-container fluid>
      <component :is="store.state.ui" />
    </b-container>
    <logger />
  </div>
</template>

<script>
import ui_approveTx from './ui_approveTx.vue';
import ui_approveListing from './ui_approveListing.vue';
import ui_approveSignData from './ui_approveSignData.vue';
import ui_approveNewAccount from './ui_approveNewAccount';
import Logger from './Logger.vue';
import TaskQueue from './TaskQueue.vue';
import { ipcRenderer } from 'electron';
import store from '@/store';

export default {
  components: {
    TaskQueue,
    Logger,
    ui_approveTx,
    ui_approveListing,
    ui_approveSignData,
    ui_approveNewAccount
  },
  data() {
    return {
      store: store,
      mounted: null
    };
  },
  created: function() {
    ipcRenderer.on('ApprovalRequired', (event, message) => {
      store.dispatch('addData', message);
    });
    // Let the main process know the page is loaded
    ipcRenderer.send('channelsConfigured', 'ping');
  }
};
</script>
