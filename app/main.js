const autoUpdater = require('electron-updater').autoUpdater;
const electron = require('electron');
const log = require('electron-log');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const isDev = require('electron-is-dev');

const path = require('path');
const url = require('url');
const execFile = require('child_process').execFile;
const os = require('os');

const isWin = /^win/.test(os.platform());
var resoucesDir = isDev ? path.join(__dirname, '..') : path.join(__dirname, '..', '..');
const serverExecFile = path.join(resoucesDir, 'extra', isWin ? 'server.exe' : 'server');

// Logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 500, height: 800});

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: '/localhost:8753/app/index.html',
        protocol: 'http:',
        slashes: true
    }));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

let nagomeExec;

function executeNagome() {
    log.info('Resouce directory: ' + resoucesDir);
    nagomeExec = execFile(serverExecFile, {cwd: resoucesDir},
        (error, stdout, stderr) => {
            if (error) {
                electron.dialog.showErrorBox('Server Error', error + stdout + stderr);
            } else if(stderr != '') {
                electron.dialog.showErrorBox('Server Error', error + stdout + stderr);
            }
        }
    );
}

// autoUpdater
autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
    log.info('Update available.');
});
autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available.');
});
autoUpdater.on('error', (err) => {
    log.info('Error in auto-updater. ' + err);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
    autoUpdater.checkForUpdatesAndNotify();
    executeNagome();
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    nagomeExec.stdin.end();
    nagomeExec = null;

    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
    if (nagomeExec === null) {
        executeNagome();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
