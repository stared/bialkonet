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
    {name: "crystals"},
    {name: "models"},
  ];

  var linkDatasets = [
    {name: "rmsd"},
    {name: "esp"},
    {name: "seq"}
  ];

  // defaults
  this.nodeDataset = "crystals";
  this.linkDataset = "rmsd";
  d3.csv("data/metadata_" + this.nodeDataset + ".csv", function(error, nodes) {
    thisDG.updateNodes(nodes);
  });

  var menu = svg.append("g")
    .attr("transform", "translate(20, 20)");

  menu.selectAll(".node-file")
    .data(nodeDatasets)
    .enter()
      .append('text')
        .attr('class', 'node-file')
        .attr('x', 0)
        .attr('y', function (d, i) { return 20 * i; })
        .text(function (d) { return d.name; })
        .style("opacity", function (d) {
          return d.name === thisDG.nodeDataset ? 1 : 0.5;
        })
        .on('click', function (d) {
          thisDG.nodeDataset = d.name;
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
        .text(function (d) { return d.name; })
        .style("opacity", function (d) {
          return d.name === thisDG.linkDataset ? 1 : 0.5;
        })
        .on('click', function (d) {
          thisDG.linkDataset = d.name;
          thisDG.force.stop();
          d3.csv("data/distance_" + thisDG.nodeDataset + "_" + d.name + ".csv", function(error, links) {
            thisDG.updateLinks(links);
          });

          menu
            .selectAll(".dist-file")
              .style("opacity", function (c) {
                return c.name === d.name ? 1 : 0.5;
              });
        });


  var optionList = [
    {name: "maintype", label: "serotype (main)"},
    {name: "subtype", label: "serotype (subtype)"},
    {name: "yearNum", label: "year"},
    {name: "host_class", label: "host"},
    {name: "continent", label: "continent"},
  ];

  this.legend = new Legend('#d3graph svg');
  this.legend.g.attr('transform', 'translate(550, 150)');

  this.graphOptions = new GraphOptions('#d3graph svg', optionList, this.legend);
  this.graphOptions.g.attr('transform', 'translate(550, 25)');


  this.updateNodes = function(nodes) {

    var optsByDataset = {
      crystals: {
        r: 5,
        charge: -150,
        gravity: 0.7
      },
      models: {
        r: 4,
        charge: -120,
        gravity: 2.5
      },
    };

    var opts = optsByDataset[this.nodeDataset];

    this.nodes = nodes;

    this.nodes.forEach(function (d) {
      d.maintype = "H" + d.H;
      d.search = [d.p_id, d.template_id, d.database, d.subtype, d.host, d.location, d.continent, d.year].join(" ").toLowerCase();
    });

    this.nodes.forEach(function (d) {
      var year = parseInt(d.year);
      if (!year) {
        d.yearNum = "N/A";
      } else if ((year < 2000) && (year > 1919)) {
        d.yearNum = String(year).slice(0, 3) + "0s";
      } else {
        d.yearNum = String(year);
      }
    });

    this.force = this.force
      .charge(opts.charge)
      .linkDistance(60)
      .gravity(opts.gravity)
      .nodes(nodes);

    var drag = this.force.drag();

    var node = svg.selectAll(".node")
        .data(this.nodes, function (d) { return d.p_id; });

    node.enter()
      .append("circle")
        .attr("class", "node")
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
          proteinViewer.load(d.p_id, ["pdb/" + thisDG.nodeDataset + "/", d.p_id, ".pdb"].join(""));
          // WARNING: temporary workaround with regex to make zooming working;
          sequenceViewer.load(d.p_id, d.sequence.replace(/-/g, ""), proteinViewer.superimpose);
        })
        .call(drag);

    node
      .attr("r", opts.r)

    node.exit()
      .remove();

    this.force.on("tick", function() {
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    });

    d3.select("#search").on("input", function () {
      var hx = /H[x\d]+N[x\d]+/;
      var regexes = this.value
        .toLowerCase()
        .split(" ")
        .map(function (s) {
          if (hx.test(s)) {
            return new RegExp(s.replace(/x/g, "\\d+"));
          } else {
            return new RegExp(s);
          }
        });

      node.style('opacity', function (d) {
        return _.every(regexes, function (re) { return re.test(d.search); }) ? null : 0.1;
      });
    });

    this.legend.node = node;
    this.graphOptions.nodes = this.nodes;
    this.graphOptions.node = node;
    this.graphOptions.choice(this.graphOptions.currentField || 'subtype');

    proteinViewer.clear();
    sequenceViewer.clear();

    d3.csv("data/distance_" + thisDG.nodeDataset + "_" + thisDG.linkDataset + ".csv", function(error, links) {
      thisDG.updateLinks(links);
    });

  };


  this.updateLinks = function(links) {

    var wfs = {
      crystals_rmsd: function (d) { return Math.exp(-d.value/0.2); },
      crystals_esp: function (d) {return Math.exp(-Math.pow(d.distance/0.15, 8)); },
      crystals_seq: function (d) {return Math.pow(d.distance/1800, 8); },
      models_rmsd: function (d) { return Math.exp(-d.value/0.5); },
      models_esp: function (d) {return Math.exp(-Math.pow(d.distance/0.15, 8)); },
      models_seq: function (d) {return Math.pow(d.distance/1800, 8); },
    }

    var wf = wfs[this.nodeDataset + "_" + this.linkDataset];

    var id2node = {};

    this.nodes.forEach(function (d, i) {
      id2node[d.p_id] = i;
    });

    this.links = links.map(function (d) {
      return {
        weight: wf(d),
        a: d.p_id,
        b: d.p_id2,
        source: id2node[d.p_id],
        target: id2node[d.p_id2],
      };
    }).filter(function (d) {
      // there shouldn't be, but it seems I were given messy data... :/
      return d.source !== undefined && d.target !== undefined && d.source !== d.target;
    }); 

    console.log("mean weigth", d3.mean(this.links, function(d) { return d.weight; }));

    this.force = this.force
      .links(this.links)
      .linkStrength(function (d) {
          return d.weight;
      })
      .start();

  };

}


