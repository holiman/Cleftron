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
import ApproveTx from './ApproveTx.vue';
import ApproveExport from './ApproveExport.vue';
import ApproveImport from './ApproveImport.vue';
import ApproveListing from './ApproveListing.vue';
import ApproveSignData from './ApproveSignData.vue';
import ApproveNewAccount from './ApproveNewAccount';
import Logger from './Logger.vue';
import TaskQueue from './TaskQueue.vue';
import { ipcRenderer } from 'electron';
import store from '@/store';

export default {
  components: {
    TaskQueue,
    Logger,
    ApproveTx,
    ApproveExport,
    ApproveImport,
    ApproveListing,
    ApproveSignData,
    ApproveNewAccount
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
