window.APP_CONFIG = {
  placeName: "Lausanne, Switzerland",

  latitude: 46.5197,
  longitude: 6.6323,
  radiusMeters: 700,
  maxStationSearchRadiusMeters: 1500,

  forecastStepHours: 2,
  forecastSlots: 7,

  weatherRefreshMinutes: 30,
  transportRefreshMinutes: 3,
  pollenRefreshMinutes: 180,
  countdownRefreshSeconds: 1,

  favoriteDestinations: [
    { name: "Lausanne-Flon", icon: "🏙️", match: "Flon" },
    { name: "Malley", icon: "🏢", match: "Malley" }
  ],

  pollenTypes: [
    { key: "grass_pollen", label: "Grasses", fr: "graminées" },
    { key: "birch_pollen", label: "Birch", fr: "bouleau" },
    { key: "ragweed_pollen", label: "Ambrosia", fr: "ambroisie" },
    { key: "olive_pollen", label: "Olive", fr: "olivier" },
    { key: "alder_pollen", label: "Alder", fr: "aulne" },
    { key: "mugwort_pollen", label: "Mugwort", fr: "armoise" }
  ]
};
