
export class Store {
  constructor(base: any) {
    this._id = base.id;
    this._name = base.name;
    this._workers = base.workers;
    this._purchaseRules = base.purchaseRules;
    this._saleRules = base.saleRules;
    this._rank = base.rank;
    this._review = base.reviews;
    this._purchasePolicy = base.purchasePolicy;
    this._storeState = base.storeState;
    this._messages = base.messages;
    this._pendingOwners = base.pendingOwners;
  }

  private _id: string;
  private _name: string;
  private _workers: any[]; //already an array of users
  private _purchaseRules: any[];
  private _saleRules: any[];
  private _rank: number;
  private _review: any[]; //array of review
  private _purchasePolicy: string;
  private _storeState: string;
  private _messages: any[];
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

  /**
   * Getter workers
   * @return {any[]}
   */
  public get workers(): any[] {
    return this._workers;
  }

  public get purchaseRules(): any[] {
      return this._purchaseRules;
  }

  public get saleRules(): any[] {
      return this._saleRules;
  }

  /**
   * Getter rank
   * @return { number}
   */
  public get rank(): number {
    return this._rank;
  }

  /**
   * Getter review
   * @return { any[]}
   */
  public get review(): any[] {
    return this._review;
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
   * Getter messages
   * @return {any[]}
   */
  public get messages(): any[] {
    return this._messages;
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

  /**
   * Setter workers
   * @param {any[]} value
   */
  public set workers(value: any[]) {
    this._workers = value;
  }

  public set purchaseRules(value: any[]) {
    this._purchaseRules = value;
  }

  public set saleRules(value: any[]) {
    this._saleRules = value;
  }


  /**
   * Setter rank
   * @param { number} value
   */
  public set rank(value: number) {
    this._rank = value;
  }

  /**
   * Setter review
   * @param { any[]} value
   */
  public set review(value: any[]) {
    this._review = value;
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

  /**
   * Setter messages
   * @param {any[]} value
   */
  public set messages(value: any[]) {
    this._messages = value;
  }
  
  public getStoreDetails (){
    const {
        _id,
        _name,
        _rank,
        
    } = this;
    return ({
        id:_id,
        name:_name,
        rank: _rank,
    });
}

}
