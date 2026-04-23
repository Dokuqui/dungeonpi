export class Notification {
  private constructor(
    private readonly _id: number | undefined,
    private readonly _userId: number,
    private readonly _type: string,
    private readonly _content: string,
    private _isRead: boolean,
    private readonly _createdAt: Date,
  ) {}

  public static create(
    userId: number,
    type: string,
    content: string,
  ): Notification {
    return new Notification(
      undefined,
      userId,
      type,
      content,
      false,
      new Date(),
    );
  }

  public static reconstitute(
    id: number,
    userId: number,
    type: string,
    content: string,
    isRead: boolean,
    createdAt: Date,
  ): Notification {
    return new Notification(id, userId, type, content, isRead, createdAt);
  }

  public get id(): number | undefined {
    return this._id;
  }
  public get userId(): number {
    return this._userId;
  }
  public get type(): string {
    return this._type;
  }
  public get content(): string {
    return this._content;
  }
  public get isRead(): boolean {
    return this._isRead;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }

  public markAsRead(): void {
    this._isRead = true;
  }
}
