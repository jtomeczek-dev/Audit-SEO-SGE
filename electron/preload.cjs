const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,
    // Add more bridges if needed later for file system access or keychain
});
