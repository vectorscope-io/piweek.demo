
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
var state = {timestamp: null, cont:0, wait:null, stolen:null, sys:null, user:null}

function initDataSets(){

    var ds = {}

    ds.cpuData = []

    ds.update = function(obj){
 
        if (state.timestamp != obj.timestamp) {
            state.timestamp = obj.timestamp;
            state.cont = 0;
        }

        if (obj.name == "egiAlea.cpu.wait") {
            state.cont = state.cont + 1;
            state.wait = parseFloat(obj.value, 10);
        }else if (obj.name == "egiAlea.cpu.stolen") {
            state.cont = state.cont + 1;
            state.stolen = parseFloat(obj.value, 10);
        }else if (obj.name == "egiAlea.cpu.sys") {
            state.cont = state.cont + 1;
            state.sys = parseFloat(obj.value, 10);
        }else if (obj.name == "egiAlea.cpu.user") {
            state.cont = state.cont + 1;
            state.user = parseFloat(obj.value, 10);
        }

       if (state.cont == 4){
           console.log(" values:",state);

           this.cpuData[3].append(state.timestamp*1000, state.wait);
           this.cpuData[2].append(state.timestamp*1000, state.wait + state.stolen);
           this.cpuData[1].append(state.timestamp*1000, state.wait + state.stolen + state.sys);
           this.cpuData[0].append(state.timestamp*1000, state.wait + state.stolen + state.sys + state.user);

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
    { maxValue:100.00, minValue: 0.00, 
        millisPerPixel: millisPerPixel, 
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
