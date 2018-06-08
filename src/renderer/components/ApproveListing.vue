<template>
  <b-form>
    <b-card
      title="Approve Account Listing"
      bg-variant="light">
      <RequestInfo />
      <b-form-group
        vertical
        breakpoint="lg"
        label="Accounts Info"
        label-size="mg"
        label-class="font-weight-bold pt-0"
        class="mb-0">
        <b-form-group
          v-for="item in state.selected.obj.params[0].accounts"
          :key="item.address"
          horizontal
          label="Address:"
          label-class="text-sm-right"
          label-for="address">
          <b-input-group>
            <b-input-group-text slot="prepend">
              <blockie :address="item.address" />
            </b-input-group-text>
            <b-form-input
              id="address"
              :value="item.address"
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
    RequestInfo,
    Blockie
  },
  data() {
    return {
      state: store.state
    };
  },
  methods: {
    approve() {
      const response = {
        accounts: store.state.selected.obj.params[0].accounts
      };
      ipcRenderer.send(
        'response',
        JSON.stringify(jsonrpc.success(store.state.selected.id, response))
      );
      store.dispatch('taskDone');
    },
    reject() {
      const response = {
        accounts: []
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
