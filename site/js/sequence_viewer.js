function SequenceViewer(domId) {

/*
         * for the sake of the demo, we keep track of the mousover ft
         */
        var mouseOveredFT;

        /*
         * add a mouseover/mouseout call back based on the feature type
         */
        // pviz.FeatureDisplayer.addMouseoverCallback(['helix', 'turn', 'beta_strand'], function(ft) {
        //     mouseOveredFT = ft;
        //     var el = $('#output-mouse-over');
        //     el.empty();
        //     el.html('<pre>' + JSON.stringify(ft) + '</pre>')
        // }).addMouseoutCallback(['helix', 'turn', 'beta_strand'], function(ft) {
        //     mouseOveredFT = undefined;
            
        // });

        var seq = 'MELAALCRWGLLLALLPPGAASTQVCTGTDMKLRLPASPETHLDMLRHLYQGCQVVQGNLELTYLPTNASLSFLQDIQEVQGYVLIAHNQVRQVPLQRLRIVRGTQLFEDNYALAVLDNGDPLNNTTPVTGASPGGLRELQLRSLTEILKGGVLIQRNPQLCYQDTILWKDIFHKNNQLA';
        var seqEntry = new pviz.SeqEntry({
            sequence : seq
        });

        var view = new pviz.SeqEntryAnnotInteractiveView({
            model : seqEntry,
            el : "#" + domId,
            /** adding a xChange callback. It is called whenever the x position is fired
             *
             */
            // xChangeCallback : function(pStart, pEnd) {
            //     var str = 'cursor at ' + pStart.toFixed(1) + ' - ' + pEnd.toFixed(1);
            //     if (mouseOveredFT !== undefined) {
            //         str += '<strong> -> on FT'
            //     }

            //     $('#output-x-change').html(str);
            // }
        })
        view.render();

        seqEntry.addFeatures([{
            category: 'second',
            type: 'altSequence',
            sequence: seq,
        }]);

        // seqEntry.addFeatures([{
        //     category : 'regions',
        //     type : 'topological domain',
        //     text : 'extra cellular',
        //     start : 22,
        //     end : 650
        // }, {
        //     category : 'secondary structure',
        //     type : 'beta_strand',
        //     start : 24,
        //     end : 26
        // }, {
        //     category : 'secondary structure',
        //     type : 'helix',
        //     start : 38,
        //     end : 49
        // }, {
        //     category : 'secondary structure',
        //     type : 'beta_strand',
        //     start : 53,
        //     end : 57
        // }, {
        //     category : 'secondary structure',
        //     type : 'beta_strand',
        //     start : 59,
        //     end : 63
        // }, {
        //     category : 'secondary structure',
        //     type : 'helix',
        //     start : 71,
        //     end : 73
        // }, {
        //     category : 'secondary structure',
        //     type : 'beta_strand',
        //     start : 78,
        //     end : 81
        // }, {
        //     category : 'secondary structure',
        //     type : 'beta_strand',
        //     start : 83,
        //     end : 87
        // }, {
        //     category : 'secondary structure',
        //     type : 'beta_strand',
        //     start : 91,
        //     end : 94
        // }, {
        //     category : 'secondary structure',
        //     type : 'turn',
        //     start : 108,
        //     end : 110
        // }, {
        //     category : 'secondary structure',
        //     type : 'beta_strand',
        //     start : 111,
        //     end : 116
        // }, {
        //     category : 'secondary structure',
        //     type : 'turn',
        //     start : 129,
        //     end : 131
        // }, {
        //     category : 'secondary structure',
        //     type : 'beta_strand',
        //     start : 138,
        //     end : 140
        // }, {
        //     category : 'secondary structure',
        //     type : 'beta_strand',
        //     start : 150,
        //     end : 155
        // }]);

}

        
