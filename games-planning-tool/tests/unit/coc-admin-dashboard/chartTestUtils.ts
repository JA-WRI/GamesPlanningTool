//50% or more AI-generated
// Shared test helpers for components that render recharts' ResponsiveContainer.
// jsdom has no ResizeObserver and reports a 0x0 layout, so recharts never
// measures a size and renders nothing. These stubs give it a fixed size.
export function mockChartLayout() {
  Element.prototype.getBoundingClientRect = () =>
    ({
      width: 200,
      height: 200,
      top: 0,
      left: 0,
      bottom: 200,
      right: 200,
      x: 0,
      y: 0,
      toJSON() {},
    }) as DOMRect;

  class FakeResizeObserver {
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback(
        [
          {
            target,
            contentRect: target.getBoundingClientRect(),
          } as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver,
      );
    }

    unobserve() {}
    disconnect() {}
  }

  global.ResizeObserver = FakeResizeObserver;
}
