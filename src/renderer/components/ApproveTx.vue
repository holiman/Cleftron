<template>
  <b-form>
    <p v-if="errs.length">
      <strong>
        Please correct the following
        {{ errs.length }} {{ errs.length > 1 ? 'errors' : 'error' }}:
      </strong>
      <ul>
        <li
          v-for="error in errs"
          :key="error">
          {{ error }}
        </li>
      </ul>
    </p>
    <b-card
      title="Approve Transaction"
      bg-variant="light">
      <RequestInfo />

      <b-form-group
        vertical
        label="Call Info"
        label-size="mg"
        label-class="font-weight-bold pt-0"
        class="mb-0">
        <b-container />
        <b-alert
          v-for="item in info_warnings"
          :key="item.message"
          show
          variant="danger">
          {{ item.message }}
        </b-alert>
        <b-alert
          v-for="item in info_notes"
          :key="item.message"
          show>
          {{ item.message }}
        </b-alert>
      </b-form-group>

      <b-form-group
        vertical
        label="Transaction Info"
        label-size="mg"
        label-class="font-weight-bold pt-0"
        class="mb-0">
        <b-form-group
          horizontal
          label="From:"
          label-class="text-sm-right"
          label-for="fromInput">
          <b-input-group>
            <blockie :address="from" />
            <b-form-input
              v-validate="'required|eth_hex|eth_address|eth_checksum'"
              id="fromInput"
              v-model="from"
              :plaintext="!edit.from"
              :state="fields.from && fields.from.valid ? true : false"
              name="from" />
            <b-form-invalid-feedback
              :force-show="fields.from && !fields.from.valid">
              {{ errors.first('from') }}
            </b-form-invalid-feedback>
            <b-form-checkbox
              id="edit.from"
              v-model="edit.from"
              :class="{ 'checked': edit.from }"
              @change.native="showEditWarning">
              Edit
            </b-form-checkbox>
          </b-input-group>
        </b-form-group>
        <b-form-group
          horizontal
          label="To:"
          label-class="text-sm-right"
          label-for="toInput">
          <b-input-group>
            <blockie :address="to" />
            <b-form-input
              v-validate="'eth_hex|eth_address|eth_checksum'"
              id="toInput"
              v-model="to"
              :plaintext="!edit.to"
              :state="fields.to && fields.to.valid ? true : false"
              stacked
              name="to" />
            <b-form-invalid-feedback
              :force-show="fields.to && !fields.to.valid">
              {{ errors.first('to') }}
            </b-form-invalid-feedback>
            <b-form-checkbox
              id="editTo"
              v-model="edit.to"
              :class="{ 'checked': edit.to }"
              @change.native="showEditWarning">
              Edit
            </b-form-checkbox>
          </b-input-group>
        </b-form-group>
        <b-form-group
          horizontal
          label="Value:"
          label-class="text-sm-right"
          label-for="valueInput">
          <b-form-input
            v-validate="'required|eth_hex'"
            id="valueInput"
            v-model="value"
            :disabled="disabled"
            :plaintext="!edit.value"
            :state="fields.value && fields.value.valid ? true : false"
            name="value" />
          <b-form-invalid-feedback
            :force-show="fields.value && !fields.value.valid">
            {{ errors.first('value') }}
          </b-form-invalid-feedback>
          <b-form-checkbox
            id="editValue"
            v-model="edit.value"
            :class="{ 'checked': edit.value }"
            @change.native="showEditWarning">
            Edit
          </b-form-checkbox>
        </b-form-group>
        <b-form-group
          label="Gas:"
          label-class="text-sm-right"
          label-for="gasInput"
          horizontal>
          <b-form-input
            v-validate="'required|eth_hex'"
            id="gasInput"
            v-model="gas"
            :disabled="disabled"
            :plaintext="!edit.gas"
            :state="fields.gas && fields.gas.valid ? true : false"
            name="gas" />
          <b-form-invalid-feedback
            :force-show="fields.gas && !fields.gas.valid">
            {{ errors.first('gas') }}
          </b-form-invalid-feedback>
          <b-form-checkbox
            id="editGas"
            v-model="edit.gas"
            :class="{ 'checked': edit.gas }"
            @change.native="showEditWarning">
            Edit
          </b-form-checkbox>
        </b-form-group>
        <b-form-group
          label="Gas Price:"
          label-class="text-sm-right"
          label-for="gasPriceInput"
          horizontal>
          <b-form-input
            v-validate="'required|eth_hex'"
            id="gasPriceInput"
            v-model="gasPrice"
            :disabled="disabled"
            :plaintext="!edit.gasPrice"
            :state="fields.gasPrice && fields.gasPrice.valid ? true : false"
            name="gasPrice" />
          <b-form-invalid-feedback
            :force-show="fields.gasPrice && !fields.gasPrice.valid">
            {{ errors.first('gasPrice') }}
          </b-form-invalid-feedback>
          <b-form-checkbox
            id="editGasPrice"
            v-model="edit.gasPrice"
            :class="{ 'checked': edit.gasPrice }"
            @change.native="showEditWarning">
            Edit
          </b-form-checkbox>
        </b-form-group>
        <b-form-group
          label="Nonce:"
          label-class="text-sm-right"
          label-for="nonceInput"
          horizontal>
          <b-form-input
            v-validate="'required|eth_hex'"
            id="nonceInput"
            v-model="nonce"
            :disabled="disabled"
            :plaintext="!edit.nonce"
            :state="fields.nonce && fields.nonce.valid ? true : false"
            name="nonce" />
          <b-form-invalid-feedback
            :force-show="fields.nonce && !fields.nonce.valid">
            {{ errors.first('nonce') }}
          </b-form-invalid-feedback>
          <b-form-checkbox
            id="editNonce"
            v-model="edit.nonce"
            :class="{ 'checked': edit.nonce }"
            @change.native="showEditWarning">
            Edit
          </b-form-checkbox>
        </b-form-group>
        <b-form-group
          label="Data:"
          label-class="text-sm-right"
          label-for="dataInput"
          horizontal>
          <b-form-textarea
            v-validate="'eth_hex'"
            id="textarea-data"
            :rows="2"
            :max-rows="6"
            v-model="txData"
            :disabled="disabled"
            :plaintext="!edit.data"
            :state="fields.data && fields.data.valid ? true : false"
            placeholder="0x0"
            name="data" />
          <b-form-invalid-feedback
            :force-show="fields.data && !fields.data.valid">
            {{ errors.first('data') }}
          </b-form-invalid-feedback>
          <b-form-checkbox
            id="editData"
            v-model="edit.data"
            :class="{ 'checked': edit.data }"
            @change.native="showEditWarning">
            Edit
          </b-form-checkbox>
        </b-form-group>
      </b-form-group>
      <b-form-group
        vertical
        label="Action"
        label-size="mg"
        label-class="font-weight-bold pt-0"
        class="mb-0">
        <b-form-group
          horizontal
          label="Password:"
          label-class="text-sm-right"
          label-for="pass">
          <b-input-group>
            <b-form-input
              id="pass"
              v-model="passphrase"
              :disabled="disabled"
              type="password" />
            <b-button
              variant="primary"
              @:click="approve()">
              Approve
            </b-button>
          </b-input-group>
        </b-form-group>
      </b-form-group>
      <b-container>
        <b-row class="text-center">
          <b-col class="py-3">
            <b-button
              variant="danger"
              @:click="reject">Reject</b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-card>
  </b-form>
