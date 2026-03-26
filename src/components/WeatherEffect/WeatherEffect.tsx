import { WeatherType, WEATHER_EFFECTS } from "../../lib/weatherGrid";
import styles from "./WeatherEffect.module.css";

interface WeatherEffectProps {
  weatherType: WeatherType;
}

export function WeatherEffect({ weatherType }: WeatherEffectProps) {
  const effect = WEATHER_EFFECTS[weatherType];

  return (
    <div className={styles.card}>
      <h2 className={styles.name}>{effect.name}</h2>
      <p className={styles.description}>{effect.description}</p>
    </div>
  );
}
