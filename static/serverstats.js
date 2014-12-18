var serverStats = {};

(function(ns){

  var millisPerLine = 10*60*1000
  var millisPerPoint = 500
  var millisPerPixel = 20

  var colors = {red: '255, 0, 0', green: '0, 255, 0', blue: '0, 0, 255', yellow: '255, 255, 0'};

  function createCpuState(){
      var timestamp = null;
      var cont = 0;
      var wait = null;
      var stolen = null;
      var sys = null;
      var user = null;

      return {
          incCont: function(){
            cont += 1; 
          },
          resetCont: function(){
              cont = 0
          },
          isAllData: function(){
              return cont == 4;
          },
          getTime: function(){
              return timestamp * 1000;
          },
          setTime: function(time){
              timestamp = time; 
          },
          isSameTime: function(time){
              return timestamp == time;
          },
          setWait: function(value){
              wait = value; 
          },
          setStolen: function(value){
              stolen = value;
          },
          setSys: function(value){
              sys = value;
          },
          setUser: function(value){
              user = value;
          },
          getWait: function(){
              return wait;
          },
          getWaitAndStolen: function(){
              return wait + stolen;
          },
          getWaitStolenSys: function(){
              return wait + stolen + sys;
          },
          getAll: function(){
              return wait + stolen + sys + user;
          }
      }
  };

  var cpuState = createCpuState();
  var redSeries = createSeries(colors.red,0.2);
  var greenSeries = createSeries(colors.green,0.2);
  var blueSeries = createSeries(colors.blue,0.2);

  var cpuSeriesOptions = {
    "cpuWait": createSeries(colors.yello, 0.4), 
    "cpuStolen": createSeries(colors.blue, 0.4), 
    "cpuSys": createSeries(colors.green, 0.4), 
    "cpuUser": createSeries(colors.red, 0.4)
  };

 function createSeries(color, alpha){
    return { strokeStyle: 'rgba('+ color +', 1)', fillStyle: 'rgba(' + color +', 0.2)', lineWidth: 3 };
 }

  var dataSets = initDataSets();
  
  function initDataSets(){

      var ds = {};

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
          console.log(cpuState.isSameTime(obj.timestamp));
          if (!cpuState.isSameTime(obj.timestamp)){
              cpuState.setTime(obj.timestamp);
              cpuState.resetCont();
          }
          var nameDesc = obj.name.split(".")[0];

          var metricName = obj.name.substring(obj.name.indexOf(".") +1);
          if (metricsDataSets.hasOwnProperty(metricName)){
              dataSet = metricsDataSets[metricName];
              dataSet.append(obj.timestamp*1000, parseFloat(obj.value, 10));
          } else {
            if (metricName == "cpu.wait") {
                cpuState.incCont();
                cpuState.setWait(parseFloat(obj.value,10));
            }else if (metricName == "cpu.stolen") {
                cpuState.incCont();
                cpuState.setStolen(parseFloat(obj.value, 10));
            }else if (metricName == "cpu.sys") {
                cpuState.incCont();
                cpuState.setSys(parseFloat(obj.value, 10));
            }else if (metricName == "cpu.user") {
                cpuState.incCont();
                cpuState.setUser(parseFloat(obj.value,10));
            }
            if (cpuState.isAllData()){
               this.cpuData.cpuWait.append(cpuState.getTime(), cpuState.getWait());
               this.cpuData.cpuStolen.append(cpuState.getTime(), cpuState.getWaitAndStolen());
               this.cpuData.cpuSys.append(cpuState.getTime(), cpuState.getWaitStolenSys());
               this.cpuData.cpuUser.append(cpuState.getTime(), cpuState.getAll());
            }
          }
      }
      return ds; // revealing pattern - module pattern
  }


  function onMessage(message) {
    //console.log(message);
    var obj = JSON.parse(message);
    dataSets.update(obj);
  }

  function init(cpuElemId,loadAvgElemId, memElemId) {
    initCpuData(cpuElemId);
    initMemData(memElemId);
    initLoadAvgData(loadAvgElemId);
  }

  function initMemData(elemId){
    var timeline = createTimeline(100.00)
    timeline.addTimeSeries(dataSets.memUsedDataSets, blueSeries);
    timeline.addTimeSeries(dataSets.swapUsedDataSets, redSeries);
    timeline.streamTo(document.getElementById(elemId), millisPerPoint);
  }


  function initLoadAvgData(elemId){
    var timeline = createTimeline(null);
    timeline.addTimeSeries(dataSets.loadAvgOneDataSets, blueSeries);
    timeline.addTimeSeries(dataSets.loadAvgFiveDataSets, redSeries);
    timeline.addTimeSeries(dataSets.loadAvgFifteenDataSets, greenSeries);

    timeline.streamTo(document.getElementById(elemId), millisPerPoint);
  }

  function initCpuData(elemId) {
    var cpuDataSets = { "cpuWait": new TimeSeries(), "cpuStolen": new TimeSeries(), "cpuSys": new TimeSeries(), "cpuUser": new TimeSeries()};
    var timeline = createTimeline(100.00);
    timeline.addTimeSeries(cpuDataSets.cpuWait,cpuSeriesOptions.cpuWait);
    timeline.addTimeSeries(cpuDataSets.cpuStolen,cpuSeriesOptions.cpuStolen);
    timeline.addTimeSeries(cpuDataSets.cpuSys,cpuSeriesOptions.cpuSys);
    timeline.addTimeSeries(cpuDataSets.cpuUser,cpuSeriesOptions.cpuUser);
    timeline.streamTo(document.getElementById(elemId), millisPerPoint);

    dataSets.cpuData = cpuDataSets;
  }

  
  function createTimeline(maxValue) {
      var params = {minValue: 0.00,labels:{fillStyle:'#fff',fontSize:14},
                    millisPerPixel: millisPerPixel,timestampFormatter:SmoothieChart.timeFormatter,
                    grid: { strokeStyle: '#555555', lineWidth: 1, millisPerLine: millisPerLine, verticalSections: 4 }};
      if (maxValue){
         params.maxValue = maxValue;
      }
      return new SmoothieChart(params); 
  }
  
  ns.init = init;
  ns.onMessage = onMessage;

}(serverStats));
