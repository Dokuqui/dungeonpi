export class Message {
  private constructor(
    private readonly _id: number | undefined,
    private readonly _senderId: number,
    private readonly _receiverId: number,
    private readonly _content: string,
    private _isRead: boolean,
    private readonly _createdAt: Date,
  ) {}

  public static create(
    senderId: number,
    receiverId: number,
    content: string,
  ): Message {
    if (content.trim().length === 0) {
      throw new Error('Message content cannot be empty.');
    }
    return new Message(
      undefined,
      senderId,
      receiverId,
      content,
      false,
      new Date(),
    );
  }

  public static reconstitute(
    id: number,
    senderId: number,
    receiverId: number,
    content: string,
    isRead: boolean,
    createdAt: Date,
  ): Message {
    return new Message(id, senderId, receiverId, content, isRead, createdAt);
  }

  public get id(): number | undefined {
    return this._id;
  }
  public get senderId(): number {
    return this._senderId;
  }
  public get receiverId(): number {
    return this._receiverId;
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
