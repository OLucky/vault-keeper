export const WeatherType = {
  Still: "Still",
  Hazy: "Hazy",
  DustStorm: "DustStorm",
  SandStorm: "SandStorm",
  Heatwave: "Heatwave",
  WormPollen: "WormPollen",
  Rain: "Rain",
  PrismaticTempest: "PrismaticTempest",
} as const;

export type WeatherType = (typeof WeatherType)[keyof typeof WeatherType];

export type HexCell = { row: number; col: number; weather: WeatherType };

export const GRID_CELLS: HexCell[] = [
  // Row 0
  { row: 0, col: 3, weather: WeatherType.PrismaticTempest },

  // Row 1
  { row: 1, col: 2, weather: WeatherType.WormPollen },
  { row: 1, col: 3, weather: WeatherType.Heatwave },

  // Row 2
  { row: 2, col: 1, weather: WeatherType.WormPollen },
  { row: 2, col: 2, weather: WeatherType.Hazy },
  { row: 2, col: 3, weather: WeatherType.Hazy },
  { row: 2, col: 4, weather: WeatherType.Heatwave },
  { row: 2, col: 5, weather: WeatherType.DustStorm },

  // Row 3
  { row: 3, col: 1, weather: WeatherType.WormPollen },
  { row: 3, col: 2, weather: WeatherType.WormPollen },
  { row: 3, col: 3, weather: WeatherType.Hazy },
  { row: 3, col: 4, weather: WeatherType.Hazy },
  { row: 3, col: 5, weather: WeatherType.Still },
  { row: 3, col: 6, weather: WeatherType.Heatwave },

  // Row 4
  { row: 4, col: 0, weather: WeatherType.WormPollen },
  { row: 4, col: 1, weather: WeatherType.WormPollen },
  { row: 4, col: 2, weather: WeatherType.Hazy },
  { row: 4, col: 3, weather: WeatherType.Still },
  { row: 4, col: 4, weather: WeatherType.Still },
  { row: 4, col: 5, weather: WeatherType.Heatwave },
  { row: 4, col: 6, weather: WeatherType.Heatwave },

  // Row 5 (START row)
  { row: 5, col: 0, weather: WeatherType.Still },
  { row: 5, col: 1, weather: WeatherType.Still },
  { row: 5, col: 2, weather: WeatherType.Still },
  { row: 5, col: 3, weather: WeatherType.Still },
  { row: 5, col: 4, weather: WeatherType.Hazy },
  { row: 5, col: 5, weather: WeatherType.Still },
  { row: 5, col: 6, weather: WeatherType.Heatwave },

  // Row 6
  { row: 6, col: 0, weather: WeatherType.Still },
  { row: 6, col: 1, weather: WeatherType.DustStorm },
  { row: 6, col: 2, weather: WeatherType.Still },
  { row: 6, col: 3, weather: WeatherType.Still },
  { row: 6, col: 4, weather: WeatherType.Rain },
  { row: 6, col: 5, weather: WeatherType.DustStorm },
  { row: 6, col: 6, weather: WeatherType.Heatwave },

  // Row 7
  { row: 7, col: 1, weather: WeatherType.Still },
  { row: 7, col: 2, weather: WeatherType.DustStorm },
  { row: 7, col: 3, weather: WeatherType.SandStorm },
  { row: 7, col: 4, weather: WeatherType.SandStorm },
  { row: 7, col: 5, weather: WeatherType.Still },

  // Row 8
  { row: 8, col: 1, weather: WeatherType.SandStorm },
  { row: 8, col: 2, weather: WeatherType.SandStorm },
  { row: 8, col: 3, weather: WeatherType.Rain },
  { row: 8, col: 4, weather: WeatherType.Still },

  // Row 9
  { row: 9, col: 2, weather: WeatherType.SandStorm },
  { row: 9, col: 3, weather: WeatherType.PrismaticTempest },
  { row: 9, col: 4, weather: WeatherType.SandStorm },

  // Row 10
  { row: 10, col: 3, weather: WeatherType.PrismaticTempest },
];

export const START_HEX = { row: 5, col: 3 };

