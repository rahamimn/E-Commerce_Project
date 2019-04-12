import { RoleCollection, UserCollection } from "../../persistance/mongoDb/Collections";

export class Role {

    constructor(base:any){
        this._id = base._id;
        this._name =  base.name;
        this._ofUser = base.ofUser;
        this._store = base.store;
        this._appointor  = base.appointor;
        this._appointees = base.appointees;
        this._permissions = base.permissions;

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

    /**
     * Getter name
     * @return {String}
     */
	public get name(): String {
		return this._name;
	}

    /**
     * Setter name
     * @param {String} value
     */
	public set name(value: String) {
		this._name = value;
    }


    async delete(removeFromAppointor: Boolean){
        if(removeFromAppointor){
            const appointor = await RoleCollection.findById(this.appointor);
            appointor.appointees = appointor.appointees.filter(appointee => !appointee.equals(this.id));
            await RoleCollection.updateOne(appointor);
        }
        const RolesToDelete = await RoleCollection.findByIds(this.appointees); 
    
        await (async () => RolesToDelete.forEach(async role => await role.delete(false))) ();
        
        await RoleCollection.delete({ _id : this.id});
  };


    private _id: String;
    private _name: String;
    private _ofUser: any;
    private _store: any;
    private _appointor: any;
    private _appointees:  any[];
    private _permissions: String[];
}
