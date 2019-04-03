export class Review {
  /**
   * Getter date
   * @return {  Date}
   */
  public get date(): Date {
    return this._date;
  }

  /**
   * Getter registeredUser
   * @return {any}
   */
  public get registeredUser(): any {
    return this._registeredUser;
  }

  /**
   * Getter rank
   * @return { number}
   */
  public get rank(): number {
    return this._rank;
  }

  /**
   * Getter comment
   * @return { string}
   */
  public get comment(): string {
    return this._comment;
  }

  /**
   * Setter date
   * @param {  Date} value
   */
  public set date(value: Date) {
    this._date = value;
  }

  /**
   * Setter registeredUser
   * @param {any} value
   */
  public set registeredUser(value: any) {
    this._registeredUser = value;
  }

  /**
   * Setter rank
   * @param { number} value
   */
  public set rank(value: number) {
    this._rank = value;
  }

  /**
   * Setter comment
   * @param { string} value
   */
  public set comment(value: string) {
    this._comment = value;
  }

  constructor(base: any) {
    this._id = base.id;
    this._date = base.date;
    this._registeredUser = base.registeredUser;
    this._rank = base.rank;
    this._comment = base.comment;
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
  private _id: string;
  private _date: Date;
  private _registeredUser: any;
  private _rank: number;
  private _comment: string;
}
