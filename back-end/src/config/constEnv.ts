import dotenv from 'dotenv'

dotenv.config()

export const ConfigEnv ={
  port: Number(process.env.PORT) || 3306, // Puerto donde recibe las solicitudes el Backend
  db_user: process.env.DB_USER || "postgres", // Usuario dueño de la Base de datos que se usará
  db_host: process.env.DB_HOST|| "localhost", // Cuando el servidor no esta en local, se usa la IP
  db_database: process.env.DB_DATABASE || "practicaspp", // Nombre de la Base de datos
  db_password: process.env.DB_PASSWORD || "a54321", // Contraseña de la Base de datos
  db_port: Number(process.env.DB_PORT) || 5432, // Puerto de conexión a la Base de datos
  secret_key: process.env.SECRET_KEY || 'defaultsecretkey',

}