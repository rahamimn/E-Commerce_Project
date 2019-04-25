export var E_Commerce_system_logger = require('logger').createLogger('E_Commerce_system_logger.log'); // logs to a file
export var E_Commerce_system_error_logger = require('logger').createLogger('E_Commerce_system_error_logger.log'); // logs to a file

export async function addToRegularLogger(string_func_name, object:Object) {

    E_Commerce_system_logger.info("enteres ", string_func_name," called and recieved:  ", object );
  }


  export async function addToErrorLogger(string_func_name) {

    E_Commerce_system_error_logger.info("error in func: ", string_func_name );

}