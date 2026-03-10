import { createFileRoute } from '@tanstack/react-router'
import { GRID_CELLS } from '../lib/weatherGrid'
import { findCell } from '../lib/weatherMovement'
import { useWeatherStore } from '../stores/weatherStore'
import { HexGrid } from '../components/HexGrid/HexGrid'
import { WeatherEffect } from '../components/WeatherEffect/WeatherEffect'
import styles from './Weather.module.css'

export const Route = createFileRoute('/weather')({
  component: WeatherPage,
})

function WeatherPage() {
  const markerPosition = useWeatherStore((s) => s.markerPosition)
  const lastRoll = useWeatherStore((s) => s.lastRoll)
  const advanceDay = useWeatherStore((s) => s.advanceDay)
  const placeMarker = useWeatherStore((s) => s.placeMarker)
  const reset = useWeatherStore((s) => s.reset)

  const currentCell = findCell(markerPosition.row, markerPosition.col, GRID_CELLS)

  return (
    <div>
      <h1>Weather Simulator</h1>

      <div className={styles.controls}>
        <button className={styles.primaryButton} onClick={advanceDay} type="button">
          Next Day
        </button>
        <button className={styles.secondaryButton} onClick={reset} type="button">
          Reset
        </button>
        {lastRoll && (
          <span className={styles.rollResult}>
            d6: {lastRoll.value} ({lastRoll.direction})
          </span>
        )}
      </div>

      <HexGrid
        cells={GRID_CELLS}
        markerPosition={markerPosition}
        onHexClick={placeMarker}
      />

      {currentCell && <WeatherEffect weatherType={currentCell.weather} />}
    </div>
  )
}
