<template>
  <b-form>
    <b-card
      title="Approve Sign Message"
      bg-variant="light">
      <RequestInfo />
      <b-form-group
        vertical
        breakpoint="lg"
        label="Message Info"
        label-size="mg"
        label-class="font-weight-bold pt-0"
        class="mb-0">
        <b-form-group
          horizontal
          label="Address:"
          label-class="text-sm-right"
          label-for="address">
          <b-form-input
            id="address"
            :value="store.state.pending.params[0].address"
            disabled />
        </b-form-group>
        <b-form-group
          horizontal
          label="Raw Data:"
          label-class="text-sm-right"
          label-for="rawdata">
          <b-form-input
            id="rawdata"
            :value="store.state.pending.params[0].raw_data"
            disabled />
        </b-form-group>
        <b-form-group
          horizontal
          label="Hash:"
          label-class="text-sm-right"
          label-for="hash">
          <b-form-input
            id="hash"
            :value="store.state.pending.params[0].hash"
            disabled />
        </b-form-group>
        <b-form-group
          horizontal
          label="Message:"
          label-class="text-sm-right"
          label-for="messagearea">
          <b-form-textarea
            id="messagearea"
            :value="store.state.pending.params[0].message"
            :rows="2"
            :max-rows="6"
            placeholder="0x0"
            disabled />
        </b-form-group>
        <b-form-group
          horizontal
          label="Passphrase:"
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
      store: store
    };
  },
  computed: {
    passphrase: {
      get() {
        return store.state.passphrase;
      },
      set(value) {
        store.dispatch('addPassphrase', value);
      }
    }
  },
  methods: {
    approve() {
      const response = {
        approved: true,
        password: store.state.selected.password
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
