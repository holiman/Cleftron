<script>
import store from '@/store'
import jsonrpc from 'jsonrpc-lite'
import { ipcRenderer } from 'electron'
import RequestInfo from './Requestinfo.vue'

export default {
  data () {
    return {
      store: store
    }
  },
  components: {
    RequestInfo
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
        <b-card title="Approve New Account" bg-variant="light">
            <RequestInfo></RequestInfo>
            
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
        </b-card>
    </b-form>
</template>