export const Direction = {
  UpperLeft: 1,
  UpperRight: 2,
  Right: 3,
  LowerRight: 4,
  LowerLeft: 5,
  Left: 6,
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

export const DIRECTION_LABELS: Record<Direction, string> = {
  [Direction.UpperLeft]: "Upper-left",
  [Direction.UpperRight]: "Upper-right",
  [Direction.Right]: "Right",
  [Direction.LowerRight]: "Lower-right",
  [Direction.LowerLeft]: "Lower-left",
  [Direction.Left]: "Left",
};

export const BLOCKED_EDGES: Array<{ row: number; col: number; direction: Direction }> = [
  // Top vertex area
  { row: 0, col: 3, direction: Direction.UpperLeft },
  { row: 0, col: 3, direction: Direction.UpperRight },
  { row: 1, col: 2, direction: Direction.UpperLeft },
  { row: 1, col: 3, direction: Direction.UpperRight },

  // Right boundary
  { row: 2, col: 5, direction: Direction.Right },
  { row: 5, col: 6, direction: Direction.Right },

  // Bottom vertex area
  { row: 10, col: 3, direction: Direction.LowerRight },
  { row: 10, col: 3, direction: Direction.LowerLeft },
  { row: 9, col: 4, direction: Direction.LowerRight },
  { row: 9, col: 2, direction: Direction.LowerLeft },

  // Lower-left boundary
  { row: 8, col: 1, direction: Direction.LowerLeft },
];

export function isEdgeBlocked(row: number, col: number, direction: Direction): boolean {
  return BLOCKED_EDGES.some((e) => e.row === row && e.col === col && e.direction === direction);
}

export const WEATHER_EFFECTS: Record<WeatherType, { name: string; description: string }> = {
  [WeatherType.Still]: {
    name: "Still",
    description:
      "The desert landscape is still, untroubled by the susurration of the heavens. Visibility is good.",
  },
  [WeatherType.Hazy]: {
    name: "Hazy",
    description:
      "The air is still, but mists of a lurid hue hang over the desert. Visibility is impaired and landmarks cannot be seen from a distance. Vigilance checks are made with disadvantage.",
  },
  [WeatherType.DustStorm]: {
    name: "Dust Storm",
    description:
      "The wind blows sheets of blue dust across the desert. Visibility is badly impaired. Traveling under such conditions is possible, but the pace is slowed to half normal speed. A three-day journey will take six days, and so on. Vigilance checks are made with disadvantage.",
  },
  [WeatherType.SandStorm]: {
    name: "Sand Storm",
    description:
      "A howling wind blows a ferocious cloud of azure sand across the desert. Nobody travels in Vaarn's sandstorms; the PCs must hunker down and wait out the storm. Tents or other makeshift shelters will provide adequate protection. Any encounters rolled during these days are assumed to be seeking shelter from the storm in the same place as the party.",
  },
  [WeatherType.Heatwave]: {
    name: "Heatwave",
    description:
      "Urth's dying sun musters all the warmth it can. PCs must consume twice their normal ration of water per day if they wish to travel during a heatwave.",
  },
  [WeatherType.WormPollen]: {
    name: "Worm-pollen",
    description:
      "Vaarnish sandworms reproduce through a baroque, decade-long process of parthenogenesis, culminating in the explosive release of thousands of melon-sized spores into the atmosphere. This worm-pollen drifts back to Urth in ponderous sticky deluges that can last for weeks. Progress through shifting mounds of the stuff is slowed to half normal speed; the upside is that the worm-pollen is edible, and many a starving man has been saved by the timely arrival of spores from the heavens. Treat worm-pollen days as providing d4 rations per player.",
  },
  [WeatherType.Rain]: {
    name: "Rain",
    description:
      "A rare bounty. The parched blue earth is blessed with water. The party may collect 2d6 days of rations per member. In the aftermath of a rainshower, the desert is conquered by a short-lived imperium of majestic flora.",
  },
  [WeatherType.PrismaticTempest]: {
    name: "Prismatic Tempest",
    description:
      "The sky bruises with clouds of midnight blue. Howling winds carry scouring sheets of sand across the landscape. Thunder rends the air and polychromatic lightning caresses the desert like the tendrils of a jellyfish deity. No travel of any kind is possible, and the PCs will take 3d6 electrical damage every hour they spend aboveground.",
  },
};