function GraphOptions(parentDom, optionList, legend){

  this.g = d3.select(parentDom).append('g');
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

    this.currentField = field;

    var sb = {
      host_class: 'count',
      maintype: function (d) { return -d.H; },
      subtype: function (d) { return -d.H * 1000 - d.N; },
      continent: 'count',
      yearNum: function (d) { return parseInt(d.yearNum); },
    };

    options
      .style('fill', function (d) {
        return d.name == field ? 'black' : 'grey';
      });

    // it modifies the input node data, but in a harmless way
    var aggregated = _.chain(this.nodes)
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

    // hard-coded, but it will be changed
    if (field != 'yearNum') {

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

      this.node.style("fill", function(d) {
        return colorF(colorMap[d[field]].i); 
      });

    } else {

      // because of data messiness, +d.year is not enough
      var yearMin = d3.min(this.nodes, function (d) { return parseInt(d.year); }); 
      var yearMax = d3.max(this.nodes, function (d) { return parseInt(d.year); });

      var colorScale = d3.scale.log()
        .domain([1, yearMax + 1 - yearMin])
        .range(['red', 'blue']);

      legend.update(aggregated, field, colorScale);

      // need to make colors on nodes the same as for the legend (linear vs ordinal)
      this.node.style("fill", function(d) {
        return isFinite(d.yearNum) ? colorScale(yearMax + 1 - d.yearNum) : "#000"; 
      });

    }


  };

}


function Legend (parentDom) {

  this.g = d3.select(parentDom).append('g');

  this.update = function (nameColorList, field, colorF) {
    
    var node = this.node;

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
