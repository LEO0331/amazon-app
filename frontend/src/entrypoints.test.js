/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

describe('entrypoints', () => {
  it('main.js calls ReactDOM.render', async () => {
    vi.resetModules();
    const render = vi.fn();
    const storeMock = { subscribe: vi.fn(), dispatch: vi.fn(), getState: vi.fn(() => ({})) };
    vi.doMock('react-dom', () => ({ default: { render }, render }));
    vi.doMock('./App', () => ({ default: () => null }));
    vi.doMock('./store', () => ({ default: storeMock }));
    document.body.innerHTML = '<div id="root"></div>';
    await import('./main');
    expect(render).toHaveBeenCalled();
  });

  it('index.js calls ReactDOM.render and reportWebVitals', async () => {
    vi.resetModules();
    const render = vi.fn();
    const reportWebVitals = vi.fn();
    const storeMock = { subscribe: vi.fn(), dispatch: vi.fn(), getState: vi.fn(() => ({})) };
    vi.doMock('react-dom', () => ({ default: { render }, render }));
    vi.doMock('./App', () => ({ default: () => null }));
    vi.doMock('./store', () => ({ default: storeMock }));
    vi.doMock('./reportWebVitals', () => ({ default: reportWebVitals }));
    document.body.innerHTML = '<div id="root"></div>';
    await import('./index');
    expect(render).toHaveBeenCalled();
    expect(reportWebVitals).toHaveBeenCalled();
  });
});
