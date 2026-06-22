window.APP_CONFIG = {
  placeName: "Lausanne, Switzerland",

  // Public fallback only. Do not put your home coordinates here.
  latitude: 46.5197,
  longitude: 6.6323,
  radiusMeters: 700,

  forecastStepHours: 2,
  forecastSlots: 7,

  // Weather changes slowly; departures change quickly.
  weatherRefreshMinutes: 30,
  transportRefreshMinutes: 3,
  countdownRefreshSeconds: 1,

  favoriteDestinations: [
    { name: "Lausanne-Flon", icon: "🏙️", match: "Flon" },
    { name: "Malley", icon: "🏢", match: "Malley" }
  ]
};
