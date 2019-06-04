export class Complaint {
  private _id: string;

  private _date: Date;
  private _user: any;
  private _order: string;
  private _body: string;

  constructor(base: any) {
    this._id = base.id;
    this._date = base.date;
    this._user = base.user;
    this._order = base.order;
    this._body = base.body;
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
   * @return { string}
   */
  public get order(): string {
    return this._order;
  }

  /**
   * Getter body
   * @return { string}
   */
  public get body(): string {
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
   * @param { string} value
   */
  public set order(value: string) {
    this._order = value;
  }

  /**
   * Setter body
   * @param { string} value
   */
  public set body(value: string) {
    this._body = value;
  }
}
