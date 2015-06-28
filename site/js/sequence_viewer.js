
function SequenceViewer(domId, width, height, margin) {

  var that = this;

  this.width = width;
  this.height = height;
  this.margin = margin;

  this.svg = d3.select('#' + domId).append('svg')
    .attr('width', width)
    .attr('height', height)
    .on('mousemove', function () {
      that.hoverMove(d3.mouse(this)[0]);
    });

  this.onZoom = function (from, to) {
    return;
  };

  this.data = [];

  this.load = function (p_id, sequence) {
    this.data.push({name: p_id, sequence: sequence});
    this.draw(this.data);
  };

  this.draw = function (data) {

    this.data = data;

    var maxL = d3.max(data, function (d) { return d.sequence.length; });

    var scaleX = d3.scale.linear()
      .domain([0, maxL - 1])
      .range([this.margin, this.width - this.margin]);

    this.scaleX = scaleX;

    var dX = function() {
      return scaleX(1) - scaleX(0);
    }

    var scaleY = d3.scale.linear()
      .domain([-0.5, data.length - 0.5])
      .range([this.margin, this.height - 2 * this.margin]);

    var axisX = d3.svg.axis()
      .scale(scaleX)
      .orient('bottom')
      .tickSize(6, 0);

    this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', "translate(0," + (this.height - this.margin) + ")")
      .call(axisX);

    var sequences = this.svg.selectAll('.sequence')
      .data(data, function (d) { return d.name; });

    sequences
      .enter()
      .append('g')
        .attr('class', 'sequence');

    sequences
      .attr('transform', function (d, i) {
        return "translate(0," + scaleY(i) + ")";
      })
      .selectAll('.letter')
        .data(function(d) { return d.sequence; })
        .enter()
        .append('text')
          .attr('class', 'letter')
          .attr('x', function (d, i) { return scaleX(i); })
          .style('font-size', Math.min(15, dX()))
          .text(function (d) { return d; });

    //
    // zoom behaviour
    //

    var zoom = d3.behavior.zoom()
      .x(scaleX)
      .scaleExtent([1, 15/dX()])
      .on("zoom", zoomed);

    function zoomed() {
      if (scaleX(0) > that.margin) {
        zoom.translate([that.margin * (1 - zoom.scale()), 0]);
      } else if (scaleX(maxL - 1) < that.width - that.margin) {
        zoom.translate([(that.width - that.margin) * (1 - zoom.scale()), 0]);
      }

      that.svg.select(".axis").call(axisX);

      that.svg.selectAll('.sequence')
        .data(data, function (d) { return d.name; })
          .selectAll('.letter')
          .data(function(d) { return d.sequence; })
            .attr('x', function (d, i) { return scaleX(i); })
            .style('font-size', Math.min(15, dX()));

      that.hover.style("opacity", dX() > 10 ? 0 : null);

      that.onZoom(scaleX.invert(that.margin), scaleX.invert(that.width - that.margin));
    }

    this.svg.call(zoom);

    //
    // hover
    //

    this.hover = this.svg.append('g')
      .attr('class', 'hover')
      .attr('transform', "translate(-100,0)");

    this.hover.append('line')
      .attr('y1', 0)
      .attr('y2', this.height);

    this.hover.append('text')
      .attr('class', 'position')
      .attr('x', 5)
      .attr('y', this.height - 1.3 * this.margin);

    var hoverAdd = this.hover.selectAll('.loupe')
      .data(data, function (d) { return d.name; })
      .enter()
      .append('g')
        .attr('class', 'loupe')
        .attr('transform', function (d, i) {
          return "translate(" + (-25) + "," + (scaleY(i) - 10) + ")";
        });

    hoverAdd.append('rect')
      .attr('width', 50)
      .attr('height', 15)
      .style('fill', 'white')
      .style('stroke', 'black')
      .style('stroke-width', "0.5px");

    hoverAdd.selectAll('text')
      .data("     ")
      .enter()
      .append('text')
        .attr('x', function (d, i) { return 10 * i+ 5; })
        .attr('y', 12)
        .style('font-size', function (d, i) { return  14 - 2 * Math.abs(i - 2); })

    //
    // blink
    //

    this.blinker = this.svg.append('line')
      .attr('class', 'blinking')
      .attr('y1', 0)
      .attr('y2', this.height)
      .style('opacity', 0);

  };

  this.hoverMove = function (x) {

    var pos = Math.round(this.scaleX.invert(x));

    this.hover
      .attr('transform', "translate(" + x  + ",0)");
    
    this.hover.select('.position')
      .text(pos);

    this.hover.selectAll('.loupe')
      .data(this.data)
      .selectAll('text')
        .data(function (d) {
          var chars = d.sequence.slice(pos - 2, pos + 3);
          // error thx to JS treating " " like false... :/
          if (pos < 2) {
            return _.repeat("-", 2 - pos) + chars;
          } else {
            return _.padRight(chars, 6, "-");
          }
        })
          .text(function (d) { return d; });

  };

  this.blinkAt = function (pos) {

    this.blinker
      .attr('transform', "translate(" + this.scaleX(pos) + ",0)")
      .style('opacity', 0.75)
      .transition().duration(2000)
        .style('opacity', 0);

  };

}