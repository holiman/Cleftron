<script>
import store from '@/store'
import jsonrpc from 'jsonrpc-lite'
import { ipcRenderer } from 'electron'
import RequestInfo from './Requestinfo.vue'
import Blockie from './Blockie.vue'
export default {
  data () {
    return {
      store: store,
      passphrase : '',
      newpassphrase : ''
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
        <b-card title="Approve Account Import" bg-variant="light">
            <RequestInfo></RequestInfo>
              <b-form-group horizontal
                              label="Old Passphrase:"
                              label-class="text-sm-right"
                              label-for="pass">
                  <b-form-input type="password" v-model="passphrase" :disabled="disabled" id="pass"></b-form-input>
              </b-form-group>
              <b-form-group horizontal
                              label="New Passphrase:"
                              label-class="text-sm-right"
                              label-for="pass">
                  <b-form-input type="password" v-model="passphrase" :disabled="disabled" id="pass"></b-form-input>
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
        </b-card>
    </b-form>
</template>
           