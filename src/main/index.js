import { Notification, Menu, BrowserWindow, Tray, app, nativeImage, ipcMain, dialog } from 'electron'

import fs from 'fs'
import path from 'path'
//import store from '../renderer/store'
import StringDecoder from 'string_decoder'
import jsonrpc from 'jsonrpc-lite'
import { spawn } from 'cross-spawn'
const decoder = new StringDecoder.StringDecoder('utf8');

if (process.env.NODE_ENV !== 'development') {
	global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let tray
let clef

const winURL = process.env.NODE_ENV === 'development'
	? `http://localhost:9080`
	: `file://${__dirname}/index.html`

// Set up the systray icon 
function setupTray(){

	const iconPath = path.join(__static, 'blu-eth-48x48.png');
	tray = new Tray(nativeImage.createFromPath(iconPath));

	const menu = Menu.buildFromTemplate([
		{label: "Open", click: (item, window, event) => {
				mainWindow.show();
		}},
		{type: "separator"},
		{label: "Exit", click : () => {
			app.isQuiting = true;
			app.quit();
		}},
	]);
	tray.setContextMenu(menu);
	tray.on('click', () => {
		mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
	})

}

// Display a notification to the user
function note(text, surpressOnClick){
	let notify = new Notification({ title: 'Cleftron', body: text})
	notify.show();
	if (surpressOnClick){ return }
	notify.on('click', () =>{ mainWindow.show(); })
}

function createWindow () {
	mainWindow = new BrowserWindow({
		height: 1000,
		useContentSize: true,
		width: 563
	})

	mainWindow.loadURL(winURL)
	//mainWindow.webContents.openDevTools()
	mainWindow.on('closed', () => { mainWindow = null })
	mainWindow.on('show', () => {})
	mainWindow.on('hide', () => {})
	setupTray();


	mainWindow.on('close', (e) => {
		if(!app.isQuiting){
		e.preventDefault();
		e.sender.hide();
		}
	})
	var send = function(data){
		console.log("->"+data)
		clef.stdin.write(data);
		clef.stdin.write("\n");
	}
	ipcMain.on('response', (e, m) => {
		mainWindow.webContents.send("message", m);
		send(m);
	})
	// From the landing page, we send 'channelsConfigured' when
	// the receivers are configured, and ready to receive data
	ipcMain.once('channelsConfigured', () =>{
		clef.stderr.on('data', (data) => {
			mainWindow.webContents.send('stderr', data);
			console.log(String(data));
		});
	})


	let dispatchers = {
		ApproveTx : function(payload){
			mainWindow.webContents.send('addTx', payload);
			note('Transaction Signing is awaiting review.');
		},
		ApproveExport: function(payload){
			mainWindow.webContents.send('addExport', payload);
			note('Account Export is awaiting review.');	  
		},
		ApproveImport: function(payload){  
			mainWindow.webContents.send('addImport', payload);
			note('Account Import is awaiting review.');
		},
	 	ApproveSignData: function(payload) {
			mainWindow.webContents.send('addSignData', payload);
			note('Message signing is awaiting review.');
		}, 
		ApproveListing: function(payload) {
			mainWindow.webContents.send('addListing', payload);
			note('Account listing is awaiting review.');
		},
	 	ApproveNewAccount: function(payload){
			mainWindow.webContents.send('addNewAccount', payload);
			note('New account request is awaiting review.');	 		
	 	},
	 	ShowInfo: function(payload){
			note(payload.params[0].text, true);
	 	},
	 	ShowError: function(payload){
			note(payload.params[0].text, true);
	 	},
		OnApprovedTx: function(payload){
			note('Signed '+payload.params[0].tx.hash, true);
			send(JSON.stringify(jsonrpc.success(payload.id,{})));
		},
		OnSignerStartup: function(payload){
			var i = payload.params[0].info
			note('Clef is up. Web: '+i.extapi_http +" IPC:" + i.extapi_ipc, true)
			send(JSON.stringify(jsonrpc.success(payload.id,{})));
		},
	} 

	clef.stdout.on('data', (data) => {
		console.log(data.toString())
		let rpc = jsonrpc.parse(decoder.end(data))
		if(rpc.type === "request"){
			let handler = dispatchers[rpc.payload.method]  
			if(handler) {  
				handler(rpc.payload) 
			}
			else{
				console.log("Missing handler for method "+rpc.payload.method);
			}
			return
		}
		//mainWindow.webContents.send('message', data);
	});
	
	clef.on('exit', (code) => {
		throw(code)
		mainWindow.webContents.send('message', `Child exited with code ${code}`);
	});


}

app.on('ready', function () {

	let clefpath = "/home/user/tools/clef/clef"

	if(process.argv[1] === '--clefbin'){
		clefpath = process.argv[2];
	} 

	if (!clefpath) {
		clefpath = dialog.showOpenDialog({
			title : 'Select Clef Binary',
			filters : [
				{name: 'Application', extensions: ['exe', 'bin', 'app']},
				{name: 'All Files', extensions: ['*']}
			]
		})[0];
	}

	try{
		clef = spawn(clefpath, ['--rpc','--4bytedb' ,path.dirname(clefpath) + '/4byte.json','--ipcdisable','--stdio-ui'])
	} catch (e) {
		console.log(e);
		throw(e)
	}

	createWindow()
	let fd = require('fs').createReadStream(clefpath);
	let hash = require('crypto').createHash('sha256');
	hash.setEncoding('hex');
	fd.on('end', function() {
			hash.end();
			const notify = new Notification({
				title: 'Binary Sha256',
				body: hash.read(),
				silent: true
			})
			notify.show();
	});
	fd.pipe(hash);

})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow()
	}
})
