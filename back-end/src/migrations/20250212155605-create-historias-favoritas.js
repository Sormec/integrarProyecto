'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    console.log("Migración aplicada: tb_historias_favoritas");
  },

  async down (queryInterface, Sequelize) {
    console.log("Reversión omitida: tb_historias_favoritas");
  }
};
