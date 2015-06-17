
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

  this.hover = this.svg.append('g')
    .attr('class', 'hover');


  this.hover.append('line')
    .attr('y1', 0)
    .attr('y2', this.height);

  this.hover.append('text')
    .attr('class', 'position')
    .attr('x', 5)
    .attr('y', this.height - 1.3 * this.margin);

  this.draw = function (data) {

    var maxL = d3.max(data, function (d) { return d.sequence.length; });

    var scaleX = d3.scale.linear()
      .domain([0, maxL - 1])
      .range([this.margin, this.width - this.margin]);

    this.scaleX = scaleX;

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

    this.svg.selectAll('.sequence')
      .data(data, function (d) { return d.name; })
      .enter()
      .append('g')
        .attr('class', 'sequence')
        .attr('transform', function (d, i) {
          return "translate(0," + scaleY(i) + ")";
        })
        .selectAll('.letter')
          .data(function(d) { return d.sequence; })
          .enter()
          .append('text')
            .attr('class', 'letter')
            .attr('x', function (d, i) { return scaleX(i); })
            .style('font-size', 10)
            .text(function (d) { return d; });

  };

  this.hoverMove = function (x) {
    this.hover
      .attr('transform', "translate(" + x  + ",0)");
    
    this.hover.select('.position')
      .text(Math.round(this.scaleX.invert(x)));

  };

}