export class Coordinates {
  private constructor(
    private _x: number,
    private _y: number,
  ) {}

  public static create(x: number, y: number): Coordinates {
    return new Coordinates(x, y);
  }

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  public move(dx: number, dy: number): void {
    this._x += dx;
    this._y += dy;
  }
}
