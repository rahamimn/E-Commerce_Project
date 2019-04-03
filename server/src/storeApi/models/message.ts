export class Message {
  constructor(base: any) {
    this._id = base.id;
    this._date = base.date;
    this._from = base.from;
    this._to = base.to;
    this._title = base.title;
    this._body = base.body;
  }

  private _id: string;
  private _date: String;
  private _from: any;
  private _to: any;
  private _title: string;
  private _body: string;

  /**
   * Getter id
   * @return {string}
   */
  public get id(): string {
    return this._id;
  }

  /**
   * Getter date
   * @return {  String}
   */
  public get date(): String {
    return this._date;
  }

  /**
   * Getter from
   * @return {any}
   */
  public get from(): any {
    return this._from;
  }

  /**
   * Getter to
   * @return {any}
   */
  public get to(): any {
    return this._to;
  }

  /**
   * Getter title
   * @return { string}
   */
  public get title(): string {
    return this._title;
  }

  /**
   * Getter body
   * @return { string}
   */
  public get body(): string {
    return this._body;
  }

  /**
   * Setter id
   * @param {string} value
   */
  public set id(value: string) {
    this._id = value;
  }

  /**
   * Setter date
   * @param {  String} value
   */
  public set date(value: String) {
    this._date = value;
  }

  /**
   * Setter from
   * @param {any} value
   */
  public set from(value: any) {
    this._from = value;
  }

  /**
   * Setter to
   * @param {any} value
   */
  public set to(value: any) {
    this._to = value;
  }

  /**
   * Setter title
   * @param { string} value
   */
  public set title(value: string) {
    this._title = value;
  }

  /**
   * Setter body
   * @param { string} value
   */
  public set body(value: string) {
    this._body = value;
  }
}
