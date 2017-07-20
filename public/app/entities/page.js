/*global app*/
app.factory('Page', ['Glyph', 'genericServices', function (Glyph, genericServices) {
    'use strict';
    /* Constructor */
    function Page(width, height) {
        this.width = width;
        this.height = height;

        

        this.numPoints = 8;

        this.adjacencySets = generateAdjacencySets();

        this.normalizedPoints = generateNormalizedPoints();

        this.numStrokesPerGlyph = 2;
        this.strokeDecayThreshold = 0.9;

        this.generationParametersChanged = true;

        this.generateGlyphs();
    }

    // return point locations in NDC ([-1,+1] for X and Y)
    function generateNormalizedPoints() {
        return [
            [-1.0, 1.0],    // lower left
            [-1.0, 0.0],    // middle left
            [-1.0, -1.0],   // upper left
            [0.0, 0.5],     // lower middle
            [0.0, -0.5],    // upper middle
            [1.0, 1.0],    // lower right
            [1.0, 0.0],    // middle right
            [1.0, -1.0]   // upper right
        ];
    }

    function generateAdjacencySets() {
        return [
            new Set([1,3]),      // lower left
            new Set([0,2,3,4]),  // middle left
            new Set([1,4]),  // upper left
            new Set([0,1,4,5,6]),  // lower middle
            new Set([1,2,3,6,7]),  // upper middle
            new Set([3,6]),  // lower right
            new Set([3,4,5,7]),  // middle right
            new Set([4,6])   // upper right
        ];
    }

    function getRandomFromSet(set) {
        var setArray = Array.from(set);
        var rndm = Math.floor(Math.random() * setArray.length);
        return setArray[rndm];
    }

    /* Public functions */
    Page.prototype = {
        setGlyphGenerationParameters: function(numStrokesPerGlyph, strokeDecayThreshold) {
            if (this.numStrokesPerGlyph !== numStrokesPerGlyph) {
                this.generationParametersChanged = true;
            }
            this.numStrokesPerGlyph = numStrokesPerGlyph;

            if (this.strokeDecayThreshold !== strokeDecayThreshold) {
                this.generationParametersChanged = true;
            }
            this.strokeDecayThreshold = strokeDecayThreshold;
        },

        generateGlyphs: function() {
            if (this.generationParametersChanged) {
                var i, j;
                this.glyphs = [];
                for (i = 0; i < this.width; i += 1) {
                    this.glyphs[i] = [];
                    
                    for (j = 0; j < this.height; j += 1) {

                        // list of all UNvisited edges
                        var inverseGlyphAdjacencySets = generateAdjacencySets();

                        var glyphStrokes = [];

                        for (var strokeIdx = 0; strokeIdx < this.numStrokesPerGlyph; strokeIdx++) {
                            var startPoint = genericServices.rand(0, this.numPoints - 1);

                            var glyphStroke = [startPoint];

                            var continuingStroke = true;

                            var currentPoint = startPoint;

                            while (continuingStroke) {
                                var inverseGlyphAdjacencyRow = inverseGlyphAdjacencySets[currentPoint];

                                if (Math.random() >= this.strokeDecayThreshold) {
                                    // decay rate
                                    continuingStroke = false;
                                } else if (inverseGlyphAdjacencyRow.size === 0) {
                                    // nowhere else to go from the current point
                                    continuingStroke = false;
                                } else {
                                    var nextPoint = getRandomFromSet(inverseGlyphAdjacencyRow);

                                    var correspondingAdjacencyRow = inverseGlyphAdjacencySets[nextPoint];
                                    inverseGlyphAdjacencyRow.delete(nextPoint);
                                    correspondingAdjacencyRow.delete(currentPoint);

                                    glyphStroke.push(nextPoint);



                                    currentPoint = nextPoint;
                                }
                            }

                            if (glyphStroke.length > 1) {
                                glyphStrokes.push(glyphStroke);
                            }
                        }

                        this.glyphs[i][j] = new Glyph(glyphStrokes);
                    }
                }
                this.generationParametersChanged = false;
                return true;
            } else {
                return false;
            }
        },
    };

    return Page;
}]);
