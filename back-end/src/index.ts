import express from 'express';
import routerPrincipal from './routers/router';
import { ConfigEnv } from './config/constEnv';
import sequelize from './config/database';
import { actualizarHistorias } from "./controller/historias.controller";


const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use('/api', routerPrincipal);

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
setInterval(actualizarHistorias, 60 * 1000); // 1min

