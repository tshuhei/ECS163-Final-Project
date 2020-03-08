// all the functions, fields should be put under this object
histogram = {};

histogram.START_YEAR = 1985;
histogram.END_YEAR = 2015;
histogram.currentYear = histogram.START_YEAR;
histogram.columns = ["population", "GDP_percap", "suicide_ratio"];
histogram.margins = {
    top: 30,
    bottom: 30,
    left: 30,
    right: 30
};
histogram.color = "blue";
histogram.x = d3.scaleLinear();
histogram.y = d3.scaleLinear();
histogram.histo = d3.histogram();
/**
 * initialize the chart
 * @param {array} data the data loaded from csv file
 * ! don't change data in any way, because it would be be passed to other charts as well.
 */
histogram.init = function(data) {

    this.originalData = data;
    this.currentData = this.originalData.filter((d) => {
        return (d.available && d.year === this.currentYear);
    });

    // Get the widht and Height of main histogram svg
    var client = d3.select("#histogram").node().getBoundingClientRect();
    this.width = client.width - this.margins.left - this.margins.right;
    this.height = client.height - this.margins.top - this.margins.bottom;
    this.svg = d3.select("#histogram")
        .append("g")
        .attr("transform",
            `translate(${this.margins.left}, ${this.margins.top})`);

    this.x.range([0, this.height]);
    this.y.range([this.height, 0]);

    this.createCharts();
};

/**
 * update the data using a transition
 * @param {number} year the new year in which data need to be displayed
 * @param {number} duration the duration of the transition
 */
histogram.updateYear = function(year, duration) {

};

/**
 * apply the current filters to histogram data
 * @param undecided
 */
histogram.applyFilter = function() {

};

/**
 * Create n charts
 * #param {List} chartCols : columns to display in histogram. Size must equal n
 * #param {number} n : number of charts to create
 */
histogram.createCharts = function() {

    var n = this.columns.length;
    var count = 0;
    // Create each rect for histogram
    this.columns.forEach((col) => {

        this.x.domain(d3.extent(this.currentData, (d) => {
            return d[col];
        }));

        // Format and append titles to each histogram
        this.svg.append("text")
            .attr("x", (count * this.width / n) + (this.width / (
                2.5 * n)))
            .attr("y", 0)
            .html(col.charAt(0).toUpperCase() + col.slice(1).replace(
                "_", " "));

        // Create d3 histogram object to create chart
        this.histo.value((d) => { return d[col]; })
            .domain(this.x.domain())
            .thresholds(this.x.ticks(20));

        // Apply the histogram object to our data
        var bins = this.histo(this.currentData);
        // Create and scale Y axis based on our bins
        this.y.domain([0, d3.max(bins, (d) => { return d.length; })]);

        // Append X axis
        this.svg.append("g")
            .attr("transform",
                `translate(${(count*this.width)/n + this.margins.left}, ${this.height})`
            )
            .attr("class", `xAxis${count}`)
            .call(d3.axisBottom(this.x).tickValues([]).tickSizeOuter(
                0));

        // Append Y axis
        this.svg.append("g")
            .attr("transform",
                `translate(${(count*this.width)/n +this.margins.left}, 0)`
            )
            .attr("class", `yAxis${count}`)
            .call(d3.axisLeft(this.y).tickValues([]).tickSizeOuter(
                0));


        // Add the bars for our histogram
        this.svg.append("g")
            .attr("class", `subChart${count}`)
            .selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
            .attr("x", 1)
            .attr("transform", (d) => {
                var offset = histogram.x(d.x0) + this.margins.left +
                    (
                        count * this.width) / n;
                return `translate(${offset},${histogram.y(d.length)})`
            })
            .attr("width", function(d) {
                return histogram.x(d.x1) - histogram.x(d.x0);
            })
            .attr("height", function(d) {
                return (histogram.height - histogram.y(d.length));
            })
            .style("fill", this.color);

        count++;
    })
};


histogram.updateCharts = function() {
    var n = this.columns.length;
    var count = 0;
    // Create each rect for histogram
    this.columns.forEach((col) => {

        this.x.domain(d3.extent(this.currentData, (d) => {
            return d[col];
        }));

        // Create d3 histogram object to create chart
        this.histo.value((d) => { return d[col]; })
            .domain(this.x.domain())
            .thresholds(this.x.ticks(20));

        // Apply the histogram object to our data
        var bins = this.histo(this.currentData);
        // Create and scale Y axis based on our bins
        this.y.domain([0, d3.max(bins, (d) => { return d.length; })]);

        this.svg.select(`.xAxis${count}`)
            .call(d3.axisBottom(this.x).tickValues([]).tickSizeOuter(
                0));

        this.svg.select(`.yAxis${count}`)
            .call(d3.axisLeft(this.y).tickValues([]).tickSizeOuter(
                0));

        var nodes = this.svg.select(`.subChart${count}`)
            .selectAll("rect")
            .data(bins);

        nodes.exit().remove();

        nodes.enter().append("rect")
            .merge(nodes)
            .transition()
            .attr("x", 1)
            .attr("transform", (d) => {
                var offset = histogram.x(d.x0) + this.margins.left +
                    (
                        count * this.width) / n;
                return `translate(${offset},${histogram.y(d.length)})`
            })
            .attr("width", function(d) {
                return histogram.x(d.x1) - histogram.x(d.x0);
            })
            .attr("height", function(d) {
                return (histogram.height - histogram.y(d.length));
            })
            .style("fill", this.color);

        count++;
    })
}

histogram.test = function(yr) {
    this.currentYear = yr;
    this.currentData = this.originalData.filter((d) => {
        return (d.available && d.year === this.currentYear);
    });
    this.updateChart();
}