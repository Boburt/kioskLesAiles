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
        id: "lists",
        label: "Lists",
        icon: "notes",
        form: {
          groups: [
            {
              label: "Lists",
              fields: [
                {
                  label: "Favorite foods",
                  key: "foods",
                  type: "list",
                  size: 15,
                  help: "A list of your favorite foods",
                  addItemValidator: /^[A-Za-z ]+$/.toString(),
                  addItemLabel: "Add favorite food",
                },
                {
                  label: "Best places to visit",
                  key: "places",
                  type: "list",
                  size: 10,
                  style: {
                    width: "75%",
                  },
                  help: "An ordered list of nice places to visit",
                  orderable: true,
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
