import {Injectable} from '@angular/core';

@Injectable()
export class SeededRandomService {

  private static baseSeed = Math.random() * 2147483647;
  private seed: number;

  constructor() {
    if (window.location.hash && !isNaN(window.location.hash.replace('#', '') as any)) {
      SeededRandomService.baseSeed = parseFloat(window.location.hash.replace('#', ''));
    }
    this.setSeed(0);

    if (this.seed <= 0) {
      this.seed += 2147483646;
    }
  }

  static saveSeed() {
    window.location.hash = `#${SeededRandomService.baseSeed}`;
  }

  static clearSeed() {
    SeededRandomService.baseSeed = Math.random() * 2147483647;
    window.location.hash = '';
  }

  setSeed(seed: number) {
    this.seed = (SeededRandomService.baseSeed + seed) % 2147483647; // shifting with 16 to the left
  }

  get() {
    this.seed = (this.seed * 16807 % 2147483647);
    return this.seed / 2147483647;
  }

}
