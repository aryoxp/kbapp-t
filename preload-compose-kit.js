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
  loadConceptMap: () => ipcRenderer.invoke('load-concept-map'),
  loadConceptMapResult: (data) => ipcRenderer.on('load-concept-map-result', data),
  loadKit: () => ipcRenderer.invoke('load-kit'),
  loadKitResult: (data) => ipcRenderer.on('load-kit-result', data),
  saveKit: (conceptMapData) => ipcRenderer.invoke('save-kit', conceptMapData),
  saveKitResult: (data) => ipcRenderer.on('save-kit-result', data),
  saveKitAs: (kitData) => ipcRenderer.invoke('save-kit-as', kitData),
});
