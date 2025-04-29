const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const { execFile } = require("child_process");



let pythonProcess = null;

// function getBackendPath() {
//   const isPackaged = app.isPackaged; // Kiểm tra ứng dụng đã đóng gói hay chưa
//   const backendPath = isPackaged
//     ? path.join(
//         process.resourcesPath,
//         "app",
//         "backend",
//         "dist",
//         "backend",
//         "backend.exe"
//       ) // Đường dẫn khi đóng gói
//     : path.join(
//         __dirname,
//         "backend",
//         "dist",
//         "backend",
//         "backend.exe"
//       ); // Đường dẫn khi phát triển
//   return backendPath;
// }
// function getBackendPath() {
//   const isPackaged = app.isPackaged; // Kiểm tra ứng dụng đã đóng gói hay chưa
//   const backendPath = isPackaged
//     ? path.join(process.resourcesPath, "backend.exe") // Đường dẫn khi đóng gói
//     : path.join(__dirname, "backend", "backend.exe"); // Đường dẫn khi phát triển
//   return backendPath;
// }
// function runPythonBackend() {
//   const pythonExePath = getBackendPath();
//   const backendCwd = path.dirname(pythonExePath);

//   pythonProcess = execFile(
//     pythonExePath,
//     { cwd: backendCwd },
//     (error, stdout, stderr) => {
//       if (error) {
//         console.error("Failed to run backend.exe:", error);
//         return;
//       }
//       if (stderr) {
//         console.error("Python stderr:", stderr);
//       }
//       console.log("Python stdout:", stdout);
//     }
//   );

//   pythonProcess.on("close", (code) => {
//     console.log(`Python process exited with code ${code}`);
//     pythonProcess = null;
//   });
//   return pythonProcess; // Trả về tiến trình để quản lý
// }

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    // width: 1300,
    // height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "javascript", "preload.js"), // preload file cho index.html
    },
  });

  mainWindow.maximize();

  // ===== Intro =====
  mainWindow
    .loadFile(path.join(__dirname, "view", "intro.html"))
    .catch((err) => {
      console.error("Failed to load intro.html:", err);
    });

  mainWindow.webContents.on("did-finish-load", () => {
    const currentURL = mainWindow.webContents.getURL();
    if (currentURL.includes("intro.html")) {
      // console.log(runPythonBackend());
      setTimeout(() => {
        mainWindow.loadFile(path.join(__dirname, "index.html")).catch((err) => {
          console.error("Failed to load index.html:", err);
        });
      }, 3000);
    }
  });
  // Loại bỏ thanh menu
  // Menu.setApplicationMenu(null);
  // Dọn dẹp khi cửa sổ đóng
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
// ================= Create Window Crop =================
ipcMain.on("open-crop", () => {
  // Tạo cửa sổ settings
  const settingsWindow = new BrowserWindow({
    width: 830,
    height: 740,
    parent: mainWindow, // Đặt parent là mainWindow
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, "javascript", "preload.js"), // preload file cho setting.html
    },
  });

  settingsWindow
    .loadFile("./view/crop.html")
    .catch((err) => console.error("Failed to load setting.html:", err));

  // Loại bỏ thanh menu
  // Menu.setApplicationMenu(null);
});
// ================= Create Window Setting =================
ipcMain.on("open-settings", () => {
  // Tạo cửa sổ settings
  const settingsWindow = new BrowserWindow({
    width: 830,
    height: 740,
    parent: mainWindow, // Đặt parent là mainWindow
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, "javascript", "preload.js"), // preload file cho setting.html
    },
  });

  settingsWindow
    .loadFile("./view/setting.html")
    .catch((err) => console.error("Failed to load setting.html:", err));

  // Loại bỏ thanh menu
  // Menu.setApplicationMenu(null);
});
// ================= Create Window Model =================
ipcMain.on("open-model", () => {
  const modelWindow = new BrowserWindow({
    width: 830,
    height: 740,
    parent: mainWindow,
    model: true,
    webPreferences: {
      preload: path.join(__dirname, "javascript", "preload.js"),
    },
  });
  modelWindow
    .loadFile("./view/model.html")
    .catch((err) => console.error("Failded to load model.html:", err));

  // Loại bỏ thanh menu
  // Menu.setApplicationMenu(null);
  // Khi đóng cửa sổ model, gửi tính hiệu đến index.js
  modelWindow.on("closed", () => {
    mainWindow.webContents.send("model-closed");
  });
});
app.whenReady().then(() => {
  // runPythonBackend();
  createWindow();
});
app.on("quit", () => {
  if (pythonProcess) {
    console.log("Terminating backend process....");
    pythonProcess.kill();
    pythonProcess = null;
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
