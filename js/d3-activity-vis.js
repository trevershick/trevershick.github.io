function ActivityViz(targetSelector, rangeBegin, rangeEnd) {
    var color = d3.scale.quantize()
        .domain([0, 3])
        .range(d3.range(4).map(function(d) { return "q" + d + "-11"; }));
    var db = {};


    var render = function() {
        var w1 = parseInt(d3.select("body").style('width'), 10);

        var w2 = parseInt(d3.select(targetSelector).style('width'),10)
        var width = Math.min(w1,w2),
            cellSize = ((width-60)/52),
            height = cellSize * 7 + 20; // cell size

        var percent = d3.format(".1%"),
            format = d3.time.format("%Y-%m-%d");

        var monthPath = function(t0) {
          var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
              d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
              d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
          return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
              + "H" + w0 * cellSize + "V" + 7 * cellSize
              + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
              + "H" + (w1 + 1) * cellSize + "V" + 0
              + "H" + (w0 + 1) * cellSize + "Z";
        };

        var years = d3.select(targetSelector)
            .selectAll("div")
            .data(d3.range(rangeBegin, rangeEnd), function(i) { return i; }).sort();


        years.enter()
            .append("div")
                .attr("class", "yr")
            .append("svg")
                .attr("id", function(d) { return "svg-yr-" + d; })
                .attr("height", height)
                .attr("width", width)
                .attr("class", "RdYlGn")
            .append("g")
                .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")")
                .append("text")
                    .attr("class", "yr-title")
                    .attr("transform", "translate(-6," + cellSize + ")rotate(-90)")
                    .style("text-anchor", "middle");


        years.selectAll(".yr-title").text(function(d) { return d; });
        years.exit().remove();


        var days = d3.select(targetSelector)
            .selectAll("g")
            .selectAll(".day")
            .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); });

        days.enter()
            .append("rect")
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", "#fff")
            .attr("stroke", "#ccc")
            .attr("x", function(d) { return d3.time.weekOfYear(d) * cellSize; })
            .attr("y", function(d) { return d.getDay() * cellSize; })
            .datum(format)
            .append("title")
            .text(function(d) { return d; }); // only setup basic title on append


        days.exit().remove();


        var months = d3.select(targetSelector)
            .selectAll("g")
            .selectAll(".month")
            .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); });

        months.enter()
            .append("path")
            .attr("class", "month")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-width", 2)
            .attr("d", monthPath);
        months.exit().remove();
    }



    this.refresh = function(newData) {
        db = newData;
        render();
          var data = d3.nest().key(function(d) { return d.Date; })
            .rollup(function (d) {
                var titles = d.map(function(o){ return o.Title;});
                return {
                    d:d[0].Date,
                    titles:titles,
                    c:d.length
                };
            })
            .map(db);

        var dayToolTip = function(d) {
            var record = data[d];
            return d + ": " + record.c + " post(s)" +
            record.titles.map(function(t){ return "\n" + t; });
        };

          d3.select(targetSelector)
              .selectAll(".day")
              .filter(function(d) { return d in data; } )
              .attr("class", function(d) { return "day " + color(data[d].c); })
              .on('click', function(d,i) { })
              .select("title")
              .text(dayToolTip);
        render();
    };
    return this;
}
