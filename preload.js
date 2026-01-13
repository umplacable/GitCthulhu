const { contextBridge, ipcRenderer } = require("electron");

console.log("preload loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  // config / fenêtres
  getConfig: () => ipcRenderer.invoke("get-config"),
  openSelectWindow: (nom, path) =>
    ipcRenderer.send("open-select-window", nom, path),
  closeWindow: () => ipcRenderer.send("close-window"),
  addRepository: () => ipcRenderer.send("add-repository"),
  deleteRepository: (id) => ipcRenderer.send("delete-repository", id),
  getReadme: (path) => ipcRenderer.invoke("get-readme", path),
  openTerminal: () => ipcRenderer.send("open-terminal"),

  gitActions: {
    // MUST : init / clone / add / commit / amend
    init: () => ipcRenderer.send("git-init"),
    clone: (url) => ipcRenderer.send("git-clone", url),
    add: () => ipcRenderer.invoke("git-add"),
    commit: (message) => ipcRenderer.invoke("git-commit", message),
    ammend: () => ipcRenderer.send("git-togle-amend"),

    // Status / log / diff
    status: () => ipcRenderer.invoke("git-status"),
    log: () => ipcRenderer.invoke("git-log"),
    diff: (commit1, commit2) =>
      ipcRenderer.invoke("git-diff", commit1, commit2),

    // Branches
    addbranch: (name) => ipcRenderer.invoke("git-add-branch", name),
    delbranch: (name) => ipcRenderer.invoke("git-del-branch", name),
    branchList: () => ipcRenderer.invoke("git-branch-local"),
    checkout: (branch) => ipcRenderer.send("git-checkout", branch),

    // Merge "intelligent"
    merge: (branch) => ipcRenderer.invoke("git-merge", branch),

    // Fichiers en conflit : base / ours / theirs
    getMergeFileContents: (filePath) =>
      ipcRenderer.invoke("git-merge-file-contents", filePath),

    // Appliquer un contenu résolu pour un fichier
    applyMergeResolution: (filePath, content) =>
      ipcRenderer.invoke("git-merge-apply-resolution", filePath, content),

    // Auto-résolution avec node-diff3
    autoSolveMergeFile: (filePath) =>
      ipcRenderer.invoke("git-merge-autosolve-file", filePath),

    // Choisir "ours" / "theirs"
    resolveMergeFileWithStrategy: (filePath, strategy) =>
      ipcRenderer.invoke("git-merge-resolve-file", filePath, strategy),

    // Merge abort / continue
    mergeAbort: () => ipcRenderer.invoke("git-merge-abort"),
    mergeContinue: (message) =>
      ipcRenderer.invoke("git-merge-continue", message),

    // Remote
    pull: () => ipcRenderer.invoke("git-pull"),
    push: () => ipcRenderer.invoke("git-push"),
  },
});
