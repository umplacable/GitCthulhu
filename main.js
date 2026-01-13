// --- IMPORTS ---
const { app, BrowserWindow, nativeTheme, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ini = require('ini');
const marked = require('marked');
const simpleGit = require('simple-git');
const Diff3 = require('node-diff3'); // utilisé pour l'auto-merge "smart"


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

function createIsGit() {
  const modalWin = new BrowserWindow({
    name: `No git repo detected`,
    width: 500,
    height: 400,
    icon: path.join(__dirname, nativeTheme.shouldUseDarkColors ? 'public/icons/favicon-light.ico' : 'public/icons/favicon-dark.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
  });

  modalWin.loadURL(getFilePath('InitRepo.html'));

  modalWin.once('ready-to-show', () => {
    modalWin.show();
  });

  win.push(modalWin);
  return modalWin
}

// --- FONCTION ---

// Trouver le premier terminal disponible
function findTerminal(terminals) {
  const { exec } = require('child_process');
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
};

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

  if (win && win.length > 0) {
    win.forEach((elt) => {
      if (elt && !elt.isDestroyed()) elt.setIcon(newIcon);
    });

    if (process.platform === 'darwin') {
      app.dock.setIcon(newIcon);
    }
  }
});












// --- IPC HANDLERS / EVENTS ---

