import { useMemo } from 'react'
import {
  ComposedChart, Bar, XAxis, YAxis, ReferenceLine,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { OHLCBar } from '../../types/ohlc'

const AXIS_COLOR = '#555555'
const TOOLTIP_STYLE = {
  background: '#0a0a0a',
  border: '1px solid #2a2a2a',
  borderRadius: 2,
  fontSize: 11,
  fontFamily: 'JetBrains Mono, monospace',
  color: '#e0e0e0',
}

interface TradeDetailPanelProps {
  ticker: string
  entryPrice: number
  targetPrice?: number
  stopPrice?: number
  entryDate: string
  closePrice?: number
  exitReason?: string
  bars: OHLCBar[]
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatPrice(v: number): string {
  return `$${v.toFixed(2)}`
}

interface CandlestickBarProps {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: OHLCBar
  dataMin: number
}

function CandlestickBar({ x, y, width, height, payload, dataMin }: CandlestickBarProps) {
  if (x == null || y == null || width == null || height == null || width <= 0 || height <= 0) return null
  const { o, h, l, c } = payload ?? { o: 0, h: 0, l: 0, c: 0 }

  const cx = x + width / 2
  const bw = Math.max(width * 0.6, 2)
  const ppu = height / (h - dataMin)

  const highY = y
  const lowY = y + (h - l) * ppu
  const openY = y + (h - o) * ppu
  const closeY = y + (h - c) * ppu
  const isUp = c >= o
  const color = isUp ? '#00ff88' : '#ff3b3b'

  return (
    <g>
      <line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={color} strokeWidth={1} />
      <rect
        x={cx - bw / 2}
        y={Math.min(openY, closeY)}
        width={bw}
        height={Math.max(Math.abs(closeY - openY), 1)}
        fill={color}
        fillOpacity={0.7}
      />
    </g>
  )
}

export default function TradeDetailPanel({
  ticker, entryPrice, targetPrice, stopPrice, entryDate,
  closePrice, exitReason, bars,
}: TradeDetailPanelProps) {
  if (!bars || bars.length === 0) {
    return (
      <div className="border-t border-border bg-bg-card">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-text-bright">{ticker}</span>
        </div>
        <div className="py-8 text-center text-xs text-text-dim font-mono">NO DATA</div>
      </div>
    )
  }

  const { dataMin, dataMax, displayBars } = useMemo(() => {
    const allLow = Math.min(...bars.map(b => b.l))
    const allHigh = Math.max(...bars.map(b => b.h))
    const pad = (allHigh - allLow) * 0.05

    const entryIdx = bars.findIndex(b => new Date(b.d) >= new Date(entryDate))
    const startIdx = Math.max(0, entryIdx - 25)
    const subset = bars.slice(startIdx)

    return {
      dataMin: allLow - pad,
      dataMax: allHigh + pad,
      displayBars: subset,
    }
  }, [bars, entryDate])

  const exitColor = exitReason === 'TARGET_HIT' ? '#00ff88'
    : exitReason === 'STOPPED_OUT' ? '#ff3b3b'
    : '#888888'

  return (
    <div className="border-t border-border bg-bg-card">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-text-bright">{ticker}</span>
        <div className="flex items-center gap-3 text-2xs font-mono text-text-dim">
          <span>ENTRY <span className="text-text">${entryPrice.toFixed(2)}</span></span>
          {targetPrice != null && (
            <span>TP <span className="text-green">${targetPrice.toFixed(2)}</span></span>
          )}
          {stopPrice != null && (
            <span>SL <span className="text-red">${stopPrice.toFixed(2)}</span></span>
          )}
          {closePrice != null && (
            <span>EXIT <span className="text-text-dim">${closePrice.toFixed(2)}</span></span>
          )}
        </div>
      </div>
      <div className="p-3">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={displayBars} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <XAxis
              dataKey="d"
              tick={{ fill: AXIS_COLOR, fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickFormatter={formatDate}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis
              domain={[dataMin, dataMax]}
              tick={{ fill: AXIS_COLOR, fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickFormatter={formatPrice}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value: number, name: string) => [
                formatPrice(value),
                name.toUpperCase(),
              ]}
              labelFormatter={(label: string) => formatDate(label)}
            />
            <Bar
              dataKey="h"
              shape={<CandlestickBar dataMin={dataMin} />}
              isAnimationActive={false}
            />

            <ReferenceLine
              y={entryPrice}
              stroke="#ffd700"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: `ENTRY $${entryPrice.toFixed(2)}`,
                fill: '#ffd700',
                fontSize: 9,
                fontFamily: 'JetBrains Mono',
                position: 'insideTopRight',
              }}
            />

            <ReferenceLine
              x={entryDate}
              stroke="#ffd700"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: formatDate(entryDate),
                fill: '#ffd700',
                fontSize: 9,
                fontFamily: 'JetBrains Mono',
                position: 'insideTopLeft',
              }}
            />

            {targetPrice != null && (
              <ReferenceLine
                y={targetPrice}
                stroke="#00ff88"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: 'TP',
                  fill: '#00ff88',
                  fontSize: 9,
                  fontFamily: 'JetBrains Mono',
                  position: 'insideTopRight',
                }}
              />
            )}

            {stopPrice != null && (
              <ReferenceLine
                y={stopPrice}
                stroke="#ff3b3b"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: 'SL',
                  fill: '#ff3b3b',
                  fontSize: 9,
                  fontFamily: 'JetBrains Mono',
                  position: 'insideTopRight',
                }}
              />
            )}

            {closePrice != null && (
              <ReferenceLine
                y={closePrice}
                stroke={exitColor}
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: exitReason === 'TARGET_HIT' ? 'TP HIT' :
                         exitReason === 'STOPPED_OUT' ? 'SL HIT' : 'EXIT',
                  fill: exitColor,
                  fontSize: 9,
                  fontFamily: 'JetBrains Mono',
                  position: 'insideTopRight',
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
