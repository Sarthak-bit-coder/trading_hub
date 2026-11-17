(function (root) {
  'use strict';

  /**
   * AcademyChart - standalone lightweight Canvas chart module.
   * Zero external dependencies.
   */
  function create(canvas, options) {
    if (!canvas || typeof canvas.getContext !== 'function') {
      throw new Error('AcademyChart requires a valid canvas element');
    }

    const ctx = canvas.getContext('2d');
    let bars = (options && options.bars) || [];
    let overlays = (options && options.overlays) || [];
    let markers = (options && options.markers) || [];

    // Viewport state: indices into bars array (floating point for smooth pan/zoom)
    let viewStart = 0;
    let viewEnd = 0;

    // Interaction state
    let isDragging = false;
    let dragStartX = 0;
    let dragStartViewStart = 0;
    let dragStartViewEnd = 0;
    let crosshair = null; // { x, y } in CSS pixels or null
    let animFrameId = null;
    let touchPinchDist = 0;
    let touchPinchSpan = 0;

    // Layout margins in CSS pixels
    const padTop = 26;
    const padBottom = 26;
    const padLeft = 8;
    const padRight = 62;

    // Initialize or reset view range (default shows latest 120 bars, or all if fewer)
    function resetViewRange() {
      if (!bars || !bars.length) {
        viewStart = 0;
        viewEnd = 0;
        return;
      }
      const count = Math.min(bars.length, 120);
      viewEnd = bars.length - 1;
      viewStart = Math.max(0, viewEnd - count + 1);
    }

    resetViewRange();

    // Binary search for closest bar index given timestamp
    function findBarIndex(time) {
      if (!bars.length) return 0;
      let lo = 0;
      let hi = bars.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const t = bars[mid].time;
        if (t === time) return mid;
        if (t < time) lo = mid + 1;
        else hi = mid - 1;
      }
      if (hi < 0) return 0;
      if (lo >= bars.length) return bars.length - 1;
      const tLo = bars[hi].time;
      const tHi = bars[lo].time;
      if (tHi === tLo) return hi;
      return hi + (time - tLo) / (tHi - tLo);
    }

    // Read colors from CSS variables on the canvas with robust fallbacks
    function getThemeColors() {
      const style = window.getComputedStyle(canvas);
      const isDark =
        style.getPropertyValue('color-scheme').trim() === 'dark' ||
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.body.getAttribute('data-theme') === 'dark';

      const readVar = (name, fallback) => {
        const val = style.getPropertyValue(name).trim();
        return val || fallback;
      };

      return {
        bg: readVar('--paper', readVar('--bg', isDark ? '#171a17' : '#ffffff')),
        grid: readVar('--line', isDark ? '#2e352e' : '#e7e5db'),
        text: readVar('--muted', isDark ? '#9da398' : '#77796f'),
        ink: readVar('--ink', isDark ? '#eff0e8' : '#242720'),
        up: readVar('--chart-up', readVar('--green', isDark ? '#4ade80' : '#2a753e')),
        down: readVar('--chart-down', readVar('--red', isDark ? '#f87171' : '#a83a2d')),
        volume: readVar('--chart-volume', isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'),
        badgeBg: isDark ? '#232923' : '#ebe8dd'
      };
    }

    function formatDate(time, spanMs) {
      const d = new Date(time);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      if (spanMs > 86400000 * 3) {
        return `${y}-${m}-${day}`;
      }
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const mm = String(d.getUTCMinutes()).padStart(2, '0');
      return `${m}-${day} ${hh}:${mm}`;
    }

    function formatNumber(val) {
      if (!Number.isFinite(val)) return '—';
      if (Math.abs(val) >= 1000) return val.toFixed(2);
      if (Math.abs(val) >= 1) return val.toFixed(2);
      if (Math.abs(val) >= 0.01) return val.toFixed(4);
      return val.toFixed(6);
    }

    // Calculate human-friendly tick steps
    function niceStep(range, targetTicks) {
      const raw = range / targetTicks;
      const mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const rel = raw / mag;
      let step;
      if (rel < 1.5) step = 1 * mag;
      else if (rel < 3.5) step = 2 * mag;
      else if (rel < 7.5) step = 5 * mag;
      else step = 10 * mag;
      return step;
    }

    function draw() {
      animFrameId = null;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(10, Math.floor(rect.width));
      const cssH = Math.max(10, Math.floor(rect.height));

      // Resize canvas buffer for sharp rendering on HiDPI displays
      if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const colors = getThemeColors();

      // Clear & background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, cssW, cssH);

      if (!bars || bars.length === 0) {
        ctx.fillStyle = colors.text;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No bar data available', cssW / 2, cssH / 2);
        return;
      }

      const plotWidth = Math.max(10, cssW - padLeft - padRight);
      const plotHeight = Math.max(10, cssH - padTop - padBottom);
      const plotLeft = padLeft;
      const plotRight = padLeft + plotWidth;
      const plotTop = padTop;
      const plotBottom = padTop + plotHeight;

      // Clamp view bounds
      const span = Math.max(2, viewEnd - viewStart);
      if (viewStart < 0) {
        viewStart = 0;
        viewEnd = Math.min(bars.length - 1, viewStart + span);
      }
      if (viewEnd > bars.length - 1) {
        viewEnd = bars.length - 1;
        viewStart = Math.max(0, viewEnd - span);
      }

      const vStart = Math.max(0, Math.floor(viewStart));
      const vEnd = Math.min(bars.length - 1, Math.ceil(viewEnd));
      const numVisible = vEnd - vStart + 1;

      // Downsample to at most 1 candle per pixel column when bars exceed plot width
      const shouldDownsample = numVisible > plotWidth;
      let renderedCandles = null;

      if (shouldDownsample) {
        const bucketCount = Math.max(1, Math.floor(plotWidth));
        const barsPerBucket = numVisible / bucketCount;
        renderedCandles = new Array(bucketCount);

        for (let b = 0; b < bucketCount; b++) {
          const bStart = vStart + Math.floor(b * barsPerBucket);
          const bEnd = Math.min(vEnd, vStart + Math.floor((b + 1) * barsPerBucket) - 1);
          const first = bars[bStart];
          const last = bars[Math.max(bStart, bEnd)];
          let high = first.h;
          let low = first.l;
          let volume = 0;

          // Compute high, low, volume using loops (never Math.min/max spread)
          for (let k = bStart; k <= bEnd; k++) {
            const bar = bars[k];
            if (bar.h > high) high = bar.h;
            if (bar.l < low) low = bar.l;
            if (bar.v !== null && bar.v !== undefined) volume += bar.v;
          }

          renderedCandles[b] = {
            time: first.time,
            o: first.o,
            h: high,
            l: low,
            c: last.c,
            v: volume,
            x: plotLeft + (b + 0.5) * (plotWidth / bucketCount),
            width: Math.max(1, plotWidth / bucketCount - 1)
          };
        }
      }

      // Coordinate mapping helpers
      // shortcut: X-axis spaces bars uniformly by index rather than wall-clock duration, upgrade when non-trading session gaps require proportional spacing
      function xForBarIndex(idx) {
        return plotLeft + ((idx - viewStart) / (viewEnd - viewStart)) * plotWidth;
      }

      function xForTimestamp(time) {
        return xForBarIndex(findBarIndex(time));
      }

      // Min/max price computation using loops
      let minPrice = Infinity;
      let maxPrice = -Infinity;
      let maxVolume = 0;

      if (renderedCandles) {
        for (let i = 0; i < renderedCandles.length; i++) {
          const c = renderedCandles[i];
          if (c.l < minPrice) minPrice = c.l;
          if (c.h > maxPrice) maxPrice = c.h;
          if (c.v > maxVolume) maxVolume = c.v;
        }
      } else {
        for (let i = vStart; i <= vEnd; i++) {
          const b = bars[i];
          if (b.l < minPrice) minPrice = b.l;
          if (b.h > maxPrice) maxPrice = b.h;
          if (b.v && b.v > maxVolume) maxVolume = b.v;
        }
      }

      // Include visible line overlay points in min/max
      for (let i = 0; i < overlays.length; i++) {
        const pts = overlays[i].points || overlays[i].data || overlays[i].values || [];
        for (let j = 0; j < pts.length; j++) {
          const pt = pts[j];
          if (pt.time >= bars[vStart].time && pt.time <= bars[vEnd].time) {
            if (Number.isFinite(pt.value)) {
              if (pt.value < minPrice) minPrice = pt.value;
              if (pt.value > maxPrice) maxPrice = pt.value;
            }
          }
        }
      }

      if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice)) {
        minPrice = 0;
        maxPrice = 1;
      }
      if (minPrice === maxPrice) {
        minPrice -= 1;
        maxPrice += 1;
      }

      // 5% vertical padding
      const priceSpan = maxPrice - minPrice;
      const yMinPrice = minPrice - priceSpan * 0.05;
      const yMaxPrice = maxPrice + priceSpan * 0.05;
      const yPriceSpan = yMaxPrice - yMinPrice || 1;

      function yForPrice(p) {
        return plotTop + (yMaxPrice - p) / yPriceSpan * plotHeight;
      }

      function priceForY(y) {
        return yMaxPrice - ((y - plotTop) / plotHeight) * yPriceSpan;
      }

      // 1. Grid & Price Axis (right side)
      const pStep = niceStep(yPriceSpan, 6);
      const firstTickPrice = Math.ceil(yMinPrice / pStep) * pStep;

      ctx.lineWidth = 1;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      for (let p = firstTickPrice; p <= yMaxPrice; p += pStep) {
        const y = Math.round(yForPrice(p)) + 0.5;
        if (y < plotTop || y > plotBottom) continue;

        ctx.strokeStyle = colors.grid;
        ctx.beginPath();
        ctx.moveTo(plotLeft, y);
        ctx.lineTo(plotRight, y);
        ctx.stroke();

        ctx.fillStyle = colors.text;
        ctx.fillText(formatNumber(p), plotRight + 6, y);
      }

      // 2. Grid & Date Axis (bottom side)
      const visibleTimeSpan = bars[vEnd].time - bars[vStart].time;
      const targetDateTicks = Math.max(2, Math.min(7, Math.floor(plotWidth / 90)));
      const barStep = Math.max(1, Math.round(numVisible / targetDateTicks));

      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const firstTickIndex = Math.ceil(vStart / barStep) * barStep;
      for (let idx = firstTickIndex; idx <= vEnd; idx += barStep) {
        const x = Math.round(xForBarIndex(idx)) + 0.5;
        if (x < plotLeft || x > plotRight) continue;

        ctx.strokeStyle = colors.grid;
        ctx.beginPath();
        ctx.moveTo(x, plotTop);
        ctx.lineTo(x, plotBottom);
        ctx.stroke();

        ctx.fillStyle = colors.text;
        ctx.fillText(formatDate(bars[idx].time, visibleTimeSpan), x, plotBottom + 7);
      }

      // Draw plot borders
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      ctx.moveTo(plotRight + 0.5, plotTop);
      ctx.lineTo(plotRight + 0.5, plotBottom);
      ctx.lineTo(plotLeft, plotBottom + 0.5);
      ctx.stroke();

      // 3. Optional Volume Bars (bottom 16% of plot)
      if (maxVolume > 0) {
        const maxVolH = plotHeight * 0.16;
        ctx.fillStyle = colors.volume;
        if (renderedCandles) {
          for (let i = 0; i < renderedCandles.length; i++) {
            const c = renderedCandles[i];
            if (!c.v) continue;
            const vh = (c.v / maxVolume) * maxVolH;
            ctx.fillRect(c.x - c.width / 2, plotBottom - vh, Math.max(1, c.width), vh);
          }
        } else {
          const candleW = Math.max(2, Math.min(22, (plotWidth / numVisible) * 0.75));
          for (let i = vStart; i <= vEnd; i++) {
            const b = bars[i];
            if (!b.v) continue;
            const bx = xForBarIndex(i);
            const vh = (b.v / maxVolume) * maxVolH;
            ctx.fillRect(bx - candleW / 2, plotBottom - vh, Math.max(1, candleW), vh);
          }
        }
      }

      // 4. Candlesticks
      if (renderedCandles) {
        for (let i = 0; i < renderedCandles.length; i++) {
          const c = renderedCandles[i];
          const color = c.c >= c.o ? colors.up : colors.down;
          const yO = yForPrice(c.o);
          const yC = yForPrice(c.c);
          const yH = yForPrice(c.h);
          const yL = yForPrice(c.l);
          const bodyY = Math.min(yO, yC);
          const bodyH = Math.max(1, Math.abs(yC - yO));
          const cx = Math.round(c.x) + 0.5;

          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(cx, Math.round(yH));
          ctx.lineTo(cx, Math.round(yL));
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.fillRect(Math.round(c.x - c.width / 2), Math.round(bodyY), Math.max(1, Math.round(c.width)), bodyH);
        }
      } else {
        const candleW = Math.max(2, Math.min(22, (plotWidth / numVisible) * 0.75));
        for (let i = vStart; i <= vEnd; i++) {
          const b = bars[i];
          const color = b.c >= b.o ? colors.up : colors.down;
          const yO = yForPrice(b.o);
          const yC = yForPrice(b.c);
          const yH = yForPrice(b.h);
          const yL = yForPrice(b.l);
          const bodyY = Math.min(yO, yC);
          const bodyH = Math.max(1, Math.abs(yC - yO));
          const bx = Math.round(xForBarIndex(i)) + 0.5;

          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(bx, Math.round(yH));
          ctx.lineTo(bx, Math.round(yL));
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.fillRect(Math.round(bx - candleW / 2), Math.round(bodyY), Math.max(1, Math.round(candleW)), bodyH);
        }
      }

      // 5. Overlays (e.g. SMA line)
      for (let i = 0; i < overlays.length; i++) {
        const ov = overlays[i];
        const pts = ov.points || ov.data || ov.values || [];
        if (!pts.length) continue;

        ctx.strokeStyle = ov.color || colors.ink;
        ctx.lineWidth = ov.lineWidth || 1.8;
        ctx.beginPath();

        let started = false;
        for (let j = 0; j < pts.length; j++) {
          const pt = pts[j];
          if (!Number.isFinite(pt.value)) {
            started = false;
            continue;
          }
          if (pt.time < bars[vStart].time && j + 1 < pts.length && pts[j + 1].time < bars[vStart].time) {
            continue;
          }
          if (pt.time > bars[vEnd].time && started) {
            const x = xForTimestamp(pt.time);
            const y = yForPrice(pt.value);
            ctx.lineTo(x, y);
            break;
          }

          const x = xForTimestamp(pt.time);
          const y = yForPrice(pt.value);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // 6. Buy / Sell Markers
      for (let i = 0; i < markers.length; i++) {
        const m = markers[i];
        const barIdx = findBarIndex(m.time);
        if (barIdx < vStart - 1 || barIdx > vEnd + 1) continue;

        const mx = xForBarIndex(barIdx);
        const nearIdx = Math.max(0, Math.min(bars.length - 1, Math.round(barIdx)));
        const refBar = bars[nearIdx];
        const side = String(m.side || m.type || 'buy').toLowerCase();

        if (side === 'buy') {
          const anchorY = yForPrice(refBar.l) + 6;
          ctx.fillStyle = colors.up;
          ctx.beginPath();
          ctx.moveTo(mx, anchorY);
          ctx.lineTo(mx - 5, anchorY + 8);
          ctx.lineTo(mx + 5, anchorY + 8);
          ctx.closePath();
          ctx.fill();

          if (m.text || m.label) {
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(m.text || m.label, mx, anchorY + 9);
          }
        } else {
          const anchorY = yForPrice(refBar.h) - 6;
          ctx.fillStyle = colors.down;
          ctx.beginPath();
          ctx.moveTo(mx, anchorY);
          ctx.lineTo(mx - 5, anchorY - 8);
          ctx.lineTo(mx + 5, anchorY - 8);
          ctx.closePath();
          ctx.fill();

          if (m.text || m.label) {
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(m.text || m.label, mx, anchorY - 9);
          }
        }
      }

      // 7. Active Crosshair & OHLC Readout
      let activeBar = null;
      if (crosshair && crosshair.x >= plotLeft && crosshair.x <= plotRight && crosshair.y >= plotTop && crosshair.y <= plotBottom) {
        // Draw crosshair lines
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 1;

        // Vertical line
        ctx.beginPath();
        ctx.moveTo(crosshair.x + 0.5, plotTop);
        ctx.lineTo(crosshair.x + 0.5, plotBottom);
        ctx.stroke();

        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(plotLeft, crosshair.y + 0.5);
        ctx.lineTo(plotRight, crosshair.y + 0.5);
        ctx.stroke();
        ctx.restore();

        // Price badge on right axis
        const hoverPrice = priceForY(crosshair.y);
        ctx.fillStyle = colors.badgeBg;
        ctx.fillRect(plotRight + 2, crosshair.y - 9, padRight - 4, 18);
        ctx.fillStyle = colors.ink;
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatNumber(hoverPrice), plotRight + 5, crosshair.y);

        // Date badge on bottom axis
        const hoverIdx = Math.round(viewStart + ((crosshair.x - plotLeft) / plotWidth) * (viewEnd - viewStart));
        const clampedHoverIdx = Math.max(0, Math.min(bars.length - 1, hoverIdx));
        activeBar = bars[clampedHoverIdx];

        const dateStr = formatDate(activeBar.time, visibleTimeSpan);
        ctx.font = '10px monospace';
        const badgeW = ctx.measureText(dateStr).width + 10;
        ctx.fillStyle = colors.badgeBg;
        ctx.fillRect(crosshair.x - badgeW / 2, plotBottom + 2, badgeW, 17);
        ctx.fillStyle = colors.ink;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dateStr, crosshair.x, plotBottom + 11);
      } else {
        // Default readout: latest visible bar
        activeBar = bars[vEnd];
      }

      // Render OHLC readout in top bar
      if (activeBar) {
        const timeStr = formatDate(activeBar.time, 86400000 * 30);
        const candleColor = activeBar.c >= activeBar.o ? colors.up : colors.down;

        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = colors.text;
        ctx.fillText(`${timeStr}`, plotLeft + 4, padTop / 2);

        const readoutText = ` O: ${formatNumber(activeBar.o)}  H: ${formatNumber(activeBar.h)}  L: ${formatNumber(activeBar.l)}  C: ${formatNumber(activeBar.c)}${activeBar.v !== null ? `  V: ${activeBar.v.toLocaleString()}` : ''}`;
        const offset = ctx.measureText(`${timeStr} `).width;

        ctx.fillStyle = candleColor;
        ctx.fillText(readoutText, plotLeft + 4 + offset, padTop / 2);
      }
    }

    function requestDraw() {
      if (!animFrameId) {
        animFrameId = window.requestAnimationFrame(draw);
      }
    }

    // --- Interactive Event Listeners ---

    function onMouseDown(e) {
      if (e.button !== 0) return; // Only main button
      isDragging = true;
      dragStartX = e.clientX;
      dragStartViewStart = viewStart;
      dragStartViewEnd = viewEnd;
      canvas.style.cursor = 'grabbing';
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (isDragging) {
        const plotWidth = Math.max(10, rect.width - padLeft - padRight);
        const deltaX = e.clientX - dragStartX;
        const span = dragStartViewEnd - dragStartViewStart;
        const deltaBars = (deltaX / plotWidth) * span;

        let newStart = dragStartViewStart - deltaBars;
        let newEnd = dragStartViewEnd - deltaBars;

        if (newStart < 0) {
          newStart = 0;
          newEnd = Math.min(bars.length - 1, span);
        }
        if (newEnd > bars.length - 1) {
          newEnd = bars.length - 1;
          newStart = Math.max(0, newEnd - span);
        }

        viewStart = newStart;
        viewEnd = newEnd;
      }

      const plotLeft = padLeft;
      const plotRight = rect.width - padRight;
      const plotTop = padTop;
      const plotBottom = rect.height - padBottom;

      if (x >= plotLeft && x <= plotRight && y >= plotTop && y <= plotBottom) {
        crosshair = { x, y };
        if (!isDragging) canvas.style.cursor = 'crosshair';
      } else {
        crosshair = null;
        if (!isDragging) canvas.style.cursor = 'default';
      }

      requestDraw();
    }

    function onMouseUp() {
      if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'crosshair';
      }
    }

    function onMouseLeave() {
      isDragging = false;
      crosshair = null;
      canvas.style.cursor = 'default';
      requestDraw();
    }

    function onWheel(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const plotWidth = Math.max(10, rect.width - padLeft - padRight);
      const ratio = Math.max(0, Math.min(1, (mouseX - padLeft) / plotWidth));

      const span = viewEnd - viewStart;
      const zoomFactor = e.deltaY < 0 ? 0.82 : 1.22;
      const newSpan = Math.max(5, Math.min(bars.length, span * zoomFactor));

      let newStart = viewStart + (span - newSpan) * ratio;
      let newEnd = newStart + newSpan;

      if (newStart < 0) {
        newStart = 0;
        newEnd = Math.min(bars.length - 1, newSpan);
      }
      if (newEnd > bars.length - 1) {
        newEnd = bars.length - 1;
        newStart = Math.max(0, newEnd - newSpan);
      }

      viewStart = newStart;
      viewEnd = newEnd;
      requestDraw();
    }

    // Touch events for responsive mobile use (iPhone / 375px)
    function onTouchStart(e) {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartViewStart = viewStart;
        dragStartViewEnd = viewEnd;
        const rect = canvas.getBoundingClientRect();
        crosshair = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        requestDraw();
      } else if (e.touches.length === 2) {
        isDragging = false;
        touchPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchPinchSpan = viewEnd - viewStart;
      }
    }

    function onTouchMove(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const plotWidth = Math.max(10, rect.width - padLeft - padRight);

      if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - dragStartX;
        const span = dragStartViewEnd - dragStartViewStart;
        const deltaBars = (deltaX / plotWidth) * span;

        let newStart = dragStartViewStart - deltaBars;
        let newEnd = dragStartViewEnd - deltaBars;

        if (newStart < 0) {
          newStart = 0;
          newEnd = Math.min(bars.length - 1, span);
        }
        if (newEnd > bars.length - 1) {
          newEnd = bars.length - 1;
          newStart = Math.max(0, newEnd - span);
        }

        viewStart = newStart;
        viewEnd = newEnd;
        crosshair = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        requestDraw();
      } else if (e.touches.length === 2 && touchPinchDist > 0) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = touchPinchDist / dist;
        const newSpan = Math.max(5, Math.min(bars.length, touchPinchSpan * scale));
        const center = (viewStart + viewEnd) / 2;

        let newStart = center - newSpan / 2;
        let newEnd = center + newSpan / 2;

        if (newStart < 0) {
          newStart = 0;
          newEnd = Math.min(bars.length - 1, newSpan);
        }
        if (newEnd > bars.length - 1) {
          newEnd = bars.length - 1;
          newStart = Math.max(0, newEnd - newSpan);
        }

        viewStart = newStart;
        viewEnd = newEnd;
        requestDraw();
      }
    }

    function onTouchEnd() {
      isDragging = false;
      touchPinchDist = 0;
      crosshair = null;
      requestDraw();
    }

    // Attach DOM events
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    // Watch for resize
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => requestDraw())
      : null;
    if (resizeObserver) {
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener('resize', requestDraw);
    }

    // Watch for theme attribute switches on document
    const themeObserver = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(() => requestDraw())
      : null;
    if (themeObserver) {
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
    }

    // Initial render
    draw();

    // Public API
    function setData(newData) {
      if (!newData) return;
      const isFirstLoad = !bars || !bars.length;
      if (newData.bars) {
        bars = newData.bars;
        if (isFirstLoad || viewEnd >= bars.length || viewStart >= bars.length) {
          resetViewRange();
        }
      }
      if (newData.overlays !== undefined) {
        overlays = newData.overlays;
      }
      if (newData.markers !== undefined) {
        markers = newData.markers;
      }
      draw();
    }

    function destroy() {
      if (animFrameId) {
        window.cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('wheel', onWheel);

      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', requestDraw);
      }
      if (themeObserver) {
        themeObserver.disconnect();
      }
    }

    return {
      setData,
      destroy
    };
  }

  const AcademyChart = { create };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AcademyChart;
  }
  root.AcademyChart = AcademyChart;
})(typeof window !== 'undefined' ? window : globalThis);