ipcMain.on('open-select-window', async (event, nom, dirpath) => {
  try {
    gitDirRepo = dirpath;
    const senderWin = BrowserWindow.fromWebContents(event.sender);
    const git = simpleGit(gitDirRepo);
    const isRepo = await git.checkIsRepo().catch(() => false);

    if (!isRepo) {
      const modalWin = createIsGit();

      modalWin.once('ready-to-show', () => {
        modalWin.show();
      });

      // Quand la modale se ferme, fermer la fenêtre d’origine
      modalWin.once('closed', async () => {
        try {
          const ret = await git.checkIsRepo().catch(() => false);

          if (ret) {
            if (senderWin && !senderWin.isDestroyed()) {
              senderWin.close();
            }
            createWindow(nom, dirpath);
          }

        } catch (err) {
          console.error('Erreur après fermeture de la modale :', err);
        }
      });

      return; // ✅ on sort ici : ne pas ouvrir la fenêtre principale
    }

    // ✅ Si c’est bien un dépôt git, ouvrir la fenêtre principale
    createWindow(nom, dirpath);
    if (senderWin) senderWin.close();

  } catch (err) {
    console.error('Erreur dans open-select-window:', err);
    dialog.showErrorBox('Erreur', `Impossible d’ouvrir la fenêtre : ${err.message}`);
  }
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

  const { exec } = require('child_process');
  let command;

  if (process.platform === 'win32') {
    command = `start cmd.exe /K "cd /d ${gitDirRepo}"`;

  } else if (process.platform === 'darwin') {
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
      `xterm -e "cd '${gitDirRepo}' && bash"`
    ];

    findTerminal(terminals).then((cmd) => {
      if (!cmd) {
        dialog.showErrorBox('Erreur', 'Aucun terminal compatible trouvé sur ce système.');
        return;
      }
    });
    return;
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
ipcMain.on('git-init', (event) => {
  const git = simpleGit(gitDirRepo);
  git.init().catch((err) => dialog.showErrorBox('Error', `Could not initialize git: ${err.message}`));
  dialog.showMessageBox({
      type: 'info',
      title: 'Succès',
      message: `Dépôt Git initialisé dans :\n${gitDirRepo}`,
    }).then(() => {
      const senderWin = BrowserWindow.fromWebContents(event.sender);
      if (senderWin) senderWin.close();
    })
});

ipcMain.on('git-clone', (event, url) => {
  const git = simpleGit();

  //on demande si on peut détruire le répertoire si il y a des choses dedans
  const result = dialog.showMessageBoxSync({
    type: 'question',
    buttons: ['Oui', 'Non'],
    defaultId: 1,
    cancelId: 1,
    title: 'Cloner le dépôt',
    message: `Le répertoire ${gitDirRepo} sera supprimé s'il existe déjà. Voulez-vous continuer ?`
  });
  if (result !== 0) return; // si l'utilisateur clique sur "Non", on annule l'opération
  
  // on suprime le répertoire s'il existe déjà
  if (fs.existsSync(gitDirRepo)) {
    fs.rmdirSync(gitDirRepo, { recursive: true });
  } 
  git.clone(url, gitDirRepo)
  .then(() => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Succès',
      message: `Dépôt Git cloné dans :\n${gitDirRepo}`,
    }).then(() => {
      const senderWin = BrowserWindow.fromWebContents(event.sender);
      if (senderWin) senderWin.close();
    })
  })
  .catch((err) =>
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

// --- MERGE & RÉSOLUTION DE CONFLITS ---

// Handler principal de merge : lance "git merge <branch>"
ipcMain.handle('git-merge', async (event, branch) => {
  const git = simpleGit(gitDirRepo);
  try {
    const summary = await git.merge([branch]);
    const status = await git.status();

    return {
      ok: true,
      summary,
      status,
    };
  } catch (err) {
    // simple-git renvoie une erreur en cas de conflits, mais on peut quand même récupérer le status
    let status = null;
    try {
      status = await git.status();
    } catch (e) {
      // ignore
    }

    const message = err && err.message ? err.message : String(err);

    return {
      ok: false,
      error: message,
      status,
    };
  }
});

// Récupérer les 3 versions d'un fichier en conflit : base / ours / theirs
ipcMain.handle('git-merge-file-contents', async (event, filePath) => {
  const git = simpleGit(gitDirRepo);

  try {
    const [base, ours, theirs] = await Promise.all([
      git.raw(['show', `:1:${filePath}`]).catch(() => ''),
      git.raw(['show', `:2:${filePath}`]).catch(() => ''),
      git.raw(['show', `:3:${filePath}`]).catch(() => ''),
    ]);

    return {
      ok: true,
      base,
      ours,
      theirs,
    };
  } catch (err) {
    return {
      ok: false,
      error: err && err.message ? err.message : String(err),
    };
  }
});

// Appliquer manuellement un contenu résolu pour un fichier en conflit
ipcMain.handle('git-merge-apply-resolution', async (event, filePath, content) => {
  const git = simpleGit(gitDirRepo);

  try {
    const absPath = path.join(gitDirRepo, filePath);
    fs.writeFileSync(absPath, content, 'utf8');
    await git.add(filePath);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err && err.message ? err.message : String(err),
    };
  }
});

// Auto-résolution "smart" avec node-diff3 (3-way merge)
ipcMain.handle('git-merge-autosolve-file', async (event, filePath) => {
  const git = simpleGit(gitDirRepo);

  try {
    const [base, ours, theirs] = await Promise.all([
      git.raw(['show', `:1:${filePath}`]),
      git.raw(['show', `:2:${filePath}`]),
      git.raw(['show', `:3:${filePath}`]),
    ]);

    const baseLines = base.split('\n');
    const oursLines = ours.split('\n');
    const theirsLines = theirs.split('\n');

    const resultBlocks = Diff3.diff3Merge(
      oursLines,
      baseLines,
      theirsLines,
      {
        excludeFalseConflicts: true,
        stringSeparator: '\n',
      }
    );

    const hasConflict = resultBlocks.some((b) => b.conflict);
    if (hasConflict) {
      return {
        ok: false,
        reason: 'unresolved-conflicts',
      };
    }

    const mergedLines = [];
    for (const block of resultBlocks) {
      if (block.ok) {
        mergedLines.push(...block.ok);
      }
    }

    const mergedContent = mergedLines.join('\n');
    const absPath = path.join(gitDirRepo, filePath);
    fs.writeFileSync(absPath, mergedContent, 'utf8');
    await git.add(filePath);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err && err.message ? err.message : String(err),
    };
  }
});

// Résoudre un fichier en conflit par stratégie : "ours" ou "theirs"
ipcMain.handle('git-merge-resolve-file', async (event, filePath, strategy) => {
  const git = simpleGit(gitDirRepo);

  try {
    if (strategy === 'ours') {
      await git.raw(['checkout', '--ours', filePath]);
    } else if (strategy === 'theirs') {
      await git.raw(['checkout', '--theirs', filePath]);
    } else {
      throw new Error(`Unknown strategy: ${strategy}`);
    }

    await git.add(filePath);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err && err.message ? err.message : String(err),
    };
  }
});

// Annuler un merge en cours
ipcMain.handle('git-merge-abort', async () => {
  const git = simpleGit(gitDirRepo);
  try {
    await git.raw(['merge', '--abort']);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err && err.message ? err.message : String(err),
    };
  }
});

// Terminer un merge en faisant le commit
ipcMain.handle('git-merge-continue', async (event, message) => {
  const git = simpleGit(gitDirRepo);
  try {
    await git.commit(message || 'Merge commit');
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err && err.message ? err.message : String(err),
    };
  }
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
