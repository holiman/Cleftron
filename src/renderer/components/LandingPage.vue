<script>
import ApproveTransaction from './ApproveTransaction.vue'
import ApproveExport from './ApproveExport.vue'
import ApproveImport from './ApproveImport.vue'
import ApproveListing from './ApproveListing.vue'
import ApproveSignData from './ApproveSignData.vue'
import ApproveNewAccount from './ApproveNewAccount'
import Logger from './Logger.vue'
import { ipcRenderer } from 'electron'
import Vue from 'vue'
import store from '@/store'
export default {
  components: {
    Logger,
    ApproveTransaction,
    ApproveExport,
    ApproveImport,
    ApproveListing,
    ApproveSignData,
    ApproveNewAccount
  },
  data () {
      return {
          store: store,
          mounted : null
      }
  },
  created: function() {
      ipcRenderer.on('addTx', (e,m) => {
        store.dispatch('addData', m)
        store.dispatch('setUi', "ApproveTransaction")
        
      })
      ipcRenderer.on('addExport', (e, m) => { 
        store.dispatch('addData', m)
        store.dispatch('setUi', "ApproveExport")
      })
      ipcRenderer.on('addImport', (e, m) => { 
        store.dispatch('addData', m)
        store.dispatch('setUi', "ApproveImport")
      })
      ipcRenderer.on('addListing', (e, m) => { 
        store.dispatch('addData', m)
        store.dispatch('setUi', "ApproveListing")
      })
      ipcRenderer.on('addSignData', (e, m) => { 
        store.dispatch('addData', m)
        store.dispatch('setUi', "ApproveSignData")
      })
      ipcRenderer.on('addNewAccount', (e, m) => { 
        store.dispatch('addData', m)
        store.dispatch('setUi', "ApproveNewAccount")
      })       
      // Let the main process know the page is loaded
      ipcRenderer.send('channelsConfigured', 'ping')
    }
}
</script>


<template>
  <div>
    <b-container fluid>
        <component :is="store.state.ui"></component>
    </b-container>
    <logger></logger>
  </div>
</template>
