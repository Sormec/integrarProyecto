import pool from '../config/conexion';

export interface IUser {
  id: number;
  nombre: string;
  email: string;
  password: string;
  fecha_creacion: Date;
}

export const findUserByEmail = async (email: string) => {
  const query = 'SELECT * FROM tb_usuario WHERE email = $1';
  const result = await pool.query(query, [email]);
  console.log('Resultado de la consulta:', result.rows); // Para depuración
  return result.rows[0]; // Asegúrate de que devuelve un usuario válido
};

