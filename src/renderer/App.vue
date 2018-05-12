<script>
  import { ipcRenderer } from 'electron'
  import store from '@/store'
  export default {
    name: 'Cleftron',
    data () {
      return {
        store: store
      }
    },
    created: function() {
    }
  }
</script>

<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
