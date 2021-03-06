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

scatterplot.istt = false;

scatterplot.svg = d3.select("#scatterplot");

scatterplot.svg.on("click",function(){
    if(scatterplot.istt){
        scatterplot.svg.select(".tooltip").remove();
        scatterplot.istt = false;
    }else{
        let xpos = d3.mouse(this)[0];
        let ypos = d3.mouse(this)[1];
        let nearXpos = 0;
        let nearYpos = 0;
        let selectedElement = null;
        console.log("x",xpos);
        console.log("y",ypos);

        let allCountries = scatterplot.svg.selectAll("circle")._groups[0];
        //let cxList = [];
        //let cyList = [];
        let nearest = 10000;
        allCountries.forEach(element => {
            console.log(element.__data__);
            //cxList.push(Math.abs(+element.attributes.cx.nodeValue - xpos));
            //cyList.push(Math.abs(+element.attributes.cy.nodeValue - ypos));
            let distance = Math.sqrt(Math.abs(+element.attributes.cx.nodeValue - xpos)^2 + Math.abs(+element.attributes.cy.nodeValue - ypos)^2);
            if(nearest>distance){
                nearest = distance;
                nearXpos = +element.attributes.cx.nodeValue;
                nearYpos = +element.attributes.cy.nodeValue;
                selectedElement = element.__data__;
            }
        });
    
        let tt = scatterplot.svg.append("g")
        .attr("class","tooltip");
    
        tt.append("rect")
        //.attr("transform","translate("+xpos+","+ypos+")")
        .attr("width",70)
        .attr("height",35)
        .attr("x",nearXpos)
        .attr("y",nearYpos)
        .attr("fill","gray");  
        scatterplot.istt = true;  

        tt.append("text")
        .attr("x",nearXpos)
        .attr("y",nearYpos + 10)
        .attr("font-size",10)
        .attr("fill","white")
        .text(selectedElement.country);

        tt.append("text")
        .attr("x",nearXpos)
        .attr("y",nearYpos + 20)
        .attr("font-size",10)
        .attr("fill","white")
        .text(function(){
            switch(scatterplot.updatedxAxis){
                case "GDP_percap":
                    return "GDP:"+selectedElement.GDP_percap;
                case "population":
                    return "Pop:"+selectedElement.population;
                case "suicide_ratio":
                    return "Ratio:"+selectedElement.suicide_ratio;
                default:
                    return "";
            }
        });

        tt.append("text")
        .attr("x",nearXpos)
        .attr("y",nearYpos + 30)
        .attr("font-size",10)
        .attr("fill","white")
        .text(function(){
            switch(scatterplot.updatedyAxis){
                case "GDP_percap":
                    return "GDP:"+selectedElement.GDP_percap;
                case "population":
                    return "Pop:"+selectedElement.population;
                case "suicide_ratio":
                    return "Ratio:"+selectedElement.suicide_ratio;
                default:
                    return "";
            }
        });

    }
});


scatterplot.boundingbox = scatterplot.svg.node().getBoundingClientRect();

scatterplot.brush = d3.brush();
scatterplot.updatedxAxis = "GDP_percap";
scatterplot.updatedyAxis = "population";

scatterplot.svgWidth = scatterplot.boundingbox.width;
scatterplot.svgHeight = scatterplot.boundingbox.height;
scatterplot.height = scatterplot.svgHeight - scatterplot.margins.top - scatterplot.margins.bottom;
scatterplot.width = scatterplot.svgWidth - scatterplot.margins.left - scatterplot.margins.right;

scatterplot.x = d3.scaleLinear().range([scatterplot.margins.left,scatterplot.width]);
scatterplot.y = d3.scaleLinear().range([scatterplot.height,scatterplot.margins.right]);

scatterplot.xAxis = scatterplot.svg.append("g")
    .call(d3.axisBottom(scatterplot.x))
    .attr("transform", "translate(0," + (scatterplot.height) + ")");

