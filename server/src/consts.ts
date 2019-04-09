
//names
export const STORE_OWNER = 'store-owner';
export const STORE_MANAGER = 'store-manager';
export const ADMIN = 'admin';

//code status
export const OK_STATUS = 0;
export const BAD_REQUEST = -1;
export const MISSING_PARAMETERS = -2;
export const USER_EXIST = -3;
export const BAD_PASSWORD = -4;
export const BAD_USERNAME = -5;

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

//Permissions 
export const APPOINT_STORE_MANAGER = "appoint-store-manager"; //done
export const ADD_PRODUCT_PERMOSSION = "add-product";
export const REMOVE_PRODUCT_PERMOSSION = "remove-product";
export const UPDATE_PRODUCT_PERMOSSION = "update-product";
export const REMOVE_ROLE_PERMOSSION = "remove-role";
export const GET_STORE_MESSAGE_PERMOSSION = "get-store-message";
export const SEND_STORE_MESSAGE_PERMOSSION = "send-store-message";

