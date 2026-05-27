const { contextBridge, ipcRenderer } = require('electron');

try {
  contextBridge.exposeInMainWorld('electronAPI', {
    getConfig: () => ipcRenderer.invoke("get-config"),
    openSelectWindow: (nom, path) => ipcRenderer.send('open-select-window',nom, path),
    openSelectCreateRepoWindow: () => ipcRenderer.send('open-select_create-repo-window'),
    openInitRepoWindow: () => ipcRenderer.send('open-init-repo-window'),
    openListRemote : () => ipcRenderer.send('open-list-remote-window'),
    openConfig : (scope) => ipcRenderer.send('git-open-config-window', scope),
    getScope: () => ipcRenderer.invoke("get-scope"),
    closeWindow: () => ipcRenderer.send('close-window'),
    addRepository: () => ipcRenderer.send('add-repository'),
    getReadme: async (path) => ipcRenderer.invoke('get-readme', path),
    openTerminal: () => ipcRenderer.send('open-terminal'),
    deleteRepository: (name) => ipcRenderer.send('delete-repository', name),
    openConfigFile: () => ipcRenderer.send('git-config-edit-file'),

    gitActions:{
      /* Liste de commandes da la partie MUST */
      init: () => ipcRenderer.send('git-init'),                                         // utilisé (Riad)
      clone: (url) => ipcRenderer.send('git-clone', url),                               // utilisé (Riad)     
      add: () => ipcRenderer.invoke('git-add'),                                         // utilisé
      commit: (message) => ipcRenderer.invoke('git-commit', message),                   // utilisé
      ammend: (message) => ipcRenderer.send('git-togle-amend', message),                // utilisé
      status: () => ipcRenderer.invoke('git-status'),                                   // utilisé
      log: () => ipcRenderer.invoke('git-log'),                                         // utilisé
      log_branch: () => ipcRenderer.invoke('git-log-branch'),                                         // utilisé
      diff: (commit1, commit2) => ipcRenderer.invoke('git-diff', commit1, commit2),     // utilisé (Riad)
      addbranch: (name) => ipcRenderer.invoke('git-add-branch', name),                  // utilisé
      delbranch: (name) => ipcRenderer.invoke('git-del-branch', name),                  // utilisé
      branchList: () => ipcRenderer.invoke('git-branch-local'),                         // utilisé
      checkout: (branch) => ipcRenderer.send('git-checkout', branch),                   // utilisé
      checkout_dist: (branch) => ipcRenderer.send('git-checkout-dist', branch),         // utilisé
      merge: (branch) => ipcRenderer.invoke('git-merge', branch),                       // utilisé (Riad)
      getMergeConflicts: () => ipcRenderer.invoke('git-merge-get-conflicts'),           // utilisé (Riad)
      getMergeVersions: (file) => ipcRenderer.invoke('git-merge-get-versions', file),  // utilisé (Riad)
      resolveConflict: (file, content) => ipcRenderer.invoke('git-merge-resolve', file, content), // utilisé (Riad)
      completeMerge: () => ipcRenderer.invoke('git-merge-complete'),                   // utilisé (Riad)
      abortMerge: () => ipcRenderer.invoke('git-merge-abort'),                         // utilisé (Riad)
      pull: () => ipcRenderer.invoke('git-pull'),                                       // utilisé
      push: () => ipcRenderer.invoke('git-push'),                                       // utilisé
      list_remotes: () => ipcRenderer.invoke('git-list-remote'),                        // utilisé
      add_remote: (name, url) => ipcRenderer.send('git-add-remote', name, url),         // utilisé
      del_remote: (name) => ipcRenderer.invoke('git-remove-remote', name),              // utilisé

      /* Liste de commandes da la partie SHOULD */
      config: (key, value, scope) => ipcRenderer.send('git-config', key, value, scope), // utilisé
      del_config : (key, scope) =>ipcRenderer.send('git-del-config', key, scope),       // utilisé
      list_config: () => ipcRenderer.invoke('git-list-config'),                         // utilisé
      reset: (mode) => ipcRenderer.send('git-reset', mode),                             // pas utilisé
      revert: (commit) => ipcRenderer.send('git-revert', commit),                       // utilisé
      stash: (action) => ipcRenderer.send('git-stash', action),                         // pas utilisé
      fetch: () => ipcRenderer.invoke('git-fetch'),                                     // utilisé
      show: (commit) => ipcRenderer.invoke('git-show', commit),                         // utilisé
      tag: (name) => ipcRenderer.send('git-tag', name),                                 // pas utilisé
      rebase: (branch) => ipcRenderer.invoke('git-rebase', branch),                    // utilisé
      rebase_abort: () => ipcRenderer.invoke('git-rebase-abort'),                         // utilisé
      blame: (file) => ipcRenderer.invoke('git-blame', file),                           // pas utilisé
      
      /* Liste de commandes da la partie COULD */
      chery_pick: (commit) => ipcRenderer.send('git-cherry-pick', commit),              // pas utilisé, possible (pas dans la doc simple git)
      bisect: () => {},                                                                 // Imposible (pas dans la doc simple git)
      archive: () => ipcRenderer.send('git-archive'),                                   // utilisé
      shortlog: () => ipcRenderer.invoke('git-shortlog'),                               // Imposible (pas dans la doc simple git. Deplus, déja utilisée sur github / gitea / ...)
      describe: (commit) => ipcRenderer.invoke('git-describe', commit),                 // Imposible (pas dans la doc simple git)
      clean: (mode) => ipcRenderer.send('git-clean', mode),                             // utilisé
      reflog: () => ipcRenderer.invoke('git-reflog'),                                   // pas utilisé, possible (mais pas dans la doc simple git)
      gc: () => ipcRenderer.send('git-gc'),                                             // utilisé
      submodule: (action, path, name) => ipcRenderer.invoke('git-submodule', action, path, name),     // utilisé
      worktree: (action, path) => ipcRenderer.send('git-worktree', action, path),       // Complexitée (fonctionalitée trops compliquée a implémentée)
    }
  });

  console.log('preload loaded'); 

} catch (error) {
  console.log('preload unable to load:', error); 
}