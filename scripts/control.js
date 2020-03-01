control = {};

control.init = function(error, data){
    if(error) throw error;
    // preprocess data so that convert the type string to number
    // initialize each part
    // control.currentYear
    curvechart.init(data);
    scatterplot.init(data);
    sunburst.init(data);
    histogram.init(data);
}


d3.csv('./data/master.csv', control.init);