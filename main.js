const { app, BrowserWindow, nativeTheme, ipcMain, dialog } = require('electron/main')
const path = require("path");
const fs = require('fs');
const ini = require('ini');
const marked = require('marked');

let win = [];
let gitDirRepo = "~/"; // répertoire du dépôt git courant

// création d'une fenêtre

const createGitCreatorWindow = () => {
    win.push(new BrowserWindow({
        width: 600,
        height: 450,
        icon: nativeTheme.shouldUseDarkColors
            ? "favicon-light.ico"
            : "favicon-dark.ico",
        webPreferences: {
            nodeIntegration: true, 
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"), // ⚡ important pour la sécurité
        },
        // désactivation du menu
        autoHideMenuBar: true,
        //désactive la possibilité de redimensionner la fenêtre
        resizable: false

    }))

    // win.loadFile('public/header.html')
    win[win.length - 1].loadFile('dist/GitCreator.html')
}

const createGitSelectorWindow = () => {
    win.push(new BrowserWindow({
        width: 600,
        height: 450,
        icon: nativeTheme.shouldUseDarkColors
            ? "favicon-light.ico"
            : "favicon-dark.ico",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"), // ⚡ important pour la sécurité
        },
        // désactivation du menu
        autoHideMenuBar: true,
        //désactive la possibilité de redimensionner la fenêtre
        resizable: false

    }))

    win[win.length - 1].loadFile('dist/GitSelector.html')
}

const createWindow = (nom, dirpath) => {
   win.push(new BrowserWindow({
        name: nom + " - " + dirpath,
        width: 800,
        height: 600,
        icon: nativeTheme.shouldUseDarkColors
            ? "favicon-light.ico"
            : "favicon-dark.ico",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"), // ⚡ important pour la sécurité
        }
        ,autoHideMenuBar: true
    }))

    win[win.length - 1].loadFile('dist/index.html');
    win[win.length - 1].setTitle(nom + " - " + dirpath);
    win[win.length - 1].reload();
}

app.whenReady().then(() => {
    
    //createWindow()
    //createGitSelectorWindow()
    createGitCreatorWindow()

})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

nativeTheme.on("updated", () => {
    const newIcon = nativeTheme.shouldUseDarkColors
        ? "favicon-light.ico"
        : "favicon-dark.ico"

    win.forEach((elt) => {
        if (elt && !elt.isDestroyed()){
            elt.setIcon(newIcon)
        }
    }); // Windows et Linux
    if (process.platform === "darwin") {
      app.dock.setIcon(newIcon); // macOS
    }
  });

ipcMain.on('open-select-window', (event, nom, dirpath) => {
    createWindow(nom, dirpath)
    // on enregistre le répertoire courant
    gitDirRepo = dirpath;
});

ipcMain.on("close-window", (event) => {
  const senderWin = BrowserWindow.fromWebContents(event.sender);
  if (senderWin) senderWin.close();
});

ipcMain.handle("get-config", () => {
    if (!fs.existsSync("config.ini")) return null;
    const content = fs.readFileSync("config.ini", "utf-8");
    if (!content) return null;
    return ini.parse(content);
});

ipcMain.on('add-repository', async (event) => {

    // regarde la fenêtre qui a envoyé le message
    const senderWin = BrowserWindow.fromWebContents(event.sender);
    if (!senderWin) return;
    
    // ouvre une boîte de dialogue pour sélectionner un dossier
    const result = await dialog.showOpenDialog(senderWin, {
        properties: ['openDirectory']
    });
    if (result.canceled) return null;
    let dirpath = result.filePaths[0]; // return selected folder path

    // check si le fichier existe
    if (!fs.existsSync("config.ini")) {
        fs.writeFileSync("config.ini", "[Depo]\nnames=\npaths=\nids=");
    }

    if (!dirpath) return;
    let content = fs.readFileSync("config.ini", "utf-8");
    // si le fichier n'existe pas, le créer
    if (!content) {
        fs.writeFileSync("config.ini", "[Depo]\nnames=\npaths=\nids=");
        content = fs.readFileSync("config.ini", "utf-8");
    }

    const config = ini.parse(content);
    // si la section Depo n'existe pas, la créer
    if (!config.Depo) {
        config.Depo = { names: "", paths: "", ids: "" };
    }
    // ajoute le nouveau dépôt
    if (config.Depo.paths ) {
        config.Depo.paths += `,${dirpath}`;
        config.Depo.names += `,${dirpath.split(/[\\/]/).pop()}`;
        config.Depo.ids += `,${(config.Depo.ids ? config.Depo.ids.split(",").length + 1 : 1)}`;
    } else {
        config.Depo.paths = dirpath;
        config.Depo.names = `${dirpath.split(/[\\/]/).pop()}`;
        config.Depo.ids = "1";
    }
    fs.writeFileSync("config.ini", ini.stringify(config));

    // reload les pages
    win.forEach((elt) => {
        if (elt && !elt.isDestroyed()){
            elt.reload()
        }
    });
});

