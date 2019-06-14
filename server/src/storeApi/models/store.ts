
export class Store {
  constructor(base: any) {
    this._id = base.id;
    this._name = base.name;
    this._purchaseRules = base.purchaseRules;
    this._saleRules = base.saleRules;
    this._purchasePolicy = base.purchasePolicy;
    this._storeState = base.storeState;
    this._pendingOwners = base.pendingOwners;
  }

  private _id: string;
  private _name: string;
  private _purchaseRules: any[];
  private _saleRules: any[];
  private _purchasePolicy: string;
  private _storeState: string;
  private _pendingOwners: any[];




  public get pendingOwners(): any[] {
    return this._pendingOwners;
  }
  public set pendingOwners(value: any[]) {
    this._pendingOwners = value;
  }

  /**
   * Getter id
   * @return {string}
   */
  public get id(): string {
    return this._id;
  }

  /**
   * Getter name
   * @return {  string}
   */
  public get name(): string {
    return this._name;
  }

  public get purchaseRules(): any[] {
      return this._purchaseRules;
  }

  public get saleRules(): any[] {
      return this._saleRules;
  }


  /**
   * Getter purchasePolicy
   * @return {string}
   */
  public get purchasePolicy(): string {
    return this._purchasePolicy;
  }

  /**
   * Getter storeState
   * @return {string}
   */
  public get storeState(): string {
    return this._storeState;
  }


  /**
   * Setter id
   * @param {string} value
   */
  public set id(value: string) {
    this._id = value;
  }

  /**
   * Setter name
   * @param {  string} value
   */
  public set name(value: string) {
    this._name = value;
  }


  public set purchaseRules(value: any[]) {
    this._purchaseRules = value;
  }

  public set saleRules(value: any[]) {
    this._saleRules = value;
  }

  /**
   * Setter purchasePolicy
   * @param {string} value
   */
  public set purchasePolicy(value: string) {
    this._purchasePolicy = value;
  }

  /**
   * Setter storeState
   * @param {string} value
   */
  public set storeState(value: string) {
    this._storeState = value;
  }

  
  public getStoreDetails (){
    const {
        _id,
        _name,
        _purchaseRules,
        _saleRules

        
    } = this;
    return ({
        id:_id,
        name:_name,
        purchaseRules:_purchaseRules,
        saleRules: _saleRules
    });
}

}
