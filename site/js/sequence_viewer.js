
function SequenceViewer(domId, width, height, margin) {

  this.width = width;
  this.height = height;
  this.margin = margin;

  this.svg = d3.select('#' + domId).append('svg')
    .attr('width', width)
    .attr('height', height);

  this.draw = function (data) {

    var maxL = d3.max(data, function (d) { return d.sequence.length; });

    var scaleX = d3.scale.linear()
      .domain([0, maxL - 1])
      .range([this.margin, this.width - this.margin]);

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
          return "translate(0," + (50 + 50 * i) + ")";
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

}