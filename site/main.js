var width = 600,
    height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-100)
    .linkDistance(60)
    .gravity(0.3)
    .size([width, height]);


var svg = d3.select("#d3graph").append("svg")
  .attr("width", width)
  .attr("height", height);
    

d3.json("graph.json", function(error, graph) {

    force.nodes(graph.nodes)
        .links(graph.links)
        .linkStrength(function (d) {
            return Math.pow(d.weight, 4);
        })
        .start();

    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link");

    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 5)
        .style("fill", function(d) {
            return color(d.sero_num); 
        });

    node.append("title")
        .text(function(d) { return d.p_id + " (" + d.sero + ")"; });

    force.on("tick", function() {
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    });
});


//
// Tooltip
//

function Tooltip(parentDom) {

  var tooltip = d3.select(parentDom)
    .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 1e-6);

  this.show = function (html) {
    tooltip.style('opacity', 0.8)
      .style('left', (d3.event.pageX + 15) + 'px')
      .style('top', (d3.event.pageY + 8) + 'px')
      .html(html);
  };

  this.out = function () {
    tooltip
      .style('opacity', 1e-6);
  };

  this.destory = function () {
    tooltip.remove();
  };

}
