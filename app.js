function updateClock() {
  var now = new Date();
  var time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  var date = now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
  document.getElementById("time").textContent = time;
  document.getElementById("date").textContent = date;
}

function enterFullscreen() {
  var el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

document.getElementById("fullscreenBtn").addEventListener("click", enterFullscreen);

updateClock();
setInterval(updateClock, 30000);

// Small PWA helper. The app remains usable even if service workers are unsupported.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(function () {});
}