scatterplot.yAxis = scatterplot.svg.append("g")
    .call(d3.axisLeft(scatterplot.y))
    .attr("transform", "translate(" + (scatterplot.margins.left ) + ")");

var xAxisTitle = scatterplot.svg.append("text")
        .attr("x", scatterplot.width/2)
        .attr("y", scatterplot.height*1.1)
        .attr("font-weight", "bold")
        .attr("font-size", "15 px")
        

var yAxisTitle = scatterplot.svg.append("text")
        .attr("x", -180)
        .attr("y", -5)
        .attr("dy", "1em")
        .style("text-anchor" , "middle")
        .attr("transform" , "rotate(-90)")
        .attr("font-weight", "bold")
        .attr("font-size", "15 px")
        .text("Population");     

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
    //console.log("x axis:", scatterplot.updatedxAxis);
    //console.log("y axis:", scatterplot.updatedyAxis);

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
        .style("fill",main.color)
        .classed("circle",true)
        /*.on("mouseover",function(d,i){
            let xpos = d3.mouse(this)[0];
            let ypos = d3.mouse(this)[1];
            console.log("xpos",xpos);
            let tt = scatterplot.svg.append("g")
                    .attr("class","tooltip");
            tt.append("rect")
                //.attr("transform","translate("+xpos+","+ypos+")")
                .attr("width",120)
                .attr("height",50)
                .attr("x",xpos)
                .attr("y",ypos)
                .attr("fill","gray");
            
        })
        .on("mouseout",function(d,i){
            scatterplot.svg.select(".tooltip").remove();
        })*/;

// update the circles depending on the available data
function updateCircle(updateSelection){
    updateSelection
        .style("fill",main.color)
        .attr("class", "non_brushed")
        .style("opacity", 0.8)
        .attr("r", 5)

/*  updates both x and y axis based on the selection of the histogram
    the default data that is loaded in is the GDP_percap vs Population
*/
    if(scatterplot.updatedxAxis === "GDP_percap"){
        //update x axis
        scatterplot.x.domain(d3.extent(data,function(d) {return d.GDP_percap}))
        scatterplot.xAxis.transition().call(d3.axisBottom(scatterplot.x))
        xAxisTitle.text("GDP Percap").transition().duration(duration);
       
        // update the data to the selected data
        updateSelection
            .attr("cx", function(d) {return scatterplot.x(d.GDP_percap);})
           }
       
        
    else if(scatterplot.updatedxAxis === "population"){
        
        scatterplot.x.domain(d3.extent(data,function(d) {return d.population}))
        scatterplot.xAxis.transition().call(d3.axisBottom(scatterplot.x))
        xAxisTitle.text("Population").transition().duration(duration);

        updateSelection
            .attr("cx", function(d) {return scatterplot.x(d.population);})}

    else if (scatterplot.updatedxAxis === "suicide_ratio"){

        scatterplot.x.domain(d3.extent(data,function(d) {return d.suicide_ratio}))
        scatterplot.xAxis.transition().call(d3.axisBottom(scatterplot.x))
        xAxisTitle.text("Suicide Ratio").transition().duration(duration);

        updateSelection
            .attr("cx", function(d) {return scatterplot.x(d.suicide_ratio);})}
        

    if(scatterplot.updatedyAxis === "population"){

        scatterplot.y.domain(d3.extent(data,function(d) {return d.population}))
        scatterplot.yAxis.transition().call(d3.axisLeft(scatterplot.y))
        yAxisTitle.text("Population").transition().duration(duration);
        updateSelection
            .attr("cy", function(d) {return scatterplot.y(d.population);})}
            
    else if(scatterplot.updatedyAxis === "GDP_percap"){

        scatterplot.y.domain(d3.extent(data,function(d) {return d.GDP_percap}))
        scatterplot.yAxis.transition().call(d3.axisLeft(scatterplot.y))
        yAxisTitle.text("GDP Percap").transition().duration(duration);

        updateSelection
            .attr("cy", function(d) {return scatterplot.y(d.GDP_percap);})}
    else if(scatterplot.updatedyAxis === "suicide_ratio"){

        scatterplot.y.domain(d3.extent(data,function(d) {return d.suicide_ratio}))
        scatterplot.yAxis.transition().call(d3.axisLeft(scatterplot.y))
        yAxisTitle.text("Suicide Ratio").transition().duration(duration);
        updateSelection
            .attr("cy", function(d) {return scatterplot.y(d.suicide_ratio);})
    }
        
    }

  

    // update the new data
    updateCircle(entering.transition().duration(duration));
    updateCircle(circles.transition().duration(duration));

    // remove the out of scope circles
    circles.exit()
    .remove();

    if(curvechart.animating){
        
    }
    else{scatterplot.brush
        .on("brush", highlightBrushed)
        .on("end", brushended);

    scatterplot.svg.append("g")
        .call(scatterplot.brush);
    }


