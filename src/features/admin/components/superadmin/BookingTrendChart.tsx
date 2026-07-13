import React, { useEffect, useRef, useState } from 'react';
import { parseDateId } from '../../../../lib/dates';

interface BookingTrendChartProps {
  /** Oldest → newest, one point per day. */
  data: { date: string; count: number }[];
}

const HEIGHT = 180;
const PADDING = { top: 16, right: 12, bottom: 24, left: 24 };
const FALLBACK_WIDTH = 600;

const shortDateLabel = (dateId: string) =>
  parseDateId(dateId).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

// Single-series trend — line + 10%-opacity area wash, per the dataviz mark
// spec. The endpoint value is always direct-labeled (not just on hover)
// because the line color alone doesn't clear contrast against a white card.
//
// The SVG is sized in real pixels (measured via ResizeObserver) rather than
// a fixed viewBox stretched with preserveAspectRatio="none" — a non-uniform
// scale would distort strokes/dots into ellipses on any card wider than the
// viewBox's fixed aspect ratio.
const BookingTrendChart: React.FC<BookingTrendChartProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(FALLBACK_WIDTH);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const plotWidth = width - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const yMax = maxCount <= 5 ? 5 : Math.ceil(maxCount / 5) * 5;
  const yTicks = [0, Math.round(yMax / 2), yMax];

  const xAt = (i: number) =>
    PADDING.left + (data.length === 1 ? plotWidth / 2 : (i / (data.length - 1)) * plotWidth);
  const yAt = (count: number) => PADDING.top + plotHeight - (count / yMax) * plotHeight;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(d.count)}`).join(' ');
  const areaPath = `${linePath} L ${xAt(data.length - 1)} ${PADDING.top + plotHeight} L ${xAt(0)} ${PADDING.top + plotHeight} Z`;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    const ratio = (relX - PADDING.left) / plotWidth;
    const idx = Math.round(ratio * (data.length - 1));
    setHoverIndex(Math.min(data.length - 1, Math.max(0, idx)));
  };

  if (totalCount === 0) {
    return (
      <div ref={containerRef} className="flex items-center justify-center h-[180px] text-sm text-ld-fog">
        Belum ada booking dalam 14 hari terakhir.
      </div>
    );
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const lastPoint = data[data.length - 1];
  const labelIndices = [0, Math.floor((data.length - 1) / 2), data.length - 1];

  return (
    <div ref={containerRef} className="relative">
      <svg
        width={width}
        height={HEIGHT}
        className="touch-none block"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING.left} x2={width - PADDING.right} y1={yAt(tick)} y2={yAt(tick)}
              className="stroke-ld-frost" strokeWidth={1}
            />
            <text x={PADDING.left} y={yAt(tick) - 3} className="fill-ld-fog" fontSize={9}>
              {tick}
            </text>
          </g>
        ))}

        <path d={areaPath} className="fill-ld-violet" fillOpacity={0.1} stroke="none" />
        <path d={linePath} fill="none" className="stroke-ld-violet" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {labelIndices.map((i) => (
          <text key={i} x={xAt(i)} y={HEIGHT - 6} textAnchor="middle" className="fill-ld-fog" fontSize={9}>
            {shortDateLabel(data[i].date)}
          </text>
        ))}

        <circle cx={xAt(data.length - 1)} cy={yAt(lastPoint.count)} r={4} className="fill-ld-violet stroke-white" strokeWidth={2} />
        <text
          x={xAt(data.length - 1)} y={yAt(lastPoint.count) - 10} textAnchor="end"
          className="fill-ld-graphite" fontSize={11} fontWeight={600}
        >
          {lastPoint.count}
        </text>

        {hovered && hoverIndex !== null && (
          <>
            <line
              x1={xAt(hoverIndex)} x2={xAt(hoverIndex)} y1={PADDING.top} y2={PADDING.top + plotHeight}
              className="stroke-ld-ash" strokeWidth={1}
            />
            <circle cx={xAt(hoverIndex)} cy={yAt(hovered.count)} r={4} className="fill-ld-violet stroke-white" strokeWidth={2} />
          </>
        )}
      </svg>

      {hovered && hoverIndex !== null && (
        <div
          className={`absolute top-1 px-2.5 py-1.5 rounded-lg bg-ld-onyx text-white text-[11px] shadow-lg pointer-events-none whitespace-nowrap z-10 ${
            hoverIndex === 0 ? '' : hoverIndex === data.length - 1 ? '-translate-x-full' : '-translate-x-1/2'
          }`}
          style={{ left: `${xAt(hoverIndex)}px` }}
        >
          <p className="m-0 font-semibold">{hovered.count} booking</p>
          <p className="m-0 text-ld-fog">
            {parseDateId(hovered.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingTrendChart;
