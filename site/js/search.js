d3.csv("data/metadata_crystals.csv", function(errorCSVcrystals, dataCSVcrystals) {
  d3.csv("data/metadata_models.csv", function(errorCSVmodels, dataCSVmodels) {

  dataCSVcrystals.forEach(function (d) {
    d.database = "crystal";
    d.template_id = "";
  });

  dataCSVmodels.forEach(function (d) {
    d.database = "model";
  });

  var dataCSV = dataCSVcrystals.concat(dataCSVmodels);

  // or some other on-load
  var rowTemplate = _.template(d3.select("#tableContent").html());

  dataCSV.forEach(function (d) {
    d.search = [d.p_id, d.template_id, d.database, d.subtype, d.host, d.location, d.continent, d.year].join(" ").toLowerCase();
  });
  var table = dataCSV.map(rowTemplate).join("\n");
  d3.select("#resultTable tbody").html(table);
  d3.select("#search").on("input", function () {
    // test http://jsperf.com/regexp-vs-indexof
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
    var dataF;
    if (this.value.length > 1) {
      dataF = dataCSV.filter(function (d) {
        return _.every(regexes, function (re) { return re.test(d.search); });
      })
    } else {
      dataF = dataCSV;
    }
    d3.select("#foundCount").html("Found " + dataF.length + " proteins:");
    var table = dataF.map(rowTemplate).join("\n");
    d3.select("#resultTable tbody").html(table);
  });

});
});