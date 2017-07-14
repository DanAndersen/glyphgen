/*global app, d3, jsPDF, canvg*/
app.factory('mapServices', [function () {
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

        drawPage: function (page) {
            var glyphs = page.glyphs;
            var x = 0;
            var y = 0;
            var radius = constants.HEX_WIDTH / 2;
            var renderedGlyph;

            var spaceBetweenLines = radius / 2;

            var color = 'rgb(255,0,0)';
            var colorStroke = 'lightgrey';
            var strokeWidth = 0.5;

            var glyphWidth = radius / 2;
            var glyphHeight = radius;

            var currentGlyph;

            for (var i = 0; i < glyphs.length; i++) {

                y = 0;
                x += radius;

                for (var j = 0; j < glyphs[i].length; j++) {
                
                    y += radius + spaceBetweenLines;

                    // define segment endpoints
                    var left_x = x - glyphWidth/2;
                    var right_x = x + glyphWidth/2;

                    var mid_y = y;
                    var top_y = y - glyphHeight/2;
                    var bottom_y = y + glyphHeight/2;




                    currentGlyph = glyphs[i][j];

                    renderedGlyph = d3.select('#glyph_x' + i + 'y' + j);

                    if (renderedGlyph.empty()) {
                        renderedGlyph = d3.select('g').append('g').attr('id', 'glyph_x' + i + 'y' + j);

                        renderedGlyph.append('circle')
                            .attr('id', 'glyph_x' + i + 'y' + j)
                            .attr('cx', x)
                            .attr('cy', y)
                            .attr('r', radius);
                    }

                    renderedGlyph.attr('fill', color)
                            .attr('stroke', colorStroke)
                            .attr('stroke-width', strokeWidth);

                    renderedGlyph.selectAll("*").remove();

                    for (var segmentIdx = 0; segmentIdx < page.numGlyphSegments; segmentIdx++) {
                        if (currentGlyph.segments[segmentIdx]) {

                            var x1 = x;
                            var x2 = x;
                            var y1 = y;
                            var y2 = y;

                            switch(segmentIdx) {
                                case 0:
                                    x1 = right_x;
                                    x2 = right_x;
                                    y1 = mid_y;
                                    y2 = bottom_y;
                                    break;
                                case 1:
                                    x1 = left_x;
                                    x2 = right_x;
                                    y1 = mid_y;
                                    y2 = bottom_y;
                                    break;
                                case 2:
                                    x1 = right_x;
                                    x2 = left_x;
                                    y1 = mid_y;
                                    y2 = bottom_y;
                                    break;
                                case 3:
                                    x1 = left_x;
                                    x2 = left_x;
                                    y1 = mid_y;
                                    y2 = bottom_y;
                                    break;
                                case 4:
                                    x1 = right_x;
                                    x2 = right_x;
                                    y1 = top_y;
                                    y2 = mid_y;
                                    break;
                                case 5:
                                    x1 = left_x;
                                    x2 = right_x;
                                    y1 = top_y;
                                    y2 = mid_y;
                                    break;
                                case 6:
                                    x1 = right_x;
                                    x2 = left_x;
                                    y1 = top_y;
                                    y2 = mid_y;
                                    break;
                                case 7:
                                    x1 = left_x;
                                    x2 = left_x;
                                    y1 = top_y;
                                    y2 = mid_y;
                                    break;
                                default:
                                    break;
                            }

                            renderedGlyph.append("line")
                                         .attr('x1', x1)
                                         .attr('x2', x2)
                                         .attr('y1', y1)
                                         .attr('y2', y2)
                                         .attr('stroke', 'black')
                                         .attr('stroke-width', strokeWidth);
                        }
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
