import {
  screen,
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
} from "electron";
import Store from "electron-store";
const ElectronPreferences = require("electron-preferences");
const path = require("path");

const remoteMain = require("@electron/remote/main");
remoteMain.initialize();

export default (
  windowName: string,
  options: BrowserWindowConstructorOptions
): BrowserWindow => {
  const key = "window-state";
  const name = `window-state-${windowName}`;
  const store = new Store({ name });
  const defaultSize = {
    width: options.width,
    height: options.height,
  };
  let state = {};
  let win: any;

  const restore = () => store.get(key, defaultSize);

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

  const getCurrentPosition = () => {
    const position = win.getPosition();
    const size = win.getSize();
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    };
  };

  const windowWithinBounds = (windowState: any, bounds: any) => {
    return (
      windowState.x >= bounds.x &&
      windowState.y >= bounds.y &&
      windowState.x + windowState.width <= bounds.x + bounds.width &&
      windowState.y + windowState.height <= bounds.y + bounds.height
    );
  };

  const resetToDefaults = () => {
    const bounds = screen.getPrimaryDisplay().bounds;
    return Object.assign({}, defaultSize, {
      x: (bounds.width - defaultSize!.width!) / 2,
      y: (bounds.height - defaultSize!.height!) / 2,
    });
  };

  const ensureVisibleOnSomeDisplay = (windowState: any) => {
    const visible = screen.getAllDisplays().some((display) => {
      return windowWithinBounds(windowState, display.bounds);
    });
    if (!visible) {
      // Window is partially or fully not visible now.
      // Reset it to safe defaults.
      return resetToDefaults();
    }
    return windowState;
  };

  const saveState = () => {
    if (!win.isMinimized() && !win.isMaximized()) {
      Object.assign(state, getCurrentPosition());
    }
    store.set(key, state);
  };

  state = ensureVisibleOnSomeDisplay(restore());

  const browserOptions: BrowserWindowConstructorOptions = {
    ...options,
    ...state,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      ...options.webPreferences,
    },
  };

  console.log(browserOptions);
  win = new BrowserWindow(browserOptions);
  remoteMain.enable(win.webContents);

  // win.loadFile(path.join(__dirname, "index.html"));
  win.on("close", saveState);

  return win;
};
