import { Sequelize } from 'sequelize';
import config from '../config/env.js';

export const sequelize = new Sequelize(
  config.DB_DATABASE, // db name
  config.DB_USER, // db username
  config.DB_PASSWORD, // db password
  {
    host: config.DB_HOST,
    dialect: config.DB_DIALECT,
    logging: console.log(),

    dialectOptions:
      config.DB_USE_SSL === 'true'
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false, // para asegurar que la conexi'on sea segura
            },
          }
        : {},
  }
);
