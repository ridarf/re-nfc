const { MSICreator } = require('electron-wix-msi');
const path = require('path');

const appDirectory = path.resolve(__dirname, './dist/ReNFC-win32-x64');
const outputDirectory = path.resolve(__dirname, './installer');

const msiCreator = new MSICreator({
  appDirectory,
  outputDirectory,

  description: "ReNFC allows you to re-map near-field communication device serial numbers.",
  exe: "ReNFC",
  name: "ReNFC - NFC Serial Device Rewriter",
  manufacturer: "Rida F'kih",
  version: "1.0.0",
  appIconPath: path.join(__dirname, "./logo.ico"),

  ui: {
    chooseDirectory: true,
  }
})

msiCreator.create().then(() => msiCreator.compile());