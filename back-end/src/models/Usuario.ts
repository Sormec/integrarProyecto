import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Usuario extends Model {
  public id!: number;
  public nombre!: string;
  public email!: string;
  public password!: string;
  public fecha_creacion!: Date;
}

// export const findUserByEmail = async (email: string) => {
//   const query = 'SELECT * FROM tb_usuario WHERE email = $1';
//   const result = await pool.query(query, [email]);
//   console.log('Resultado de la consulta:', result.rows); // Para depuración
//   return result.rows[0]; // Asegúrate de que devuelve un usuario válido
// };

Usuario.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(100), allowNull: false },
    fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "Usuario", tableName: "tb_usuario", timestamps: false }
);

export default Usuario;
