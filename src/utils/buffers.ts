/** Fixed-capacity ring buffer. Never grows beyond `capacity`. */
export class RingBuffer {
  private data: Float64Array;
  private times: Float64Array;
  private start = 0;
  private length = 0;

  constructor(private capacity: number) {
    this.data = new Float64Array(capacity);
    this.times = new Float64Array(capacity);
  }

  get size() {
    return this.length;
  }

  get max() {
    return this.capacity;
  }

  push(value: number, time: number) {
    const index = (this.start + this.length) % this.capacity;
    this.data[index] = value;
    this.times[index] = time;
    if (this.length < this.capacity) this.length += 1;
    else this.start = (this.start + 1) % this.capacity;
  }

  clear() {
    this.start = 0;
    this.length = 0;
  }

  resize(capacity: number) {
    const values = this.toArray();
    const times = this.timeArray();
    this.capacity = capacity;
    this.data = new Float64Array(capacity);
    this.times = new Float64Array(capacity);
    this.start = 0;
    this.length = 0;
    const from = Math.max(0, values.length - capacity);
    for (let i = from; i < values.length; i++) this.push(values[i] as number, times[i] as number);
  }

  at(i: number): number {
    return this.data[(this.start + i) % this.capacity] as number;
  }

  timeAt(i: number): number {
    return this.times[(this.start + i) % this.capacity] as number;
  }

  last(): number | undefined {
    return this.length === 0 ? undefined : this.at(this.length - 1);
  }

  toArray(): number[] {
    const out: number[] = new Array(this.length);
    for (let i = 0; i < this.length; i++) out[i] = this.at(i);
    return out;
  }

  timeArray(): number[] {
    const out: number[] = new Array(this.length);
    for (let i = 0; i < this.length; i++) out[i] = this.timeAt(i);
    return out;
  }
}