// ------------------------------------ IMPORTS ------------------------------------
const {
  app,
  BrowserWindow,
  nativeTheme,
  ipcMain,
  dialog,
} = require("electron");
const path = require("path");
const fs = require("fs");
const ini = require("ini");
const marked = require("marked");
const { simpleGit, CleanOptions } = require("simple-git");

// ------------------------------------ VARIABLES GLOBALES ------------------------------------
let win = [];
let gitDirRepo = "~/"; // répertoire du dépôt git courant
const isDev = !app.isPackaged;
let configPath;
let ammend = false;
let currentConfigScope = "local"; // "local" ou "global"
let gitConflicts = null; // { branch, files: [...] } — état de merge en cours

// ------------------------------------ FONCTION UTILITAIRE POUR LES CHEMINS ------------------------------------
function getFilePath(filename) {
  if (isDev) {
    // En dev : on charge depuis webpack dev server (vite ou autre)
    return path.join(__dirname, "dist", filename);
  } else {
    // En prod : on charge depuis le dossier dist dans app.asar
    return `file://${path.join(__dirname, "dist", filename)}`;
  }
}

// ------------------------------------ FONCTION : CRÉATION FENÊTRES ------------------------------------
function createGitCreatorWindow() {
  const creatorWin = new BrowserWindow({
    width: 600,
    height: 450,
    icon: path.join(
      __dirname,
      nativeTheme.shouldUseDarkColors
        ? "public/icons/favicon-light.ico"
        : "public/icons/favicon-dark.ico",
    ),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
    resizable: false,
  });

  creatorWin.loadURL(getFilePath("GitCreator.html"));
  win.push(creatorWin);
}

function createGitSelectorWindow() {
  const selectorWin = new BrowserWindow({
    width: 600,
    height: 450,
    icon: path.join(
      __dirname,
      nativeTheme.shouldUseDarkColors
        ? "public/icons/favicon-light.ico"
        : "public/icons/favicon-dark.ico",
    ),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
    resizable: false,
  });

  selectorWin.loadURL(getFilePath("GitSelector.html"));
  win.push(selectorWin);
}

function OpenRepoInit() {
  const initWin = new BrowserWindow({
    width: 600,
    height: 450,
    icon: path.join(
      __dirname,
      nativeTheme.shouldUseDarkColors
        ? "public/icons/favicon-light.ico"
        : "public/icons/favicon-dark.ico",
    ),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
    resizable: false,
  });

  initWin.loadURL(getFilePath("InitRepo.html"));
  win.push(initWin);
}

function createWindow(nom, dirpath) {
  const mainWin = new BrowserWindow({
    name: `${nom} - ${dirpath}`,
    width: 800,
    height: 600,
    icon: path.join(
      __dirname,
      nativeTheme.shouldUseDarkColors
        ? "public/icons/favicon-light.ico"
        : "public/icons/favicon-dark.ico",
    ),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
  });

  mainWin.loadURL(getFilePath("index.html"));
  mainWin.setTitle(`${nom} - ${dirpath}`);
  win.push(mainWin);
  return mainWin;
}

function createIsGit() {
  const modalWin = new BrowserWindow({
    name: `No git repo detected`,
    width: 500,
    height: 400,
    icon: path.join(
      __dirname,
      nativeTheme.shouldUseDarkColors
        ? "public/icons/favicon-light.ico"
        : "public/icons/favicon-dark.ico",
    ),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
  });

  modalWin.loadURL(getFilePath("InitRepo.html"));

  modalWin.once("ready-to-show", () => {
    modalWin.show();
  });

  win.push(modalWin);
  return modalWin;
}