ipcMain.handle('get-readme', async (event, dirpath) => {
    try {
        const data = fs.readFileSync(path.join(dirpath, 'README.md'), 'utf-8');
        return marked.parse(data);
    } catch (err) {
        return null; // si le fichier n'existe pas ou une autre erreur
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
    } else { // linux
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

    // regarde la fenêtre qui a envoyé le message
    const senderWin = BrowserWindow.fromWebContents(event.sender);
    if (!senderWin) return;

    // check si le fichier existe
    if (!fs.existsSync("config.ini")) {
        fs.writeFileSync("config.ini", "[Depo]\nnames=\npaths=\nids=");
    }
    let content = fs.readFileSync("config.ini", "utf-8");

    // si le fichier n'existe pas, le créer
    if (!content) {
        fs.writeFileSync("config.ini", "[Depo]\nnames=\npaths=\nids=");
        content = fs.readFileSync("config.ini", "utf-8");
    }
    const config = ini.parse(content);

    // si la section Depo n'existe pas, la créer
    if (!config.Depo) {
        config.Depo = { names: "", paths: "", ids: "" };
    }

    if (!config.Depo.names || !config.Depo.paths) return; // rien à faire
    const names = config.Depo.names.split(",").map((x) => x.trim());
    const paths = config.Depo.paths.split(",").map((x) => x.trim());
    const ids = config.Depo.ids.split(",").map((x) => x.trim());
    const index = ids.indexOf(id);

    if (index === -1) return; // pas trouvé

    names.splice(index, 1);
    paths.splice(index, 1);
    ids.splice(index, 1);
    config.Depo.names = names.join(",");
    config.Depo.paths = paths.join(",");
    config.Depo.ids = ids.join(",");

    if (config.Depo.names === "" && config.Depo.paths === "") {
        // supprime le fichier si plus de dépôts
        fs.unlinkSync("config.ini");
    }else{
        fs.writeFileSync("config.ini", ini.stringify(config));
    }
    
    // reload les pages
    win.forEach((elt) => {
        if (elt && !elt.isDestroyed()){
            elt.reload()
        }
    });
});

// Git commands
const simpleGit = require('simple-git');

ipcMain.on('git-init', (event) => {
    const git = simpleGit(gitDirRepo);
    git.init().catch((err) => {
        console.error(err);
        dialog.showErrorBox('Error', `Could not initialize git repository: ${err.message}`);
    });
});

ipcMain.on('git-clone', (event, url) => {
    const git = simpleGit();
    git.clone(url, gitDirRepo).catch((err) => {
        console.error(err);
        dialog.showErrorBox('Error', `Could not clone repository: ${err.message}`);
    });
});

ipcMain.on('git-add', (event) => {
    const git = simpleGit(gitDirRepo);
    git.add('.').catch((err) => {
        console.error(err);
        dialog.showErrorBox('Error', `Could not add files: ${err.message}`);
    });
});

ipcMain.on('git-commit', (event, message) => {
    const git = simpleGit(gitDirRepo);
    git.commit(message).catch((err) => {
        console.error(err);
        dialog.showErrorBox('Error', `Could not commit: ${err.message}`);
    });
});

ipcMain.on('git-commit-ammend', (event, message) => {
    const git = simpleGit(gitDirRepo);
    git.commit(message, {'--amend': null}).catch((err) => {
        console.error(err);
        dialog.showErrorBox('Error', `Could not amend commit: ${err.message}`);
    });
});

ipcMain.handle('git-status', async (event) => {
    const git = simpleGit(gitDirRepo);
    try {
        const status = await git.status();
        return JSON.parse(JSON.stringify(status));
    } catch (err) {
        console.error(err);
        dialog.showErrorBox('Error', `Could not get status: ${err.message}`);
        return null;
    }
});

ipcMain.handle('git-log', async (event) => {
    const git = simpleGit(gitDirRepo);
    try {
        const log = await git.log();
        return log;
    } catch (err) {
        console.error(err);
        dialog.showErrorBox('Error', `Could not get log: ${err.message}`);
        return null;
    }
});

ipcMain.handle('git-diff', async (event, commit1, commit2) => {
    const git = simpleGit(gitDirRepo);
    try {
        const diff = await git.diff([`${commit1}..${commit2}`]);
        return diff;
    } catch (err) {
        console.error(err);
        dialog.showErrorBox('Error', `Could not get diff: ${err.message}`);
        return null;
    }
});

ipcMain.handle('git-branch', async (event) => {
    const git = simpleGit(gitDirRepo);
    try {
        const branches = await git.branch();
        return branches;
    } catch (err) {
        console.error(err);
        dialog.showErrorBox('Error', `Could not get branches: ${err.message}`);
        return null;
    }
});

ipcMain.on('git-checkout', (event, branch) => {
    const git = simpleGit(gitDirRepo);
    git.checkout(branch).catch((err) => {
        console.error(err);
        dialog.showErrorBox('Error', `Could not checkout branch: ${err.message}`);
    });
});

ipcMain.on('git-merge', (event, branch) => {
    const git = simpleGit(gitDirRepo);
    git.merge([branch]).catch((err) => {
        console.error(err);
        dialog.showErrorBox('Error', `Could not merge branch: ${err.message}`);
        // TODO handle merge conflicts here
    });
});

ipcMain.on('git-pull', (event) => {
    const git = simpleGit(gitDirRepo);
    git.pull().catch((err) => {
        console.error(err);
        dialog.showErrorBox('Error', `Could not pull: ${err.message}`);
    });
});

ipcMain.on('git-push', (event) => {
    const git = simpleGit(gitDirRepo);
    git.push().catch((err) => {
        console.error(err);
        dialog.showErrorBox('Error', `Could not push: ${err.message}`);
    });
});