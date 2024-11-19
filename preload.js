const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  executarConsulta: (params) => ipcRenderer.invoke("executarConsulta", params),
});
