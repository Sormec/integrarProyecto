'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    console.log("Migración aplicada: tb_solicitudes_amigos");
  },

  async down (queryInterface, Sequelize) {
    console.log("Reversión omitida: tb_solicitudes_amigos");
  }
};
