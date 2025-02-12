import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Usuario from "./Usuario";

class SolicitudAmistad extends Model {
  public id!: number;
  public usuario_id!: number;
  public amigo_id!: number;
  public estado!: string;
  public fecha_creacion!: Date;
}

SolicitudAmistad.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: { type: DataTypes.INTEGER, references: { model: Usuario, key: "id" } },
    amigo_id: { type: DataTypes.INTEGER, references: { model: Usuario, key: "id" } },
    estado: { type: DataTypes.STRING(20), defaultValue: "pendiente" },
    fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "SolicitudAmistad", tableName: "tb_solicitudes_amigos", timestamps: false }
);

Usuario.hasMany(SolicitudAmistad, { foreignKey: "usuario_id" });
Usuario.hasMany(SolicitudAmistad, { foreignKey: "amigo_id" });

export default SolicitudAmistad;
