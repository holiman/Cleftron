<template>
  <b-form>
    <b-card
      title="Approve Account Export"
      bg-variant="light">
      <RequestInfo />
      <b-form-group
        vertical
        label="Account Info"
        label-size="mg"
        label-class="font-weight-bold pt-0"
        class="mb-0">
        <b-form-group
          horizontal
          label="Address:"
          label-class="text-sm-right"
          label-for="address">
          <b-input-group>
            <b-input-group-text slot="prepend">
              <blockie :address="store.state.selected.obj.params[0].address" />
            </b-input-group-text>
            <b-form-input
              id="address"
              :value="store.state.selected.obj.params[0].address"
              disabled />
          </b-input-group>
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
      </b-form-group>
    </b-card>
  </b-form>
</template>

<script>
import store from '@/store';
import jsonrpc from 'jsonrpc-lite';
import { ipcRenderer } from 'electron';
import RequestInfo from './RequestInfo.vue';
import Blockie from './Blockie.vue';

export default {
  components: {
    Blockie,
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
