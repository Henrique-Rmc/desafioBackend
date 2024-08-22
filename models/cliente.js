'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cliente extends Model {
    static associate(models) {
      Cliente.hasMany(models.Mensagem, { foreignKey: 'pagadorId', as: 'mensagensComoPagador' });
      
      Cliente.hasMany(models.Mensagem, { foreignKey: 'recebedorId', as: 'mensagensComoRecebedor' });
    }
  }

  Cliente.init({
    nome: DataTypes.STRING,
    cpfCnpj: DataTypes.STRING,
    ispb: DataTypes.STRING,
    agencia: DataTypes.STRING,
    contaTransacional: DataTypes.STRING,
    tipoConta: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Cliente', 
    tableName: 'Clientes',
  });

  return Cliente;
};
