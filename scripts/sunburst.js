// all the functions, fields should be put under this object
sunburst = {};

sunburst.START_YEAR = 1985;
sunburst.END_YEAR = 2016;
sunburst.margins = {
    top: 30,
    bottom: 30,
    left: 30,
    right: 30
};
sunburst.svg = d3.select("#sunburst");
sunburst.boundingBox = sunburst.svg.node().getBoundingClientRect();

//sunburst.svg.select("g").remove();

sunburst.svgHeight = sunburst.boundingBox.height;
sunburst.svgWidth = sunburst.boundingBox.width;
sunburst.height = sunburst.svgHeight - sunburst.margins.top - sunburst.margins.bottom;
sunburst.width = sunburst.svgWidth - sunburst.margins.left - sunburst.margins.right;

//console.log("svgHeight",sunburst.svgHeight);
//console.log("svgWidth",sunburst.svgWidth);
//console.log("height",sunburst.height);
//console.log("width",sunburst.width);

sunburst.partition = data => {
    const root = d3.hierarchy(data)
        .sum(d => d.suicide_no)
        .sort((a, b) => b.suicide_no - a.sucie_no);
    return d3.partition()
        .size([2 * Math.PI, root.height + 1])
      (root);
  }

sunburst.format = d3.format(",d");

sunburst.radius = Math.min(sunburst.width / 6, sunburst.height / 6);

//console.log("radius",sunburst.radius);

sunburst.arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(sunburst.radius * 1.5)
    .innerRadius(d => d.y0 * sunburst.radius)
    .outerRadius(d => Math.max(d.y0 * sunburst.radius, d.y1 * sunburst.radius - 1));

sunburst.color = d3.scaleOrdinal(d3.schemeCategory10);

/**
 * initialize the chart
 * @param {array} data the data loaded from csv file
 * ! don't change data in any way, because it would be be passed to other charts as well.
 */
