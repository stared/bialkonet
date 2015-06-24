var proteinViewer = new ProteinViewer('structureViewer');

var sequenceViewer = new SequenceViewer("sequenceViewer", 500, 100, 20);

sequenceViewer.draw([
  {name: "aaa", sequence: "DSCBSDKVJBADKVBVDLBADKADAKABJBADKVBVDLBADKADAKABDKACJBACLBACAABDKACJBACLBACAABDKACJBACLBACA"},
  {name: "bbb", sequence: "DKBHSVDSJHBVSKVDHSBVSKHDSBKAJBCKAJBAKBACKBVSKVDHSBJBADKVBVDLBADKADAKABVSBVSKVDHSBVSBVSKVDHSBVSBVSKVDHSBVS"}
]);

proteinViewer.onClickingAtom(sequenceViewer.blinkAt.bind(sequenceViewer));
sequenceViewer.onZoom = proteinViewer.highlightFromTo;


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
