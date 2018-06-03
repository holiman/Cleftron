import { ipcRenderer } from 'electron';

export default store => {
  ipcRenderer.send('vuex-state', store.state);

  store.subscribe((mutation, state) => {
    ipcRenderer.send('vuex-state', state);
  });
};
