// Price chart on TradingView Lightweight Charts (Apache-2.0, vendored). Same input as AcademyChart.create,
// and falls back to it if the library did not load. The library shows its own TradingView attribution logo.
(function (root) {
  function create(el, { bars, overlays = [], markers = [] }) {
    const L = root.LightweightCharts;
    if (!L || !el) return root.AcademyChart.create(el, { bars, overlays, markers });
    let host = el;
    if (el.tagName === 'CANVAS') { // swap the fallback canvas for a div container
      host = document.createElement('div');
      host.id = el.id; host.className = 'lwc-chart'; host.setAttribute('role', 'img'); host.setAttribute('aria-label', el.getAttribute('aria-label') || 'Price chart');
      el.replaceWith(host);
    }
    const css = getComputedStyle(document.documentElement), v = (name, fb) => css.getPropertyValue(name).trim() || fb;
    const sec = t => Math.floor(t / 1000);
    const chart = L.createChart(host, {
      autoSize: true,
      layout: { background: { color: 'transparent' }, textColor: v('--muted', '#667'), fontFamily: v('--font-sans', 'sans-serif'), attributionLogo: true },
      grid: { vertLines: { color: v('--line', '#e5e7eb') }, horzLines: { color: v('--line', '#e5e7eb') } },
      rightPriceScale: { borderColor: v('--line', '#e5e7eb') },
      timeScale: { borderColor: v('--line', '#e5e7eb') },
    });
    const up = v('--up', v('--green', '#0f9d76')), down = v('--red', '#d64545');
    const candles = chart.addSeries(L.CandlestickSeries, { upColor: up, downColor: down, borderVisible: false, wickUpColor: up, wickDownColor: down });
    candles.setData(bars.map(b => ({ time: sec(b.time), open: b.o, high: b.h, low: b.l, close: b.c })));
    for (const ov of overlays) {
      const pts = (ov.points || ov.data || ov.values || []).filter(p => Number.isFinite(p.value));
      if (pts.length) chart.addSeries(L.LineSeries, { color: ov.color || v('--gold', '#b7791f'), lineWidth: 2, priceLineVisible: false, lastValueVisible: false })
        .setData(pts.map(p => ({ time: sec(p.time), value: p.value })));
    }
    const label = markers.length <= 20; // arrows only on busy runs, text would overlap
    if (markers.length) L.createSeriesMarkers(candles, markers.map(m => m.side === 'buy'
      ? { time: sec(m.time), position: 'belowBar', color: up, shape: 'arrowUp', text: label ? m.label || 'Buy' : '' }
      : { time: sec(m.time), position: 'aboveBar', color: down, shape: 'arrowDown', text: label ? m.label || 'Sell' : '' }).sort((a, b) => a.time - b.time));
    chart.timeScale().fitContent();
    return { destroy: () => chart.remove() };
  }
  root.PriceChart = { create };
})(typeof window !== 'undefined' ? window : globalThis);
