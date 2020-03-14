reset={};

reset.svg = d3.select("#reset");
reset.data = null;

reset.boundingBox = reset.svg.node().getBoundingClientRect();
reset.svgHeight = reset.boundingBox.height;
reset.svgWidth = reset.boundingBox.width;

reset.button = reset.svg.append("rect")
                        .attr("x",reset.svgWidth/2-50)
                        .attr("y",reset.svgHeight/2-20)
                        .attr("width",100)
                        .attr("height",50)
                        .style("fill","gray")
                        .on("click",function(){
                            //reset the wholeYearData
                            main.wholeYearData = main.originalData;
                            //reset the singleYearData
                            main.singleYearData = main.originalData.filter(function(datum){
                                return datum.year === main.END_YEAR;
                            });
                            //reset all charts
                            //init(reset.data) should be init() in the final version.
                            curvechart.init(reset.data);//init();
                            scatterplot.init(reset.data);//init();
                            sunburst.init(reset.data);//init();
                            histogram.init(reset.data);//init();
                        });

reset.svg.append("text")
    .attr("x",reset.svgWidth/2)
    .attr("y",reset.svgHeight/2+10)
    .attr("text-anchor","middle")
    .attr("font-size",20)
    .style("fill","white")
    .text("RESET")

reset.init = function(data){
    reset.data = data;
}