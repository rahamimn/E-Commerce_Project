
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
     * @return {  string}
     */
	public get userName():   string {
		return this._userName;
	}

    /**
     * Getter password
     * @return {  string}
     */
	public get password():   string {
		return this._password;
	}

    /**
     * Getter salt
     * @return {string}
     */
	public get salt(): string {
		return this._salt;
	}

    /**
     * Getter firstName
     * @return { string}
     */
	public get firstName():  string {
		return this._firstName;
	}

    /**
     * Getter lastName
     * @return { string}
     */
	public get lastName():  string {
		return this._lastName;
	}

    /**
     * Getter email
     * @return {string}
     */
	public get email(): string {
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
     * @param {  string} value
     */
	public set userName(value:   string) {
		this._userName = value;
	}

    /**
     * Setter password
     * @param {  string} value
     */
	public set password(value:   string) {
		this._password = value;
	}

    /**
     * Setter salt
     * @param {string} value
     */
	public set salt(value: string) {
		this._salt = value;
	}

    /**
     * Setter firstName
     * @param { string} value
     */
	public set firstName(value:  string) {
		this._firstName = value;
	}

    /**
     * Setter lastName
     * @param { string} value
     */
	public set lastName(value:  string) {
		this._lastName = value;
	}

    /**
     * Setter email
     * @param {string} value
     */
	public set email(value: string) {
		this._email = value;
    }
    
    public set phone(value:  string) {
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
     * @return { string}
     */
	public get phone():  string {
		return this._phone;
    }
    
    /**
     * Setter phone
     * @param { string} value
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
     * @return {string}
     */
	public get id(): string {
		return this._id;
	}

    /**
     * Setter id
     * @param {string} value
     */
	public set id(value: string) {
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

    private _id: string;
    private _userName:   string;
    private _password:   string;
    private _salt: string;
    private _firstName:  string;
    private _lastName:  string;
    private _phone:  string;
    private _email: string;
    private _isDeactivated: Boolean;
    private _notifications: any[];
    private _messages: any[];
}


