<script>
import store from '@/store';
import jsonrpc from 'jsonrpc-lite';
import { ipcRenderer } from 'electron';
import Blockie from './Blockie.vue';
import RequestInfo from './RequestInfo.vue';
import Vue from 'vue';
import VeeValidate from 'vee-validate';
import { Validator } from 'vee-validate';
import { keccak256 } from 'eth-lib/lib/hash.js';
Vue.use(VeeValidate);

const ethValidators = {
  isHex(value) {
    var v = String(value);
    if (v.length < 2) {
      return false;
    }
    var prefix = v.slice(0, 2).toLowerCase();
    if (prefix != '0x') {
      return false;
    }
    var hex = v.slice(2);
    if (!/^[0-9a-f]*$/i.test(hex)) {
      return false;
    }
    return true;
  },
  isAddr(v) {
    if (!ethValidators.isHex(v)) {
      return false;
    }
    var hex = String(v).slice(2);
    if (!/^[0-9a-f]{40}$/i.test(hex)) {
      return false;
    }
    return true;
  },
  isChecksummed(v) {
    if (!ethValidators.isAddr(v)) {
      return false;
    }
    var address = String(v).slice(2);
    var addrLC = address.toLowerCase();
    var addrUC = address.toUpperCase();
    var addressHash = keccak256(addrLC).replace(/^0x/i, '');
    for (var i = 0; i < 40; i++) {
      // the nth letter should be uppercase if the nth digit of casemap is 1
      if (parseInt(addressHash[i], 16) > 7) {
        if (addrUC[i] !== address[i]) {
          return false;
        }
      } else {
        if (addrLC[i] !== address[i]) {
          return false;
        }
      }
    }
    return true;
  }
};

Validator.extend('eth_hex', {
  getMessage: field => 'Not valid hex.',
  validate: value => ethValidators.isHex(value)
});
Validator.extend('eth_address', {
  getMessage: field => 'Not an ethereum address',
  validate: value => ethValidators.isAddr(value)
});
Validator.extend('eth_checksum', {
  getMessage: field => 'Incorrect checksum',
  validate: value => ethValidators.isChecksummed(value)
});

