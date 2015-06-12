function ProteinViewer(domId) {

  var that = this;

  var colors = d3.scale.category10();

  this.chainCounter = 0;

  var viewer = pv.Viewer(document.getElementById(domId), {
    quality: 'high',
    width: 'auto',
    height: 450, // 'auto',
    antialias: true,
    outline: true,
    slabMode: 'auto'
  });

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
        that.chainCounter = 1;
      } else {
        that.chainCounter++;
      }

      console.log("that.chainCounter", that.chainCounter);

      var go = viewer.cartoon('structure', structure, {
        color: pv.color.uniform(colors(that.chainCounter))
      });

      var rotation = pv.viewpoint.principalAxes(go);
      viewer.setRotation(rotation)

      viewer.autoZoom();
    });
  }

}
