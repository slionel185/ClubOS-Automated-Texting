const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('api', {
    // Invoke
    testInvoke: (args) => ipcRenderer.invoke('test-invoke', args),
    
    // Send
    testSend: (args) => ipcRenderer.send('test-send', args),

    // Receive
    testReceive: (callback) => ipcRenderer.on('test-receive', (event, data) => { callback(data) }),

    // Init Puppeteer
    dispatchTexts: (args) => ipcRenderer.invoke('dispatchTexts', args)
})