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
        "accounts" : store.state.pending.params[0].accounts
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
  },
  created: function() {

  },
  computed: {
  }  
}
</script>


<template>
    <b-form>
        <b-card title="Approve Account Listing" bg-variant="light">
            <RequestInfo></RequestInfo>
            
            <b-form-group vertical
                        breakpoint="lg"
                        label="Accounts Info"
                        label-size="mg"
                        label-class="font-weight-bold pt-0"
                        class="mb-0">
              <b-form-group v-for="item in store.state.pending.params[0].accounts" :key="item" horizontal
                              label="Address:"
                              label-class="text-sm-right"
                              label-for="address"
                              >
                  <b-input-group>
                    <b-input-group-text slot="prepend">
                      <blockie :address="item.address"></blockie>
                    </b-input-group-text>
                    <b-form-input :value="item.address" disabled id="address"></b-form-input>
                  </b-input-group>                                                
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