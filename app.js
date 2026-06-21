function updateClock() {
  var now = new Date();
  var time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  var date = now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
  document.getElementById("time").textContent = time;
  document.getElementById("date").textContent = date;
}

function isFullscreen() {
  return document.fullscreenElement || document.webkitFullscreenElement;
}

function updateFullscreenButton() {
  var btn = document.getElementById("fullscreenBtn");
  if (!btn) return;
  btn.textContent = isFullscreen() ? "↙ Exit fullscreen" : "⛶ Fullscreen";
}

function toggleFullscreen() {
  if (isFullscreen()) {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    return;
  }

  var el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

document.getElementById("fullscreenBtn").addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", updateFullscreenButton);
document.addEventListener("webkitfullscreenchange", updateFullscreenButton);

updateClock();
updateFullscreenButton();
setInterval(updateClock, 30000);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(function () {});
}
