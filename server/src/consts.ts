
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
export const RUN_LOCAL = true;

//error messages
export const ERR_PARAMS_MSG ='did not received all of the params'
export const ERR_GENERAL_MSG ='Bad request';

//Store state
export const OPEN_STORE = "OPEN STORE";
export const CLOSE_STORE_BY_OWNER = "CLOSE_STORE_BY_OWNER";
export const CLOSE_STORE_BY_ADMIN = "CLOSE_STORE_BY_ADMIN";

//Order state
export const NEW_ORDER = "new-order";
export const ORDER_SUPPLY_APPROVED = "supply-system-approved";
export const ORDER_DONE= "payment-system-approved";
