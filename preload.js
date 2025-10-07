const { contextBridge, ipcRenderer } = require('electron');

console.log('preload loaded'); // debug : doit apparaître dans la console du renderer

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke("get-config"),
  openSelectWindow: (nom, path) => ipcRenderer.send('open-select-window',nom, path),
  closeWindow: () => ipcRenderer.send('close-window'),
  addRepository: () => ipcRenderer.send('add-repository'),
  getReadme: async (path) => ipcRenderer.invoke('get-readme', path),
  openTerminal: (path) => ipcRenderer.send('open-terminal', path),
  deleteRepository: (name) => ipcRenderer.send('delete-repository', name)
});
