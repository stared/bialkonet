function ProteinViewer(domId) {

  var that = this;

  var colors = d3.scale.category10();


  var viewer = pv.Viewer(document.getElementById(domId), {
    quality: 'high',
    width: 'auto',
    height: 450, // 'auto',
    antialias: true,
    outline: true,
    slabMode: 'auto'
  });

  this.onClickingAtom = function (callback) {
    viewer.on('click', function(picked) {
      // strange... this is fired twice, once with callback, once without it
      if (callback === undefined) return;
      if (picked === null) return;
      callback(picked.object().atom.index());
    });
  };

  this.onClickingAtom();

  this.colorNameList = [];

  this.proteinLegend = new proteinLegend(domId);

  //
  // menu
  //

  this.superimpose = true;

  var siSelect = d3.select("#" + domId).append('select')
    .attr('id', 'superimpose')
    .on('change', function (x, y) {
      that.superimpose = (d3.select(this).node().value === "superimpose");
    });

  siSelect.append('option')
    .attr('value', "superimpose")
    .text("superimpose");

  siSelect.append('option')
    .attr('value', "change")
    .text("change");


  this.load = function(name, pdbPath) {

    pv.io.fetchPdb(pdbPath, function(structure) {

      
      if (!that.superimpose) {
        viewer.clear();
        that.colorNameList = [];
      }

      var color = colors(that.colorNameList.length);
      that.colorNameList.push({name: name, color: color});

      var go = viewer.cartoon('structure', structure, {
        color: pv.color.uniform(color)
      });

      var rotation = pv.viewpoint.principalAxes(go);
      viewer.setRotation(rotation)

      viewer.autoZoom();

      that.proteinLegend.update(that.colorNameList);
    });

  }

  function highlightFromToOp(start, end) {
    return new pv.color.ColorOp(function(atom, out, index) {
      if ((start == null || atom.index() >= start) &&
          (end == null || atom.index() <= end)) {
        out[index+3] = 1.0; // A
      } else {
        out[index+3] = 0.3; // A
      }
    });
  }

  this.highlightFromTo = function(from, to) {
    viewer.forEach(function(go) {
      go.colorBy(highlightFromToOp(from, to));
    });
    viewer.requestRedraw();
  }

}


function proteinLegend (domId) {

  this.svg = d3.select("#" + domId).append("svg")
    .attr("class", "legendSvg")
    .attr('width', 100)
    .attr('height', 150);

  this.update = function (colorNameList) {

    var boxes = this.svg.selectAll('.box')
      .data(colorNameList);
    var labels = this.svg.selectAll('.label')
      .data(colorNameList);;

    boxes.enter()
      .append('rect')
        .attr('class', 'box');
    
    boxes
      .attr('x', 0)
      .attr('y', function (d, i) { return 15 * i + 10; })
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', function (d) { return d.color; });

    boxes.exit()
      .remove();


    labels
      .enter()
      .append('text')
        .attr('class', 'label');

    labels
      .attr('x', 15)
      .attr('y', function (d, i) { return 15 * i + 20; })
      .text(function (d) { return d.name; });

    labels.exit()
      .remove();

  };


}
