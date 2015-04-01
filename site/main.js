var width = 600,
    height = 500;

// We create a color scale.
var color = d3.scale.category20();

// We create a force-directed dynamic graph layout.
var force = d3.layout.force()
    .charge(-100)
    .linkDistance(60)
    .gravity(0.3)
    .size([width, height]);

// In the <div> element, we create a <svg> graphic
// that will contain our interactive visualization.
var svg = d3.select("#d3graph").append("svg")
  .attr("width", width)
  .attr("height", height);
    
// We load the JSON file.
d3.json("graph.json", function(error, graph) {
    // In this block, the file has been loaded
    // and the 'graph' object contains our graph.
    
    // We load the nodes and links in the force-directed
    // graph.
    force.nodes(graph.nodes)
        .links(graph.links)
        .linkStrength(function (d) {
        // it needs to be here, after links
            return Math.pow(d.weight, 4);
        })
        .start();

    // We create a <line> SVG element for each link
    // in the graph.
    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link");

    // We create a <circle> SVG element for each node
    // in the graph, and we specify a few attributes.
    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 5)  // radius
        .style("fill", function(d) {
            // The node color depends on the club.
            return color(d.sero_num); 
        });
        // .call(force.drag);

    // The name of each node is the node number.
    node.append("title")
        .text(function(d) { return d.p_id + " (" + d.sero + ")"; });

    // We bind the positions of the SVG elements
    // to the positions of the dynamic force-directed graph,
    // at each time step.
    force.on("tick", function() {
       // link.attr("x1", function(d) { return d.source.x; })
       //     .attr("y1", function(d) { return d.source.y; })
       //     .attr("x2", function(d) { return d.target.x; })
       //     .attr("y2", function(d) { return d.target.y; });

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
