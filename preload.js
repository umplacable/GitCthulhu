import { contextBridge, ipcRenderer } from Electron;

try {
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
      init: () => ipcRenderer.send('git-init'),                                         // utilisé (Riad)
      clone: (url) => ipcRenderer.send('git-clone', url),                               // utilisé (Riad)     
      add: () => ipcRenderer.invoke('git-add'),                                         // utilisé
      commit: (message) => ipcRenderer.invoke('git-commit', message),                   // utilisé
      ammend: (message) => ipcRenderer.send('git-togle-amend', message),                // utilisé
      status: () => ipcRenderer.invoke('git-status'),                                   // utilisé
      log: () => ipcRenderer.invoke('git-log'),                                         // utilisé
      diff: (commit1, commit2) => ipcRenderer.invoke('git-diff', commit1, commit2),     // utilisé (Riad)
      addbranch: (name) => ipcRenderer.invoke('git-add-branch', name),                  // utilisé
      delbranch: (name) => ipcRenderer.invoke('git-del-branch', name),                  // utilisé
      branchList: () => ipcRenderer.invoke('git-branch-local'),                         // utilisé
      checkout: (branch) => ipcRenderer.send('git-checkout', branch),                   // utilisé
      checkout_dist: (branch) => ipcRenderer.send('git-checkout-dist', branch),         // utilisé
      merge: (branch) => ipcRenderer.send('git-merge', branch),                         // pas utilisé (Riad)
      pull: () => ipcRenderer.invoke('git-pull'),                                       // utilisé
      push: () => ipcRenderer.invoke('git-push'),                                       // utilisé
      list_remotes: () => ipcRenderer.invoke('git-list-remotes'),                       // utilisé
      add_remote: (name, url) => ipcRenderer.send('git-add-remote', name, url),         // utilisé
      del_remote: (name) => ipcRenderer.send('git-del-remote', name),                   // utilisé

      /* Liste de commandes da la partie SHOULD */
      config: (key, value) => ipcRenderer.send('git-config', key, value),               // pas utilisé
      list_config: () => ipcRenderer.invoke('git-list-config'),                         // pas utilisé
      reset: (mode) => ipcRenderer.send('git-reset', mode),                             // pas utilisé
      revert: (commit) => ipcRenderer.send('git-revert', commit),                       // pas utilisé
      stash: (action) => ipcRenderer.send('git-stash', action),                         // pas utilisé
      fetch: () => ipcRenderer.invoke('git-fetch'),                                     // pas utilisé
      show: (commit) => ipcRenderer.invoke('git-show', commit),                         // pas utilisé
      tag: (name) => ipcRenderer.send('git-tag', name),                                 // pas utilisé
      rebase: (branch) => ipcRenderer.send('git-rebase', branch),                       // pas utilisé
      blame: (file) => ipcRenderer.invoke('git-blame', file),                           // pas utilisé
      
      /* Liste de commandes da la partie COULD */
      chery_pick: (commit) => ipcRenderer.send('git-cherry-pick', commit),              // pas utilisé
      bisect: (action) => ipcRenderer.send('git-bisect', action),                       // pas utilisé
      archive: (format, output) => ipcRenderer.send('git-archive', format, output),     // pas utilisé
      shortlog: () => ipcRenderer.invoke('git-shortlog'),                               // pas utilisé
      describe: (commit) => ipcRenderer.invoke('git-describe', commit),                 // pas utilisé
      clean: (mode) => ipcRenderer.send('git-clean', mode),                             // pas utilisé
      reflog: () => ipcRenderer.invoke('git-reflog'),                                   // pas utilisé
      gc: () => ipcRenderer.send('git-gc'),                                             // pas utilisé
      submodule: (action, path) => ipcRenderer.send('git-submodule', action, path),     // pas utilisé
      worktree: (action, path) => ipcRenderer.send('git-worktree', action, path),       // pas utilisé
    }
  });

  console.log('preload loaded'); 

} catch (error) {
  console.log('preload unable to load:', error); 
}