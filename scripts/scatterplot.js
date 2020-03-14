// all the functions, fields should be put under this object
scatterplot = {};

scatterplot.START_YEAR = 1985;
scatterplot.END_YEAR = 2016;
scatterplot.margins = {
    top:  0,
    bottom: 50,
    left: 80,
    right: 30
};

scatterplot.svg = d3.select("#scatterplot");
scatterplot.boundingbox = scatterplot.svg.node().getBoundingClientRect();

scatterplot.svgWidth = scatterplot.boundingbox.width;
scatterplot.svgHeight = scatterplot.boundingbox.height;
scatterplot.height = scatterplot.svgHeight - scatterplot.margins.top - scatterplot.margins.bottom;
scatterplot.width = scatterplot.svgWidth - scatterplot.margins.left - scatterplot.margins.right;

scatterplot.x = d3.scaleLinear().range([scatterplot.margins.left,scatterplot.width]);
scatterplot.y = d3.scaleLinear().range([scatterplot.height,20]);

scatterplot.xAxis = scatterplot.svg.append("g")
    .call(d3.axisBottom(scatterplot.x))
    .attr("transform", "translate(0," + (scatterplot.height) + ")");

scatterplot.yAxis = scatterplot.svg.append("g")
    .call(d3.axisLeft(scatterplot.y))
    .attr("transform", "translate(" + (scatterplot.margins.left ) + ")");

var xAxisTitle = scatterplot.svg.append("text")
        .attr("x", 400)
        .attr("y", 465)
        .attr("font-weight", "bold")
        .attr("font-size", "15 px")
        .text("GDP Percap");

var yAxisTitle = scatterplot.svg.append("text")
        .attr("x", -180)
        .attr("y", -5)
        .attr("dy", "1em")
        .style("text-anchor" , "middle")
        .attr("transform" , "rotate(-90)")
        .attr("font-weight", "bold")
        .attr("font-size", "15 px")
        .text("Population");

var scatterTitle = scatterplot.svg.append("text")
        .attr("x", 250)
        .attr("y", 20)
        .attr("font-weight", "bold")
        .attr("font-size", "15 px")
        .text("GDP Percap vs Population");            



/**
 * initialize the chart
 * @param {array} data the data loaded from csv file
 * ! don't change data in any way, because it would be be passed to other charts as well.
 */

 
scatterplot.init = function(){
    scatterplot.update(0)
    
} 

/**
 * update the data using a transition
 * fetch the global snigleYearData
 * and plot the data
 */