function createListRemote() {
  const modalWin = new BrowserWindow({
    name: `${gitDirRepo} - Remotes`,
    width: 700,
    height: 400,
    icon: path.join(
      __dirname,
      nativeTheme.shouldUseDarkColors
        ? "public/icons/favicon-light.ico"
        : "public/icons/favicon-dark.ico",
    ),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
  });

  modalWin.loadURL(getFilePath("ListRemote.html"));
  modalWin.setTitle(`${gitDirRepo} - Remotes`);

  modalWin.once("ready-to-show", () => {
    modalWin.show();
  });

  win.push(modalWin);
  return modalWin;
}

function createConfig(scope) {
  const modalWin = new BrowserWindow({
    width: 500,
    height: 400,
    icon: path.join(
      __dirname,
      nativeTheme.shouldUseDarkColors
        ? "public/icons/favicon-light.ico"
        : "public/icons/favicon-dark.ico",
    ),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
  });

  modalWin.loadURL(getFilePath("GitConfig.html"));
  modalWin.setTitle(`Git Config - ${scope}`);

  modalWin.once("ready-to-show", () => {
    modalWin.show();
  });

  win.push(modalWin);
  return modalWin;
}

function createMergeConflictWindow() {
  const conflictWin = new BrowserWindow({
    width: 1100,
    height: 650,
    icon: path.join(
      __dirname,
      nativeTheme.shouldUseDarkColors
        ? "public/icons/favicon-light.ico"
        : "public/icons/favicon-dark.ico",
    ),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
  });

  conflictWin.loadURL(getFilePath("GitMergeConflict.html"));
  conflictWin.setTitle("Git — Résolution de conflits");

  conflictWin.once("ready-to-show", () => {
    conflictWin.show();
  });

  win.push(conflictWin);
  return conflictWin;
}

function openAddSubModule() {
  const modalWin = new BrowserWindow({
    name: `Add a submodule`,
    width: 500,
    height: 300,
    icon: path.join(
      __dirname,
      nativeTheme.shouldUseDarkColors
        ? "public/icons/favicon-light.ico"
        : "public/icons/favicon-dark.ico",
    ),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
  });

  modalWin.loadURL(getFilePath("AddSubModule.html"));

  modalWin.once("ready-to-show", () => {
    modalWin.show();
  });

  win.push(modalWin);
  return modalWin;
}

// ------------------------------------ FONCTION ------------------------------------

// Trouver le premier terminal disponible
function findTerminal(terminals) {
  return new Promise((resolve) => {
    const tryNext = (index) => {
      if (index >= terminals.length) return resolve(null);

      exec(terminals[index], (error) => {
        if (!error) return resolve(terminals[index]);
        tryNext(index + 1);
      });
    };
    tryNext(0);
  });
}

// ------------------------------------ APP READY ------------------------------------
app.whenReady().then(() => {
  configPath = path.join(app.getPath("userData"), "config.ini");
  ammend = false;

  // createGitSelectorWindow();
  createGitCreatorWindow();
});

// --- QUIT LOGIQUE ---
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// --- CHANGEMENT DE THEME ---
nativeTheme.on("updated", () => {
  const newIcon = path.join(
    __dirname,
    nativeTheme.shouldUseDarkColors
      ? "public/icons/favicon-light.ico"
      : "public/icons/favicon-dark.ico",
  );

  if (win && win.length > 0) {
    win.forEach((elt) => {
      if (elt && !elt.isDestroyed()) elt.setIcon(newIcon);
    });

    if (process.platform === "darwin") {
      app.dock.setIcon(newIcon);
    }
  }
});

// ------------------------------------ IPC HANDLERS / EVENTS ------------------------------------

