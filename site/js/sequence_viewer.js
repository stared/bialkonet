
function SequenceViewer(domId, width, height, margin) {

  var that = this;

  this.width = width;
  this.height = height;
  this.margin = margin;

  this.data = [];

  // init svg

  this.svg = d3.select('#' + domId).append('svg')
    .attr('width', width)
    .attr('height', height)
    .on('mousemove', function () {
      that.hoverMove(d3.mouse(this)[0]);
    });

  this.g = this.svg.append("g");

  // init scaleX

  this.scaleX = d3.scale.linear()
    .range([this.margin, this.width - this.margin]);

  this.axisXLegend = this.svg.append('g')
    .attr('class', 'axis')
    .attr('transform', "translate(0," + (this.height - this.margin) + ")");

  // init hover

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

  // init blinking stripe

  this.blinker = this.svg.append('line')
    .attr('class', 'blinking')
    .attr('y1', 0)
    .attr('y2', this.height)
    .style('opacity', 0);

  //
  // functions
  //

  // does nothing. but can be reassigned 
  this.onZoom = function (from, to) {
    return;
  };

  this.load = function (p_id, sequence) {
    this.data.push({name: p_id, sequence: sequence});
    this.draw(this.data);
  };

  this.draw = function (data) {

    // in case draw is called directly
    this.data = data;

    // WARNING: as it is right now it might not work for changing domain length
    var maxL = d3.max(data, function (d) { return d.sequence.length; });

    var dX = function() {
      return that.scaleX(1) - that.scaleX(0);
    }


    if (data.length === 1) {
      this.scaleX = this.scaleX.domain([0, maxL - 1]);

      var axisX = d3.svg.axis()
        .scale(that.scaleX)
        .orient('bottom')
        .tickSize(6, 0);

      this.axisXLegend
        .call(axisX);

      var zoom = d3.behavior.zoom()
        .x(that.scaleX)
        .scaleExtent([1, 15/dX()])
        .on("zoom", zoomed);

      this.svg.call(zoom);

    }

    var scaleY = d3.scale.linear()
      .domain([-0.5, data.length - 0.5])
      .range([0.7 * this.margin, this.height - 1.3 * this.margin]);


    var sequences = this.g.selectAll('.sequence')
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
          .attr('x', function (d, i) { return that.scaleX(i); })
          .style('font-size', Math.min(15, dX()))
          .text(function (d) { return d; });

    //
    // zoom behaviour
    //

    function zoomed() {
      if (that.scaleX(0) > that.margin) {
        zoom.translate([that.margin * (1 - zoom.scale()), 0]);
      } else if (that.scaleX(maxL - 1) < that.width - that.margin) {
        zoom.translate([(that.width - that.margin) * (1 - zoom.scale()), 0]);
      }

      that.svg.select(".axis").call(axisX);

      that.svg.selectAll('.sequence')
        .data(data, function (d) { return d.name; })
          .selectAll('.letter')
          .data(function(d) { return d.sequence; })
            .attr('x', function (d, i) { return that.scaleX(i); })
            .style('font-size', Math.min(15, dX()));

      that.hover.style("opacity", dX() > 10 ? 0 : null);

      that.onZoom(that.scaleX.invert(that.margin), that.scaleX.invert(that.width - that.margin));
    }

    //
    // update hover
    //

    this.hover.style("opacity", 0);

    var hover = this.hover.selectAll('.loupe')
      .data(data, function (d) { return d.name; });

    var hoverAdd = hover.enter()
      .append('g')
        .attr('class', 'loupe')

    hover
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
        .attr('x', function (d, i) { return 10 * i + 5; })
        .attr('y', 12)
        .style('font-size', function (d, i) { return  14 - 2 * Math.abs(i - 2); })

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
