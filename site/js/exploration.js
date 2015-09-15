var distanceGraph = new DistanceGraph('d3graph');

var proteinViewer = new ProteinViewer('structureViewer');

var sequenceViewer = new SequenceViewer("sequenceViewer", 500, 300, 20);

proteinViewer.onClickingAtom(sequenceViewer.blinkAt.bind(sequenceViewer));
sequenceViewer.onZoom = proteinViewer.highlightFromTo;

// proteinViewer.load("10gs_orig.pdb", ["testowanie/10gs_orig.pdb"].join(""));

// in future, data should be joined beforehand
// d3.csv("data/distance_crystals_rmsd_full.csv", function(errorCSVdist, distances) {
//   d3.csv("data/crystals_metadata.csv", function(errorCSVdist, nodes) {
d3.csv("data/distance_models_rmsd.csv", function(errorCSVdist, distances) {
  d3.csv("data/models_metadata.csv", function(errorCSVdist, nodes) {


    var id2node = {};

    nodes.forEach(function (d, i) {
      id2node[d.p_id] = i;
    });

    var links = distances.map(function (d) {
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

    distanceGraph.updateNodes(nodes);
    distanceGraph.updateLinks(links);

  });
});
