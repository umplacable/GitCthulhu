const { contextBridge, ipcRenderer } = require('electron');

console.log('preload loaded'); // debug : doit apparaître dans la console du renderer

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke("get-config"),
  openSelectWindow: (nom, path) => ipcRenderer.send('open-select-window',nom, path),
  closeWindow: () => ipcRenderer.send('close-window'),
  addRepository: () => ipcRenderer.send('add-repository'),
  getReadme: async (path) => ipcRenderer.invoke('get-readme', path),
  openTerminal: () => ipcRenderer.send('open-terminal'),
  deleteRepository: (name) => ipcRenderer.send('delete-repository', name),

  gitActions:{
    /* Liste de commandes da la partie MUST */
    init: () => ipcRenderer.send('git-init'),                                         // pas utilisé (Riad)
    clone: (url) => ipcRenderer.send('git-clone', url),                               // pas utilisé (Riad)     
    add: () => ipcRenderer.invoke('git-add'),                                         // utilisé
    commit: (message) => ipcRenderer.invoke('git-commit', message),                   // utilisé
    ammend: (message) => ipcRenderer.send('git-commit-ammend', message),              // pas utilisé
    status: () => ipcRenderer.invoke('git-status'),                                   // utilisé
    log: () => ipcRenderer.invoke('git-log'),                                         // utilisé
    diff: (commit1, commit2) => ipcRenderer.invoke('git-diff', commit1, commit2),     // pas utilisé
    branch: () => ipcRenderer.invoke('git-branch'),                                   // pas utilisé
    checkout: (branch) => ipcRenderer.send('git-checkout', branch),                   // pas utilisé
    merge: (branch) => ipcRenderer.send('git-merge', branch),                         // pas utilisé
    pull: () => ipcRenderer.invoke('git-pull'),                                       // utilisé
    push: () => ipcRenderer.invoke('git-push'),                                       // utilisé
  }
});
