window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})

const { contextBridge, ipcRenderer, ipcMain } = require('electron')

contextBridge.exposeInMainWorld('api', {
  saveFileAs: (data) => ipcRenderer.invoke('save-file-as', data).then(result => {}),
  saveFileAsCancelled: (callback) => ipcRenderer.on('save-file-as-cancelled', callback),
  saveFileAsResult: (callback) => ipcRenderer.on('save-file-as-result', callback),
  saveFileAsSilent: (data) => ipcRenderer.invoke('save-file-as-silent', data),
  saveFileAsResultSilent: (callback) => ipcRenderer.on('save-file-as-result-silent', callback),
  openFile: () => ipcRenderer.invoke('open-file'),
  openFileResult: (callback) => ipcRenderer.on('open-file-result', callback),
  openFileCancelled: (callback) => ipcRenderer.on('open-file-cancelled', callback),
  composeKit: (data) => ipcRenderer.invoke('compose-kit', data),
  openImage: () => ipcRenderer.invoke('open-image'),
  openDataGenerator: () => ipcRenderer.invoke('open-data-generator'),
});
