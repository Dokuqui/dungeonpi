export class Room {
  private constructor(
    private readonly _id: number | undefined,
    private readonly _x: number,
    private readonly _y: number,
    private _name: string,
    private _description: string,
  ) {}

  public static create(
    x: number,
    y: number,
    name: string,
    description: string,
  ): Room {
    if (name.trim().length === 0) {
      throw new Error('Room name cannot be empty.');
    }
    return new Room(undefined, x, y, name, description);
  }

  public static reconstitute(
    id: number,
    x: number,
    y: number,
    name: string,
    description: string,
  ): Room {
    return new Room(id, x, y, name, description);
  }

  public get id(): number | undefined {
    return this._id;
  }
  public get x(): number {
    return this._x;
  }
  public get y(): number {
    return this._y;
  }
  public get name(): string {
    return this._name;
  }
  public get description(): string {
    return this._description;
  }

  public updateDetails(newName: string, newDescription: string): void {
    if (newName.trim().length === 0)
      throw new Error('Room name cannot be empty.');
    this._name = newName;
    this._description = newDescription;
  }
}