// gets all the circles within the brushed selection 

function highlightBrushed(){
    if (d3.event.selection != null){
        entering.attr("class", "non_brushed");

         scatterplot.brush_cords = d3.brushSelection(this);

        entering.filter(function(){
            var cx = d3.select(this).attr("cx"),
                cy = d3.select(this).attr("cy");
                
            return isBrushed(scatterplot.brush_cords, cx, cy);
        })
        .attr("class", "brushed")  // assigned the brushed class to all the circles that have been selected

        circles.filter(function(){
            var cx = d3.select(this).attr("cx"),
                cy = d3.select(this).attr("cy");
                
            return isBrushed(scatterplot.brush_cords, cx, cy);
        })
        .attr("class", "brushed")  // assigned the brushed class to all the circles that have been selected

        // save the selected brushed element's countries into a variable

        scatterplot.d_brushed = d3.selectAll(".brushed").data().map(function(d) {return d.country});
        //console.log("brushed elements", scatterplot.d_brushed);
        
        // filter the single and whole year data by countries 
        main.singleYearData = data.filter(function(datum){
            if(scatterplot.d_brushed.includes(datum.country)){
                return datum;}

        main.wholeYearData = wholeData.filter(function(datum){
            if(scatterplot.d_brushed.includes(datum.country)){
                return datum;}

        
        })

    })
        sunburst.update(duration);
        histogram.update(duration);
        curvechart.update(duration);
        //console.log("wholeYearData",main.wholeYearData);
        //console.log("singleYearData",main.singleYearData);
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
            .style("fill", main.color)
            scatterplot.d_nonbrushed = d3.selectAll(".non_brushed").data().map(function(d) {return d.country});
            //console.log("brushed elements", scatterplot.d_brushed);
            
            // filter the single and whole year data by countries 
            main.singleYearData = data.filter(function(datum){
                if(scatterplot.d_nonbrushed.includes(datum.country)){
                    return datum;}
    
            main.wholeYearData = wholeData.filter(function(datum){
                if(scatterplot.d_nonbrushed.includes(datum.country)){
                    return datum;}
    
            
            })
    
        })
        // update the graphs back to original state
            sunburst.update(duration);
            histogram.update(duration);
            curvechart.update(duration);
            
        }
    }          
  


//console.log("newx",scatterplot.updatedxAxis);
//console.log("newy",scatterplot.updatedyAxis);

};

/**
*
* update the x axis and y axis
* and re plot the data
* create new axis object, and assign them
*/
scatterplot.updateAxis = function(x, y){
   
    scatterplot.updatedxAxis = x;
    scatterplot.updatedyAxis = y;

    scatterplot.update(200)


    //console.log("function call x: ", scatterplot.updatedxAxis);
    //console.log("function call y: ", scatterplot.updatedyAxis);


};
