import dotenv from 'dotenv'

dotenv.config()

export const ConfigEnv ={
  port: process.env.PORT || 3636,
  db_user:process.env.DB_USER,
  db_host:process.env.DB_HOST,
  db_database:process.env.DB_DATABASE,
  db_password:process.env.DB_PASSWORD,
  db_port:process.env.DB_PORT || 5432,
  secret_key: process.env.SECRET_KEY || 'defaultsecretkey',

}