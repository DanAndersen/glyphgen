/*global app*/
app.controller('mainCtrl', ['$scope', 'mapServices', 'genericServices', 'Biome', 'Page', function ($scope, mapServices, genericServices, Biome, Page) {
    'use strict';

    var page = new Page(10, 10);

    var world = new Biome(45, Math.round(45 * Math.sqrt(3) / 2));

    mapServices.initMap();



    /* Line interpolation mode */
    $scope.lineInterpolationModes = [
        {
            id: 0,
            name: 'linear'
        },
        {
            id: 1,
            name: 'step-before'
        },
        {
            id: 2,
            name: 'step-after'
        },
        {
            id: 3,
            name: 'basis'
        },
        {
            id: 4,
            name: 'basis-open'
        },
        {
            id: 5,
            name: 'basis-closed'
        },
        {
            id: 6,
            name: 'cardinal'
        },
        {
            id: 7,
            name: 'cardinal-open'
        },
        {
            id: 8,
            name: 'cardinal-closed'
        },
        {
            id: 9,
            name: 'monotone'
        },
    ];
    $scope.selectedLineInterpolationMode = $scope.lineInterpolationModes[3];
    $scope.selectLineInterpolationMode = function(id) {
        $scope.selectedLineInterpolationMode = $scope.lineInterpolationModes[id];

        mapServices.drawPage(page, $scope);
    }






    /* Dropdown mode */
    $scope.modes = [
        {
            id: 0,
            name: 'Normal'
        },
        {
            id: 1,
            name: 'Perlin Only'
        }, {
            id: 2,
            name: 'Gradients Only'
        }
    ];
    $scope.selectedMode = $scope.modes[0];
    $scope.selectMode = function (id) {
        if (id === 1 && $scope.selectedTab[2]) {
            $scope.selectedTab[2] = false;
        } else if (id === 2 && $scope.selectedTab[1]) {
            $scope.selectedTab[1] = false;
        }

        $scope.selectedMode = $scope.modes[id];
        world.setBiomes($scope.selectedMode.id, $scope.islandSize.value, $scope.biomesDistribution, $scope.isGrey);
        mapServices.drawGrid(world, $scope.isGrey, $scope.biomesDistribution);
        mapServices.drawPage(page, $scope);
    };


    /* Color mode */
    $scope.isGrey = false;
    $scope.onClickColorMode = function (isGrey) {
        if ($scope.selectedTab[0]) {
            $scope.selectedTab[0] = false;
        }
        world.setBiomes($scope.selectedMode.id, $scope.islandSize.value, $scope.biomesDistribution, $scope.isGrey);
        mapServices.drawGrid(world, $scope.isGrey, $scope.selectedMode.id);
        mapServices.drawPage(page, $scope);
    };

    /* Island Size */
    $scope.islandSize = {
        id: 10,
        value: 75,
        min: 1,
        max: 100,
        step: 1
    };
    $scope.onChangeIslandSize = function () {
        world.setBiomes($scope.selectedMode.id, $scope.islandSize.value, $scope.biomesDistribution, $scope.isGrey);
        mapServices.drawGrid(world, $scope.isGrey, $scope.biomesDistribution);
        mapServices.drawPage(page, $scope);
    };

    $scope.tooltipPercentageFormatter = function (value) {
        return value + '%';
    };

    $scope.refreshAll = function () {
        world.setGradientSeeds($scope.gradientSliders[0].value);
        world.setGradients($scope.gradientSliders[2].value, $scope.gradientSliders[1].value);
        $scope.refreshNoise();
    };

    /* Biomes Distribution */
    $scope.biomesDistribution = [
        {
            label: 'Shallow Water',
            id: 101,
            value: 15,
            min: 0,
            max: 100,
            step: 1,
            percentage: 15
        },
        {
            label: 'Sand',
            id: 102,
            value: 30,
            min: 0,
            max: 100,
            step: 1,
            percentage: 30
        },
        {
            label: 'Grass',
            id: 103,
            value: 35,
            min: 0,
            max: 100,
            step: 1,
            percentage: 35
        },
        {
            label: 'Forest',
            id: 104,
            value: 15,
            min: 0,
            max: 100,
            step: 1,
            percentage: 15
        },
        {
            label: 'Dark Forest',
            id: 105,
            value: 5,
            min: 0,
            max: 100,
            step: 1,
            percentage: 5
        }
    ];
    $scope.onChangeBiomesDistribution = function () {
        var totalValues = 0,
            i,
            roundedValues = [],
            totalRounded = 0,
            gap;

        for (i = 0; i < $scope.biomesDistribution.length; i += 1) {
            totalValues += $scope.biomesDistribution[i].value;
        }

        for (i = 0; i < $scope.biomesDistribution.length; i += 1) {
            roundedValues.push(Math.round($scope.biomesDistribution[i].value * 100 / totalValues));
            totalRounded += Math.round($scope.biomesDistribution[i].value * 100 / totalValues);
        }

        gap = totalRounded - 100;

        if (gap > 0) {
            for (i = 0; i < roundedValues.length; i += 1) {
                if (roundedValues[i] < 100) {
                    roundedValues[i] -= 1;
                    gap -= 1;
                    if (gap === 0) {
                        break;
                    }
                }
            }
        }

        if (gap < 0) {
            for (i = 0; i < roundedValues.length; i += 1) {
                if (roundedValues[i] > 0) {
                    roundedValues[i] += 1;
                    gap += 1;
                    if (gap === 0) {
                        break;
                    }
                }
            }
        }

        for (i = 0; i < $scope.biomesDistribution.length; i += 1) {
            $scope.biomesDistribution[i].percentage = roundedValues[i];
        }
        
        world.setBiomes($scope.selectedMode.id, $scope.islandSize.value, $scope.biomesDistribution, $scope.isGrey);
        mapServices.drawGrid(world, $scope.isGrey, $scope.selectedMode.id);
        mapServices.drawPage(page, $scope);
    };

    $scope.randomizeBiomes = function () {
        var i;
        for (i = 0; i < $scope.biomesDistribution.length; i += 1) {
            $scope.biomesDistribution[i].value = genericServices.rand(0, 100);
        }

        $scope.onChangeBiomesDistribution();
    };

    /* Glyph Generation */
    $scope.glyphGenerationSliders = [
        {
            id: 1,
            label: 'Strokes',
            value: 2,
            min: 1,
            max: 4,
            step: 1
        },
        {
            id: 2,
            label: 'Stroke Decay Threshold',
            value: 0.9,
            min: 0.0,
            max: 1.0,
            step: 0.01
        },
    ];
    $scope.onChangeGlyphGenerationParameters = function () {
        page.setGlyphGenerationParameters($scope.glyphGenerationSliders[0].value, $scope.glyphGenerationSliders[1].value);
        page.generateGlyphs();

        mapServices.drawPage(page, $scope);
    };




    /* Perlin Noise */
    $scope.perlinSliders = [
        {
            id: 1,
            label: 'Intensity',
            value: 1,
            min: 0.01,
            max: 5,
            step: 0.1
        },
        {
            id: 2,
            label: 'Frequency',
            value: 15,
            min: 0.01,
            max: 50,
            step: 1
        },
        {
            id: 3,
            label: 'Octaves',
            value: 1,
            min: 0.01,
            max: 10,
            step: 1
        }
    ];
    $scope.onChangePerlin = function () {
        world.setPerlinNoise($scope.perlinSliders[0].value, $scope.perlinSliders[1].value, $scope.perlinSliders[2].value);
        world.setBiomes($scope.selectedMode.id, $scope.islandSize.value, $scope.biomesDistribution, $scope.isGrey);
        mapServices.drawGrid(world, $scope.isGrey, $scope.biomesDistribution);
        mapServices.drawPage(page, $scope);
    };

    /* Button Refresh Perlin */
    $scope.refreshNoise = function () {
        world.perlinSeed = Math.random();
        $scope.onChangePerlin();
    };

    /* Gradients */
    $scope.gradientSliders = [
        {
            id: 4,
            label: 'Quantity',
            value: 4,
            min: 1,
            max: 20,
            step: 1
        }, {
            id: 5,
            label: 'Intensity',
            value: 1,
            min: 0.01,
            max: 5,
            step: 0.1
        }, {
            id: 6,
            label: 'Radius',
            value: 10,
            min: 0,
            max: 25,
            step: 1
        }
    ];
    $scope.onChangeGradients = function () {
        if (world.gradientSeeds.length < $scope.gradientSliders[0].value) {
            world.addGradientSeeds($scope.gradientSliders[0].value - world.gradientSeeds.length);

        } else if (world.gradientSeeds.length > $scope.gradientSliders[0].value) {
            world.removeSeeds(world.gradientSeeds.length - $scope.gradientSliders[0].value);
        }

        world.setGradients($scope.gradientSliders[2].value, $scope.gradientSliders[1].value);
        world.setBiomes($scope.selectedMode.id, $scope.islandSize.value, $scope.biomesDistribution, $scope.isGrey);

        mapServices.drawGrid(world, $scope.isGrey, $scope.biomesDistribution);
        mapServices.drawPage(page, $scope);
    };

    /* Button Refresh Gradients */
    $scope.refreshGradients = function () {
        world.setGradientSeeds($scope.gradientSliders[0].value);
        $scope.onChangeGradients();
    };

    $scope.downloadPdf = function () {
        mapServices.downloadPdf();
    };

    $scope.browserCompliant = (!genericServices.isInternetExplorer() && !genericServices.isSafari());
    $scope.downloadPng = function () {
        mapServices.downloadPng();
    };

    $scope.selectedTab = [true, false, false, false];

    /* Init the grid on load */
    world.setGradientSeeds($scope.gradientSliders[0].value);
    world.setGradients($scope.gradientSliders[2].value, $scope.gradientSliders[1].value);
    world.perlinSeed = Math.random();
    world.setPerlinNoise($scope.perlinSliders[0].value, $scope.perlinSliders[1].value, $scope.perlinSliders[2].value);
    world.setBiomes($scope.selectedMode.id, $scope.islandSize.value, $scope.biomesDistribution, $scope.isGrey);

    mapServices.drawGrid(world, $scope.isGrey, $scope.biomesDistribution);
    mapServices.drawPage(page, $scope);
}]);