ipcMain.on("open-select-window", async (event, nom, dirpath) => {
  try {
    gitDirRepo = dirpath;
    const senderWin = BrowserWindow.fromWebContents(event.sender);
    const git = simpleGit(gitDirRepo);
    const isRepo = await git.checkIsRepo().catch(() => false);

    if (!isRepo) {
      const modalWin = createIsGit();

      modalWin.once("ready-to-show", () => {
        modalWin.show();
      });

      // Quand la modale se ferme, fermer la fenêtre d’origine
      modalWin.once("closed", async () => {
        try {
          const ret = await git.checkIsRepo().catch(() => false);

          if (ret) {
            if (senderWin && !senderWin.isDestroyed()) {
              senderWin.close();
            }
            createWindow(nom, dirpath);
          }
        } catch (err) {
          console.error("Erreur après fermeture de la modale :", err);
        }
      });

      return;
    }

    //await git.fetch(["--all", "--prune"]);
    // ✅ Si c’est bien un dépôt git, ouvrir la fenêtre principale
    createWindow(nom, dirpath);
    if (senderWin) senderWin.close();
  } catch (err) {
    console.error("Erreur dans open-select-window:", err);
    dialog.showErrorBox(
      "Erreur",
      `Impossible d’ouvrir la fenêtre : ${err.message}`,
    );
  }
});

ipcMain.on("open-select_create-repo-window", () => {
  createGitCreatorWindow();
});

ipcMain.on("open-init-repo-window", () => {
  OpenRepoInit();
});

ipcMain.on("open-list-remote-window", () => {
  createListRemote();
});

ipcMain.on("close-window", (event) => {
  const senderWin = BrowserWindow.fromWebContents(event.sender);
  if (senderWin) senderWin.close();
});

ipcMain.handle("get-config", () => {
  if (!fs.existsSync(configPath)) return null;
  const content = fs.readFileSync(configPath, "utf-8");
  return content ? ini.parse(content) : null;
});

ipcMain.on("add-repository", async (event) => {
  const senderWin = BrowserWindow.fromWebContents(event.sender);
  if (!senderWin) return;

  const result = await dialog.showOpenDialog(senderWin, {
    properties: ["openDirectory"],
  });
  if (result.canceled) return;

  const dirpath = result.filePaths[0];
  const git = simpleGit(dirpath);

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, "[Depo]\nnames=\npaths=\nids=");
  }

  let content = fs.readFileSync(configPath, "utf-8");
  if (!content) {
    fs.writeFileSync(configPath, "[Depo]\nnames=\npaths=\nids=");
    content = fs.readFileSync(configPath, "utf-8");
  }

  const config = ini.parse(content);
  if (!config.Depo) config.Depo = { names: "", paths: "", ids: "" };

  if (config.Depo.paths) {
    config.Depo.paths += `,${dirpath}`;
    config.Depo.names += `,${dirpath.split(/[\\/]/).pop()}`;
    config.Depo.ids += `,${config.Depo.ids ? config.Depo.ids.split(",").length + 1 : 1}`;
  } else {
    config.Depo.paths = dirpath;
    config.Depo.names = `${dirpath.split(/[\\/]/).pop()}`;
    config.Depo.ids = "1";
  }

  fs.writeFileSync(configPath, ini.stringify(config));

  win.forEach((elt) => {
    if (elt && !elt.isDestroyed()) elt.reload();
  });
});

ipcMain.handle("get-readme", async (_event, dirpath) => {
  try {
    const data = fs.readFileSync(path.join(dirpath, "README.md"), "utf-8");
    return marked.parse(data);
  } catch (err) {
    return null;
  }
});

ipcMain.on("open-terminal", (event) => {
  const senderWin = BrowserWindow.fromWebContents(event.sender);
  if (!senderWin) return;

  const exec = require("child_process").exec;
  let command;

  if (process.platform === "win32") {
    command = `start cmd.exe /K "cd /d ${gitDirRepo}"`;
  } else if (process.platform === "darwin") {
    command = `open -a Terminal "${gitDirRepo}"`;
  } else {
    // - - - Linux : détecter un terminal disponible - - -
    const terminals = [
      `x-terminal-emulator --working-directory="${gitDirRepo}"`,
      `gnome-terminal --working-directory="${gitDirRepo}"`,
      `konsole --workdir "${gitDirRepo}"`,
      `xfce4-terminal --working-directory="${gitDirRepo}"`,
      `tilix -w "${gitDirRepo}"`,
      `mate-terminal --working-directory="${gitDirRepo}"`,
      `xterm -e "cd '${gitDirRepo}' && bash"`,
    ];

    findTerminal(terminals).then((cmd) => {
      if (!cmd) {
        dialog.showErrorBox(
          "Erreur",
          "Aucun terminal compatible trouvé sur ce système.",
        );
        return;
      }
    });
    return;
  }

  exec(command, (error) => {
    if (error) {
      console.error(`Error opening terminal: ${error}`);
      dialog.showErrorBox("Error", `Could not open terminal: ${error.message}`);
    }
  });
});

