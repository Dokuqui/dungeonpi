import { Coordinates } from '../../characters/domain/class/coordinates.class';

export class Spawner {
  private constructor(
    private readonly _id: number | undefined,
    private readonly _coordinates: Coordinates,
    private _monsterName: string,
    private _monsterMaxHealth: number,
    private _monsterDamage: number,
  ) {}

  public static create(
    x: number,
    y: number,
    monsterName: string,
    monsterMaxHealth: number,
    monsterDamage: number,
  ): Spawner {
    const coords = Coordinates.create(x, y);
    return new Spawner(
      undefined,
      coords,
      monsterName,
      monsterMaxHealth,
      monsterDamage,
    );
  }

  public static reconstitute(
    id: number,
    coordinates: Coordinates,
    monsterName: string,
    monsterMaxHealth: number,
    monsterDamage: number,
  ): Spawner {
    return new Spawner(
      id,
      coordinates,
      monsterName,
      monsterMaxHealth,
      monsterDamage,
    );
  }

  public get id(): number | undefined {
    return this._id;
  }
  public get coordinates(): Coordinates {
    return this._coordinates;
  }
  public get monsterName(): string {
    return this._monsterName;
  }
  public get monsterMaxHealth(): number {
    return this._monsterMaxHealth;
  }
  public get monsterDamage(): number {
    return this._monsterDamage;
  }
}
