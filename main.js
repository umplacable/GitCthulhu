const { app, BrowserWindow } = require('electron/main')

const creatGitSelectorWindow = () => {
    const win = new BrowserWindow({
        width: 600,
        height: 450,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        // désactivation du menu
        autoHideMenuBar: true,
        //désactive la possibilité de redimensionner la fenêtre
        resizable: false

    })

    win.loadFile('public/GitSelector.html')
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile('public/index.html')
}

app.whenReady().then(() => {

    createWindow()
    creatGitSelectorWindow()
})

app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {
        app.quit()
    }
})