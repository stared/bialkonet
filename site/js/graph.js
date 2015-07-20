var color = d3.scale.category20();

function drawGraph(graph) {

  console.log("Graph data", graph);

  var width = 700,
      height = 500;

  var force = d3.layout.force()
      .charge(-100)
      .linkDistance(60)
      .gravity(0.3)
      .size([width - 150, height]);


  var svg = d3.select("#d3graph").append("svg")
    .attr("width", width)
    .attr("height", height);

  var tooltip = new Tooltip('#d3graph');

  force.nodes(graph.nodes)
      .links(graph.links)
      .linkStrength(function (d) {
          return Math.pow(d.weight, 4);
      })
      .start();

  var drag = force.drag();

  var node = svg.selectAll(".node")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .on('mouseover', function (d) {
        tooltip.show([d.p_id, d.sero, d.location, d.year, d.host].join("<br>"));
      })
      .on('mouseout', function (d) {
        tooltip.out();
      })
      .on('click', function (d) {
        // we don't want duplicates
        if (_.includes(_.pluck(proteinViewer.colorNameList, 'name'), d.p_id)) {
          return;
        }
        proteinViewer.load(d.p_id, ["pdb/crystals/", d.p_id, "_chA.pdb"].join(""));
        // WARNING: temporary workaround with regex to make zooming working;
        sequenceViewer.load(d.p_id, d.sequence.replace(/-/g, ""), proteinViewer.superimpose);
      })
      .call(drag);

  force.on("tick", function() {
      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
  });

  var optionList = [
    {name: "maintype", label: "serotype (main)"},
    {name: "subtype", label: "serotype (subtype)"},
    {name: "year", label: "year"},
    {name: "host", label: "host"},
    {name: "location", label: "location"}
  ];


  var legend = new Legend('#d3graph svg', node);
  legend.g.attr('transform', 'translate(550, 150)');

  var graphOptions = new GraphOptions('#d3graph svg', optionList, graph.nodes, node, legend);
  graphOptions.g.attr('transform', 'translate(550, 25)');

  graphOptions.choice('subtype');

}


function GraphOptions(parentDom, optionList, data, node, legend){

  this.g = d3.select(parentDom).append('g');
  this.data = data;
  this.node = node;
  this.legend = legend;

  var options = this.g.selectAll('.option').data(optionList);

  var that = this;

  options.enter()
    .append('text')
      .attr('class', 'option')
      .attr('x', 0)
      .attr('y', function (d, i) { return 20 * i; })
      .text(function (d) {return d.label;})
      .on('click', function (d) {
        that.choice(d.name);
      });

  this.choice = function (field) {

    options
      .style('fill', function (d) {
        return d.name == field ? 'black' : 'grey';
      });

    // hard-coded, but it will be changed
    if (field != 'year') {

      var aggregated = _.chain(data)
        .countBy(field)
        .map(function (val, key) {
          return {name: key, count: val}
        })
        .sortBy('count')
        .reverse()
        .map(function (d, i) {
          return _.assign(d, {color: color(i)})
        })
        .value();

      console.log("aggregated", aggregated);

      var colorMap = _.indexBy(aggregated, 'name');

      legend.update(aggregated, field);

      node.style("fill", function(d) {
        return colorMap[d[field]].color; 
      });

    } else {

      // because of data messiness, +d.year is not enough
      var yearMin = d3.min(data, function (d) { return parseInt(d.year); }); 
      var yearMax = d3.max(data, function (d) { return parseInt(d.year); });

      console.log("yearMin", yearMin);
      console.log(_.countBy(data, 'year'));

      var colorScale = d3.scale.linear()
        .domain([yearMin, yearMax])
        .range(['brown', 'lightgreen']);

      // right now just clearning the categorical legend 
      legend.update([], field);

      node.style("fill", function(d) {
        return colorScale(parseInt(d.year)); 
      });

    }


  };

}


function Legend (parentDom, node) {

  this.g = d3.select(parentDom).append('g');

  this.update = function (nameColorList, field) {
    
    this.g.selectAll('.legend-box').remove();
    this.g.selectAll('.legend-label').remove();

    var boxes = this.g.selectAll('.legend-box');
    var labels = this.g.selectAll('.legend-label');

    boxes.data(nameColorList)
      .enter()
      .append('rect')
        .attr('class', 'legend-box')
        .attr('x', 0)
        .attr('y', function (d, i) { return 15 * i; })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function (d) { return d.color; })
        .on('mouseover', function (d) {
          node.style('stroke', function (c) {
            return c[field] == d.name ? "black" : null;
          })
        })
        .on('mouseout', function (d) {
          node.style('stroke', null);
        });

    labels.data(nameColorList)
      .enter()
      .append('text')
        .attr('class', 'legend-label')
        .attr('x', 15)
        .attr('y', function (d, i) { return 15 * i + 10; })
        .text(function (d) { return d.name; })
        .on('mouseover', function (d) {
          node.style('stroke', function (c) {
            return c[field] == d.name ? "black" : null;
          })
        })
        .on('mouseout', function (d) {
          node.style('stroke', null);
        });

  };

}
