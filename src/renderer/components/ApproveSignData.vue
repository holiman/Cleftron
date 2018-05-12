<script>
import store from '@/store'
import jsonrpc from 'jsonrpc-lite'
import { ipcRenderer } from 'electron'
import RequestInfo from './Requestinfo.vue'
import Blockie from './Blockie.vue'
export default {
  data () {
    return {
      store: store
    }
  },
  components: {
    RequestInfo,
    Blockie
  },
  methods: {
    approve (evt) {
      const response = {
        "approved" : true
      }
      ipcRenderer.send('response',JSON.stringify(jsonrpc.success(store.state.pending.id, response)))
      store.dispatch('setUi', '');
    },
    reject (evt) {
            const response = {
        "approved" : false
      }
      ipcRenderer.send('response',JSON.stringify(jsonrpc.success(store.state.pending.id, response)))
      store.dispatch('setUi', '');
    }
  }
}
</script>

<template>
    <b-form>
        <b-card title="Approve Sign Message" bg-variant="light">
            <RequestInfo></RequestInfo>
            <b-form-group vertical
                        breakpoint="lg"
                        label="Message Info"
                        label-size="mg"
                        label-class="font-weight-bold pt-0"
                        class="mb-0">
              <b-form-group horizontal
                              label="Address:"
                              label-class="text-sm-right"
                              label-for="address"
                              >
                  <b-form-input :value="store.state.pending.params[0].address" disabled id="address"></b-form-input>
              </b-form-group>
              <b-form-group horizontal
                              label="Raw Data:"
                              label-class="text-sm-right"
                              label-for="rawdata"
                              >
                  <b-form-input :value="store.state.pending.params[0].raw_data" disabled id="rawdata"></b-form-input>
              </b-form-group>
              <b-form-group horizontal
                              label="Hash:"
                              label-class="text-sm-right"
                              label-for="hash"
                >
                <b-form-input :value="store.state.pending.params[0].hash" disabled id="hash"></b-form-input>
              </b-form-group>
              <b-form-group horizontal
                              label="Message:"
                              label-class="text-sm-right"
                              label-for="messagearea">
                  <b-form-textarea
                              disabled
                              :value="store.state.pending.params[0].message"
                              id="messagearea"
                              placeholder="0x0"
                              :rows="4"
                              :max-rows="6">
                  </b-form-textarea>
              </b-form-group>
              <b-container>
                <b-row class="text-center">
                    <b-col class="py-3">
                    <b-button v-on:click="reject" variant="danger">Reject</b-button>
                    </b-col>
                    <b-col class="py-3">
                    <b-button v-on:click="approve" variant="primary">Approve</b-button>
                    </b-col>
                </b-row>
              </b-container>
            </b-form-group>
        </b-card>
    </b-form>
</template>