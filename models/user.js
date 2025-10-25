'use strict';
// 1. Importamos bcryptjs (el nombre corregido)
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  
  const User = sequelize.define('User', {
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    
    // --- 2. HOOKS DE SEQUELIZE ---
    // Usamos el hook 'beforeCreate' para que se ejecute
    // justo antes de que un nuevo usuario sea insertado en la DB.
    hooks: {
      beforeCreate: async (user) => {
        // Hasheamos la contraseña
        const salt = await bcrypt.genSalt(10); // Genera un 'salt'
        user.password = await bcrypt.hash(user.password, salt); // Aplica el hash
      }
    }
  });

  // --- 3. MÉTODO PARA OCULTAR LA CONTRASEÑA ---
  // Sobrescribimos el método 'toJSON'
  // Este método es llamado automáticamente por Express
  // cada vez que el objeto 'User' se va a convertir a JSON (ej. en un res.json())
  User.prototype.toJSON = function () {
    // 'this.get()' obtiene una copia plana del objeto User
    const values = { ...this.get() };

    // Eliminamos el campo 'password' de la copia
    delete values.password;
    
    // Devolvemos la copia sin la contraseña
    return values;
  }

  return User;
};