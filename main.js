const { app, BrowserWindow, nativeTheme, ipcMain, dialog } = require('electron/main')
const path = require("path");
const fs = require('fs');
const ini = require('ini');
const marked = require('marked');

let win = [];

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
});

ipcMain.on("close-window", (event) => {
  const senderWin = BrowserWindow.fromWebContents(event.sender);
  if (senderWin) senderWin.close();
});

ipcMain.handle("get-config", () => {
  const content = fs.readFileSync("config.ini", "utf-8");
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
    const path = result.filePaths[0]; // return selected folder path

    // check si le fichier existe
    if (!fs.existsSync("config.ini")) {
        fs.writeFileSync("config.ini", "[Depo]\nnames=\npaths=");
    }

    if (!path) return;
    let content = fs.readFileSync("config.ini", "utf-8");
    // si le fichier n'existe pas, le créer
    if (!content) {
        fs.writeFileSync("config.ini", "[Depo]\nnames=\npaths=");
        content = fs.readFileSync("config.ini", "utf-8");
    }

    const config = ini.parse(content);
    // si la section Depo n'existe pas, la créer
    if (!config.Depo) {
        config.Depo = { names: "", paths: "" };
    }
    // ajoute le nouveau dépôt
    if (config.Depo.paths ) {
        config.Depo.paths += `,${path}`;
        config.Depo.names += `,${path.split(/[\\/]/).pop()}`;
    } else {
        config.Depo.paths = path;
        config.Depo.names = `${path.split(/[\\/]/).pop()}`;
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

ipcMain.on('open-terminal', (event, dirpath) => {

    const senderWin = BrowserWindow.fromWebContents(event.sender);

    if (!senderWin) return;

    const exec = require('child_process').exec;
    let command;

    if (process.platform === 'win32') {
        command = `start cmd.exe /K "cd /d ${dirpath}"`;
    } else if (process.platform === 'darwin') {
        command = `open -a Terminal "${dirpath}"`;
    } else { // linux
        command = `x-terminal-emulator --working-directory="${dirpath}"`;
    }

    exec(command, (error) => {
        if (error) {
            console.error(`Error opening terminal: ${error}`);
            dialog.showErrorBox('Error', `Could not open terminal: ${error.message}`);
        }
    });
});

ipcMain.on('delete-repository', (event, name) => {

    // regarde la fenêtre qui a envoyé le message
    const senderWin = BrowserWindow.fromWebContents(event.sender);
    if (!senderWin) return;

    // check si le fichier existe
    if (!fs.existsSync("config.ini")) {
        fs.writeFileSync("config.ini", "[Depo]\nnames=\npaths=");
    }
    let content = fs.readFileSync("config.ini", "utf-8");

    // si le fichier n'existe pas, le créer
    if (!content) {
        fs.writeFileSync("config.ini", "[Depo]\nnames=\npaths=");
        content = fs.readFileSync("config.ini", "utf-8");
    }
    const config = ini.parse(content);

    // si la section Depo n'existe pas, la créer
    if (!config.Depo) {
        config.Depo = { names: "", paths: "" };
    }

    if (!config.Depo.names || !config.Depo.paths) return; // rien à faire
    const names = config.Depo.names.split(",").map((x) => x.trim());
    const paths = config.Depo.paths.split(",").map((x) => x.trim());
    const index = names.indexOf(name);

    if (index === -1) return; // pas trouvé

    names.splice(index, 1);
    paths.splice(index, 1);
    config.Depo.names = names.join(",");
    config.Depo.paths = paths.join(",");

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