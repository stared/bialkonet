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
    dataJSON.nodes = dataJSON.nodes
      .map(function(d) {
        return _.assign(d, additionalData[d.p_id]);
      })
      .map(function (d) {
        return _.assign(d, {maintype: d.subtype ? d.subtype.split("N")[0] : undefined})
      });



    drawGraph(dataJSON);

    // calculate h and n

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

  var optionList = [
    {name: "maintype", label: "serotype (main)"},
    {name: "subtype", label: "serotype (subtype)"},
    {name: "year", label: "year"},
    {name: "host", label: "host"},
    {name: "location", label: "location"}
  ];


  var legend = new Legend('svg', node);
  legend.g.attr('transform', 'translate(550, 150)');

  var graphOptions = new GraphOptions('svg', optionList, graph.nodes, node, legend);
  graphOptions.g.attr('transform', 'translate(550, 25)');

  graphOptions.choice('subtype');

}

//
// Options
//

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


//
// Legend
//

function Legend (parentDom, node) {

  this.g = d3.select(parentDom).append('g');



  this.update = function (nameColorList, field) {
    
    this.g.selectAll('.box').remove();
    this.g.selectAll('.label').remove();

    var boxes = this.g.selectAll('.box');
    var labels = this.g.selectAll('.label');

    boxes.data(nameColorList)
      .enter()
      .append('rect')
        .attr('class', 'box')
        .attr('x', 0)
        .attr('y', function (d, i) { return 15 * i; })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function (d) { return d.color; })
        .on('mouseover', function (d) {
          node.style('opacity', function (c) {
            return c[field] == d.name ? 1 : 0.1;
          })
        })
        .on('mouseout', function (d) {
          node.style('opacity', null);
        });

    labels.data(nameColorList)
      .enter()
      .append('text')
        .attr('class', 'label')
        .attr('x', 15)
        .attr('y', function (d, i) { return 15 * i + 10; })
        .text(function (d) { return d.name; })
        .on('mouseover', function (d) {
          node.style('opacity', function (c) {
            return c[field] == d.name ? 1 : 0.1;
          })
        })
        .on('mouseout', function (d) {
          node.style('opacity', null);
        });

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

//
// protein viewer
//
var viewer = pv.Viewer(document.getElementById('structureViewer'), {
  quality: 'medium',
  width: 'auto',
  height: 500, // 'auto',
  antialias: true,
  outline: true,
  slabMode: 'auto'
});

function load(name, pdbPath) {
  pv.io.fetchPdb(pdbPath, function(structure) {
    // render everything as helix/sheet/coil cartoon, coloring by secondary 
    // structure succession
    var go = viewer.cartoon('structure', structure, {
      color: pv.color.ssSuccession(),
      showRelated: '1',
    });

    // find camera orientation such that the molecules biggest extents are 
    // aligned to the screen plane.
    var rotation = pv.viewpoint.principalAxes(go);
    viewer.setRotation(rotation)

    // adapt zoom level to contain the whole structure
    viewer.autoZoom();
  });
}


// load default
load('example', 'ABK57092.pdb');

// tell viewer to resize when window size changes.
window.onresize = function(event) {
  viewer.fitParent();
}

