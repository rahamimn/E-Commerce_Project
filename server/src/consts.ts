
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
export const CONNECTION_LOST = -5;

export const USER_EXIST = -101;
export const BAD_PASSWORD = -102;
export const BAD_USERNAME = -103;

export const BAD_PAYMENT = -101;
export const BAD_SUPPLY = -102;

export const ERR_PAYMENT_SYSTEM = -103;
export const ERR_SUPPLY_SYSTEM = -104;
export const ERR_INVENTORY_PROBLEM = -105;

export const ERR_STORE_PROBLEM = -101;


// flags
export const CREATE_SCHEMA = false;
export const RUN_LOCAL = true;

//error messages
export const ERR_PARAMS_MSG ='did not received all of the params'
export const ERR_GENERAL_MSG ='Bad request';
export const ERR_Access_MSG ='Bad access attempt - it is a restricted zone';

export const ERR_PAYMENT_MSG ='Payment System problem - ,check your details again, and perhaps you should call your bank';
export const ERR_SUPPLY_MSG ='Supply System problem -maybe your address not supported, dont worry, we didnt took your money';
export const ERR_INVENTORY_MSG ='seller doesnt have enough items in inventory';


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
export const MANAGE_SALES_PERMISSION = "manage-sales";
export const MANAGE_PURCHASE_POLICY_PERMISSION = "manage-purchase-policy";
export const EMPTY_PERMISSION = " ";


//Product error messages
export const BAD_PRICE = "Price cannot be a negative number";
export const BAD_AMOUNT = "Amount cannot be a negative number";
export const BAD_STORE_ID = "The current ID does not match any active store";
export const BAD_USER_ID = "The current ID does not match any active user";


//Purchase and Discounts consts
export const PTYPE_COMPLEX = "complex";
export const PTYPE_SIMPLE_MAX_PRODUCT = "simple-max-product-amount";
export const PTYPE_SIMPLE_MAX_PRODUCTS = "simple-max-products-amount";
export const PTYPE_SIMPLE_MIN_PRODUCT = "simple-min-product-amount";
export const DTYPE_SIMPLE_DISCOUNT_PRECENTAGE = "discountPercentage";
export const DTYPE_SIMPLE_DISCOUNT_OPO = "discountOnePlusOne";


