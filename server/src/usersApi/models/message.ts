export class Message {

    constructor(base:any){
        this._id = base._id;
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
    private _id: String;

}
