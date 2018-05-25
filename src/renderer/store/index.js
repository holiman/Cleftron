import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex)
export default new Vuex.Store({
	state: {
		// A text description about what UI to use
		ui: null,
		// Log messages, from the clef binary
		logMessages: [],
		// Requests to be handled
		tasks: {}, 
		// The currently selected task
		selected: {},

	},
	mutations: {
		addTask(state, task){
			// state.tasks[task.id] = task
			if (!state.selected.id){
				state.selected = task
				state.ui = state.selected.ui
			}

			// Since state.tasks in an object,we need to use this 
			// construct intead of 
			// state.tasks[task.id] = task
			// See https://vuejsdevelopers.com/2017/03/05/vue-js-reactivity/

			Vue.set(state.tasks, task.id, task);
		},
		// Signal that a task is done
		taskDone(state){
			if (!state.selected.id){
				return;
			}
			delete(state.tasks[state.selected.id])
			state.selected = {};
			state.ui = null;
			// Go to next task, sort by rpc id (key)
			let keys = Object.keys(state.tasks).sort();
			if (!keys.length) {return;}
			state.selected = state.tasks[keys[0]]
			state.ui = state.selected.ui
		},

		addLog(state,data){
			state.logMessages.push(data)
		},
		setSelectedTask(state, data){
			var id = Number(data)
			if (state.tasks[id]){
				state.selected = state.tasks[id]
				state.ui = state.selected.ui
			}	
		},
		updateObject(state, data){
			state.selected.obj = data;
		}
	},
	actions: {
		selectTask({commit}, data){
			// Select by RPC ID
			commit('setSelectedTask', Number(data))
		},
		taskDone({state, commit}, data){
			commit('taskDone');
		},
		addData({state, commit}, data){
			commit('addTask', {
				strData: JSON.stringify(data),
				ui  : data.method,
				obj : data,
				id : data.id
			})
		},
		// Update an object with new data, e.g. setting gasPrice
		updateObject({state, commit}, data){
			commit('updateObject', data)
		},
		// addPassphrase({commit}, data){
		// 	commit('SAVE_PASS', data)
		// },
		logMsg({commit}, data){
			commit('addLog', data)
		},
	}
})


/**
{ "jsonrpc":"2.0",
 "id":2,
 "method":"ApproveTx",
 "params":[
 	{	
 		"transaction":{"from":"0xcf6cd422f9b45778ad8a564edfbf8abab96e363a","to":"0x07a565b7ed7d7a678680a4c162885bedbb695fe0","gas":"0x333","gasPrice":"0x123","value":"0x10","nonce":"0x0","data":"0x4401a6e40000000000000000000000000000000000000000000000000000000000000012","input":null},
 		"call_info":[{"type":"WARNING","message":"Invalid checksum on to-address"},{"type":"Info","message":"safeSend(address: 0x0000000000000000000000000000000000000012)"}],
 		"meta":{"remote":"127.0.0.1:57590","local":"localhost:8550","scheme":"HTTP/1.1"}
 	}
 	]}

**/