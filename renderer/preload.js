"use strict";

const electron = require("electron");
const { contextBridge } = electron;
const { ipcRenderer } = electron;
const fs = require("fs");
const path = require("path");

let onPreferencesChangedHandler = () => {};

contextBridge.exposeInMainWorld("api", {
  showPreferences: () => {
    ipcRenderer.send("showPreferences");
  },
  getPreferences: () => ipcRenderer.sendSync("getPreferences"),
  onPreferencesChanged: (handler) => {
    onPreferencesChangedHandler = handler;
  },
  readFileData: (filePath) => {
    return fs.readFileSync(filePath, "utf8");
    // return ipcRenderer.sendSync("readFileData", filePath);
  },
});

ipcRenderer.on("preferencesUpdated", (e, preferences) => {
  onPreferencesChangedHandler(preferences);
});

console.log("Preloaded");
