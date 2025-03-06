import {Pool} from 'pg'
import { ConfigEnv } from './constEnv';

const pool = new Pool({
  user: ConfigEnv.db_user,
  host: ConfigEnv.db_host,
  database: ConfigEnv.db_database,
  password: ConfigEnv.db_password,
  port: ConfigEnv.db_port,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error al conectar a la base de datos: ', err.stack);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
  release();
});

export default pool;