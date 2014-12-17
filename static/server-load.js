
var dataSets;

function tick(value) {
  var obj = JSON.parse(value);
  // push a new data point onto the back
  console.log(obj)
  if (obj.Name == "cpu.idle") {
    //console.log("DATO", obj)
    //console.log("DATO - time ", obj.Time)
    //console.log("DATO - value", obj.Value)
    dataSets[0].append(obj.Time, obj.Value);
    //console.log(obj)
  }
  if (obj.Name == "cpu.user") {
    //console.log("DATO", obj)
    //console.log("DATO - time ", obj.Time)
    //console.log("DATO - value", obj.Value)
    dataSets[1].append(obj.Time, obj.Value);
    //console.log(obj)
  }
  if (obj.Name == "cpu.wait") {
    //console.log("DATO", obj)
    //console.log("DATO - time ", obj.Time)
    //console.log("DATO - value", obj.Value)
    dataSets[2].append(obj.Time, obj.Value);
    //console.log(obj)
  }
  if (obj.Name == "cpu.stolen") {
    //console.log("DATO", obj)
    //console.log("DATO - time ", obj.Time)
    //console.log("DATO - value", obj.Value)
    dataSets[3].append(obj.Time, obj.Value);
    //console.log(obj)
  }
}

function init() {
    console.log("init...")
  dataSets = initHost('host1');
  // initHost('host2');
  // initHost('host3');
  // initHost('host4');
}

var millisPerLine = 5*60*1000
var millisPerPoint = 500
var millisPerPixel = 20

var seriesOptions = [
  { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.1)', lineWidth: 3 },
  { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.1)', lineWidth: 3 },
  { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.1)', lineWidth: 3 },
  { strokeStyle: 'rgba(255, 255, 0, 1)', fillStyle: 'rgba(255, 255, 0, 0.1)', lineWidth: 3 }
];

function initHost(hostId) {

  // Initialize an empty TimeSeries for each CPU.
  var cpuDataSets = [new TimeSeries(), new TimeSeries(), new TimeSeries(), new TimeSeries()];
console.log(cpuDataSets.length);
  var now = new Date().getTime();
  for (var t = now - millisPerLine; t <= now; t += millisPerPoint) {
      console.log(t);
      addRandomValueToDataSets(t, cpuDataSets);
  }

  // Build the timeline
  var timeline = new SmoothieChart(
    { millisPerPixel: millisPerPixel, 
      grid: { strokeStyle: '#555555', lineWidth: 1, millisPerLine: millisPerLine, verticalSections: 4 }});
  for (var i = 0; i < cpuDataSets.length; i++) {
    timeline.addTimeSeries(cpuDataSets[i], seriesOptions[i]);
  }
  timeline.streamTo(document.getElementById(hostId + 'Cpu'), millisPerPoint);
  return cpuDataSets;
}

function addRandomValueToDataSets(time, dataSets) {
  for (var i = 0; i < dataSets.length; i++) {
    dataSets[i].append(time, 0);
  }
}
