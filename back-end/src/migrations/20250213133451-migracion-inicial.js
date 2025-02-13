'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Crea las tablas en la base de datos con Primary key y sus relaciones
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("tb_usuario", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(100), allowNull: false },
      fecha_creacion: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    await queryInterface.createTable("tb_historias", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      usuario_id: { type: Sequelize.INTEGER, references: { model: "tb_usuario", key: "id" }, onDelete: "CASCADE" },
      estado: { type: Sequelize.STRING(10) },
      favorito: { type: Sequelize.BOOLEAN, defaultValue: false },
      tipoletra: { type: Sequelize.STRING(20) },
      fondo: { type: Sequelize.STRING(20) },
      texto: { type: Sequelize.STRING(100) },
      colortexto: { type: Sequelize.STRING(20) },
      fecha_publicacion: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      video: { type: Sequelize.TEXT },
      imagen: { type: Sequelize.TEXT },
    });

    await queryInterface.createTable("tb_amigos", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      usuario_id: { type: Sequelize.INTEGER, references: { model: "tb_usuario", key: "id" }, onDelete: "CASCADE" },
      amigo_id: { type: Sequelize.INTEGER, references: { model: "tb_usuario", key: "id" }, onDelete: "CASCADE" },
      fecha_creacion: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    await queryInterface.createTable("tb_solicitudes_amigos", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      usuario_id: { type: Sequelize.INTEGER, references: { model: "tb_usuario", key: "id" }, onDelete: "CASCADE" },
      amigo_id: { type: Sequelize.INTEGER, references: { model: "tb_usuario", key: "id" }, onDelete: "CASCADE" },
      estado: { type: Sequelize.STRING(20), defaultValue: "pendiente" },
      fecha_creacion: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    await queryInterface.createTable("tb_historias_favoritas", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      historia_id: { type: Sequelize.INTEGER, references: { model: "tb_historias", key: "id" }, onDelete: "CASCADE" },
      usuario_id: { type: Sequelize.INTEGER, references: { model: "tb_usuario", key: "id" }, onDelete: "CASCADE" },
      fecha_favorito: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  // Elimina las tablas de la base de datos
  async down (queryInterface) {
    await queryInterface.dropTable("tb_historias_favoritas");
    await queryInterface.dropTable("tb_solicitudes_amigos");
    await queryInterface.dropTable("tb_amigos");
    await queryInterface.dropTable("tb_historias");
    await queryInterface.dropTable("tb_usuario");
  }
};
