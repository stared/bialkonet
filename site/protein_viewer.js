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