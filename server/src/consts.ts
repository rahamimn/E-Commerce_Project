
//names
export const STORE_OWNER = 'store-owner';
export const STORE_MANAGER = 'store-manager';
export const ADMIN = 'admin';

//code status
export const OK_STATUS = 0;
export const BAD_REQUEST = -1;
export const MISSING_PARAMETERS = -2;
export const BAD_ACCESS_NO_VISITORS = -3;
export const BAD_ACCESS_NOT_USER = -4;

export const USER_EXIST = -101;
export const BAD_PASSWORD = -102;
export const BAD_USERNAME = -103;

export const BAD_PAYMENT = -101;
export const SUPPLY_PROBLEM = -102;

// flags
export const CREATE_SCHEMA = false;
export const RUN_LOCAL = true;

//error messages
export const ERR_PARAMS_MSG ='did not received all of the params'
export const ERR_GENERAL_MSG ='Bad request';
export const ERR_Access_MSG ='Bad access attempt - it is a restricted zone';
export const ERR_PAYMENT_MSG ='Bad credit card details, please call your bank';
export const ERR_SUPPLY_MSG ='we have problems with our supply system, dont worry, we didnt took your money';

//Store state
export const OPEN_STORE = "OPEN STORE";
export const CLOSE_STORE_BY_OWNER = "CLOSE_STORE_BY_OWNER";
export const CLOSE_STORE_BY_ADMIN = "CLOSE_STORE_BY_ADMIN";

//Cart state
export const NORMAL_CART = "normal-cart";
export const ORDER_SUPPLY_APPROVED = "supply-system-approved";

//Permissions 
export const APPOINT_STORE_MANAGER = "appoint-store-manager"; //done
export const ADD_PRODUCT_PERMISSION = "add-product";
export const REMOVE_PRODUCT_PERMISSION = "remove-product";
export const UPDATE_PRODUCT_PERMISSION = "update-product";
export const REMOVE_ROLE_PERMISSION = "remove-role";
export const WATCH_WORKERS_PERMISSION = "watch-workers";
export const GET_STORE_MESSAGE_PERMISSION = "get-store-message";
export const SEND_STORE_MESSAGE_PERMISSION = "send-store-message";
export const EMPTY_PERMISSION = " ";


//Product error messages
export const BAD_PRICE = "Price cannot be a negative number";
export const BAD_AMOUNT = "Amount cannot be a negative number";
export const BAD_STORE_ID = "The current ID does not match any active store";
export const BAD_USER_ID = "The current ID does not match any active user";





