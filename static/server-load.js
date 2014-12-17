
var millisPerLine = 10*60*1000
var millisPerPoint = 500
var millisPerPixel = 20
var random = new TimeSeries();

var seriesOptions = [
  { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.1)', lineWidth: 3 },
  { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.1)', lineWidth: 3 },
  { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.1)', lineWidth: 3 },
  { strokeStyle: 'rgba(255, 255, 0, 1)', fillStyle: 'rgba(255, 255, 0, 0.1)', lineWidth: 3 }
];


var dataSets = initDataSets();

function initDataSets(){

    var ds = {}

    ds.cpuData = []

    ds.update = function(obj){
  
        if (obj.name == "egiAlea.cpu.idle") {
            //console.log("DATO", obj);
            //console.log("DATO - time ", obj.timestamp);
            //console.log("DATO - now ", new Date().getTime());
            //console.log("DATO - value", obj.value);
            this.cpuData[0].append(obj.timestamp*1000, obj.value);
            //this.cpuData[0].append(new Date().getTime(), obj.value);
            //console.log(obj)
        }else if (obj.name == "egiAlea.cpu.user") {
            //console.log("DATO", obj)
            //console.log("DATO - time ", obj.Time)
            //console.log("DATO - value", obj.Value)
            this.cpuData[1].append(obj.timestamp*1000, obj.value);
            //console.log(obj)
        }else if (obj.name == "egiAlea.cpu.wait") {
            //console.log("DATO", obj)
            //console.log("DATO - time ", obj.Time)
            //console.log("DATO - value", obj.Value)
            this.cpuData[2].append(obj.timestamp*1000, obj.value);
            //console.log(obj)
        }else if (obj.name == "egiAlea.cpu.sys") {
            //console.log("DATO", obj)
            //console.log("DATO - time ", obj.Time)
            //console.log("DATO - value", obj.Value)
            this.cpuData[3].append(obj.timestamp*1000, obj.value);
            //console.log(obj)
        }
    }
    return ds;
}

function tick(value) {
  var obj = JSON.parse(value);
  console.log(obj);
  dataSets.update(obj);
}


function init() {
  dataSets.cpuData = initHost('host1');
  // initHost('host3');
  // initHost('host4');
   createTimeline();   
}
   
function createTimeline() {
        console.log("create time line....")
    var chart = new SmoothieChart();
        
    chart.addTimeSeries(random, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 4 });
        chart.streamTo(document.getElementById("host2Cpu"), 500);
  setInterval(function() {
        random.append(new Date().getTime(), Math.random() * 10000);
      }, 500);
      
}


function initHost(hostId) {

  // Initialize an empty TimeSeries for each CPU.
  var cpuDataSets = [new TimeSeries(), new TimeSeries(), new TimeSeries(), new TimeSeries()];
  var now = new Date().getTime();
  for (var t = now - millisPerLine; t <= now; t += millisPerPoint) {
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
