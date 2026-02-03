const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const serve = require('next-electron-server');
const { autoUpdater } = require('electron-updater');

// Configure autoUpdater
autoUpdater.autoDownload = false; // We can ask user first
autoUpdater.checkForUpdatesAndNotify();

// Initialize the next-electron-server
const nextServe = serve({
    directory: path.join(__dirname, '../out'), // Path to the exported Next.js app
    port: 3000
});

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 850,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
        titleBarStyle: 'hiddenInset', // Modern macOS look
        backgroundColor: '#020617' // Match app background
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        // mainWindow.webContents.openDevTools();
    } else {
        nextServe(mainWindow);
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// Update Listeners
autoUpdater.on('update-available', () => {
    const { dialog } = require('electron');
    dialog.showMessageBox({
        type: 'info',
        title: 'Dostępna aktualizacja',
        message: 'Nowa wersja Audytora jest dostępna. Czy chcesz ją pobrać teraz?',
        buttons: ['Tak', 'Później']
    }).then((result) => {
        if (result.response === 0) {
            autoUpdater.downloadUpdate();
        }
    });
});

autoUpdater.on('update-downloaded', () => {
    const { dialog } = require('electron');
    dialog.showMessageBox({
        type: 'info',
        title: 'Aktualizacja gotowa',
        message: 'Aktualizacja została pobrana. Aplikacja zostanie zrestartowana w celu instalacji.',
        buttons: ['Restartuj teraz']
    }).then(() => {
        autoUpdater.quitAndInstall();
    });
});

