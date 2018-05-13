import { Notification, Menu, BrowserWindow, Tray, app, nativeImage, ipcMain, dialog } from 'electron'

import fs from 'fs'
import path from 'path'
import store from '../renderer/store'
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
let clefpath

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  mainWindow = new BrowserWindow({
    height: 1000,
    useContentSize: true,
    width: 563
  })

  mainWindow.loadURL(winURL)
  mainWindow.webContents.openDevTools()


  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const iconPath = path.join(__static, 'blu-eth-48x48.png');

  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);

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
  mainWindow.on('show', () => {
  })
  mainWindow.on('hide', () => {
  })

  mainWindow.on('close', (e) => {
    if(!app.isQuiting){
    e.preventDefault();
    e.sender.hide();
    }
  })

  ipcMain.on('response', (e, m) => {
    mainWindow.webContents.send("message", m);
    clef.stdin.write(m);
    clef.stdin.write("\n");
    
  })

  clef.stdout.on('data', (data) => {
    console.log(data.toString())
    let rpc = jsonrpc.parse(decoder.end(data))
    if(rpc.type === "request"){
      if(rpc.payload.method === "ApproveTx") {

        mainWindow.webContents.send('addTx', rpc.payload);
        
        let notify = new Notification({
          title: 'Cleftron',
          body: 'Transaction Signing is awaiting review.'
        })
        notify.show();
        notify.on('click', () =>{
          mainWindow.show();
        })
      } else if(rpc.payload.method === "ApproveExport") {

        mainWindow.webContents.send('addExport', rpc.payload);
        
        let notify = new Notification({
          title: 'Cleftron',
          body: 'Account Export is awaiting review.'
        })
        notify.show();
        notify.on('click', () =>{
          mainWindow.show();
        })
      } else if(rpc.payload.method === "ApproveImport") {

        mainWindow.webContents.send('addImport', rpc.payload);
        
        let notify = new Notification({
          title: 'Cleftron',
          body: 'Account Import is awaiting review.'
        })
        notify.show();
        notify.on('click', () =>{
          mainWindow.show();
        })
      } else if(rpc.payload.method === "ApproveSignData") {

        mainWindow.webContents.send('addSignData', rpc.payload);
        
        let notify = new Notification({
          title: 'Cleftron',
          body: 'Message Signing is awaiting review.'
        })
        notify.show();
        notify.on('click', () =>{
          mainWindow.show();
        })
      } else if(rpc.payload.method === "ApproveListing") {

        mainWindow.webContents.send('addListing', rpc.payload);
        
        let notify = new Notification({
          title: 'Cleftron',
          body: 'Account Listing is awaiting review.'
        })
        notify.show();
      } else if(rpc.payload.method === "ApproveNewAccount") {

        mainWindow.webContents.send('addNewAccount', rpc.payload);
        
        let notify = new Notification({
          title: 'Cleftron',
          body: 'New Account is awaiting review.'
        })
        notify.show();
      } else if(rpc.payload.method === "ShowInfo" || rpc.payload.method === "ShowError") {
        
        let notify = new Notification({
          title: 'Cleftron',
          body: rpc.payload.params[0].text
        })
        notify.show();
      }
    }
     else {
      mainWindow.webContents.send('message', data);
    }
  });

  clef.stderr.on('data', (data) => {
    mainWindow.webContents.send('message', data);
  });
  
  clef.on('exit', (code) => {
    throw(code)
    mainWindow.webContents.send('message', `Child exited with code ${code}`);
  });
}

app.on('ready', function () {
  try{
    console.log(process.argv)
    if(process.argv[1] === '--clefbin'){
      clefpath = process.argv[2];
    } else {
      clefpath = dialog.showOpenDialog({
        title : 'Select Clef Binary',
        filters : [
          {name: 'Application', extensions: ['exe', 'bin', 'app']},
          {name: 'All Files', extensions: ['*']}
        ]
      })[0];
    }
    clef = spawn(clefpath, ['--rpc','--4bytedb' ,path.dirname(clefpath) + '/4byte.json','--ipcdisable','--stdio-ui'])
    } catch (e) {
      console.log(e);
    }
  createWindow()
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
