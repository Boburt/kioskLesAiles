import { app, autoUpdater, dialog } from "electron";
import serve from "electron-serve";
import { writeFile } from "fs";
import { createWindow } from "./helpers";
import fetch from "node-fetch";
import path from "path";
require("dotenv").config();
require("update-electron-app")();
const ElectronPreferences = require("electron-preferences");

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
  try {
    const langPromise = ["ru", "uz"].map(async (lang: string) => {
      const res = await fetch(
        `${process.env.API_URL}/api/get_langs?lang=${lang}`
      );
      const { result } = await res.json();
      console.log(result);
      // async write result to file
      const file = path.join(__dirname, `../i18n/${lang}.json`);
      const data = JSON.stringify(result);
      writeFile(file, data, (err) => {
        if (err) {
          throw err;
        }
      });
    });

    const preferences = new ElectronPreferences({
      /**
       * Where should preferences be saved?
       */
      dataStore: path.resolve(app.getPath("userData"), "preferences.json"),
      /**
       * Default values.
       */
      defaults: {},
      sections: [
        {
          id: "main",
          label: "Главные настройки",
          /**
           * See the list of available icons below.
           */
          icon: "settings-gear-63",
          form: {
            groups: [
              {
                /**
                 * Group heading is optional.
                 */
                label: "Настройки",
                fields: [
                  {
                    label: "Путь к order.txt",
                    key: "file_path",
                    type: "text",
                    /**
                     * Optional text to be displayed beneath the field.
                     */
                    help: "Укажите путь к файлу order.txt",
                  },
                ],
              },
            ],
          },
        },
      ],
      browserWindowOpts: {
        title: "Настройки",
        width: 900,
        maxWidth: 1000,
        height: 700,
        maxHeight: 1000,
        resizable: true,
        maximizable: false,
        //...
      },
    });

    await Promise.all(langPromise);
  } catch (error) {
    console.log(error);
  }
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    frame: false,
    fullscreen: isProd,
    autoHideMenuBar: isProd,
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
