const { app, BrowserWindow, nativeTheme  } = require('electron/main')
const path = require("path");

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
            contextIsolation: false
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
            contextIsolation: false
        },
        // désactivation du menu
        autoHideMenuBar: true,
        //désactive la possibilité de redimensionner la fenêtre
        resizable: false

    }))

    win[win.length - 1].loadFile('dist/GitSelector.html')
}

const createWindow = () => {
   win.push(new BrowserWindow({
        width: 800,
        height: 600,
        icon: nativeTheme.shouldUseDarkColors
            ? "favicon-light.ico"
            : "favicon-dark.ico",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    }))

    win[win.length - 1].loadFile('dist/index.html');
}

app.whenReady().then(() => {

    createWindow()
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

    win.forEach((elt) => {elt.setIcon(newIcon)}); // Windows et Linux
    if (process.platform === "darwin") {
      app.dock.setIcon(newIcon); // macOS
    }
  });