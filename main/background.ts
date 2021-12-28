import { app, autoUpdater, dialog } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
require("update-electron-app")();

const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
  const server = "https://github.com/Boburt/kioskLesAiles";
  const url = `${server}/update/${process.platform}/${app.getVersion()}`;

  autoUpdater.setFeedURL({ url });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
    mainWindow.maximize();
    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, 60000);
    autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
      const dialogOpts = {
        type: "info",
        buttons: ["Restart", "Later"],
        title: "Application Update",
        message: process.platform === "win32" ? releaseNotes : releaseName,
        detail:
          "A new version has been downloaded. Restart the application to apply the updates.",
      };

      dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
      });
    });
    autoUpdater.on("error", (message) => {
      console.error("There was a problem updating the application");
      console.error(message);
    });
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});
