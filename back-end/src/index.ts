import express from 'express';
import routerPrincipal from './routers/router';
import { ConfigEnv } from './config/constEnv';
import sequelize from './config/database';
import { actualizarHistorias } from "./controller/historias.controller";
import cors from "cors";
import path from "path";


const app = express();

// Configurar CORS correctamente
app.use(cors({
  origin: "http://localhost:3000", // Reemplázalo con la URL del frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use('/api', routerPrincipal);
const PORT = ConfigEnv.port;

// Sincronizar la BD
const conectarDB = async () => {
  try {
    await sequelize.sync({ force: false }) // `force: true` elimina y recrea las tablas en cada reinicio
    console.log("Base de datos sincronizada");
  
  } catch (error) {
    console.error("Error al sincronizar:", error);
  }
};

// Iniciar servidor
const iniciarServidor = () => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}/api`);
  });
};

// Ejecutar funciones
conectarDB().then(iniciarServidor);

// Cambiar el estado de las historias a inactivo después de 24 horas
// setInterval(actualizarHistorias, 60 * 1000); // 1min

// Servir archivos estáticos para su visualización en el Navegador desde la carpeta 'imágenesGuardadas'
app.use("/api/imagenesGuardadas", express.static(path.join(__dirname, "imagenesGuardadas")));
