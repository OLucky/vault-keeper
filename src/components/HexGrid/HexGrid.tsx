import { WeatherType, BLOCKED_EDGES, Direction, START_HEX } from '../../lib/weatherGrid'
import type { HexCell } from '../../lib/weatherGrid'
import styles from './HexGrid.module.css'

interface HexGridProps {
  cells: HexCell[]
  markerPosition: { row: number; col: number }
  onHexClick?: (row: number, col: number) => void
}

const R = 28
const W = Math.sqrt(3) * R
const H = 2 * R

const WEATHER_COLORS: Record<WeatherType, string> = {
  [WeatherType.Still]: '#1a2030',
  [WeatherType.Hazy]: '#2a3a5a',
  [WeatherType.DustStorm]: '#4a3a2a',
  [WeatherType.SandStorm]: '#6a4a1a',
  [WeatherType.Heatwave]: '#5a2020',
  [WeatherType.WormPollen]: '#2a4a2a',
  [WeatherType.Rain]: '#1a3a5a',
  [WeatherType.PrismaticTempest]: '#4a2a5a',
}

const WEATHER_ABBR: Record<WeatherType, string> = {
  [WeatherType.Still]: 'S',
  [WeatherType.Hazy]: 'HZ',
  [WeatherType.DustStorm]: 'DS',
  [WeatherType.SandStorm]: 'SS',
  [WeatherType.Heatwave]: 'HW',
  [WeatherType.WormPollen]: 'WP',
  [WeatherType.Rain]: 'R',
  [WeatherType.PrismaticTempest]: 'PT',
}

const WEATHER_DISPLAY: Record<WeatherType, string> = {
  [WeatherType.Still]: 'Still',
  [WeatherType.Hazy]: 'Hazy',
  [WeatherType.DustStorm]: 'Dust Storm',
  [WeatherType.SandStorm]: 'Sand Storm',
  [WeatherType.Heatwave]: 'Heatwave',
  [WeatherType.WormPollen]: 'Worm-pollen',
  [WeatherType.Rain]: 'Rain',
  [WeatherType.PrismaticTempest]: 'Prismatic Tempest',
}

function hexCenter(row: number, col: number): { x: number; y: number } {
  const x = col * W + (row % 2 === 1 ? W / 2 : 0)
  const y = row * H * 0.75
  return { x, y }
}

function hexVertices(cx: number, cy: number): string {
  const points: string[] = []
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i + 30
    const angleRad = (Math.PI / 180) * angleDeg
    points.push(`${cx + R * Math.cos(angleRad)},${cy + R * Math.sin(angleRad)}`)
  }
  return points.join(' ')
}

/**
 * Compute offset for blocked-edge "X" markers.
 * Returns a point between the hex center and the neighboring hex
 * in the given direction (placed at the edge midpoint).
 */
function blockedEdgePosition(
  row: number,
  col: number,
  direction: Direction
): { x: number; y: number } {
  const { x: cx, y: cy } = hexCenter(row, col)

  // For pointy-top odd-r, the six direction offsets in pixel space
  // map to angles. We'll compute the neighbor center and place the X halfway.
  const oddRow = row % 2 === 1

  let dr = 0
  let dc = 0
  switch (direction) {
    case Direction.UpperLeft:
      dr = -1
      dc = oddRow ? 0 : -1
      break
    case Direction.UpperRight:
      dr = -1
      dc = oddRow ? 1 : 0
      break
    case Direction.Right:
      dr = 0
      dc = 1
      break
    case Direction.LowerRight:
      dr = 1
      dc = oddRow ? 1 : 0
      break
    case Direction.LowerLeft:
      dr = 1
      dc = oddRow ? 0 : -1
      break
    case Direction.Left:
      dr = 0
      dc = -1
      break
  }

  const neighborCenter = hexCenter(row + dr, col + dc)
  return {
    x: (cx + neighborCenter.x) / 2,
    y: (cy + neighborCenter.y) / 2,
  }
}

export function HexGrid({ cells, markerPosition, onHexClick }: HexGridProps) {
  // Compute viewBox from cell positions
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const cell of cells) {
    const { x, y } = hexCenter(cell.row, cell.col)
    if (x - R < minX) minX = x - R
    if (y - R < minY) minY = y - R
    if (x + R > maxX) maxX = x + R
    if (y + R > maxY) maxY = y + R
  }

  const padding = 10
  const vbX = minX - padding
  const vbY = minY - padding
  const vbW = maxX - minX + padding * 2
  const vbH = maxY - minY + padding * 2

  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.gridSvg}
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {cells.map((cell) => {
          const { x, y } = hexCenter(cell.row, cell.col)
          const isMarker =
            cell.row === markerPosition.row && cell.col === markerPosition.col
          const isStart =
            cell.row === START_HEX.row && cell.col === START_HEX.col

          return (
            <g
              key={`${cell.row}-${cell.col}`}
              onClick={() => onHexClick?.(cell.row, cell.col)}
              style={{ cursor: onHexClick ? 'pointer' : 'default' }}
            >
              <polygon
                points={hexVertices(x, y)}
                fill={WEATHER_COLORS[cell.weather]}
                stroke={isMarker ? '#39c5cf' : '#2a3444'}
                strokeWidth={isMarker ? 3 : 1}
              />
              {isMarker && (
                <circle cx={x} cy={y} r={4} fill="#39c5cf" opacity={0.8} />
              )}
              <text
                x={x}
                y={isStart ? y - 4 : y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#c8d0dc"
                fontSize={9}
                fontFamily="system-ui, sans-serif"
                pointerEvents="none"
              >
                {WEATHER_ABBR[cell.weather]}
              </text>
              {isStart && (
                <text
                  x={x}
                  y={y + 8}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#39c5cf"
                  fontSize={7}
                  fontFamily="system-ui, sans-serif"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  Start
                </text>
              )}
            </g>
          )
        })}

        {BLOCKED_EDGES.map((edge) => {
          const pos = blockedEdgePosition(edge.row, edge.col, edge.direction)
          return (
            <text
              key={`blocked-${edge.row}-${edge.col}-${edge.direction}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#cf4f6f"
              fontSize={8}
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
              pointerEvents="none"
            >
              X
            </text>
          )
        })}
      </svg>

      <div className={styles.legend}>
        {Object.values(WeatherType).map((wt) => (
          <div key={wt} className={styles.legendItem}>
            <div
              className={styles.legendSwatch}
              style={{ backgroundColor: WEATHER_COLORS[wt] }}
            />
            <span className={styles.legendLabel}>{WEATHER_DISPLAY[wt]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
