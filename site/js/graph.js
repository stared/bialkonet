function DistanceGraph(domId) {

  var thisDG = this;

  var width = 700,
      height = 650;

  var svg = d3.select("#" + domId).append("svg")
    .attr("width", width)
    .attr("height", height);

  var tooltip = new Tooltip('body');

  this.force = d3.layout.force()
    .size([width - 150, height]);

  var nodeDatasets = [
    {name: "crystals", r: 5},
    {name: "models", r: 3},
  ];

  var linkDatasets = [
    {name: "rmsd"}
  ];


  var menu = svg.append("g")
    .attr("transform", "translate(20, 20)");

  menu.selectAll(".node-file")
    .data(nodeDatasets)
    .enter()
      .append('text')
        .attr('class', 'node-file')
        .attr('x', 0)
        .attr('y', function (d, i) { return 20 * i; })
        .text(function (d) {return d.name;})
        .on('click', function (d) {
          thisDG.dataset = d.name;
          thisDG.force.stop();
          d3.csv("data/metadata_" + d.name + ".csv", function(error, nodes) {
            thisDG.updateNodes(nodes);
          });

          menu
            .selectAll(".node-file")
            .data(nodeDatasets)
              .style("opacity", function (c) {
                return c.name === d.name ? 1 : 0.5;
              });
        });

  menu.selectAll(".dist-file")
    .data(linkDatasets)
    .enter()
      .append('text')
        .attr('class', 'dist-file')
        .attr('x', 100)
        .attr('y', function (d, i) { return 20 * i; })
        .text(function (d) {return d.name;})
        .on('click', function (d) {
          console.log("ld d", d);
          thisDG.force.stop();
          d3.csv("data/distance_" + thisDG.dataset + "_" + d.name + ".csv", function(error, links) {
            thisDG.updateLinks(links);
          });

          menu
            .selectAll(".dist-file")
              .style("opacity", function (c) {
                return c.name === d.name ? 1 : 0.5;
              });
        });


  this.updateNodes = function(nodes) {

    this.nodes = nodes;

    this.force = this.force
      .charge(-100)
      .linkDistance(60)
      .gravity(2)
      .nodes(nodes);

  };


  this.updateLinks = function(links) {

    // preprocessing

    var id2node = {};

    this.nodes.forEach(function (d, i) {
      id2node[d.p_id] = i;
    });

    this.links = links.map(function (d) {
      return {
        // weight: Math.exp(-d.value/0.2),  // for crystals
        weight: Math.exp(-d.value/0.5),  // for models
        a: d.p_id,
        b: d.p_id2,
        source: id2node[d.p_id],
        target: id2node[d.p_id2],
      };
    }).filter(function (d) {
      // there shouldn't be, but it seems I were given messy data... :/
      return d.source !== undefined && d.target !== undefined;
    }); 


    this.force = this.force
      .links(this.links)
      .linkStrength(function (d) {
          return d.weight; // scaling done elsewhere // Math.pow(d.weight, 4);
      })
      .start();

    var drag = this.force.drag();

    var node = svg.selectAll(".node")
        .data(this.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 3)
        .on('mouseover', function (d) {
          tooltip.show([d.p_id, d.subtype, d.location, d.year, d.host].join("<br>"));
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

    this.force.on("tick", function() {
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    });

    var optionList = [
      {name: "maintype", label: "serotype (main)"},
      {name: "subtype", label: "serotype (subtype)"},
      {name: "year", label: "year"},
      {name: "host_class", label: "host"},
      {name: "continent", label: "continent"},
    ];

    this.nodes.forEach(function (d) {
      d.maintype = "H" + d.H;
    });

    var legend = new Legend('#d3graph svg', node);
    legend.g.attr('transform', 'translate(550, 150)');

    var graphOptions = new GraphOptions('#d3graph svg', optionList, this.nodes, node, legend);
    graphOptions.g.attr('transform', 'translate(550, 25)');

    graphOptions.choice('subtype');

  };

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

    var sb = {
      host_class: 'count',
      maintype: function (d) { return -d.H; },
      subtype: function (d) { return -d.H * 1000 - d.N; },
      continent: 'count'
    };

    options
      .style('fill', function (d) {
        return d.name == field ? 'black' : 'grey';
      });

    // hard-coded, but it will be changed
    if (field != 'year') {

      // it modifies the input node data, but in a harmless way
      var aggregated = _.chain(data)
        .groupBy(field)
        .map(function (val, key) {
          return _.assign(val[0], {count: val.length});
        })
        .sortBy(sb[field])
        .reverse()
        .map(function (d, i) {
          return _.assign(d, {i: i, name: d[field]});
        })
        .value();

      var colorMap = _.indexBy(aggregated, field);

      if (aggregated.length <= 10) {
        var colorF = d3.scale.category10();
      } else if (aggregated.length <= 20) {
        var colorF = d3.scale.category20();
      } else {
        var n = aggregated.length;
        var colorF = d3.scale.linear()
          .domain([0, n/3, 2*n/3, 3.5*n/3])
          .range(['red', 'green', 'blue', 'red']);
      }

      legend.update(aggregated, field, colorF);

      node.style("fill", function(d) {
        return colorF(colorMap[d[field]].i); 
      });

    } else {

      // because of data messiness, +d.year is not enough
      var yearMin = d3.min(data, function (d) { return parseInt(d.year); }); 
      var yearMax = d3.max(data, function (d) { return parseInt(d.year); });

      console.log("yearMin", yearMin);
      console.log(_.countBy(data, 'year'));

      var colorScale = d3.scale.log()
        .domain([1, yearMax + 1 - yearMin])
        .range(['red', 'blue']);

      // right now just clearning the categorical legend 
      legend.update([], field);

      node.style("fill", function(d) {
        return colorScale(parseInt(yearMax + 1 - d.year)); 
      });

    }


  };

}


function Legend (parentDom, node) {

  this.g = d3.select(parentDom).append('g');

  this.update = function (nameColorList, field, colorF) {
    
    this.g.selectAll('.legend-box').remove();
    this.g.selectAll('.legend-label').remove();

    var boxes = this.g.selectAll('.legend-box');
    var labels = this.g.selectAll('.legend-label');

    boxes.data(nameColorList)
      .enter()
      .append('rect')
        .attr('class', 'legend-box')
        .attr('x', function (d, i) { return 70 * Math.floor(i / 24); })
        .attr('y', function (d, i) { return 15 * (i % 24); })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function (d) { return colorF(d.i); })
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
        .attr('x', function (d, i) { return 15 + 70 * Math.floor(i / 24); })
        .attr('y', function (d, i) { return 15 * (i % 24) + 10; })
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
