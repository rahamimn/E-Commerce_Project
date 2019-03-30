const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

export const {DB_HOST, DB_NAME , DB_USER, DB_PASSWORD, DB_TEST_NAME}  = process.env;

export const STORE_OWNER = 'store-owner';
export const STORE_MANAGER = 'store-manager';
export const ADMIN = 'admin';