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
    init: () => ipcRenderer.send('git-init'),
    clone: (url) => ipcRenderer.send('git-clone', url),
    add: () => ipcRenderer.send('git-add'),
    commit: (message) => ipcRenderer.send('git-commit', message),
    ammend: (message) => ipcRenderer.send('git-commit-ammend', message),
    status: () => ipcRenderer.invoke('git-status'),
    log: () => ipcRenderer.invoke('git-log'),
    diff: (commit1, commit2) => ipcRenderer.invoke('git-diff', commit1, commit2),
    branch: () => ipcRenderer.invoke('git-branch'),
    checkout: (branch) => ipcRenderer.send('git-checkout', branch),
    merge: (branch) => ipcRenderer.send('git-merge', branch),
    pull: () => ipcRenderer.send('git-pull'),
    push: () => ipcRenderer.send('git-push'),
  }
});
