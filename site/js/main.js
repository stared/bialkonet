var proteinViewer = new ProteinViewer('structureViewer');

// in future, data should be joined beforehand
d3.json("data/graph.json", function(errorJSON, dataJSON) {
  d3.csv("data/HA_metadata_pdb.csv", function(errorCSV, dataCSV) {

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


var sequenceViewer = new SequenceViewer("sequenceViewer", 500, 200, 20);

sequenceViewer.draw([
  {name: "aaa", sequence: "DSCBSDKVJBADKVBVDLBADKADAKABDKACJBACLBACA"},
  {name: "bbb", sequence: "DKBHSVDSJHBVSKVDHSBVSKHDSBKAJBCKAJBAKBACK"}
]);
