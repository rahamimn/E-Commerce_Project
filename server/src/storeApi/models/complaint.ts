export class Complaint {
  private _id: String;

  private _date: Date;
  private _user: any;
  private _order: String;
  private _body: String;

  constructor(base: any) {
    this._id = base.id;
    this._date = base.date;
    this._user = base.user;
    this._order = base.order;
    this._body = base.body;
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
   * Getter date
   * @return {  Date}
   */
  public get date(): Date {
    return this._date;
  }

  /**
   * Getter user
   * @return {any}
   */
  public get user(): any {
    return this._user;
  }

  /**
   * Getter order
   * @return { String}
   */
  public get order(): String {
    return this._order;
  }

  /**
   * Getter body
   * @return { String}
   */
  public get body(): String {
    return this._body;
  }

  /**
   * Setter date
   * @param {  Date} value
   */
  public set date(value: Date) {
    this._date = value;
  }

  /**
   * Setter user
   * @param {any} value
   */
  public set user(value: any) {
    this._user = value;
  }

  /**
   * Setter order
   * @param { String} value
   */
  public set order(value: String) {
    this._order = value;
  }

  /**
   * Setter body
   * @param { String} value
   */
  public set body(value: String) {
    this._body = value;
  }
}