</template>

<script>
import { ipcRenderer, remote } from 'electron';
import Vue from 'vue';
import store from '@/store';
import jsonrpc from 'jsonrpc-lite';
import VeeValidate from 'vee-validate';
import { Validator } from 'vee-validate';
import { keccak256 } from 'eth-lib/lib/hash.js';
import Blockie from './Blockie.vue';
import RequestInfo from './RequestInfo.vue';

Vue.use(VeeValidate);

const ethValidators = {
  isHex(v) {
    const value = String(v);
    if (value.length < 2) {
      return false;
    }
    const prefix = value.slice(0, 2).toLowerCase();
    if (prefix != '0x') {
      return false;
    }
    const hex = value.slice(2);
    if (!/^[0-9a-f]*$/i.test(hex)) {
      return false;
    }
    return true;
  },
  isAddr(value) {
    if (!ethValidators.isHex(value)) {
      return false;
    }
    const hex = String(value).slice(2);
    if (!/^[0-9a-f]{40}$/i.test(hex)) {
      return false;
    }
    return true;
  },
  isChecksummed(value) {
    if (!ethValidators.isAddr(value)) {
      return false;
    }
    var address = String(value).slice(2);
    var addrLC = address.toLowerCase();
    var addrUC = address.toUpperCase();
    var addrHash = keccak256(addrLC).replace(/^0x/i, '');
    for (var i = 0; i < 40; i++) {
      // the nth letter should be uppercase if the nth digit of casemap is 1
      if (parseInt(addrHash[i], 16) > 7) {
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
  getMessage: () => 'Not valid hex.',
  validate: value => ethValidators.isHex(value)
});
Validator.extend('eth_address', {
  getMessage: () => 'Not an ethereum address',
  validate: value => ethValidators.isAddr(value)
});
Validator.extend('eth_checksum', {
  getMessage: () => 'Incorrect checksum',
  validate: value => ethValidators.isChecksummed(value)
});

export default {
  components: {
    Blockie,
    RequestInfo
  },
  data() {
    return {
      store: store,
      disabled: false,
      errs: [],
      edit: {
        from: false,
        to: false,
        gas: false,
        gasPrice: false,
        nonce: false,
        value: false,
        data: false
      }
    };
  },
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
    txData: {
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
  },
  methods: {
    checkForm(event) {
      // TODO check for errors
      this.errs = [];
      if (!this.errs.length) {
        return true;
      }
      event.preventDefault();
    },
    approve(event) {
      if (!this.checkForm(event)) {
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
    reject() {
      const response = {
        approved: false,
        transaction: store.state.selected.obj.params[0].transaction
      };
      ipcRenderer.send(
        'response',
        JSON.stringify(jsonrpc.success(store.state.selected.id, response))
      );
      store.dispatch('taskDone');
    },
    showEditWarning(event) {
      if (event.target.checked) {
        remote.dialog.showMessageBox({
          type: 'warning',
          message: 'Please be careful when editing your transaction.'
        });
      }
    }
  }
};
</script>

<style>
.form-control-plaintext.is-invalid {
  border-bottom: 1px dotted red;
}
.custom-checkbox {
  transform: scale(0.85);
  opacity: 0.5;
}
.custom-checkbox:hover {
  opacity: 0.85;
}
.custom-checkbox.checked {
  opacity: 1;
}
</style>
