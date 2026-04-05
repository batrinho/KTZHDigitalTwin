import { useRef, useCallback } from 'react';
import type { TelemetryParams } from '../models/api';

export interface TimestampedTelemetry extends TelemetryParams {
  _ts: number;
}

// 15 min × 60 s/min — enough headroom beyond the 10-min display window
const MAX_SIZE = 900;

export class RingBuffer {
  private buf: TimestampedTelemetry[] = [];

  push(entry: TimestampedTelemetry) {
    this.buf.push(entry);
    if (this.buf.length > MAX_SIZE) this.buf.shift();
  }

  getAll(): TimestampedTelemetry[] { return this.buf; }

  getRange(fromMs: number, toMs: number): TimestampedTelemetry[] {
    return this.buf.filter(e => e._ts >= fromMs && e._ts <= toMs);
  }

  getLast(n: number): TimestampedTelemetry[] { return this.buf.slice(-n); }

  extractField(field: string, count?: number): number[] {
    const data = count ? this.getLast(count) : this.buf;
    return data.map(e => (e[field] as number) ?? 0);
  }

  get length(): number { return this.buf.length; }

  clear() { this.buf = []; }
}

export function useRingBuffer() {
  const ref = useRef(new RingBuffer());
  const push = useCallback((entry: TimestampedTelemetry) => { ref.current.push(entry); }, []);
  return { buffer: ref.current, push };
}
