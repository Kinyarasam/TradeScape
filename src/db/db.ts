import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// Determine environment: default to 'development'
const environment = process.env.NODE_ENV || 'development';
const knexConfig = require('../../knexfile')[environment];

const db = knex(knexConfig);

export default db;
