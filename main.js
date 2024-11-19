const { app, BrowserWindow, ipcMain } = require("electron");
const oracledb = require("oracledb");

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: __dirname + "/preload.js",
    },
  });

  mainWindow.loadFile("index.html");
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Lógica para consulta ao Oracle
ipcMain.handle("executarConsulta", async (event, params) => {
  const connectionString = "10.0.0.241:1521/prod";

  try {
    const connection = await oracledb.getConnection({
      user: "INTEGRACAO",
      password: "COAINTEGR2308",
      connectString: connectionString,
    });

    const result = await connection.execute(
      `
      SELECT
        :filial_origem AS FILIAL_ORIGEM,
        :filial_destino AS FILIAL_DESTINO,
        CODI_PSV AS PRODUTO,
        QTDE_INO AS QUANTIDADE
      FROM INOTA
      WHERE NPRE_NOT = (
        SELECT NPRE_NOT FROM NOTA WHERE NOTA_NOT = :n_nota AND CODI_EMP = :filial
      )
      `,
      params,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();

    return result.rows;
  } catch (err) {
    console.error(err);
    throw new Error("Erro ao executar consulta: " + err.message);
  }
});
