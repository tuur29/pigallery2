import {Injectable} from '@angular/core';
import { getHashParam, setHashParam, removeHashParam } from '../utils';

@Injectable()
export class SeededRandomService {

  private static baseSeed = Math.random() * 2147483647;
  private seed: number;

  constructor() {
    const hashSeed = getHashParam('seed');
    if (hashSeed && !isNaN(parseInt(hashSeed))) {
      SeededRandomService.baseSeed = parseFloat(hashSeed);
    }
    this.setSeed(0);

    if (this.seed <= 0) {
      this.seed += 2147483646;
    }
  }

  static saveSeed() {
    window.location.hash = setHashParam('seed', SeededRandomService.baseSeed);
  }

  static clearSeed() {
    SeededRandomService.baseSeed = Math.random() * 2147483647;
    window.location.hash = removeHashParam('seed');
  }

  setSeed(seed: number) {
    this.seed = (SeededRandomService.baseSeed + seed) % 2147483647; // shifting with 16 to the left
  }

  get() {
    this.seed = (this.seed * 16807 % 2147483647);
    return this.seed / 2147483647;
  }

}
