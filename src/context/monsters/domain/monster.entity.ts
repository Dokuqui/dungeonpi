import { Health } from '../../characters/domain/valueObjects/health.vo';
import { Coordinates } from '../../characters/domain/valueObjects/coordinates.vo';

export class Monster {
  private constructor(
    private readonly _id: number | undefined,
    private _name: string,
    private _health: Health,
    private _coordinates: Coordinates,
    private readonly _damage: number,
  ) {}

  public static create(
    name: string,
    maxHealth: number,
    damage: number,
    x: number,
    y: number,
  ): Monster {
    const health = Health.create(maxHealth);
    const coords = Coordinates.create(x, y);
    return new Monster(undefined, name, health, coords, damage);
  }

  public static reconstitute(
    id: number,
    name: string,
    health: Health,
    coordinates: Coordinates,
    damage: number,
  ): Monster {
    return new Monster(id, name, health, coordinates, damage);
  }

  public get id(): number | undefined {
    return this._id;
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
  public get damage(): number {
    return this._damage;
  }

  public takeDamage(amount: number): void {
    this._health.takeDamage(amount);
  }
}
