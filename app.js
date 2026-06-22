var PUBLIC_CONFIG = window.APP_CONFIG || {};
var STORAGE_KEY = "departureCompanionPrivateSettingsV1";
var C = {};
var lastDepartures = [];

function $(id){ return document.getElementById(id); }
function round(n){ return Math.round(n); }

function readPrivateSettings(){
  try { var raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; }
  catch(e){ return null; }
}
function savePrivateSettings(settings){ localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }
function buildConfig(){
  C = {};
  for (var k in PUBLIC_CONFIG) C[k] = PUBLIC_CONFIG[k];
  var local = readPrivateSettings();
  if (local) {
    if (local.latitude) C.latitude = Number(local.latitude);
    if (local.longitude) C.longitude = Number(local.longitude);
    if (local.radiusMeters) C.radiusMeters = Number(local.radiusMeters);
    if (local.placeName) C.placeName = local.placeName;
    C.hasPrivateSettings = true;
  } else C.hasPrivateSettings = false;
}
function showSetup(show){ $("setupPanel").className = show ? "setup" : "setup hidden"; }
function updateClock(){
  var n = new Date();
  $("time").textContent = n.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
  $("date").textContent = n.toLocaleDateString([], {weekday:"long", day:"numeric", month:"long"});
}
function weatherIcon(c){
  if(c===0)return"☀️"; if(c===1||c===2)return"🌤️"; if(c===3)return"☁️";
  if(c>=45&&c<=48)return"🌫️"; if(c>=51&&c<=67)return"🌦️";
  if(c>=71&&c<=77)return"❄️"; if(c>=80&&c<=82)return"🌧️"; if(c>=95)return"⛈️";
  return"☁️";
}
function timeLeftParts(ms){
  if(ms < 0) ms = 0;
  var total = Math.floor(ms / 1000), m = Math.floor(total / 60), s = total % 60;
  return { m:m, s:s, text:m + "m " + (s < 10 ? "0" : "") + s + "s" };
}
function updateCountdowns(){
  var nodes = document.querySelectorAll("[data-departure-ms]");
  for(var i=0;i<nodes.length;i++){
    var p = timeLeftParts(Number(nodes[i].getAttribute("data-departure-ms")) - Date.now());
    nodes[i].innerHTML = p.m + '<small>m ' + (p.s < 10 ? '0' : '') + p.s + 's</small>';
  }
  var metro = lastDepartures.filter(function(d){ return priority(d) === 1 && d.departureMs; })
    .sort(function(a,b){ return a.departureMs - b.departureMs; })[0];
  $("nextMetro").textContent = metro ? timeLeftParts(metro.departureMs - Date.now()).text : "--";
}
function recommendation(h){
  var now = new Date(), times = h.time.map(function(t){return new Date(t);});
  var start = times.findIndex(function(t){return t >= now;}); if(start < 0) start = 0;
  var next = [];
  for(var i=start; i<Math.min(start+12, h.time.length); i++){
    next.push({time:h.time[i], temp:h.temperature_2m[i], rainProb:h.precipitation_probability[i]||0,
      precip:h.precipitation[i]||0, uv:h.uv_index?h.uv_index[i]:0, wind:h.wind_speed_10m?h.wind_speed_10m[i]:0});
  }
  var rainy=next.find(function(x){return x.rainProb>=55||x.precip>=.3;});
  var cold=next.find(function(x){return x.temp<=8;});
  var hot=next.find(function(x){return x.temp>=28;});
  var uv=next.find(function(x){return x.uv>=7;});
  var windy=next.find(function(x){return x.wind>=35;});
  if(rainy&&cold)return["☔🧥","Umbrella + coat","Rain and cold conditions expected"];
  if(rainy)return["☔","Take umbrella","Rain likely around "+rainy.time.slice(11,16)];
  if(cold)return["🧥","Take a coat","Cold conditions expected"];
  if(uv)return["🧴","Take sunscreen","High UV expected today"];
  if(hot)return["💧","Take water","High temperature expected"];
  if(windy)return["🌬️","Take windbreaker","Strong wind expected"];
  return["☀️","No special prep","Dry and mild conditions ahead"];
}
async function fetchWeather(){
  var url = "https://api.open-meteo.com/v1/forecast?latitude="+C.latitude+"&longitude="+C.longitude+
    "&current=temperature_2m,weather_code,wind_speed_10m"+
    "&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,uv_index,wind_speed_10m"+
    "&daily=temperature_2m_max,temperature_2m_min&forecast_days=2&timezone=auto";
  var r = await fetch(url); if(!r.ok) throw new Error("Weather API failed"); return await r.json();
}
function renderWeather(d){
  $("placeName").textContent = C.placeName || "Lausanne, Switzerland";
  var nowTemp = round(d.current.temperature_2m), wind = round(d.current.wind_speed_10m || 0);
  $("miniTemp").textContent = nowTemp + "°C"; $("miniIcon").textContent = weatherIcon(d.current.weather_code);
  $("tempNow").textContent = nowTemp + "°C"; $("tempMax").textContent = round(d.daily.temperature_2m_max[0]) + "°C"; $("tempMin").textContent = round(d.daily.temperature_2m_min[0]) + "°C";
  $("windLine").textContent = "Wind: " + wind + " km/h";
  var rec = recommendation(d.hourly); $("recommendationIcon").textContent = rec[0]; $("recommendationTitle").textContent = rec[1]; $("recommendationReason").textContent = rec[2];
  var now = new Date(), times = d.hourly.time.map(function(t){return new Date(t);});
  var start = times.findIndex(function(t){return t >= now;}); if(start < 0) start = 0;
  var html = "";
  for(var s=0; s<C.forecastSlots; s++){
    var idx = start + s*C.forecastStepHours; if(idx >= d.hourly.time.length) break;
    var label = s===0 ? "Now" : "+" + (s*C.forecastStepHours) + "h";
    html += "<div><b>"+label+"</b><span>"+weatherIcon(d.hourly.weather_code[idx])+"</span><strong>"+round(d.hourly.temperature_2m[idx])+"°C</strong><small>💧"+(d.hourly.precipitation_probability[idx]||0)+"%</small><em>🌬 "+round(d.hourly.wind_speed_10m[idx]||0)+" km/h</em></div>";
  }
  $("forecastSlots").innerHTML = html;
}
async function fetchLocations(){
  var url = "https://transport.opendata.ch/v1/locations?x="+C.latitude+"&y="+C.longitude+"&type=station";
  var r = await fetch(url); if(!r.ok) throw new Error("Locations API failed");
  var d = await r.json(); return (d.stations||[]).filter(function(s){return !s.distance || s.distance <= C.radiusMeters;}).slice(0,5);
}
async function fetchStationboard(station){
  var id = station.id || station.name;
  var url = "https://transport.opendata.ch/v1/stationboard?station="+encodeURIComponent(id)+"&limit=4";
  var r = await fetch(url); if(!r.ok) throw new Error("Stationboard API failed");
  var d = await r.json();
  return (d.stationboard||[]).map(function(x){var dep=x.stop&&x.stop.departure, ms=dep?new Date(dep).getTime():null; return {stop:station.name,distance:station.distance||0,category:x.category||"",number:x.number||"",to:x.to||"",departure:dep,departureMs:ms};});
}
function priority(d){var c=(d.category||"").toLowerCase(), n=String(d.number||"").toLowerCase(); if(c.indexOf("m")>=0||n.indexOf("m")===0)return 1; if(c.indexOf("train")>=0||c==="ir"||c==="ic"||c==="s")return 2; if(c.indexOf("bus")>=0)return 3; return 4;}
function renderTransport(deps){
  deps = deps.filter(function(d){return d.departureMs && d.departureMs >= Date.now()-60000;}).sort(function(a,b){return priority(a)-priority(b)||a.departureMs-b.departureMs||a.distance-b.distance;});
  lastDepartures = deps;
  var useful = deps.slice(0,2);
  $("usefulTrips").innerHTML = useful.map(function(d){var isM=priority(d)===1; return '<div class="line"><span class="badge '+(isM?'m':'b')+'">'+(d.number||d.category||'?')+'</span><p><b>'+(d.category+' '+d.number).trim()+' · '+d.stop+'</b><br>'+Math.round(d.distance||0)+' m away → '+d.to+'</p><strong class="'+(isM?'':'purple')+'" data-departure-ms="'+d.departureMs+'">--</strong></div><hr>';}).join("") || "No departures found";
  var metroHtml=deps.filter(function(d){return priority(d)===1;}).slice(0,3), busHtml=deps.filter(function(d){return priority(d)>=3;}).slice(0,3);
  function group(title,arr){return '<div class="group"><h2>'+title+'</h2>'+arr.map(function(d){var p=timeLeftParts(d.departureMs-Date.now()); return '<p><b>'+(d.category+' '+d.number).trim()+'</b> '+d.stop+' <span>'+Math.round(d.distance||0)+' m · '+p.text+'</span><br><small>→ '+d.to+'</small></p>';}).join('')+'</div>';}
  $("nearbyTransport").innerHTML = group("🚇 Metro", metroHtml) + group("🚌 Bus", busHtml);
  $("favoriteDestinations").innerHTML = C.favoriteDestinations.map(function(f){var match=deps.find(function(d){return (d.to||"").toLowerCase().indexOf(f.match.toLowerCase())>=0;}) || deps[0]; if(!match) return '<div class="dest"><span class="icon">'+f.icon+'</span><p><b>'+f.name+'</b><br>No live departure</p></div>'; return '<div class="dest"><span class="icon">'+f.icon+'</span><p><b>'+f.name+'</b><br>via '+(match.category+' '+match.number).trim()+'</p><strong data-departure-ms="'+match.departureMs+'">--</strong></div>';}).join('');
  $("transportStatus").textContent = "ⓘ Departures updated just now"; updateCountdowns();
}
async function loadWeather(){buildConfig(); try{var w=await fetchWeather(); renderWeather(w); $("status").textContent = C.hasPrivateSettings ? "Weather updated using private local settings." : "Weather updated using Lausanne center fallback.";} catch(e){$("status").innerHTML='<span class="error">Weather failed: '+e.message+'</span>';}}
async function loadTransport(){buildConfig(); try{var stations=await fetchLocations(), all=[]; for(var i=0;i<Math.min(stations.length,4);i++){try{all=all.concat(await fetchStationboard(stations[i]));}catch(e){}} renderTransport(all); $("status").textContent="Transport updated.";} catch(e){$("status").innerHTML+=' <span class="error">Transport failed: '+e.message+'</span>'; $("transportStatus").textContent="Transport API unavailable.";}}
function refreshAll(){loadWeather(); loadTransport();}
$("settingsBtn").onclick=function(){buildConfig(); $("setupLat").value=C.hasPrivateSettings?C.latitude:""; $("setupLon").value=C.hasPrivateSettings?C.longitude:""; $("setupRadius").value=C.radiusMeters||500; showSetup($("setupPanel").className.indexOf("hidden")>=0);};
$("saveSetupBtn").onclick=function(){var lat=Number($("setupLat").value), lon=Number($("setupLon").value), radius=Number($("setupRadius").value||500); if(!lat||!lon){$("status").innerHTML='<span class="error">Please enter valid latitude and longitude.</span>'; return;} savePrivateSettings({placeName:"Home area, Lausanne",latitude:lat,longitude:lon,radiusMeters:radius}); showSetup(false); refreshAll();};
$("useFallbackBtn").onclick=function(){localStorage.removeItem(STORAGE_KEY); showSetup(false); refreshAll();};
$("refreshBtn").onclick=refreshAll;
buildConfig(); updateClock(); setInterval(updateClock,30000); if(!C.hasPrivateSettings) showSetup(true); refreshAll();
setInterval(loadWeather, (C.weatherRefreshMinutes||30)*60000);
setInterval(loadTransport, (C.transportRefreshMinutes||3)*60000);
setInterval(updateCountdowns, (C.countdownRefreshSeconds||1)*1000);
