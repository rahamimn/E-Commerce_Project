
export class User {

    constructor(base: any) {
        this._id = base._id;
        this._userName = base.userName;
        this._password = base.password;
        this._salt = base.salt;
        this._firstName = base.firstName;
        this._lastName = base.lastName;
        this._email = base.email;
        this._phone = base.phone;
        this._isDeactivated = base.isDeactivated;
        this._notifications = base.notifications;
        this._messages = base.messages;
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
    
    public set phone(value:  String) {
		this._phone = value;
	}

    /**
     * Setter isDeactivated
     * @param {Boolean} value
     */
	public set isDeactivated(value: Boolean) {
		this._isDeactivated = value;
	}

    /**
     * Setter notifications
     * @param {any[]} value
     */
	public set notifications(value: any[]) {
		this._notifications = value;
    }
    
     /**
     * Getter phone
     * @return { String}
     */
	public get phone():  String {
		return this._phone;
    }
    
    /**
     * Setter phone
     * @param { String} value
     */

    /**
     * Setter messages
     * @param {any[]} value
     */
    
	public set messages(value: any[]) {
		this._messages = value;
	}

    /**
     * Getter id
     * @return {String}
     */
	public get id(): String {
		return this._id;
	}

    /**
     * Setter id
     * @param {String} value
     */
	public set id(value: String) {
		this._id = value;
    }
    public getUserDetails (){
        const {
            _id,
            _userName,
            _firstName,
            _lastName,
            _email,
            _phone,
            _isDeactivated
        } = this;
        return ({
            id:_id,
            userName:_userName,
            firstName:_firstName,
            lastName:_lastName,
            email:_email,
            phone:_phone,
            isDeactivated:_isDeactivated
        });
    }

    public updateDetails (userDetails){ //nothing else should update for now
       this.firstName = userDetails.firstName;
       this.lastName = userDetails.lastName;
       this.email = userDetails.email;
       this.phone = userDetails.phone;
    }

    private _id: String;
    private _userName:   String;
    private _password:   String;
    private _salt: String;
    private _firstName:  String;
    private _lastName:  String;
    private _phone:  String;
    private _email: String;
    private _isDeactivated: Boolean;
    private _notifications: any[];
    private _messages: any[];
}


