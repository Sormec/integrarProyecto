'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    //No se crea la tabla porque ya existe
    console.log("Migración aplicada: tb_historias");
  },

  async down (queryInterface, Sequelize) {
    // No eliminamos la tabla para no perder datos
    console.log("Reversión omitida: tb_historias");
  }
};
