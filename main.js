// --- IMPORTS ---
const { app, BrowserWindow, nativeTheme, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ini = require('ini');
const marked = require('marked');
const simpleGit = require('simple-git');

// --- VARIABLES GLOBALES ---
let win = [];
let gitDirRepo = '~/'; // répertoire du dépôt git courant
const isDev = !app.isPackaged;
let configPath;
let ammend = false;

// --- FONCTION UTILITAIRE POUR LES CHEMINS ---
function getFilePath(filename) {
  if (isDev) {
    // En dev : on charge depuis webpack dev server (vite ou autre)
    return path.join(__dirname, 'dist', filename);
  } else {
    // En prod : on charge depuis le dossier dist dans app.asar
    return `file://${path.join(__dirname, 'dist', filename)}`;
  }
}

// --- FONCTION : CRÉATION FENÊTRES ---
function createGitCreatorWindow() {
  const creatorWin = new BrowserWindow({
    width: 600,
    height: 450,
    icon: path.join(__dirname, nativeTheme.shouldUseDarkColors ? 'public/icons/favicon-light.ico' : 'public/icons/favicon-dark.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    resizable: false,
  });

  creatorWin.loadURL(getFilePath('GitCreator.html'));
  win.push(creatorWin);
}

function createGitSelectorWindow() {
  const selectorWin = new BrowserWindow({
    width: 600,
    height: 450,
    icon: path.join(__dirname, nativeTheme.shouldUseDarkColors ? 'public/icons/favicon-light.ico' : 'public/icons/favicon-dark.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    resizable: false,
  });

  selectorWin.loadURL(getFilePath('GitSelector.html'));
  win.push(selectorWin);
}

function OpenRepoInit() {
  const initWin = new BrowserWindow({
    width: 600,
    height: 450,
    icon: path.join(__dirname, nativeTheme.shouldUseDarkColors ? 'public/icons/favicon-light.ico' : 'public/icons/favicon-dark.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    resizable: false,
  });

  initWin.loadURL(getFilePath('InitRepo.html'));
  win.push(initWin);
}

function createWindow(nom, dirpath) {
  const mainWin = new BrowserWindow({
    name: `${nom} - ${dirpath}`,
    width: 800,
    height: 600,
    icon: path.join(__dirname, nativeTheme.shouldUseDarkColors ? 'public/icons/favicon-light.ico' : 'public/icons/favicon-dark.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
  });

  mainWin.loadURL(getFilePath('index.html'));
  mainWin.setTitle(`${nom} - ${dirpath}`);
  win.push(mainWin);
  return mainWin
}

function createIsGit(parentWin) {
  const mainWin = new BrowserWindow({
    name: `No git repo detected`,
    width: 400,
    height: 300,
    icon: path.join(__dirname, nativeTheme.shouldUseDarkColors ? 'public/icons/favicon-light.ico' : 'public/icons/favicon-dark.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    parent: parentWin,      // fenêtre parente
    modal: true,            // fait de cette fenêtre une modale
    show: false,            // on attend le chargement avant d'afficher
  });

  mainWin.loadURL(getFilePath('InitRepo.html'));

  modalWin.once('ready-to-show', () => {
    modalWin.show();
  });

  win.push(mainWin);
}

// --- APP READY ---
app.whenReady().then(() => {
  configPath = path.join(app.getPath('userData'), "config.ini");
  ammend = false;

  // createGitSelectorWindow();
  createGitCreatorWindow();
});

// --- QUIT LOGIQUE ---
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- CHANGEMENT DE THEME ---
nativeTheme.on('updated', () => {
  const newIcon = path.join(__dirname, nativeTheme.shouldUseDarkColors ? 'public/icons/favicon-light.ico' : 'public/icons/favicon-dark.ico');

  win.forEach((elt) => {
    if (elt && !elt.isDestroyed()) elt.setIcon(newIcon);
  });

  if (process.platform === 'darwin') {
    app.dock.setIcon(newIcon);
  }
});

// --- IPC HANDLERS / EVENTS ---

ipcMain.on('open-select-window', async (event, nom, dirpath) => {
  gitDirRepo = dirpath;
  
  // si le chemin ne mene pas a un dépot git
  const git = simpleGit(gitDirRepo);
  const isRepo = await git.checkIsRepo();

  let parentwin = createWindow(nom, dirpath);
  
  parentwin.once('ready-to-show', () => {
    if (!isRepo) createIsGit(parentwin);
  });

});

ipcMain.on('close-window', (event) => {
  const senderWin = BrowserWindow.fromWebContents(event.sender);
  if (senderWin) senderWin.close();
});

ipcMain.handle('get-config', () => {
  if (!fs.existsSync(configPath)) return null;
  const content = fs.readFileSync(configPath, 'utf-8');
  return content ? ini.parse(content) : null;
});

ipcMain.on('add-repository', async (event) => {
  const senderWin = BrowserWindow.fromWebContents(event.sender);
  if (!senderWin) return;

  const result = await dialog.showOpenDialog(senderWin, {
    properties: ['openDirectory'],
  });
  if (result.canceled) return;

  const dirpath = result.filePaths[0];
  const git = simpleGit(dirpath);

  if (!(await git.checkIsRepo())) OpenRepoInit();

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, '[Depo]\nnames=\npaths=\nids=');
  }

  let content = fs.readFileSync(configPath, 'utf-8');
  if (!content) {
    fs.writeFileSync(configPath, '[Depo]\nnames=\npaths=\nids=');
    content = fs.readFileSync(configPath, 'utf-8');
  }

  const config = ini.parse(content);
  if (!config.Depo) config.Depo = { names: '', paths: '', ids: '' };

  if (config.Depo.paths) {
    config.Depo.paths += `,${dirpath}`;
    config.Depo.names += `,${dirpath.split(/[\\/]/).pop()}`;
    config.Depo.ids += `,${config.Depo.ids ? config.Depo.ids.split(',').length + 1 : 1}`;
  } else {
    config.Depo.paths = dirpath;
    config.Depo.names = `${dirpath.split(/[\\/]/).pop()}`;
    config.Depo.ids = '1';
  }

  fs.writeFileSync(configPath, ini.stringify(config));

  win.forEach((elt) => {
    if (elt && !elt.isDestroyed()) elt.reload();
  });
});

ipcMain.handle('get-readme', async (event, dirpath) => {
  try {
    const data = fs.readFileSync(path.join(dirpath, 'README.md'), 'utf-8');
    return marked.parse(data);
  } catch (err) {
    return null;
  }
});

ipcMain.on('open-terminal', (event) => {
  const senderWin = BrowserWindow.fromWebContents(event.sender);
  if (!senderWin) return;

  const exec = require('child_process').exec;
  let command;

  if (process.platform === 'win32') {
    command = `start cmd.exe /K "cd /d ${gitDirRepo}"`;
  } else if (process.platform === 'darwin') {
    command = `open -a Terminal "${gitDirRepo}"`;
  } else {
    command = `x-terminal-emulator --working-directory="${gitDirRepo}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.error(`Error opening terminal: ${error}`);
      dialog.showErrorBox('Error', `Could not open terminal: ${error.message}`);
    }
  });
});

ipcMain.on('delete-repository', (event, id) => {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, '[Depo]\nnames=\npaths=\nids=');
  }

  let content = fs.readFileSync(configPath, 'utf-8');
  if (!content) {
    fs.writeFileSync(configPath, '[Depo]\nnames=\npaths=\nids=');
    content = fs.readFileSync(configPath, 'utf-8');
  }

  const config = ini.parse(content);
  if (!config.Depo) config.Depo = { names: '', paths: '', ids: '' };

  const names = config.Depo.names.split(',').map((x) => x.trim());
  const paths = config.Depo.paths.split(',').map((x) => x.trim());
  const ids = config.Depo.ids.split(',').map((x) => x.trim());
  const index = ids.indexOf(id);
  if (index === -1) return;

  names.splice(index, 1);
  paths.splice(index, 1);
  ids.splice(index, 1);

  config.Depo.names = names.join(',');
  config.Depo.paths = paths.join(',');
  config.Depo.ids = ids.join(',');

  if (config.Depo.names === '' && config.Depo.paths === '') {
    fs.unlinkSync(configPath);
  } else {
    fs.writeFileSync(configPath, ini.stringify(config));
  }

  win.forEach((elt) => {
    if (elt && !elt.isDestroyed()) elt.reload();
  });
});

// --- COMMANDES GIT ---
ipcMain.on('git-init', () => {
  const git = simpleGit(gitDirRepo);
  git.init().catch((err) => dialog.showErrorBox('Error', `Could not initialize git: ${err.message}`));
});

ipcMain.on('git-clone', (event, url) => {
  const git = simpleGit();
  git.clone(url, gitDirRepo).catch((err) =>
    dialog.showErrorBox('Error', `Could not clone: ${err.message}`)
  );
});

ipcMain.handle('git-add', async () => {
  const git = simpleGit(gitDirRepo);
  try {
    const result = await git.add('./');
    return result;
  } catch (err) {
    dialog.showErrorBox('Error', `Could not add: ${err.message}`);
    return null;
  }
});

ipcMain.handle('git-commit', async (event, message) => {
  const git = simpleGit(gitDirRepo);

  if(message == ""){
    ammend = false;
    dialog.showErrorBox('Error', `Metez un message pour commit.`)
  }

  if(ammend){
    ammend = false;
    try {
      return git.commit(message, ["--amend"]);
    } catch (err) {
      dialog.showErrorBox('Error', `Could not amend commit: ${err.message}`)
      return null;
    }
  }else{
    try {
      return await git.commit(message);
    } catch (err) {
      dialog.showErrorBox('Error', `Could not commit: ${err.message}`);
      return null;
    }
  }
});

ipcMain.on('git-togle-amend', (event) => {
  ammend = true;
});

ipcMain.handle('git-status', async () => {
  const git = simpleGit(gitDirRepo);
  try {
    const status = await git.status();
    return JSON.parse(JSON.stringify(status));
  } catch (err) {
    dialog.showErrorBox('Error', `Could not get status: ${err.message}`);
    return null;
  }
});

ipcMain.handle('git-log', async () => {
  const git = simpleGit(gitDirRepo);
  try {
    const log = await git.log();
    return log;
  } catch (err) {
    dialog.showErrorBox('Error', `Could not get log: ${err.message}`);
    return null;
  }
});

ipcMain.handle('git-diff', async (event, commit1, commit2) => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.diff([`${commit1}..${commit2}`]);
  } catch (err) {
    dialog.showErrorBox('Error', `Could not get diff: ${err.message}`);
    return null;
  }
});

ipcMain.handle('git-add-branch', async (event, name) => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.checkoutLocalBranch(name);
  } catch (err) {
    dialog.showErrorBox('Error', `Could not add branches: ${err.message}`);
    return null;
  }
});

ipcMain.handle('git-del-branch', async (event, name) => {
  const git = simpleGit(gitDirRepo);

  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showMessageBox(win, {
    type: 'question',
    buttons: ['Oui', 'Non'],
    defaultId: 1,
    cancelId: 1,
    title: 'Supprimer la branche ?',
    message: `Voulez-vous vraiment supprimer la branche "${name}" ?`
  });

  if (result.response !== 0) return;
  try {
    return await git.deleteLocalBranch(name);
  } catch (err) {
    dialog.showErrorBox('Error', `Could not delete branches: ${err.message}`);
    return null;
  }
});

ipcMain.handle('git-branch-local', async () => {
  const git = simpleGit(gitDirRepo);
  try {
    return JSON.parse(JSON.stringify( await git.branchLocal()));
  } catch (err) {
    dialog.showErrorBox('Error', `Could not get branches: ${err.message}`);
    return null;
  }
});

ipcMain.on('git-checkout', (event, branch) => {
  const git = simpleGit(gitDirRepo);
  git.checkout(branch).catch((err) =>
    dialog.showErrorBox('Error', `Could not checkout: ${err.message}`)
  );
});

ipcMain.on('git-merge', (event, branch) => {
  const git = simpleGit(gitDirRepo);
  git.merge([branch]).catch((err) =>
    dialog.showErrorBox('Error', `Could not merge: ${err.message}`)
  );
});

ipcMain.handle('git-pull', async () => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.pull();
  } catch (err) {
    dialog.showErrorBox('Error', `Could not pull: ${err.message}`);
    return null;
  }
});

ipcMain.handle('git-push', async () => {
  const git = simpleGit(gitDirRepo);
  try {
    return await git.push();
  } catch (err) {
    dialog.showErrorBox('Error', `Could not push: ${err.message}`);
    return null;
  }
});
