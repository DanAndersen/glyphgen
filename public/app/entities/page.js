/*global app*/
app.factory('Page', ['Glyph', 'genericServices', function (Glyph, genericServices) {
    'use strict';
    /* Constructor */
    function Page(width, height) {
        var i, j;

        this.width = width;
        this.height = height;

        this.glyphs = [];

        this.numGlyphSegments = 8;
        
        for (i = 0; i < width; i += 1) {
            this.glyphs[i] = [];
            
            for (j = 0; j < height; j += 1) {

                var glyphSegments = [];
                for (var segmentIdx = 0; segmentIdx < this.numGlyphSegments; segmentIdx++) {
                    glyphSegments.push(Math.random() >= 0.5);
                }

                this.glyphs[i][j] = new Glyph(glyphSegments);
            }
        }
    }

    /* Public functions */
    Page.prototype = {

    };

    return Page;
}]);
