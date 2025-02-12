import dotenv from 'dotenv'

dotenv.config()

export const ConfigEnv ={
  port: Number(process.env.PORT) || 3636,
  db_user: process.env.DB_USER || "postgres",
  db_host: process.env.DB_HOST|| "localhost",
  db_database: process.env.DB_DATABASE || "practicaspp",
  db_password: process.env.DB_PASSWORD || "a54321",
  db_port: Number(process.env.DB_PORT) || 5432,
  secret_key: process.env.SECRET_KEY || 'defaultsecretkey',

}