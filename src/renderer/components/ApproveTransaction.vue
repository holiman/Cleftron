<script>
import store from '@/store'
import jsonrpc from 'jsonrpc-lite'
import { ipcRenderer } from 'electron'
import Blockie from './Blockie.vue'
import RequestInfo from './Requestinfo.vue'

export default {
  data () {
    return {
      store: store,
      disabled: false
    }
  },
  components: {
    Blockie,
    RequestInfo
  },
  methods: {
    approve (evt) {
      const response = {
        "approved" : true,
        "transaction" : store.state.pending.params[0].transaction,
        "password" : '',
      }
      ipcRenderer.send('response',JSON.stringify(jsonrpc.success(store.state.pending.id, response)))
      store.dispatch('setUi', '');
    },
    reject (evt) {
      const response = {
        "approved" : false,
        "transaction" : store.state.pending.params[0].transaction,
        "password" : '',
      }
      ipcRenderer.send('response',JSON.stringify(jsonrpc.success(store.state.pending.id, response)))
      store.dispatch('setUi', '');
    }
  },
  created: function() {

  },
  computed: {
    from: {
      get () {
        return store.state.pending.params[0].transaction.from
      },
      set (value) {
        let data = store.state.pending
        data.params[0].transaction.from = value
        store.dispatch('addData', data);
      }
    },
    to: {
      get () {
        return store.state.pending.params[0].transaction.to
      },
      set (value) {
        let data = store.state.pending
        data.params[0].transaction.to = value
        store.dispatch('addData', data);
      }
    },
    gas: {
      get () {
        return store.state.pending.params[0].transaction.gas
      },
      set (value) {
        let data = store.state.pending
        data.params[0].transaction.gas = value
        store.dispatch('addData', data);
      }
    },
    gasPrice: {
      get () {
        return store.state.pending.params[0].transaction.gasPrice
      },
      set (value) {
        let data = store.state.pending
        data.params[0].transaction.gasPrice = value
        store.dispatch('addData', data);
      }
    },
    nonce: {
      get () {
        return store.state.pending.params[0].transaction.nonce
      },
      set (value) {
        let data = store.state.pending
        data.params[0].transaction.nonce = value
        store.dispatch('addData', data);
      }
    },
    value: {
      get () {
        return store.state.pending.params[0].transaction.value
      },
      set (value) {
        let data = store.state.pending
        data.params[0].transaction.value = value
        store.dispatch('addData', data);
      }
    },
    txdata: {
      get () {
        return store.state.pending.params[0].transaction.data
      },
      set (value) {
        let data = store.state.pending
        data.params[0].transaction.data = value
        store.dispatch('addData', data);
      }
    }
  }  
}
</script>


<template>
    <b-form>
        <b-card title="Approve Transaction" bg-variant="light">
            <RequestInfo></RequestInfo>

            <b-form-group vertical
                        breakpoint="lg"
                        label="Transaction Info"
                        label-size="mg"
                        label-class="font-weight-bold pt-0"
                        class="mb-0">
              <b-container>

              </b-container>
              <b-form-group horizontal
                              label="From:"
                              label-class="text-sm-right"
                              label-for="fromInput"
                              >

                  <b-input-group>
                    <b-input-group-text slot="prepend">
                      <blockie :address="from"></blockie>
                    </b-input-group-text>
                    <b-form-input v-model="from" plaintext id="fromInput"></b-form-input>
                  </b-input-group>
                  
              </b-form-group>
              <b-form-group horizontal
                              label="To:"
                              label-class="text-sm-right"
                              label-for="toInput">
                  <b-input-group>
                    <b-input-group-text slot="prepend">
                      <blockie :address="to"></blockie>
                    </b-input-group-text>
                    <b-form-input v-model="to" plaintext id="toInput"></b-form-input>
                  </b-input-group>
                  
              </b-form-group>
              <b-form-group horizontal
                              label="Value:"
                              label-class="text-sm-right"
                              label-for="valueInput">
                  <b-form-input v-model="value" :disabled="disabled" id="valueInput"></b-form-input>
              </b-form-group>
              <b-form-group horizontal
                              label="Gas:"
                              label-class="text-sm-right"
                              label-for="gasInput">
                  <b-form-input v-model="gas" :disabled="disabled" id="gasInput"></b-form-input>
              </b-form-group>
              <b-form-group horizontal
                              label="Gas price:"
                              label-class="text-sm-right"
                              label-for="gasPriceInput">
                  <b-form-input v-model="gasPrice" :disabled="disabled" id="gasPriceInput"></b-form-input>
              </b-form-group>
              <b-form-group horizontal
                              label="Nonce:"
                              label-class="text-sm-right"
                              label-for="nonceInput">
                  <b-form-input v-model="nonce" :disabled="disabled" id="nonceInput"></b-form-input>
              </b-form-group>
              <b-form-group horizontal
                              label="Data:"
                              label-class="text-sm-right"
                              label-for="dataInput">
                  <b-form-textarea
                              :disabled="disabled"
                              v-model="txdata" 
                              id="textarea1"
                              placeholder="0x0"
                              :rows="4"
                              :max-rows="6">
                  </b-form-textarea>
              </b-form-group>
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
