/*global app, d3, jsPDF, canvg*/
app.factory('mapServices', ['genericServices', function (genericServices) {
    'use strict';

    var constants = {
            HEX_WIDTH: 20
        },

        colors = {
            HEX_DEEPWATER: '#73b8ff',
            HEX_LIGHTWATER: '#b7dbff',
            HEX_SAND: '#dbd1b4',
            HEX_GRASSLAND: '#b8e97b',
            HEX_LIGHTFOREST: '#78ab46',
            HEX_DARKFOREST: '#567a32',
            HEX_DEFAULT: '#ffffff'
        },

        zoom = d3.behavior.zoom(),

        privateMethods = {
            onZoom: function () {
                d3.select('g')
                    .attr('transform', 'translate(' + d3.event.translate + ')' +
                        ' scale(' + d3.event.scale + ')');
            },

            getHexagonPoints: function (x, y, radius) {
                var points = [],
                    i,
                    angleDeg,
                    angleRad,
                    pointX,
                    pointY;

                for (i = 0; i < 6; i += 1) {
                    angleDeg = 60 * i;
                    angleRad = Math.PI / 180 * angleDeg;

                    pointX = x + radius * Math.cos(angleRad);
                    pointY = y + radius * Math.sin(angleRad);

                    points.push([pointX, pointY]);
                }

                return points;
            },

            getColor: function (biome) {
                if (biome === 5) {
                    return colors.HEX_DARKFOREST;
                }
                if (biome === 4) {
                    return colors.HEX_LIGHTFOREST;
                }
                if (biome === 3) {
                    return colors.HEX_GRASSLAND;
                }
                if (biome === 2) {
                    return colors.HEX_SAND;
                }
                if (biome === 1) {
                    return colors.HEX_LIGHTWATER;
                }
                if (biome === 0) {
                    return colors.HEX_DEEPWATER;
                }
                return colors.HEX_DEFAULT;
            }
        };

    return {
        initMap: function () {
            d3.select('#svgMapContainer')
                .append('svg')
                .attr('width', '100%')
                .attr('height', 800)
                .call(zoom.on('zoom', privateMethods.onZoom).scaleExtent([0.1, 10]))
                .append('rect') //add white background for clean export
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('fill', 'white');

            d3.select('svg').append('g');

        },

        drawPage: function (page, $scope) {
            var glyphs = page.glyphs;
            var glyphCenterX = 0;
            var glyphCenterY = 0;
            var radius = constants.HEX_WIDTH / 2;
            var renderedGlyph;

            var spaceBetweenLines = radius / 2;
            var spaceBetweenGlyphs = radius + 1.5;

            var color = 'rgb(255,0,0)';
            var colorStroke = 'lightgrey';
            var strokeWidth = 0.5;

            var glyphWidth = radius;
            var glyphHeight = radius * 2;

            var currentGlyph;

            var strokeFunction = d3.svg.line()
                                        .x(function(d) { 
                                            return page.normalizedPoints[d][0] * glyphWidth/2 + glyphCenterX;
                                        })
                                        .y(function(d) { 
                                            return page.normalizedPoints[d][1] * glyphHeight/2 + glyphCenterY;
                                        })
                                        .interpolate($scope.selectedLineInterpolationMode.name);


            for (var i = 0; i < glyphs.length; i++) {

                glyphCenterY = 0;
                glyphCenterX += glyphWidth + spaceBetweenGlyphs;

                for (var j = 0; j < glyphs[i].length; j++) {
                
                    glyphCenterY += glyphHeight + spaceBetweenLines;

                    
                    currentGlyph = glyphs[i][j];

                    renderedGlyph = d3.select('#glyph_x' + i + 'y' + j);

                    if (renderedGlyph.empty()) {
                        renderedGlyph = d3.select('g').append('g').attr('id', 'glyph_x' + i + 'y' + j);
                    }

                    renderedGlyph.attr('fill', color)
                            .attr('stroke', colorStroke)
                            .attr('stroke-width', strokeWidth);

                    renderedGlyph.selectAll("*").remove();

                    renderedGlyph.append('circle')
                                    .attr('cx', glyphCenterX)
                                    .attr('cy', glyphCenterY)
                                    .attr('r', radius)
                                    .attr('fill', 'none');

                    for (var strokeIdx = 0; strokeIdx < currentGlyph.strokes.length; strokeIdx++) {
                        var stroke = currentGlyph.strokes[strokeIdx];

                        renderedGlyph.append('path')
                                        .attr('d', strokeFunction(stroke))
                                        .attr('stroke', 'black' )
                                        .attr('stroke-width', strokeWidth)
                                        .attr('fill', 'none');

                    }                    
                }
            }
        },

        drawGrid: function (world, isGrey) {
            var chunks = world.chunks,
                height = constants.HEX_WIDTH * Math.sqrt(3) / 2,
                radius = constants.HEX_WIDTH / 2,
                x = 0,
                y = 0,
                i,
                j,
                color,
                colorStroke,
                strokeWidth,
                hex;

            for (i = 0; i < chunks.length; i += 1) {

                y = (i % 2 !== 0) ? radius * Math.sqrt(3) / 2 : 0;
                x += constants.HEX_WIDTH * 3 / 4;

                for (j = 0; j < chunks[i].length; j += 1) {

                    y += height;

                    color = (isGrey) ?
                            'rgb(' + Math.round(255 - world.chunks[i][j].biome * 256) + ',' +
                            Math.round(255 - world.chunks[i][j].biome * 256) + ',' +
                            Math.round(255 - world.chunks[i][j].biome * 256) + ')' :
                            privateMethods.getColor(world.chunks[i][j].biome);

                    colorStroke = (isGrey) ? 'black' : 'lightgrey';
                    strokeWidth = (isGrey) ? 0.5 : 0;

                    hex = d3.select('#x' + i + 'y' + j);
                    if (hex.empty()) {
                        d3.select('g')
                            .append('polygon')
                            .attr('id', 'x' + i + 'y' + j)
                            .attr('points', privateMethods.getHexagonPoints(x, y, radius))
                            .attr('fill', color)
                            .attr('stroke', colorStroke)
                            .attr('stroke-width', strokeWidth);
                    } else {
                        hex.attr('fill', color)
                            .attr('stroke', colorStroke)
                            .attr('stroke-width', strokeWidth);
                    }
                }
            }
        },

        clearGrid: function () {
            d3.selectAll('polygon').remove();
        },

        downloadPdf: function () {
            var canvas = document.getElementById('canvas'),
                svg = d3.select('svg').node().parentNode.innerHTML,
                JsPdf = jsPDF, //fix jslint error
                pdf = new JsPdf('p', 'mm', [297, 210]);

            canvg('canvas', svg); //convert SVG to Canvas

            pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 5, 5);
            pdf.save('island-' + Date.now() + '.pdf');
        },

        downloadPng: function () {
            var canvas = document.getElementById('canvas'),
                svg = d3.select('svg').node().parentNode.innerHTML,
                link = document.getElementById('exportPng');

            canvg('canvas', svg); //convert SVG to Canvas

            link.href = canvas.toDataURL();
            link.download = 'island-' + Date.now();
        }
    };

}]);
