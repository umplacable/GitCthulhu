const { app, BrowserWindow } = require('electron/main')

const creatGitSelectorWindow = () => {
    const win = new BrowserWindow({
        width: 400,
        height: 400
    })

    win.loadFile('public/GitSelector.html')
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600
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