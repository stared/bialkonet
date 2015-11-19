var distanceGraph = new DistanceGraph('d3graph');

var proteinViewer = new ProteinViewer('structureViewer');

var sequenceViewer = new SequenceViewer("sequenceViewer", 500, 100, 20);

proteinViewer.onClickingAtom(sequenceViewer.blinkAt.bind(sequenceViewer));
proteinViewer.onClickingReset = sequenceViewer.clear.bind(sequenceViewer);
sequenceViewer.onZoom = proteinViewer.highlightFromTo;