sunburst.init = function(data){
    //console.log("sunburst data",data);
    //console.log("sunburst start year",sunburst.START_YEAR);
    /*data = data.filter(function(datum){
        return datum.year === sunburst.START_YEAR && datum.available === true;
    });*/

    data = main.singleYearData;
    
    //console.log("sunburst filtered data",data);
    data.forEach(function(d){
        d.name=d.country;
    });

    jsonData = d3.nest()
                .key(function(d){return d.region;})
                .key(function(d){return d.subregion;})
                .entries(data);

    jsonData = jsonData.map(e => 
        Object.fromEntries(                      
           //Object.entries(e).map(([k, v]) => [keysAfter[k], v])
           Object.entries(e).map(function(value){
               //console.log("value",value);
               if(value[0]==="key"){
                   value[0]="name";
               }else{
                   value[0]="children";
                   value[1] = value[1].map(e2 =>
                        Object.fromEntries(
                            Object.entries(e2).map(function(value2){
                                if(value2[0]==="key"){
                                    value2[0]="name";
                                }else{
                                    value2[0]="children";
                                }
                                //console.log("value",value2);
                                return value2;
                            })
                        )
                    );
               }
               return value;
           })
       )
     );

    jsonData = {
        "name":"countries",
        "children": jsonData
    }

    //console.log("sunburst jsonData",jsonData);

    root = sunburst.partition(jsonData);

    root.each(d => d.current = d);

    const g = sunburst.svg.append("g")
          .attr("transform", `translate(${sunburst.svgWidth / 2},${sunburst.svgHeight / 2})`);

    sunburst.svg.append("text")
                .attr("x",sunburst.svgWidth/2)
                .attr("y",sunburst.svgHeight)
                .attr("fill","black")
                .attr("font-size",15)
                .attr("text-anchor","middle")
                .text("Suicide numbers of Regions")

    const path = g.append("g")
        .selectAll("path")
        .data(root.descendants().slice(1))
        .enter()
        .append("path")
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return sunburst.color(d.data.name); })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 1.0 : 0.4) : 0)
        .attr("d", d => sunburst.arc(d.current));
    
    path.filter(d => d.children)
        .style("cursor", "pointer")
        .on("click", clicked);

    path.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${"Suicide: "+sunburst.format(d.value)}`);

    const label = g.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .attr("font-size",8)
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .enter().append("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name);

    const parent = g.append("circle")
        .datum(root)
        .attr("r", sunburst.radius)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("click", clicked);

        function clicked(p) {
            parent.datum(p.parent || root);
        
            root.each(d => d.target = {
              x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
              x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
              y0: Math.max(0, d.y0 - p.depth),
              y1: Math.max(0, d.y1 - p.depth)
            });
        
            const t = g.transition().duration(750);
        
            // Transition the data on all arcs, even the ones that aren’t visible,
            // so that if this transition is interrupted, entering arcs will start
            // the next transition from the desired position.
            path.transition(t)
                .tween("data", d => {
                  const i = d3.interpolate(d.current, d.target);
                  return t => d.current = i(t);
                })
              .filter(function(d) {
                return +this.getAttribute("fill-opacity") || arcVisible(d.target);
              })
                .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 1.0 : 0.4) : 0)
                .attrTween("d", d => () => sunburst.arc(d.current));
        
            label.filter(function(d) {
                return +this.getAttribute("fill-opacity") || labelVisible(d.target);
              }).transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));

            /*
              * 1. filter the wholeYearData based on the Region/Subregion
              * 2. get the year data from a specific data
              * 3. filter the singleYearData base on the Region/Subregion
              * 4. scatterplot.update(duration)
              * 5. histogram.update(duration)
              * 6. curvechart.update(duration)
            */
        }

        function arcVisible(d) {
            return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
        }

        function labelVisible(d) {
            return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
        }

        function labelTransform(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2 * sunburst.radius;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        }


}

/**
 * update the data using a transition
 * fetch the global snigleYearData
 * and plot the data
 */
sunburst.update = function(duration){
        //console.log("sunburst data",data);
        //console.log("sunburst start year",sunburst.START_YEAR);
        /*data = data.filter(function(datum){
            return datum.year === sunburst.START_YEAR && datum.available === true;
        });*/

        data = main.singleYearData;

        sunburst.svg.select("g").remove();
        
        //console.log("sunburst filtered data",data);
        data.forEach(function(d){
            d.name=d.country;
        });
    
        jsonData = d3.nest()
                    .key(function(d){return d.region;})
                    .key(function(d){return d.subregion;})
                    .entries(data);
    
        jsonData = jsonData.map(e => 
            Object.fromEntries(                      
               //Object.entries(e).map(([k, v]) => [keysAfter[k], v])
               Object.entries(e).map(function(value){
                   //console.log("value",value);
                   if(value[0]==="key"){
                       value[0]="name";
                   }else{
                       value[0]="children";
                       value[1] = value[1].map(e2 =>
                            Object.fromEntries(
                                Object.entries(e2).map(function(value2){
                                    if(value2[0]==="key"){
                                        value2[0]="name";
                                    }else{
                                        value2[0]="children";
                                    }
                                    //console.log("value",value2);
                                    return value2;
                                })
                            )
                        );
                   }
                   return value;
               })
           )
         );
    
        jsonData = {
            "name":"countries",
            "children": jsonData
        }
    
        //console.log("sunburst jsonData",jsonData);
    
        root = sunburst.partition(jsonData);
    
        root.each(d => d.current = d);
    
        const g = sunburst.svg.append("g")
              .attr("transform", `translate(${sunburst.svgWidth / 2},${sunburst.svgHeight / 2})`);
    
        sunburst.svg.append("text")
                    .attr("x",sunburst.svgWidth/2)
                    .attr("y",sunburst.svgHeight)
                    .attr("fill","black")
                    .attr("font-size",15)
                    .attr("text-anchor","middle")
                    .text("Suicide numbers of Regions")
    
        const path = g.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .enter()
            .append("path")
            .attr("fill", d => { while (d.depth > 1) d = d.parent; return sunburst.color(d.data.name); })
            .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 1.0 : 0.4) : 0)
            .attr("d", d => sunburst.arc(d.current));
        
        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked);
    
        path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${"Suicide: "+sunburst.format(d.value)}`);
    
        const label = g.append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .attr("font-size",8)
            .style("user-select", "none")
            .selectAll("text")
            .data(root.descendants().slice(1))
            .enter().append("text")
            .attr("dy", "0.35em")
            .attr("fill-opacity", d => +labelVisible(d.current))
            .attr("transform", d => labelTransform(d.current))
            .text(d => d.data.name);
    
        const parent = g.append("circle")
            .datum(root)
            .attr("r", sunburst.radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked);
    
            function clicked(p) {
                parent.datum(p.parent || root);
            
                root.each(d => d.target = {
                  x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                  x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                  y0: Math.max(0, d.y0 - p.depth),
                  y1: Math.max(0, d.y1 - p.depth)
                });
            
                const t = g.transition().duration(750);
            
                // Transition the data on all arcs, even the ones that aren’t visible,
                // so that if this transition is interrupted, entering arcs will start
                // the next transition from the desired position.
                path.transition(t)
                    .tween("data", d => {
                      const i = d3.interpolate(d.current, d.target);
                      return t => d.current = i(t);
                    })
                  .filter(function(d) {
                    return +this.getAttribute("fill-opacity") || arcVisible(d.target);
                  })
                    .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 1.0 : 0.4) : 0)
                    .attrTween("d", d => () => sunburst.arc(d.current));
            
                label.filter(function(d) {
                    return +this.getAttribute("fill-opacity") || labelVisible(d.target);
                  }).transition(t)
                    .attr("fill-opacity", d => +labelVisible(d.target))
                    .attrTween("transform", d => () => labelTransform(d.current));
    
                /*
                  * 1. filter the wholeYearData based on the Region/Subregion
                  * 2. get the year data from a specific data
                  * 3. filter the singleYearData base on the Region/Subregion
                  * 4. scatterplot.update(duration)
                  * 5. histogram.update(duration)
                  * 6. curvechart.update(duration)
                */
            }
    
            function arcVisible(d) {
                return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
            }
    
            function labelVisible(d) {
                return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
            }
    
            function labelTransform(d) {
                const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                const y = (d.y0 + d.y1) / 2 * sunburst.radius;
                return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
            }
}

/*
* make a color Map for each country base on Region
* {
    "Japan": color(1);
    "China": 
*}
*/