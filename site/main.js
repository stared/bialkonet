var width = 700,
    height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-100)
    .linkDistance(60)
    .gravity(0.3)
    .size([width - 150, height]);


var svg = d3.select("#d3graph").append("svg")
  .attr("width", width)
  .attr("height", height);
    

// in future, data should be joined beforehand
d3.json("graph.json", function(errorJSON, dataJSON) {
  d3.csv("HA_metadata_pdb.csv", function(errorCSV, dataCSV) {

    var additionalData = _.indexBy(dataCSV, 'id');
    dataJSON.nodes = dataJSON.nodes.map(function(node) {
      return _.assign(node, additionalData[node.p_id]);
    });
    drawGraph(dataJSON);

  });
});


//
// Graph
//

function drawGraph(graph) {

  console.log("Graph data", graph);

  var tooltip = new Tooltip('#d3graph');

  force.nodes(graph.nodes)
      .links(graph.links)
      .linkStrength(function (d) {
          return Math.pow(d.weight, 4);
      })
      .start();

  var node = svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) {
          return color(d.sero_num); 
      })
      .on('mouseover', function (d) {
        tooltip.show([d.p_id, d.sero, d.location, d.year, d.host].join("<br>"));
      })
      .on('mouseout', function (d) {
        tooltip.out();
      });

  force.on("tick", function() {
      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
  });

  function zzz () {};

  var optionList = [
    {name: 'serotype (main)', func: zzz},
    {name: 'serotype (subtype)', func: zzz},
    {name: 'year', func: zzz},
    {name: 'species', func: zzz},
    {name: 'region', func: zzz}
  ];

  var graphOptions = new GraphOptions('svg', optionList);
  graphOptions.g.attr('transform', 'translate(550, 50)');

}

//
// Options
//

function GraphOptions(parentDom, optionList){

  this.g = d3.select(parentDom).append('g');

  var options = this.g.selectAll('.option').data(optionList);

  options.enter()
    .append('text')
    .attr('x', 0)
    .attr('y', function (d, i) {return 20 * i})
    .text(function (d) {return d.name;})
    .on('click', function (d, i) {
      d.func();
    });

}


//
// Legend
//

function Legend(g) {

  this.g = d3.select(parentDom).append('g');

  this.update = function (nameColorList) {
    // ...
  };

}

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
