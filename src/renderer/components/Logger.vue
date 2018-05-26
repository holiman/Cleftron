<script>
import { ipcRenderer } from 'electron';
import store from '@/store';
import jsonrpc from 'jsonrpc-lite';
import StringDecoder from 'string_decoder';
import ansicolor from 'ansicolor';
//const decoder = new StringDecoder.StringDecoder('utf8');

export default {
  data() {
    return {
      store: store
    };
  },
  created: function() {
    ipcRenderer.on('message', (e, m) => {
      this.logMessage(m);
    });
    ipcRenderer.on('stderr', (e, m) => {
      this.logMessage(m);
    });
  },
  methods: {
    logMessage(msg) {
      msg = String(msg);
      msg.split('\n').forEach(a => {
        store.dispatch('logMsg', ansicolor.strip(a.trim()));
      });
    }
  }
};
</script>
<template>
		<b-card title="Log" bg-variant="light" style="height: 100vh; overflow: auto">
				<b-container class="h-50 d-inline-block">
						<div style="max-height: 500px; overflow: scroll">
						<samp v-for="(item, key) in store.state.logMessages" :key="key">{{ item }}<br/>
						</samp>
					</div>
				</b-container>
		</b-card>
</template>
<!--
<template>
		<b-card title="Log" bg-variant="light" style="height: 100vh; overflow: auto">
				<b-container class="h-50 d-inline-block">
						<ul class="h-50 list-group list-group-flush" style="max-height: 500px; overflow: scroll">
						<li class="list-group-item" v-for="(item, key) in store.state.logMessages" :key="key">
								{{ item }}
						</li>
						</ul>
				</b-container>
		</b-card>
</template>
-->
