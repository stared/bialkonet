//
// protein viewer
//

'structureViewer'

function ProteinViewer(domId) {

  var viewer = pv.Viewer(document.getElementById(domId), {
    quality: 'medium',
    width: 'auto',
    height: 450, // 'auto',
    antialias: true,
    outline: true,
    slabMode: 'auto'
  });

  this.load = function(name, pdbPath, superimpose) {
    pv.io.fetchPdb(pdbPath, function(structure) {

      if (!superimpose) {
        viewer.clear();
      }

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

}
