import Vue from 'vue'
import Vuex from 'vuex'
//import BigNumber from 'bignumber.js';
//import { ipcRenderer } from 'electron'


Vue.use(Vuex)
export default new Vuex.Store({
	state: {
		passphrase: '',
		ui: null,
		logMessages: [],
//		pending : {"jsonrpc":"2.0","id":4,"method":"ApproveNewAccount","params":[{"meta":{"remote":"","local":"","scheme":""}}]},
//		pending : {"jsonrpc":"","method":"","params":[{"transaction":{"to":"","gas":"","gasPrice":"","value":"","data":"","nonce":""},"from":"","call_info":"","meta":{"remote":"","local":"","scheme":""}}],"id":-1},
//		pending : {"jsonrpc":"2.0","id":-1,"method":"ApproveExport","params":[{"address":"0x0","meta":{"remote":"signer binary","local":"main","scheme":"in-proc"}}]},
//		pending : {"jsonrpc":"2.0","id":-1,"method":"ApproveListing","params":[{"accounts":[{"type":"Account","url":"keystore:///","address":"0x0"},{"type":"Account","url":"keystore:///","address":"0x1"}],"meta":{"remote":"signer binary","local":"main","scheme":"in-proc"}}]},
//		pending : {"jsonrpc":"2.0","id":-1,"method":"ApproveSignData","params":[{"address":"0x0","raw_data":"0x0","message":"","hash":"0x0","meta":{"remote":"signer binary","local":"main","scheme":"in-proc"}}]}
	},
	mutations: {
		SAVE_DATA(state, data){
			state.pending = data;
		},
		SAVE_PASS(state,data){
			state.passphrase = data;
		},
		LOG_MSG(state,data){
			state.logMessages.push(data)
		},
		SET_UI(state,data){
			state.ui = data;
		},
		CLEAN(state){
			state.passphrase = "";
		},
	},
	actions: {
		setUi({commit}, data){
			commit('SET_UI', data)
			if(!data){
				commit('CLEAN')
			}
		},
		addData({commit}, data){
			commit('SAVE_DATA', data)
		},
		addPassphrase({commit}, data){
			commit('SAVE_PASS', data)
		},
		logMsg({commit}, data){
			commit('LOG_MSG', data)
		}
	}
})
