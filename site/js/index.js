d3.csv("data/subtype_rmsd_distance_models.csv", function (error, data) {

  var nodeNames = _.uniq(_.pluck(data, 'p_id').concat(_.pluck(data, 'p_id2')));

  var nodes = nodeNames.map(function (x) {
    var h = parseInt(x.split("N")[0].substr(1));
    return {
      name: x,
      h: h,
    };
  });

  var nodeId = _.zipObject(nodeNames.map(function (x, i) { return [x, i]; }));

  var links = data.map(function (d) {
    return {
      source: nodeId[d.p_id],
      target: nodeId[d.p_id2],
      distance_mean: +d.distance_mean,
      distance_median: +d.distance_median,
      distance_std: +d.distance_std,
    };
  });

  console.log("All links: ", links.length);

  links = links.filter(function(d) { return d.distance_mean < 1.6; })

  console.log("Selected links: ", links.length);

  drawSeroGraph({nodes: nodes, links: links});

});


function drawSeroGraph(graph) {

  var color = d3.scale.category10();

  var width = 600,
      height = 400;

  var force = d3.layout.force()
      .charge(-500)
      .linkDistance(0)
      .gravity(0.4)
      .size([width - 150, height]);


  var svg = d3.select("#serograph").append("svg")
    .attr("width", width)
    .attr("height", height);

  var tooltip = new Tooltip('#serograph');

  force.nodes(graph.nodes)
      .links(graph.links)
      .linkStrength(function (d) {
          return 0.05 * Math.min(Math.pow(d.distance_mean, -3), 1);
      })
      .start();

  var drag = force.drag();

  var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("opacity", function (d) { return Math.min(Math.pow(d.distance_mean, -3), 1); })
      .on('mouseover', function (d) {
        tooltip.show([d.source.name, " and ", d.target.name, ":<br>mean distance: ", d.distance_mean.toFixed(2)].join(""));
      })
      .on('mouseout', function (d) {
        tooltip.out();
      });

  var node = svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("circle")
        .attr("class", "node")
        .attr("r", 20)
        .style("fill", function (d) { return color(d.h); })
        .on('mouseover', function (d) {
          tooltip.show(d.name);
        })
        .on('mouseout', function (d) {
          tooltip.out();
        })
        .call(drag);

  force.on("tick", function() {

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });

      link.attr("x1", function(e) { return e.source.x; })
          .attr("y1", function(e) { return e.source.y; })
          .attr("x2", function(e) { return e.target.x; })
          .attr("y2", function(e) { return e.target.y; });

  });

}
