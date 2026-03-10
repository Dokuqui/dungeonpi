import { Health } from './valueObjects/health.vo';
import { Coordinates } from './valueObjects/coordinates.vo';

export class Character {
  private constructor(
    private readonly _id: number | undefined,
    private readonly _userId: number,
    private _name: string,
    private _health: Health,
    private _coordinates: Coordinates,
  ) {}

  public static create(userId: number, name: string): Character {
    const startingHealth = Health.create(100);
    const startingLocation = Coordinates.create(0, 0);

    return new Character(
      undefined,
      userId,
      name,
      startingHealth,
      startingLocation,
    );
  }

  public static reconstitute(
    id: number,
    userId: number,
    name: string,
    health: Health,
    coordinates: Coordinates,
  ): Character {
    return new Character(id, userId, name, health, coordinates);
  }

  public get id(): number | undefined {
    return this._id;
  }
  public get userId(): number {
    return this._userId;
  }
  public get name(): string {
    return this._name;
  }
  public get health(): Health {
    return this._health;
  }
  public get coordinates(): Coordinates {
    return this._coordinates;
  }

  public move(dx: number, dy: number): void {
    if (this._health.isDead) {
      throw new Error('A dead character cannot move.');
    }
    this._coordinates.move(dx, dy);
  }

  public takeDamage(amount: number): void {
    this._health.takeDamage(amount);
  }
}