ipcMain.on("delete-repository", (_event, id) => {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, "[Depo]\nnames=\npaths=\nids=");
  }

  let content = fs.readFileSync(configPath, "utf-8");
  if (!content) {
    fs.writeFileSync(configPath, "[Depo]\nnames=\npaths=\nids=");
    content = fs.readFileSync(configPath, "utf-8");
  }

  const config = ini.parse(content);
  if (!config.Depo) config.Depo = { names: "", paths: "", ids: "" };

  const names = config.Depo.names.split(",").map((x) => x.trim());
  const paths = config.Depo.paths.split(",").map((x) => x.trim());
  const ids = config.Depo.ids.split(",").map((x) => x.trim());
  const index = ids.indexOf(id);
  if (index === -1) return;

  names.splice(index, 1);
  paths.splice(index, 1);
  ids.splice(index, 1);

  config.Depo.names = names.join(",");
  config.Depo.paths = paths.join(",");
  config.Depo.ids = ids.join(",");

  if (config.Depo.names === "" && config.Depo.paths === "") {
    fs.unlinkSync(configPath);
  } else {
    fs.writeFileSync(configPath, ini.stringify(config));
  }

  win.forEach((elt) => {
    if (elt && !elt.isDestroyed()) elt.reload();
  });
});

// ------------------------------------ COMMANDES GIT ------------------------------------
// MUST
/*
  git init → créer un dépôt
  git clone → cloner un dépôt distant
  git add → ajouter des fichiers à l’index
  git commit → valider des changements
  git commit --amend → modifier le dernier commit (message ou contenu)
  git status → voir l’état du dépôt
  git log → afficher l’historique des commits
  git diff → comparer les différences
  git branch → gérer les branches
  git checkout → changer de branche ou restaurer un fichier
  git merge → fusionner une branche
  git pull → récupérer et fusionner du distant
  git push → envoyer des commits au dépôt distant
  git remote → gérer les dépôts distants
*/
ipcMain.on("git-init", (event) => {
  const git = simpleGit(gitDirRepo);
  git
    .init()
    .catch((err) =>
      dialog.showErrorBox("Error", `Could not initialize git: ${err.message}`),
    );
  dialog
    .showMessageBox({
      type: "info",
      title: "Succès",
      message: `Dépôt Git initialisé dans :\n${gitDirRepo}`,
    })
    .then(() => {
      const senderWin = BrowserWindow.fromWebContents(event.sender);
      if (senderWin) senderWin.close();
    });
});

ipcMain.on("git-clone", (event, url) => {
  const git = simpleGit();

  //on demande si on peut détruire le répertoire si il y a des choses dedans
  const result = dialog.showMessageBoxSync({
    type: "question",
    buttons: ["Oui", "Non"],
    defaultId: 1,
    cancelId: 1,
    title: "Cloner le dépôt",
    message: `Le répertoire ${gitDirRepo} sera supprimé s'il existe déjà. Voulez-vous continuer ?`,
  });
  if (result !== 0) return; // si l'utilisateur clique sur "Non", on annule l'opération

  // on suprime le répertoire s'il existe déjà
  if (fs.existsSync(gitDirRepo)) {
    fs.rmdirSync(gitDirRepo, { recursive: true });
  }
  git
    .clone(url, gitDirRepo, ["--recurse-submodules"])
    .then(() => {
      dialog
        .showMessageBox({
          type: "info",
          title: "Succès",
          message: `Dépôt Git cloné dans :\n${gitDirRepo}`,
        })
        .then(() => {
          const senderWin = BrowserWindow.fromWebContents(event.sender);
          if (senderWin) senderWin.close();
        });
    })
    .catch((err) =>
      dialog.showErrorBox("Error", `Could not clone: ${err.message}`),
    );
});

