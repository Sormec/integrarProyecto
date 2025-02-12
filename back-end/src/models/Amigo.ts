import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Usuario from "./Usuario";

class Amigo extends Model {
  public id!: number;
  public usuario_id!: number;
  public amigo_id!: number;
  public fecha_creacion!: Date;
}

Amigo.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: { type: DataTypes.INTEGER, references: { model: Usuario, key: "id" } },
    amigo_id: { type: DataTypes.INTEGER, references: { model: Usuario, key: "id" } },
    fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "Amigo", tableName: "tb_amigos", timestamps: false }
);

Usuario.hasMany(Amigo, { foreignKey: "usuario_id" });
Usuario.hasMany(Amigo, { foreignKey: "amigo_id" });

export default Amigo;
