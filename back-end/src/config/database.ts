import { Sequelize } from "sequelize";
import { ConfigEnv } from "./constEnv";

const sequelize = new Sequelize(
  ConfigEnv.db_database,
  ConfigEnv.db_user,
  ConfigEnv.db_password,
  {
    host: ConfigEnv.db_host,
    dialect: "postgres",
    port: ConfigEnv.db_port,
    logging: false, // Desactiva logs de SQL en consola
  }
);

// Verificar conexión a la base de datos
sequelize
  .authenticate()
  .then(() => console.log("Conexión exitosa a la base de datos"))
  .catch((error) => console.error("ERROR al conectar a la base de datos:", error));

export default sequelize;
