import { Injectable } from '@nestjs/common';

@Injectable()
export class BloomFilter {
  private readonly size: number;
  private readonly bitArray: Uint8Array;
  private readonly hashCount: number;

  constructor(size: number = 1000000, hashCount: number = 3) {
    this.size = size;
    this.bitArray = new Uint8Array(Math.ceil(size / 8));
    this.hashCount = hashCount;
  }

  private hash(item: string, seed: number): number {
    let h = 0;
    for (let i = 0; i < item.length; i++) {
      h = (Math.imul(31, h) + item.charCodeAt(i) * seed) | 0;
    }
    return Math.abs(h) % this.size;
  }

  public add(item: string): void {
    const formattedItem = item.toLowerCase().trim();
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(formattedItem, i + 1);
      const byteIndex = Math.floor(index / 8);
      const bitOffset = index % 8;
      this.bitArray[byteIndex] |= 1 << bitOffset;
    }
  }

  public mightContain(item: string): boolean {
    const formattedItem = item.toLowerCase().trim();
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(formattedItem, i + 1);
      const byteIndex = Math.floor(index / 8);
      const bitOffset = index % 8;
      if ((this.bitArray[byteIndex] & (1 << bitOffset)) === 0) {
        return false;
      }
    }
    return true;
  }
}
