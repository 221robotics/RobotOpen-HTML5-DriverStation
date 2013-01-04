define([
  'jquery',
  'highcharts',
], function($, highcharts){
  var chart = null;

  var buildGraph = function(){

    Highcharts.setOptions({
      global : {
        useUTC : false
      }
    });
    
    chart = new Highcharts.Chart({
    chart: {
        renderTo: 'mainChart',
        defaultSeriesType: 'spline',
        height: 250,
        plotBorderColor: '#e3e6e8',
        plotBorderWidth: 1,
        plotBorderRadius: 0,
        backgroundColor: '',
        spacingLeft: 0,
        plotBackgroundColor: '#FFFFFF',
        marginTop: 5,
        marginBottom: 35,
        zoomType: 'x,y'
    },

    /*
     * NOTE: Highcharts is FREE for non-commercial projects only,
     * and requires the credits ("Highcharts.com" in the corner).
     *
     */
    credits: {
        style: {
            color: '#9fa2a5'
        }
    },

    title: {
        text: ''
    },

    legend: {
        align: 'left',
        floating: true,
        verticalAlign: 'top',
        borderWidth: 0,
        y: 3,
        x: 10,
        itemStyle: {
            fontSize: '11px',
            color: '#1E1E1E'
        }
    },

    yAxis: {
        title: {
            text: ''
        },
        min: 0,
        max: 200,
        gridLineColor: '#FAFAFA',
        opposite: true,
        labels: {
            style: {
                color: '#9fa2a5'
            }
        }
    },

    xAxis: {
        type: 'datetime',
        tickPixelInterval: 150
    },

    plotOptions: {
        series: {
            marker: {
                lineWidth: 1, // The border of each point (defaults to white)
                radius: 4 // The thickness of each point
            },

            lineWidth: 3, // The thickness of the line between points
            shadow: false
        }
    },

    /*
     * Colors for the main lines.
     *
     * We recommend not using more lines than four in a single chart
     * like this one, but if you must, then make sure you add more colors
     * below, since otherwise you'll default to Highcharts' ugly colors :)
     */
    colors: [
        '#E35733', // orange
        '#4c97d7', // blue
        '#52d74c', // green
        '#e268de' // purple
    ],

    series: [{
        name: 'Latency (ms)',
        data: (function() {
            // generate an array of random data
            var data = [],
                time = (new Date()).getTime(),
                i;
            for (i = -29; i <= 0; i++) {
                data.push({
                    x: time + i * 1000,
                    y: 0
                });
            }
            return data;
        })()}]
    });
  };

  var addPoint = function(val) {
    if (chart != null) {
        var series = chart.series[0];
        var x = new Date().getTime();
        series.addPoint([x, val], true, true);
    }
  }

  return {
    buildGraph: buildGraph,
    addPoint: addPoint
  };
});