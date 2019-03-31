export class Role {

    constructor(base:{}){
        this.

    }
    /**
     * Getter ofUser
     * @return {any}
     */
	public get ofUser(): any {
		return this._ofUser;
	}

    /**
     * Getter store
     * @return {any}
     */
	public get store(): any {
		return this._store;
	}

    /**
     * Getter appointor
     * @return {any}
     */
	public get appointor(): any {
		return this._appointor;
	}

    /**
     * Getter appointees
     * @return { any[]}
     */
	public get appointees():  any[] {
		return this._appointees;
	}

    /**
     * Getter permissions
     * @return {String[]}
     */
	public get permissions(): String[] {
		return this._permissions;
	}

    /**
     * Setter ofUser
     * @param {any} value
     */
	public set ofUser(value: any) {
		this._ofUser = value;
	}

    /**
     * Setter store
     * @param {any} value
     */
	public set store(value: any) {
		this._store = value;
	}

    /**
     * Setter appointor
     * @param {any} value
     */
	public set appointor(value: any) {
		this._appointor = value;
	}

    /**
     * Setter appointees
     * @param { any[]} value
     */
	public set appointees(value:  any[]) {
		this._appointees = value;
	}

    /**
     * Setter permissions
     * @param {String[]} value
     */
	public set permissions(value: String[]) {
		this._permissions = value;
    }

    private _name: String
    private _ofUser: any;
    private _store: any;
    private _appointor: any;
    private _appointees:  any[];
    private _permissions: String[];
}
