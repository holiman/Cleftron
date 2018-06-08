<template>
  <b-form>
    <b-card
      title="Approve New Account"
      bg-variant="light">
      <RequestInfo />
      <b-container>
        <b-row class="text-center">
          <b-col class="py-3">
            <b-button
              variant="danger"
              @click="reject">
              Reject
            </b-button>
          </b-col>
          <b-col class="py-3">
            <b-button
              variant="primary"
              @click="approve">
              Approve
            </b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-card>
  </b-form>
</template>

<script>
import store from '@/store';
import jsonrpc from 'jsonrpc-lite';
import { ipcRenderer } from 'electron';
import RequestInfo from './RequestInfo.vue';

export default {
  components: {
    RequestInfo
  },
  data() {
    return {
      store: store
    };
  },
  methods: {
    approve() {
      const response = {
        approved: true
      };
      ipcRenderer.send(
        'response',
        JSON.stringify(jsonrpc.success(store.state.pending.id, response))
      );
      store.dispatch('setUi', '');
    },
    reject() {
      const response = {
        approved: false
      };
      ipcRenderer.send(
        'response',
        JSON.stringify(jsonrpc.success(store.state.pending.id, response))
      );
      store.dispatch('setUi', '');
    }
  }
};
</script>