ipcMain.handle("git-add", async () => {
  const git = simpleGit(gitDirRepo);
  try {
    const result = await git.add("./");
    return result;
  } catch (err) {
    dialog.showErrorBox("Error", `Could not add: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-commit", async (_event, message) => {
  const git = simpleGit(gitDirRepo);

  if (message == "") {
    ammend = false;
    dialog.showErrorBox("Error", `Metez un message pour commit.`);
  }

  if (ammend) {
    ammend = false;
    try {
      return git.commit(message, ["--amend"]);
    } catch (err) {
      dialog.showErrorBox("Error", `Could not amend commit: ${err.message}`);
      return null;
    }
  } else {
    try {
      return await git.commit(message);
    } catch (err) {
      dialog.showErrorBox("Error", `Could not commit: ${err.message}`);
      return null;
    }
  }
});

ipcMain.on("git-togle-amend", (_event) => {
  ammend = true;
});

ipcMain.handle("git-status", async () => {
  const git = simpleGit(gitDirRepo);
  try {
    const status = await git.status();
    return JSON.parse(JSON.stringify(status));
  } catch (err) {
    dialog.showErrorBox("Error", `Could not get status: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-log", async () => {
  const git = simpleGit(gitDirRepo);
  try {
    const log = await git.log();
    return log;
  } catch (err) {
    dialog.showErrorBox("Error", `Could not get log: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-diff", async (_event, commit1, commit2) => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.diff([`${commit1}..${commit2}`]);
  } catch (err) {
    dialog.showErrorBox("Error", `Could not get diff: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-add-branch", async (_event, name) => {
  const git = simpleGit(gitDirRepo);
  try {
    const response = await git.checkoutLocalBranch(name);
    await git.push(["-u", "origin", name]);
    return response;
  } catch (err) {
    dialog.showErrorBox("Error", `Could not add branches: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-del-branch", async (event, name) => {
  const git = simpleGit(gitDirRepo);

  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showMessageBox(win, {
    type: "question",
    buttons: ["Oui", "Non"],
    defaultId: 1,
    cancelId: 1,
    title: "Supprimer la branche ?",
    message: `Voulez-vous vraiment supprimer la branche "${name}" ?`,
  });

  if (result.response !== 0) return;
  try {
    return await git.deleteLocalBranch(name);
  } catch (err) {
    dialog.showErrorBox("Error", `Could not delete branches: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-branch-local", async () => {
  const git = simpleGit(gitDirRepo);
  try {
    ret = {
      local: JSON.parse(JSON.stringify(await git.branchLocal())),
      dist: JSON.parse(JSON.stringify(await git.branch(["-r"]))),
    };

    return ret;
  } catch (err) {
    dialog.showErrorBox("Error", `Could not get branches: ${err.message}`);
    return null;
  }
});

ipcMain.on("git-checkout", (_event, branch) => {
  const git = simpleGit(gitDirRepo);
  git
    .checkout(branch)
    .catch((err) =>
      dialog.showErrorBox("Error", `Could not checkout: ${err.message}`),
    );
});

ipcMain.on("git-checkout-dist", (_event, branch) => {
  const git = simpleGit(gitDirRepo);
  git
    .checkout(["-b", branch.split("/")[1], branch])
    .catch((err) =>
      dialog.showErrorBox("Error", `Could not checkout: ${err.message}`),
    );
});

ipcMain.handle("git-merge", async (_event, branch) => {
  const git = simpleGit(gitDirRepo);
  try {
    await git.merge([branch]);
    return { success: true };
  } catch (err) {
    // Vérifier s'il y a des conflits
    try {
      const status = await git.status();
      if (status.conflicted && status.conflicted.length > 0) {
        gitConflicts = { branch, files: [...status.conflicted] };
        createMergeConflictWindow();
        return { success: false, conflicts: status.conflicted };
      }
    } catch (_) {}
    dialog.showErrorBox("Error", `Could not merge: ${err.message}`);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("git-merge-get-conflicts", async () => {
  return gitConflicts;
});

ipcMain.handle("git-merge-get-versions", async (_event, filepath) => {
  const git = simpleGit(gitDirRepo);
  // Normaliser le chemin pour git (slashes)
  const gitPath = filepath.replace(/\\/g, "/");
  let ours = "";
  let theirs = "";
  try {
    ours = await git.show([`HEAD:${gitPath}`]);
  } catch (e) {
    ours = `(fichier absent dans HEAD)\n${e.message}`;
  }
  try {
    theirs = await git.show([`MERGE_HEAD:${gitPath}`]);
  } catch (e) {
    theirs = `(fichier absent dans la branche entrante)\n${e.message}`;
  }
  return { ours, theirs, filepath };
});

ipcMain.handle("git-merge-resolve", async (_event, filepath, content) => {
  const git = simpleGit(gitDirRepo);
  try {
    const fullPath = path.join(gitDirRepo, filepath.replace(/\//g, path.sep));
    fs.writeFileSync(fullPath, content, "utf-8");
    await git.add(filepath.replace(/\\/g, "/"));
    return { success: true };
  } catch (err) {
    dialog.showErrorBox("Error", `Could not resolve conflict: ${err.message}`);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("git-merge-complete", async () => {
  const git = simpleGit(gitDirRepo);
  try {
    await git.raw(["commit", "--no-edit"]);
    gitConflicts = null;
    return { success: true };
  } catch (err) {
    dialog.showErrorBox("Error", `Could not complete merge: ${err.message}`);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("git-merge-abort", async () => {
  const git = simpleGit(gitDirRepo);
  try {
    await git.merge(["--abort"]);
    gitConflicts = null;
    return { success: true };
  } catch (err) {
    dialog.showErrorBox("Error", `Could not abort merge: ${err.message}`);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("git-pull", async () => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.pull();
  } catch (err) {
    dialog.showErrorBox("Error", `Could not pull: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-push", async () => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.push();
  } catch (err) {
    dialog.showErrorBox("Error", `Could not push: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-list-remote", async () => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.getRemotes(true);
  } catch (err) {
    dialog.showErrorBox("Error", `Could not get remotes: ${err.message}`);
    return null;
  }
});

ipcMain.on("git-add-remote", async (_event, name, url) => {
  const git = simpleGit(gitDirRepo);
  try {
    await git.addRemote(name, url);
  } catch (err) {
    dialog.showErrorBox("Error", `Could not add remote: ${err.message}`);
  }
});

ipcMain.handle("git-remove-remote", async (event, name) => {
  const git = simpleGit(gitDirRepo);
  try {
    // demander confirmation avant de supprimer le remote
    const win = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showMessageBox(win, {
      type: "question",
      buttons: ["Oui", "Non"],
      defaultId: 1,
      cancelId: 1,
      title: "Supprimer le remote ?",
      message: `Voulez-vous vraiment supprimer le remote "${name}" ?`,
    });
    if (result.response !== 0) return;
    return await git.removeRemote(name);
  } catch (err) {
    dialog.showErrorBox("Error", `Could not remove remote: ${err.message}`);
  } finally {
    return null;
  }
});

// Should
/*
  git config → configurer Git
  git reset → annuler/revenir sur un commit
  git revert → créer un commit qui annule un autre
  git stash → mettre de côté des changements
  git fetch → récupérer les objets sans fusionner
  git show → afficher les détails d’un commit
  git tag → créer un tag
  git rebase → rejouer des commits sur une autre branche
  git blame → voir qui a modifié chaque ligne
*/

ipcMain.on("git-open-config-window", async (_event, scope) => {
  currentConfigScope = scope;
  createConfig(scope);
});

ipcMain.handle("get-scope", async () => {
  return currentConfigScope;
});

ipcMain.on("git-config", async (_event, key, value, funcScope) => {
  const git = simpleGit(gitDirRepo);
  try {
    if (value) {
      await git.addConfig(key, value, (scope = funcScope));
    }
  } catch (err) {
    dialog.showErrorBox("Error", `Git config error: ${err.message}`);
  }
});

ipcMain.on("git-del-config", async (_event, key, funcScope) => {
  const git = simpleGit(gitDirRepo);
  try {
    await git.raw(["config", `--${funcScope}`, "--unset", key]);
    return { success: true };
  } catch (err) {
    dialog.showErrorBox("Error", `Git config error: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-list-config", async (_event, scope) => {
  const git = simpleGit(gitDirRepo);
  try {
    const configList = await git.listConfig(scope);
    return configList.all;
  } catch (err) {
    dialog.showErrorBox("Error", `Git config error: ${err.message}`);
    return null;
  }
});

ipcMain.on("git-config-edit-file", async (_event) => {
  const git = simpleGit(gitDirRepo);
  try {
    const configFile = gitDirRepo + "/.git/config";
    if (!fs.existsSync(configFile)) {
      dialog.showErrorBox("Error", "Git config file not found.");
      return;
    }
    const shell =
      process.platform === "win32"
        ? "notepad.exe"
        : process.platform === "darwin"
          ? "open -a TextEdit"
          : "xdg-open";
    require("child_process").exec(`${shell} "${configFile}"`);
  } catch (err) {
    dialog.showErrorBox("Error", `Could not open config file: ${err.message}`);
  }
});

ipcMain.handle("git-reset", async (_event, mode, commit) => {
  const git = simpleGit(gitDirRepo);
  try {
    await git.reset([mode, commit]);
    return { success: true };
  } catch (err) {
    dialog.showErrorBox("Error", `Git reset error: ${err.message}`);
    return null;
  }
});

ipcMain.on("git-revert", async (_event, commit) => {
  const git = simpleGit(gitDirRepo);
  try {
    await git.revert(commit);
  } catch (err) {
    dialog.showErrorBox("Error", `Git revert error: ${err.message}`);
  }
});

ipcMain.handle("git-stash", async (_event, action) => {
  const git = simpleGit(gitDirRepo);
  try {
    if (action === "save") {
      await git.stash();
    } else if (action === "pop") {
      await git.stash(["pop"]);
    }
    return { success: true };
  } catch (err) {
    dialog.showErrorBox("Error", `Git stash error: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-fetch", async () => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.fetch(["--all", "--prune"]);
  } catch (err) {
    dialog.showErrorBox("Error", `Git fetch error: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-show", async (_event, commit) => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.show([commit]);
  } catch (err) {
    dialog.showErrorBox("Error", `Git show error: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-tag", async (_event, tag) => {
  const git = simpleGit(gitDirRepo);
  try {
    await git.addTag(tag);
    return { success: true };
  } catch (err) {
    dialog.showErrorBox("Error", `Git tag error: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-rebase", async (_event, branch) => {
  const git = simpleGit(gitDirRepo);
  try {
    await git.rebase([branch]);
    return { success: true };
  } catch (err) {
    dialog.showErrorBox("Error", `Git rebase error: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-blame", async (_event, file) => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.blame(file);
  } catch (err) {
    dialog.showErrorBox("Error", `Git blame error: ${err.message}`);
    return null;
  }
});

// Could
/*
git cherry-pick → appliquer un commit précis
git bisect → trouver un commit fautif
git archive → créer une archive du projet
git shortlog → résumé des commits par auteur
git describe → décrire un commit par rapport aux tags
git clean → supprimer les fichiers non suivis
git reflog → voir le journal des HEAD
git gc → nettoyer et optimiser le dépôt
git submodule → gérer des dépôts imbriqués
git worktree → travailler sur plusieurs branches à la fois
*/

ipcMain.on("git-cherry-pick", async (_event, commit) => {
  const git = simpleGit(gitDirRepo);
  try {
    await git.raw(["cherry-pick", commit]);
  } catch (err) {
    dialog.showErrorBox("Error", `Git cherry-pick error: ${err.message}`);
  }
});

// ipcMain.handle("git-bisect", ()=>{});

ipcMain.on("git-archive", async (_event) => {
  const git = simpleGit(gitDirRepo);
  try {
    // get le status pour connaitre la branche
    const status = await git
      .status()
      .then((res) => JSON.parse(JSON.stringify(res)));

    // choisi le format de l'archive en fonction de l'OS
    const format = process.platform === "win32" ? "zip" : "tar.gz";

    // crée l'archive
    await git.raw([
      "archive",
      `--format=${format}`,
      "-o",
      path.join(
        gitDirRepo,
        `${gitDirRepo.split(/[\\/]/).pop()}-${status.current}-archive.zip`,
      ),
      status.current,
    ]);
  } catch (err) {
    dialog.showErrorBox("Error", `Git archive error: ${err.message}`);
  }
});

ipcMain.handle("git-shortlog", async () => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.shortlog();
  } catch (err) {
    dialog.showErrorBox("Error", `Git shortlog error: ${err.message}`);
    return null;
  }
});

ipcMain.handle("git-describe", async (_event, commit) => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.describe([commit]);
  } catch (err) {
    dialog.showErrorBox("Error", `Git describe error: ${err.message}`);
    return null;
  }
});

ipcMain.on("git-clean", async (_event, options) => {
  const git = simpleGit(gitDirRepo);
  try {
    await git.raw(["clean", `-f${options}`]);
  } catch (err) {
    dialog.showErrorBox("Error", `Git clean error: ${err.message}`);
  }
});

ipcMain.handle("git-reflog", async () => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.reflog();
  } catch (err) {
    dialog.showErrorBox("Error", `Git reflog error: ${err.message}`);
    return null;
  }
});

ipcMain.on("git-gc", async () => {
  const git = simpleGit(gitDirRepo);
  try {
    const res = await git.raw(["gc"]);
    console.log("Git gc result:", res);
  } catch (err) {
    dialog.showErrorBox("Error", `Git gc error: ${err.message}`);
  }
});

ipcMain.handle(
  "git-submodule",
  async (_event, action, repoUrl = "", repoName = "") => {
    const git = simpleGit(gitDirRepo);
    try {
      if (action === "add") {
        if (repoUrl === "" || repoName === "") {
          openAddSubModule();
        } else {
          return await git.submoduleAdd(repoUrl, repoName, ["--force"]);
        }
      } else if (action === "update") {
        return await git.submoduleUpdate(["--init", "--recursive"]);
      } else if (action === "init") {
        return await git.submoduleInit();
      }
    } catch (err) {
      dialog.showErrorBox("Error", `Git submodule error: ${err.message}`);
      return null;
    }
  },
);

ipcMain.handle("git-worktree", async (_event, action, options) => {
  const git = simpleGit(gitDirRepo);
  try {
    if (action === "add") {
      await git.worktreeAdd(options);
    } else if (action === "remove") {
      await git.worktreeRemove(options);
    } else if (action === "list") {
      return await git.worktreeList();
    } else if (action === "prune") {
      await git.worktreePrune();
    }
    return { success: true };
  } catch (err) {
    dialog.showErrorBox("Error", `Git worktree error: ${err.message}`);
    return null;
  }
});
