<template>
  <b-form>
    <b-card
      title="Approve Account Import"
      bg-variant="light">
      <RequestInfo />
      <b-form-group
        horizontal
        label="Old Passphrase:"
        label-class="text-sm-right"
        label-for="pass">
        <b-form-input
          id="pass"
          v-model="passphrase"
          :disabled="disabled"
          type="password" />
      </b-form-group>
      <b-form-group
        horizontal
        label="New Passphrase:"
        label-class="text-sm-right"
        label-for="pass">
        <b-form-input
          id="pass"
          v-model="passphrase"
          :disabled="disabled"
          type="password" />
      </b-form-group>
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
      store: store,
      passphrase: '',
      newpassphrase: ''
    };
  },
  methods: {
    approve() {
      const response = {
        approved: true
      };
      ipcRenderer.send(
        'response',
        JSON.stringify(jsonrpc.success(store.state.selected.id, response))
      );
      store.dispatch('taskDone');
    },
    reject() {
      const response = {
        approved: false
      };
      ipcRenderer.send(
        'response',
        JSON.stringify(jsonrpc.success(store.state.selected.id, response))
      );
      store.dispatch('taskDone');
    }
  }
};
</script>
