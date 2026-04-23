export class Health {
  private constructor(
    private _current: number,
    private readonly _max: number,
  ) {}

  public static create(maxHealth: number): Health {
    if (maxHealth <= 0) {
      throw new Error('Maximum health must be greater than 0.');
    }
    return new Health(maxHealth, maxHealth);
  }

  public static reconstitute(current: number, max: number): Health {
    return new Health(current, max);
  }

  public get current(): number {
    return this._current;
  }

  public get max(): number {
    return this._max;
  }

  public get isDead(): boolean {
    return this._current === 0;
  }

  public takeDamage(amount: number): void {
    if (amount < 0) throw new Error('Damage cannot be negative.');
    this._current = Math.max(0, this._current - amount);
  }

  public heal(amount: number): void {
    if (amount < 0) throw new Error('Healing cannot be negative.');
    if (this.isDead) throw new Error('Cannot heal a dead character.');
    this._current = Math.min(this._max, this._current + amount);
  }
}
