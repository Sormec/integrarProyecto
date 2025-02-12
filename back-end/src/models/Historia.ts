import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Usuario from "./Usuario";

class Historia extends Model {
  public id!: number;
  public usuario_id!: number;
  public estado!: string;
  public favorito!: boolean;
  public tipoletra!: string;
  public fondo!: string;
  public texto!: string;
  public colortexto!: string;
  public fecha_publicacion!: Date;
  public video!: string;
  public imagen!: string;
}

Historia.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id: { type: DataTypes.INTEGER, references: { model: Usuario, key: "id" } },
    estado: { type: DataTypes.STRING(10), allowNull: true },
    favorito: { type: DataTypes.BOOLEAN, defaultValue: false },
    tipoletra: { type: DataTypes.STRING(20), allowNull: true },
    fondo: { type: DataTypes.STRING(20), allowNull: true },
    texto: { type: DataTypes.STRING(100), allowNull: true },
    colortexto: { type: DataTypes.STRING(20), allowNull: true },
    fecha_publicacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    video: { type: DataTypes.TEXT, allowNull: true },
    imagen: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, modelName: "Historia", tableName: "tb_historias", timestamps: false }
);

Usuario.hasMany(Historia, { foreignKey: "usuario_id" });
Historia.belongsTo(Usuario, { foreignKey: "usuario_id" });

export default Historia;