scatterplot.update = function(duration){
    console.log("scatterplot.update called");

    let data = main.singleYearData;
    let wholeData = main.wholeYearData;

    // filter singleYearData by the available data
    data = data.filter((d) => { return d.available; })

   var circles = scatterplot.svg
        .selectAll("circle")
        .data(data)

    var entering = circles
        .enter().append("circle")
        .attr("class", "non_brushed")
        .classed("circle",true);

// update the circles depending on the available data
function updateCircle(updateSelection,color){
    updateSelection
        .style("fill",color)
        .attr("class", "non_brushed")
        .style("opacity", 0.8)
        .attr("r", 5)
        .attr("cx", function(d) {return scatterplot.x(d.GDP_percap);})
        .attr("cy", function(d) {return scatterplot.y(d.population);})
        
    }

    // update the x axis
    scatterplot.x.domain(d3.extent(data,function(d) {return d.GDP_percap}))
    scatterplot.xAxis.transition().call(d3.axisBottom(scatterplot.x))

    // update the y axis
    scatterplot.y.domain(d3.extent(data,function(d) {return d.population}))
    scatterplot.yAxis.transition().call(d3.axisLeft(scatterplot.y))

    // update the new data
    updateCircle(entering.transition().duration(duration));
    updateCircle(circles.transition().duration(duration));

    // remove the out of scope circles
    circles.exit()
    .remove();

    var brush = d3.brush()
        .on("brush", highlightBrushed)
        .on("end", brushended);

    scatterplot.svg.append("g")
        .call(brush);


// gets all the circles within the brushed selection 

// HELP ME HERE :) 
function highlightBrushed(){
    if (d3.event.selection != null){
        entering.attr("class", "non_brushed");

        var brush_cords = d3.brushSelection(this);

        entering.filter(function(){
            var cx = d3.select(this).attr("cx"),
                cy = d3.select(this).attr("cy");
                
            return isBrushed(brush_cords, cx, cy);
        })
        .attr("class", "brushed")  // assigned the brushed class to all the circles that have been selected
        .style("fill", "orange");

        circles.filter(function(){
            var cx = d3.select(this).attr("cx"),
                cy = d3.select(this).attr("cy");
                
            return isBrushed(brush_cords, cx, cy);
        })
        .attr("class", "brushed")  // assigned the brushed class to all the circles that have been selected
        .style("fill", "orange");

        // save the selected brushed element's countries into a variable

        /* I didn't know how else to access the country data from the selected brushed items so I put .map(function...) 
        from what I saw from Stackoverflow. There could be a problem that, i'm not sure. In the console looks like d_brushed items are stored in a array */

        var d_brushed = d3.selectAll(".brushed").data().map(function(d) {return d.country});
        console.log("brushed elements", d_brushed);
        
        // filter the single and whole year data by countries 

        /* IDK there might be a problem b/c d_brushed is being stored in an array? */

        main.singleYearData = data.filter(function(datum){
            if(datum.country === d_brushed){
                return datum;}

        main.wholeYearData = wholeData.filter(function(datum){
            if(datum.country === d_brushed){
                return datum;}
        })
    })
        console.log("wholeYearData",main.wholeYearData);
        console.log("singleYearData",main.singleYearData);
    }
}

function isBrushed(brush_cords, cx,cy){
       var x0 = brush_cords[0][0],
            x1 = brush_cords[1][0],
            y0 = brush_cords[0][1],
            y1 = brush_cords[1][1];

        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; 
}
        

// called when the user has stopped brushing
    function brushended(){
        if (!d3.event.selection){
            scatterplot.svg.selectAll('circle')
            .transition()
            .duration(150)
            .ease(d3.easeLinear)
            .attr("class", "non_brushed")
            return
        }
    }          
  




};

/**
*
* update the x axis and y axis
* and re plot the data
* create new axis object, and assign them
*/
scatterplot.updateAxis = function(xAxis, yAxis){


};






/** save for later just in case something doesn't work :) */

//brushing events
 /*   scatterplot.svg.append("g")
        .call(d3.brush()
        .on("brush", brushed)
        .on("end",brushended));
*/

// called when user makes a selection on the scatterplot
 /*  function brushed(){
        var s = d3.event.selection,
        x0 = s[0][0],
        y0 = s[0][1],
        dx = s[1][0] - x0,
        dy = s[1][1] - y0;
    
    scatterplot.svg.selectAll('circle')
        .transition()
        .duration(100)
        .style("fill",function (d) { 
            if (scatterplot.x(d.GDP_percap) >= x0 && scatterplot.x(d.GDP_percap) <= x0 + dx
             && scatterplot.y(d.population) >= y0 && scatterplot.y(d.population) <= y0 + dy){

                var brush_cords = d3.brushSelection(this);

                circles.filter(function(){
                    var cx = d3.select(this).attr("cx"),
                        cy = d3.select(this).attr("cy");
                
                })
                .attr("class","brushed");
             
                if (data.name === "countries"){
                    main.wholeYearData = wholeData;
                    main.singleYearData = data;
             }else{
                
                main.singleYearData = data.filter(function(datum){
                    if(datum.country === "Austria"){
                        return datum;
                    }

                    main.wholeYearData = wholeData.filter(function(datum){
                        if(datum.country === "Albania"){
                        return datum;
                    }
                   
                    })
                            
                    })
            };

                return "orange";}
            else {return "black";}
        })
      
    
      

        var d_brushed = d3.selectAll(".brushed").data();
        console.log("brushed",d_brushed);
       // console.log("wholeYearData",main.wholeYearData);
       // console.log("singleYearData",main.singleYearData);

    }


    
*/