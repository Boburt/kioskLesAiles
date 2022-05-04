"use strict";

const electron = require("electron");
const { Menu } = electron;
const path = require("path");
const os = require("os");
const ElectronPreferences = require("electron-preferences");

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
                label: "Выбрать филиал",
                key: "terminal_id",
                type: "list",
                /**
                 * Optional text to be displayed beneath the field.
                 */
                help: "Филиал ",
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

module.exports = preferences;
