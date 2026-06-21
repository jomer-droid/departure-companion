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

function setPresentationMode(active) {
  document.body.classList.toggle("presentation", active);
  var btn = document.getElementById("presentationBtn");
  btn.textContent = active ? "↙ Smaller screen" : "⛶ Presentation mode";
}

function requestFull() {
  var el = document.documentElement;
  if (el.requestFullscreen) return el.requestFullscreen();
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
}

function exitFull() {
  if (document.exitFullscreen) return document.exitFullscreen();
  if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
}

function togglePresentation() {
  var active = document.body.classList.contains("presentation");

  if (active) {
    setPresentationMode(false);
    try { exitFull(); } catch (e) {}
    return;
  }

  setPresentationMode(true);
  try { requestFull(); } catch (e) {}
}

document.getElementById("presentationBtn").addEventListener("click", togglePresentation);

document.addEventListener("fullscreenchange", function () {
  setPresentationMode(!!isFullscreen());
});
document.addEventListener("webkitfullscreenchange", function () {
  setPresentationMode(!!isFullscreen());
});

updateClock();
setPresentationMode(false);
setInterval(updateClock, 30000);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js?v=3").catch(function () {});
}
