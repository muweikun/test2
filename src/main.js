// main.js

let sub_id = 0;
// electron 模块可以用来控制应用的生命周期和创建原生浏览窗口
const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path')

const { dialog } = require('electron');

const createWindow = () => {
  // 创建浏览窗口
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 1080,
    minHeight: 720,
    icon: './assets/img/icon.png',
    autoHideMenuBar: true,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, './preload.js'),
    }
  });

  ipcMain.on('close-app', function () {
    mainWindow.close();
  });

  ipcMain.on('minus-app', function () {
    mainWindow.minimize();
  });

  ipcMain.on('resize-app', function () {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    }
    else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('top-app', function () {
    mainWindow.setAlwaysOnTop(true);
  });

  ipcMain.on('untop-app', function () {
    mainWindow.setAlwaysOnTop(false);
  });

  ipcMain.on('com-send', function (e, arg) {
    // console.log('main : ' + arg);
    mainWindow.webContents.send('com-send', arg);
  });

  ipcMain.on('open-directory-dialog', function (event, p) {
    dialog.showOpenDialog({
      title : p.title,
      properties: [p.option]
    }).then((result) => {
      // console.log(result);
      if(!result.canceled && result.filePaths.length > 0) mainWindow.webContents.send(p.listen_to, result.filePaths[0]);
    });
  });

  // 加载 index.html
  mainWindow.loadFile('./assets/index.html')

  // 打开开发工具
  mainWindow.webContents.openDevTools({mode:'detach'});

  mainWindow.webContents.setFrameRate(60);

  ipcMain.on('openWindow', (e, arg) => {
    let childWin = new BrowserWindow({
      width: 960,
      height: 600,
      minWidth: 960,
      minHeight: 600,
      icon: './assets/img/icon.png',
      autoHideMenuBar: true,
      show: false,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, './preload.js'),
      }
    });

    

    childWin.loadFile('./assets/sub.html');
    childWin.on('ready-to-show', function () {
      // childWin.webContents.openDevTools()
      arg.initialize.id = sub_id;
      sub_id++;
      childWin.webContents.send('initialize', arg.initialize); // 发送消息
      childWin.webContents.setFrameRate(60);
      childWin.show() // 初始化后再显示
    });

    let onCom = (e, arg) => {
      !childWin.isDestroyed() && childWin.webContents.send('com', arg);
    };
    ipcMain.on('com', onCom);

    childWin.on('closed' + sub_id, function () {
      ipcMain.off('com', onCom);
    });

    ipcMain.on('close-app' + sub_id, function () {
      childWin.close();
    });

    ipcMain.on('minus-app' + sub_id, function () {
      childWin.minimize();
    });

    ipcMain.on('resize-app' + sub_id, function () {
      if (childWin.isMaximized()) {
        childWin.restore();
      }
      else {
        childWin.maximize();
      }
    });

    ipcMain.on('top-app' + sub_id, function () {
      childWin.setAlwaysOnTop(true, "status");
    });

    ipcMain.on('untop-app' + sub_id, function () {
      childWin.setAlwaysOnTop(false);
    });

    mainWindow.on('closed', function () {
      !childWin.isDestroyed() && childWin.close()
    })

    // childWin.on("closed", () => {
    //   // 在窗口对象被关闭时，取消订阅所有与该窗口相关的事件
    //   childWin.removeAllListeners();
    //   ipcMain.removeListener();
    //   childWin= null;
    // });

  });

  ipcMain.on('openGraph', (e, arg) => {
    let childWin = new BrowserWindow({
      width: 960,
      height: 600,
      minWidth: 960,
      minHeight: 600,
      icon: './assets/img/icon.png',
      autoHideMenuBar: true,
      show: false,
      // frame: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: path.join(__dirname, './preload.js'),
      }
    });

    

    childWin.loadFile('./assets/graph.html');
    childWin.on('ready-to-show', function () {
      // childWin.webContents.openDevTools()
      arg.initialize.id = sub_id;
      sub_id++;
      childWin.webContents.send('initialize', arg.initialize); // 发送消息
      childWin.maximize()
      childWin.show() // 初始化后再显示
    });

    mainWindow.on('closed', function () {
      !childWin.isDestroyed() && childWin.close()
    })

    // childWin.on("closed", () => {
    //   // 在窗口对象被关闭时，取消订阅所有与该窗口相关的事件
    //   childWin.removeAllListeners();
    //   ipcMain.removeListener();
    //   childWin= null;
    // });

  });
  

  mainWindow.on('ready-to-show', function () {
    mainWindow.maximize();
    mainWindow.show();
  });



}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  app.allowRendererProcessReuse = false

  createWindow()

  app.on('activate', () => {
    // 在 macOS 系统内, 如果没有已开启的应用窗口
    // 点击托盘图标时通常会重新创建一个新窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})



// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
// 对应用程序和它们的菜单栏来说应该时刻保持激活状态, 
// 直到用户使用 Cmd + Q 明确退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 在当前文件中你可以引入所有的主进程代码
// 也可以拆分成几个文件，然后用 require 导入。