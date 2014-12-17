var serverStats = {};

(function(ns){

  var millisPerLine = 10*60*1000
  var millisPerPoint = 500
  var millisPerPixel = 20

  var redSeries = { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.5)', lineWidth: 3 };
  var greenSeries = { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.5)', lineWidth: 3 };
  var blueSeries = { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.5)', lineWidth: 3 };

  var seriesOptions = [
    { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.4)', lineWidth: 3 },
    { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.4)', lineWidth: 3 },
    { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.4)', lineWidth: 3 },
    { strokeStyle: 'rgba(255, 255, 0, 1)', fillStyle: 'rgba(255, 255, 0, 0.4)', lineWidth: 3 }
  ];


  var dataSets = initDataSets();
  var state = {timestamp: null, cont:0, wait:null, stolen:null, sys:null, user:null}


  function initDataSets(){

      var ds = {};

      ds.cpuData = [];
      ds.swapUsedDataSets = new TimeSeries();
      ds.memUsedDataSets = new TimeSeries();
      ds.loadAvgOneDataSets = new TimeSeries();
      ds.loadAvgFiveDataSets = new TimeSeries();
      ds.loadAvgFifteenDataSets = new TimeSeries();

      var metricsDataSets = {
        "swap.usedpercent": ds.swapUsedDataSets,
        "mem.actualusedpercent": ds.memUsedDataSets,
        "loadavg.one": ds.loadAvgOneDataSets,
        "loadavg.five": ds.loadAvgFiveDataSets,
        "loadavg.fitfteen": ds.loadAvgFifteenDataSets,
      };

      ds.update = function(obj){
          if (state.timestamp != obj.timestamp) {
              state.timestamp = obj.timestamp;
              state.cont = 0;
          }
          var nameDesc = obj.name.split(".")[0];

          var metricName = obj.name.substring(obj.name.indexOf(".") +1);
          if (metricsDataSets.hasOwnProperty(metricName)){
              dataSet = metricsDataSets[metricName];
              dataSet.append(obj.timestamp*1000, parseFloat(obj.value, 10));
          } else {
            if (metricName == "cpu.wait") {
                state.cont = state.cont + 1;
                state.wait = parseFloat(obj.value, 10);
            }else if (metricName == "cpu.stolen") {
                state.cont = state.cont + 1;
                state.stolen = parseFloat(obj.value, 10);
            }else if (metricName == "cpu.sys") {
                state.cont = state.cont + 1;
                state.sys = parseFloat(obj.value, 10);
            }else if (metricName == "cpu.user") {
                state.cont = state.cont + 1;
                state.user = parseFloat(obj.value, 10);
            }
            if (state.cont == 4){
               this.cpuData[3].append(state.timestamp*1000, state.wait);
               this.cpuData[2].append(state.timestamp*1000, state.wait + state.stolen);
               this.cpuData[1].append(state.timestamp*1000, state.wait + state.stolen + state.sys);
               this.cpuData[0].append(state.timestamp*1000, state.wait + state.stolen + state.sys + state.user);
            }
          }
      }
      return ds; // revealing pattern - module pattern
  }


  function onWebsocketMessage(message) {
    var obj = JSON.parse(message);
    console.log(obj);
    dataSets.update(obj);
  }

  function init() {
    dataSets.cpuData = initHost();
    initMemData();
    initLoadAvgData();
  }

  function initMemData(hostId){
    var timeline = new SmoothieChart(
      { maxValue:100.00, minValue: 0.00,labels:{fillStyle:'#fff',fontSize:14},
          millisPerPixel: millisPerPixel,timestampFormatter:SmoothieChart.timeFormatter,
        grid: { strokeStyle: '#555555', lineWidth: 1, millisPerLine: millisPerLine, verticalSections: 4 }});

    timeline.addTimeSeries(dataSets.memUsedDataSets, blueSeries);
    timeline.addTimeSeries(dataSets.swapUsedDataSets, redSeries);
    timeline.streamTo(document.getElementById('Mem'), millisPerPoint);
  }


  function initLoadAvgData(){
    var timeline = new SmoothieChart(
      { minValue: 0.00,labels:{fillStyle:'#fff',fontSize:14},
          millisPerPixel: millisPerPixel,timestampFormatter:SmoothieChart.timeFormatter,
        grid: { strokeStyle: '#555555', lineWidth: 1, millisPerLine: millisPerLine, verticalSections: 4 }});

    timeline.addTimeSeries(dataSets.loadAvgOneDataSets, blueSeries);
    timeline.addTimeSeries(dataSets.loadAvgFiveDataSets, redSeries);
    timeline.addTimeSeries(dataSets.loadAvgFifteenDataSets, greenSeries);

    timeline.streamTo(document.getElementById('LoadAvg'), millisPerPoint);
  }


  function initHost(hostId) {
    var cpuDataSets = [new TimeSeries(), new TimeSeries(), new TimeSeries(), new TimeSeries()];
    var timeline = new SmoothieChart(
      { maxValue:100.00, minValue: 0.00,labels:{fillStyle:'#fff',fontSize:14},
          millisPerPixel: millisPerPixel,timestampFormatter:SmoothieChart.timeFormatter,
        grid: { strokeStyle: '#555555', lineWidth: 1, millisPerLine: millisPerLine, verticalSections: 4 }});

    for (var i = 0; i < cpuDataSets.length; i++) {
      timeline.addTimeSeries(cpuDataSets[i], seriesOptions[i]);
    }
    timeline.streamTo(document.getElementById('Cpu'), millisPerPoint);

    return cpuDataSets;
  }

  ns.init = init;
  ns.onWebsocketMessage = onWebsocketMessage;

}(serverStats));
