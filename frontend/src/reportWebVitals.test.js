import { describe, expect, it, vi } from 'vitest';
import reportWebVitals from './reportWebVitals';
import * as webVitals from 'web-vitals';

vi.mock('web-vitals', () => {
  const call = (cb) => cb({ ok: true });
  return {
    getCLS: vi.fn(call),
    getFID: vi.fn(call),
    getFCP: vi.fn(call),
    getLCP: vi.fn(call),
    getTTFB: vi.fn(call),
  };
});

describe('reportWebVitals', () => {
  it('does nothing when callback is not a function', () => {
    expect(() => reportWebVitals(null)).not.toThrow();
  });

  it('loads web-vitals callbacks when a function is provided', async () => {
    const cb = vi.fn();
    reportWebVitals(cb);
    await vi.dynamicImportSettled();
    expect(webVitals.getCLS).toHaveBeenCalledWith(cb);
    expect(webVitals.getFID).toHaveBeenCalledWith(cb);
    expect(webVitals.getFCP).toHaveBeenCalledWith(cb);
    expect(webVitals.getLCP).toHaveBeenCalledWith(cb);
    expect(webVitals.getTTFB).toHaveBeenCalledWith(cb);
    expect(cb).toHaveBeenCalled();
  });
});
