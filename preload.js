const { contextBridge, ipcRenderer } = require('electron');

console.log('preload loaded'); // debug : doit apparaître dans la console du renderer

contextBridge.exposeInMainWorld('electronAPI', {
  openSelectWindow: () => ipcRenderer.send('open-select-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
});
