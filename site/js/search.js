var rowTemplate = _.template("<tr><td><%= id %></td><td><%= subtype %></td><td><%= host %></td><td><%= location %></td><td><%= year %></td>"
                             + "<td><a href='pdb/crystals/<%= id %>_chA.pdb'>pdb</a> <a href='dx/<%= id %>.ds'>dx</a> <a href='fas/<%= id %>.fas'>fas</a></td></tr>");
// tied to crystal
// I should have did it in ES6 io use a better tamplating

d3.csv("data/crystals_metadata.csv", function(errorCSV, dataCSV) {
  console.log("dataCSV", dataCSV);
  dataCSV.forEach(function (d) {
    d.search = [d.id, d.subtype, d.host, d.location, d.year].join(" ");
  });
  var table = dataCSV.map(rowTemplate).join("\n");
  d3.select("#resultTable tbody").html(table);
  d3.select("#search").on("input", function () {
    var strings = this.value.split(" ");
    var dataF;
    if (this.value.length > 1) {
      dataF = dataCSV.filter(function (d) {
        return _.every(strings, function (s) { return d.search.indexOf(s) !== -1; });
      })
    } else {
      dataF = dataCSV;
    }
    d3.select("#foundCount").html("Found " + dataF.length + " proteins:");
    var table = dataF.map(rowTemplate).join("\n");
    d3.select("#resultTable tbody").html(table);
  });
});