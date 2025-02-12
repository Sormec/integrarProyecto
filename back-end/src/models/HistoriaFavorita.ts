import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Usuario from "./Usuario";
import Historia from "./Historia";

class HistoriaFavorita extends Model {
  public id!: number;
  public historia_id!: number;
  public usuario_id!: number;
  public fecha_favorito!: Date;
}

HistoriaFavorita.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    historia_id: { type: DataTypes.INTEGER, references: { model: Historia, key: "id" } },
    usuario_id: { type: DataTypes.INTEGER, references: { model: Usuario, key: "id" } },
    fecha_favorito: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "HistoriaFavorita", tableName: "tb_historias_favoritas", timestamps: false }
);

Usuario.hasMany(HistoriaFavorita, { foreignKey: "usuario_id" });
Historia.hasMany(HistoriaFavorita, { foreignKey: "historia_id" });

export default HistoriaFavorita;
