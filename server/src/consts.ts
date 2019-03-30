const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// export const {DB_HOST, DB_NAME , DB_USER, DB_PASSWORD, DB_TEST_NAME}  = process.env;

//names
export const STORE_OWNER = 'store-owner';
export const STORE_MANAGER = 'store-manager';
export const ADMIN = 'admin';

//code status
export const OK_STATUS = 0;
export const BAD_REQUEST = -1;
export const MISSING_PARAMETERS = -1;
export const USER_EXIST = 1;
export const BAD_PASSWORD = 2;
export const BAD_USERNAME = 1;

// flags
export const CREATE_SCHEMA = false;

//error messages
export const ERR_PARAMS_MSG ='did not received all of the params'