export default {
  data() {
    return {
      store: store,
      disabled: false,
      errs: []
    };
  },
  components: {
    Blockie,
    RequestInfo
  },
  methods: {
    checkForm(evt) {
      // TODO check for errors
      this.errs = [];
      if (!this.errs.length) return true;
      evt.preventDefault();
    },

    approve(evt) {
      if (!this.checkForm(evt)) {
        return;
      }
      const response = {
        approved: true,
        transaction: store.state.selected.obj.params[0].transaction,
        password: store.state.selected.password
      };
      ipcRenderer.send(
        'response',
        JSON.stringify(jsonrpc.success(store.state.selected.id, response))
      );
      store.dispatch('taskDone');
    },
    reject(evt) {
      const response = {
        approved: false,
        transaction: store.state.selected.obj.params[0].transaction
      };
      ipcRenderer.send(
        'response',
        JSON.stringify(jsonrpc.success(store.state.selected.id, response))
      );
      store.dispatch('taskDone');
    }
  },
  created: function() {},
  computed: {
    passphrase: {
      get() {
        return store.state.selected.password;
      },
      set(value) {
        let data = store.state.selected.obj;
        store.state.selected.password = value;
        store.dispatch('updateObject', data);
      }
    },
    from: {
      get() {
        return store.state.selected.obj.params[0].transaction.from;
      },
      set(value) {
        let data = store.state.selected.obj;
        data.params[0].transaction.from = value;
        store.dispatch('updateObject', data);
      }
    },
    to: {
      get() {
        return store.state.selected.obj.params[0].transaction.to;
      },
      set(value) {
        let data = store.state.selected.obj;
        data.params[0].transaction.to = value;
        store.dispatch('updateObject', data);
      }
    },
    gas: {
      get() {
        return store.state.selected.obj.params[0].transaction.gas;
      },
      set(value) {
        let data = store.state.selected.obj;
        data.params[0].transaction.gas = value;
        store.dispatch('updateObject', data);
      }
    },
    gasPrice: {
      get() {
        return store.state.selected.obj.params[0].transaction.gasPrice;
      },
      set(value) {
        let data = store.state.selected.obj;
        data.params[0].transaction.gasPrice = value;
        store.dispatch('updateObject', data);
      }
    },
    nonce: {
      get() {
        return store.state.selected.obj.params[0].transaction.nonce;
      },
      set(value) {
        let data = store.state.selected.obj;
        data.params[0].transaction.nonce = value;
        store.dispatch('updateObject', data);
      }
    },
    value: {
      get() {
        return store.state.selected.obj.params[0].transaction.value;
      },
      set(value) {
        let data = store.state.selected.obj;
        data.params[0].transaction.value = value;
        store.dispatch('updateObject', data);
      }
    },
    txdata: {
      get() {
        return store.state.selected.obj.params[0].transaction.data;
      },
      set(value) {
        let data = store.state.selected.obj;
        data.params[0].transaction.data = value;
        store.dispatch('updateObject', data);
      }
    },
    info_warnings: {
      get() {
        var ci = store.state.selected.obj.params[0].call_info;
        return ci.filter(x => x.type != 'Info');
      }
    },
    info_notes: {
      get() {
        var ci = store.state.selected.obj.params[0].call_info;
        return ci.filter(x => x.type == 'Info');
      }
    }
  }
};
</script>
<template>
    <b-form>
      <p v-if="errs.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errs">{{ error }}</li>
        </ul>
      </p>
        <b-card title="Approve Transaction" bg-variant="light">
            <RequestInfo></RequestInfo>


            <b-form-group vertical
                        breakpoint="lg"
                        label="Call Info"
                        label-size="mg"
                        label-class="font-weight-bold pt-0"
                        class="mb-0">
              <b-container>
              </b-container>
                  <b-alert v-for="item in info_warnings" :key="item.message" show variant="danger">
                    {{ item.message }}
                  </b-alert>
                  <b-alert v-for="item in info_notes" :key="item.message" show>
                  {{ item.message }}
                  </b-alert>
            </b-form-group>

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
                    <b-form-input v-validate="'required|eth_hex|eth_address|eth_checksum'" name='from' v-model="from" plaintext id="fromInput"></b-form-input>
                    <b-alert v-if="errors.first('from')" show variant="danger">{{ errors.first('from') }}</b-alert>
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
                    <b-form-input v-model="to" v-validate="'eth_hex|eth_address|eth_checksum'" plaintext id="toInput" name='to'></b-form-input>
                     <b-alert v-if="errors.first('to')" show variant="danger">{{ errors.first('to') }}</b-alert>
                  </b-input-group>
                  
              </b-form-group>
              <b-form-group horizontal
                              label="Value:"
                              label-class="text-sm-right"
                              label-for="valueInput">
                  <b-form-input v-model="value" :disabled="disabled" id="valueInput" v-validate="'required|eth_hex'" name='value'></b-form-input>
                  <b-alert v-if="errors.first('value')" show variant="danger">{{ errors.first('value') }}</b-alert>
              </b-form-group>
              <b-form-group horizontal
                              label="Gas:"
                              label-class="text-sm-right"
                              label-for="gasInput">
                  <b-form-input v-model="gas" :disabled="disabled" id="gasInput" v-validate="'required|eth_hex'" name='gas'></b-form-input>
                  <b-alert v-if="errors.first('gas')" show variant="danger">{{ errors.first('gas') }}</b-alert>
              </b-form-group>
              <b-form-group horizontal
                              label="Gas price:"
                              label-class="text-sm-right"
                              label-for="gasPriceInput">
                  <b-form-input v-model="gasPrice" :disabled="disabled" id="gasPriceInput" v-validate="'required|eth_hex'" name='gasPrice'></b-form-input>
                  <b-alert v-if="errors.first('gasPrice')" show variant="danger">{{ errors.first('gasPrice') }}</b-alert>
              </b-form-group>
              <b-form-group horizontal
                              label="Nonce:"
                              label-class="text-sm-right"
                              label-for="nonceInput">
                  <b-form-input v-model="nonce" :disabled="disabled" id="nonceInput" v-validate="'required|eth_hex'" name='nonce'></b-form-input>
                  <b-alert v-if="errors.first('nonce')" show variant="danger">{{ errors.first('nonce') }}</b-alert>
                  <span>{{ errors.first('nonce') }}</span>
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
                              :max-rows="6" v-validate="'eth_hex'" name="data">
                  </b-form-textarea>
                  <b-alert v-if="errors.first('data')" show variant="danger">{{ errors.first('data') }}</b-alert>
              </b-form-group>
              <b-form-group horizontal
                              label="Passphrase:"
                              label-class="text-sm-right"
                              label-for="pass">
                  <b-form-input type="password" v-model="passphrase" :disabled="disabled" id="pass"></b-form-input>
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
