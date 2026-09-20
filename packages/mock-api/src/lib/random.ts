/** Small deterministic PRNG (mulberry32) so the mock dataset is stable across reloads. */
export class Random {
  private state: number

  constructor(seed: number) {
    this.state = seed >>> 0
  }

  /** Float in [0, 1). */
  next(): number {
    let t = (this.state += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  float(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  chance(probability: number): boolean {
    return this.next() < probability
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('Cannot pick from an empty list')
    return items[Math.floor(this.next() * items.length)] as T
  }

  /** Picks an item using relative weights. */
  weighted<T>(items: ReadonlyArray<readonly [item: T, weight: number]>): T {
    const total = items.reduce((acc, [, w]) => acc + w, 0)
    let roll = this.next() * total
    for (const [item, weight] of items) {
      roll -= weight
      if (roll <= 0) return item
    }
    return items[items.length - 1]![0]
  }

  shuffle<T>(items: readonly T[]): T[] {
    const copy = items.slice()
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j] as T, copy[i] as T]
    }
    return copy
  }

  sample<T>(items: readonly T[], count: number): T[] {
    return this.shuffle(items).slice(0, count)
  }
}

let counter = 0

/** Compact, readable ids such as `ord_01hx4k`. Not cryptographically random — this is a mock. */
export function createId(prefix: string, random: Random): string {
  counter += 1
  const part = Math.floor(random.next() * 36 ** 5)
    .toString(36)
    .padStart(5, '0')
  return `${prefix}_${part}${(counter % 36).toString(36)}`
}
