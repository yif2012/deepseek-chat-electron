const { app, BrowserWindow, net, ipcMain, protocol, shell, Notification } = require('electron');
const fs = require('fs');
const path = require('node:path');
const { pathToFileURL } = require('url');

// 注册自定义协议，用于加载本地资源
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true, // 允许使用标准 API
      secure: true, // 启用安全特性
      supportFetchAPI: true, // 支持 fetch API
    },
  },
]);

// 获取 APP_KEY 文件的路径
// 开发环境：使用项目目录下的文件
// 生产环境：使用用户数据目录下的文件
function getAppKeyPath() {
  if (app.isPackaged) {
    return path.join(app.getPath('userData'), 'APP_KEY');
  }
  return path.join(__dirname, './APP_KEY');
}

// 确保 APP_KEY 文件存在
// 如果文件不存在，则创建一个空文件
function ensureAppKeyFile() {
  const appKeyPath = getAppKeyPath();
  if (!fs.existsSync(appKeyPath)) {
    try {
      fs.writeFileSync(appKeyPath, '');
    } catch (error) {
      console.error('Failed to create APP_KEY file:', error);
    }
  }
}

// 创建主窗口
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true, // 隐藏菜单栏
    frame: false, // 无边框窗口
    titleBarStyle: 'hidden', // 隐藏标题栏
    webPreferences: {
      nodeIntegration: false, // 禁用 Node.js 集成
      contextIsolation: true, // 启用上下文隔离
      preload: path.join(__dirname, 'preload.js'), // 预加载脚本
      webSecurity: true, // 启用 Web 安全特性
    },
  });

  // 处理自定义协议的请求
  protocol.handle('app', (req) => {
    const { host, pathname } = new URL(req.url);
    if (host === 'bundle') {
      // 处理根路径请求，返回 index.html
      if (pathname === '/') {
        return new Response(fs.readFileSync(path.join(__dirname, '../dist/index.html')), {
          headers: { 'content-type': 'text/html' },
        });
      }

      // 处理其他静态资源请求
      const pathToServe = path.resolve(__dirname, `../dist/${pathname}`);
      const relativePath = path.relative(__dirname, pathToServe);
      console.log(pathname, pathToServe, relativePath);
      console.log('relativePath.startsWith(..)', relativePath.startsWith('..'));
      console.log('path.isAbsolute(relativePath)', path.isAbsolute(relativePath));

      return net.fetch(pathToFileURL(pathToServe).toString());
    }
  });

  let url = 'http://localhost:5173';
  // 根据环境选择加载的 URL
  if (app.isPackaged) {
    url = 'app://bundle/';
  } else {
    win.webContents.openDevTools();
  }

  win.loadURL(url);

  // 处理新窗口打开请求
  win.webContents.setWindowOpenHandler(({ url }) => {
    // 只允许打开 http(s) 链接，并使用系统默认浏览器打开
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' }; // 阻止在应用内打开新窗口
  });
}

// 应用程序准备就绪时的处理
app.whenReady().then(() => {
  ensureAppKeyFile();
  createWindow();
});

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  app.quit();
});

// 处理获取 API Key 的请求
ipcMain.handle('get-app-key', () => {
  try {
    return fs.readFileSync(getAppKeyPath(), 'utf-8');
  } catch (error) {
    console.error('Failed to read APP_KEY:', error);
    return '';
  }
});

// 处理窗口置顶的请求
ipcMain.handle('toggle-pin-window', (event, shouldPin) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.setAlwaysOnTop(shouldPin);
    return shouldPin;
  }
  return false;
});

// 处理复制消息的请求，显示系统通知
ipcMain.handle('copy-message', (event, message) => {
  new Notification({
    title: '复制成功',
    body: message,
  }).show();
});

// 处理编辑 API Key 的请求
ipcMain.handle('edit-app-key', (event, appKey) => {
  try {
    fs.writeFileSync(getAppKeyPath(), appKey);
    return appKey;
  } catch (error) {
    console.error('Failed to write APP_KEY:', error);
    return '';
  }
});
