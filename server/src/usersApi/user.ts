
export class User {

    constructor(base) {
        this._id = base._id;
        this._userName = base.userName;
        this._salt = base.salt;
        this._firstName = base.firstName;
        this._lastName = base.lastName;
        this._email = base.email;
        this._isDeactivated = base.isDeactivated;
        this._roles = base.roles;
        this._carts = base.carts;
        this._notifications = base.notifications;
        this._messages = base.messages;
    }

    /**
     * Getter id
     * @return {Number}
     */
	public get id(): Number {
		return this._id;
	}

    /**
     * Getter userName
     * @return {  String}
     */
	public get userName():   String {
		return this._userName;
	}

    /**
     * Getter password
     * @return {  String}
     */
	public get password():   String {
		return this._password;
	}

    /**
     * Getter salt
     * @return {String}
     */
	public get salt(): String {
		return this._salt;
	}

    /**
     * Getter firstName
     * @return { String}
     */
	public get firstName():  String {
		return this._firstName;
	}

    /**
     * Getter lastName
     * @return { String}
     */
	public get lastName():  String {
		return this._lastName;
	}

    /**
     * Getter email
     * @return {String}
     */
	public get email(): String {
		return this._email;
	}

    /**
     * Getter isDeactivated
     * @return {Boolean}
     */
	public get isDeactivated(): Boolean {
		return this._isDeactivated;
	}

    /**
     * Getter roles
     * @return {any[]}
     */
	public get roles(): any[] {
		return this._roles;
	}

    /**
     * Getter carts
     * @return {any[]}
     */
	public get carts(): any[] {
		return this._carts;
	}

    /**
     * Getter notifications
     * @return {any[]}
     */
	public get notifications(): any[] {
		return this._notifications;
	}

    /**
     * Getter messages
     * @return {any[]}
     */
	public get messages(): any[] {
		return this._messages;
	}

    /**
     * Setter id
     * @param {Number} value
     */
	public set id(value: Number) {
		this._id = value;
	}

    /**
     * Setter userName
     * @param {  String} value
     */
	public set userName(value:   String) {
		this._userName = value;
	}

    /**
     * Setter password
     * @param {  String} value
     */
	public set password(value:   String) {
		this._password = value;
	}

    /**
     * Setter salt
     * @param {String} value
     */
	public set salt(value: String) {
		this._salt = value;
	}

    /**
     * Setter firstName
     * @param { String} value
     */
	public set firstName(value:  String) {
		this._firstName = value;
	}

    /**
     * Setter lastName
     * @param { String} value
     */
	public set lastName(value:  String) {
		this._lastName = value;
	}

    /**
     * Setter email
     * @param {String} value
     */
	public set email(value: String) {
		this._email = value;
	}

    /**
     * Setter isDeactivated
     * @param {Boolean} value
     */
	public set isDeactivated(value: Boolean) {
		this._isDeactivated = value;
	}

    /**
     * Setter roles
     * @param {any[]} value
     */
	public set roles(value: any[]) {
		this._roles = value;
	}

    /**
     * Setter carts
     * @param {any[]} value
     */
	public set carts(value: any[]) {
		this._carts = value;
	}

    /**
     * Setter notifications
     * @param {any[]} value
     */
	public set notifications(value: any[]) {
		this._notifications = value;
	}

    /**
     * Setter messages
     * @param {any[]} value
     */
    
	public set messages(value: any[]) {
		this._messages = value;
	}
    private _id: Number;
    private _userName:   String;
    private _password:   String;
    private _salt: String;
    private _firstName:  String;
    private _lastName:  String;
    private _email: String;
    private _isDeactivated: Boolean;
    private _roles: any[];
    private _carts : any[];
    private _notifications: any[];
    private _messages: any[];
}


