const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,  // Sin marco
        webPreferences: {
            preload: path.join(__dirname, 'renderer.js'),  // Cargar el script de renderizado
            nodeIntegration: true,
            contextIsolation: false  // Permite usar Node.js en frontend
        }
    });

    // Pantalla completa
    mainWindow.setFullScreen(true);

    // Cargar archivo HTML
    mainWindow.loadFile('index.html');

    // Ocultar el cursor si está en la ventana
    mainWindow.webContents.on('dom-ready', () => {
        mainWindow.webContents.insertCSS('body { cursor: none; }');
    });

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
