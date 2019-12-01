import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TopoJSON from 'ol/format/TopoJSON';
import {
    Tile as TileLayer,
    Vector as VectorLayer
} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import {
    Fill,
    Stroke,
    Style,
    Text
} from 'ol/style';
import {
    fromLonLat
} from 'ol/proj';
import getStyle from './js/getStyle';
import mobileCheck from './js/mobileCheck';
import GeoJSON from 'ol/format/GeoJSON';
import getScreenSize from './js/getScreenSize';
import * as request from 'd3-request';

var mobile = mobileCheck();
var screenSize = getScreenSize();
var initialZoom
var fontSize
var selectedPolygon

var is_safari = navigator.userAgent.indexOf("Safari") > -1;

if (mobile) {
    // document.getElementById('map').style.height = screenSize[1] + 'px';
    initialZoom = 8.5;
    fontSize = 32;
    document.getElementById('countyLegend').style.height = 30 + 'vh';
    document.getElementById('townLegend').style.height = 30 + 'vh';
    document.getElementById('villageLegend').style.height = 30 + 'vh';
    document.getElementById('tooltip').style.fontSize = 32 + 'px';
    document.getElementsByClassName('floatTL')[0].style.right = '25%';
    document.getElementsByClassName('select-css')[0].style.fontSize = '24px';
    document.getElementsByClassName('select-css')[1].style.fontSize = '24px';
    document.getElementsByClassName('select-css')[2].style.fontSize = '24px';
} else {
    initialZoom = 8;
    fontSize = 18;
    document.getElementById('countyLegend').style.height = 30 + 'vh';
    document.getElementById('townLegend').style.height = 30 + 'vh';
    document.getElementById('villageLegend').style.height = 30 + 'vh';
}

var taichung = fromLonLat([120.6736877, 24.1415118]),
    taipei = fromLonLat([121.5642203, 25.0337007]),
    centerCoordinate = [120.973882, 23.57565];

var grey = "189,189,189",
    colorPalette = ["247,251,255", "222,235,247", "198,219,239", "158,202,225", "107,174,214", "66,146,198", "33,113,181", "8,69,148", grey];

var zoomThreshold = [20, 200];

var lineWidth = 1,
    borderColor = 'rgba(50,50,50,0.8)';

var villageThreshold = [1, 500, 1000, 2500, 5000, 10000, 25000, 50000],
    townThreshold = [1, 250, 500, 1000, 2500, 5000, 10000, 25000],
    countyThreshold = [1, 100, 250, 500, 1000, 2500, 5000, 10000];

var villageFeatures = [];

var halfMapWidth = document.getElementById('map').offsetWidth / 3,
    halfMapHeight = document.getElementById('map').offsetHeight / 5;

var villageURL = 'https://gist.githubusercontent.com/imdataman/4837ecbf70185e6747d1b762223a9ff1/raw/2dc73c4d3532ba7918e2a967a19a15d7b4a9f3f7/village-original.json',
    townURL = 'https://gist.githubusercontent.com/imdataman/e5fc3ebb21f82b660e274de654e3d407/raw/b6930d6378b7e2d937a6fce5deed273ef0cc205f/town-original.json',
    countyURL = 'https://gist.githubusercontent.com/imdataman/227f92cd2f01d0143ce6e079f51a0a0a/raw/213e72400cd9c576e2f93b9113ed7f551a4158f8/county-original.json';

var village = new VectorLayer({
    source: new VectorSource({
        url: villageURL,
        format: new TopoJSON({})
    }),
    maxResolution: zoomThreshold[0],
    style: function (feature, resolution) {
        return getStyle(feature, resolution, villageThreshold, false, colorPalette);
    }
});

var town = new VectorLayer({
    source: new VectorSource({
        url: townURL,
        format: new TopoJSON({})
    }),
    minResolution: zoomThreshold[0],
    maxResolution: zoomThreshold[1],
    style: function (feature, resolution) {
        return getStyle(feature, resolution, townThreshold, false, colorPalette);
    }
});

var townBorder = new VectorLayer({
    source: new VectorSource({
        url: townURL,
        format: new TopoJSON({})
    }),
    type: "noEvent",
    maxResolution: zoomThreshold[0],
    style: new Style({
        stroke: new Stroke({
            color: borderColor,
            width: lineWidth
        })
    })
});

var county = new VectorLayer({
    source: new VectorSource({
        url: countyURL,
        format: new TopoJSON({})
    }),
    minResolution: 200,
    style: function (feature, resolution) {
        return getStyle(feature, resolution, countyThreshold, false, colorPalette);
    }
});

var background = new VectorLayer({
    source: new VectorSource({
        url: countyURL,
        format: new TopoJSON({})
    }),
    type: "noEvent",
    // minResolution: zoomThreshold[0],
    // maxResolution: zoomThreshold[1],
    style: new Style({
        fill: new Fill({
            color: "rgba(247,247,247,1)"
        })
    })
});

var countyBorder = new VectorLayer({
    source: new VectorSource({
        url: countyURL,
        format: new TopoJSON({})
    }),
    type: "noEvent",
    minResolution: zoomThreshold[0],
    maxResolution: zoomThreshold[1],
    style: new Style({
        stroke: new Stroke({
            color: borderColor,
            width: lineWidth
        })
    })
});

var style = new Style({
    text: new Text({
        font: fontSize + 'px "Helvetica"',
        placement: 'point',
        fill: new Fill({
            color: 'black'
        }),
        stroke: new Stroke({
            color: '#fff',
            width: 1
        })
    })
});


var countyLabel = new VectorLayer({
    declutter: true,
    type: "noEvent",
    source: new VectorSource({
        format: new GeoJSON(),
        url: './county_label.geojson'
    }),
    style: function (feature) {
        style.getText().setText(feature.get('COUNTYNAME'));
        return style;
    },
    minResolution: 200
})

var townLabel = new VectorLayer({
    declutter: true,
    type: "noEvent",
    source: new VectorSource({
        format: new GeoJSON(),
        url: './town_label.geojson'
    }),
    style: function (feature) {
        style.getText().setText(feature.get('TOWNNAME'));
        return style;
    },
    maxResolution: zoomThreshold[1]
})

var view = new View({
    center: fromLonLat(centerCoordinate),
    zoom: initialZoom
});

var map = new Map({
    layers: [background, countyBorder, townBorder, village, town, county,
        countyLabel, townLabel
    ],
    target: 'map',
    view: view
});

function displayTooltip(evt) {
    if (selectedPolygon) {
        selectedPolygon.setStyle(function (feature, resolution) {
            if (feature.id_.length == 5) {
                return getStyle(feature, resolution, countyThreshold, false, colorPalette);
            } else if (feature.id_.length == 8) {
                return getStyle(feature, resolution, townThreshold, false, colorPalette);
            } else {
                return getStyle(feature, resolution, villageThreshold, false, colorPalette);
            }
        });
    }
    var pixel = evt.pixel;
    var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    }, {
        layerFilter: function (layer) {
            return layer.get('type') !== 'noEvent';
        }
    });
    tooltip.style.display = feature ? '' : 'none';
    if (feature) {
        feature.setStyle(function (feature, resolution) {
            if (feature.id_.length == 5) {
                return getStyle(feature, resolution, countyThreshold, true, colorPalette);
            } else if (feature.id_.length == 8) {
                return getStyle(feature, resolution, townThreshold, true, colorPalette);
            } else {
                return getStyle(feature, resolution, villageThreshold, true, colorPalette);
            }
        });
        tooltip.style.padding = '20px 30px 20px 30px';
        tooltip.innerHTML = "<span>地區</span><br/>" + feature.get('name') + "<br/><br/><span>人口密度</span><br/>" + feature.get('pop') + "人/km²";
        selectedPolygon = feature;
    }
};

// function flyTo(location, done) {
//     var duration = 4000;
//     var zoom = view.getZoom();
//     var finalZoom = 14;
//     var parts = 2;
//     var called = false;

//     function callback(complete) {
//         --parts;
//         if (called) {
//             return;
//         }
//         if (parts === 0 || !complete) {
//             called = true;
//             done(complete);
//         }
//     }
//     view.animate({
//         center: location,
//         duration: duration
//     }, callback);
//     view.animate({
//         zoom: zoom - (zoom / 4),
//         duration: duration / 2
//     }, {
//         zoom: finalZoom,
//         duration: duration / 2
//     }, callback);
// }

// function onClick(id, callback) {
//     document.getElementById(id).addEventListener('click', callback);
// }

if (mobile) {
    map.on('singleclick', displayTooltip);
} else {
    map.on('pointermove', displayTooltip);
}

// onClick('zoomToTaichung', function () {
//     flyTo(taichung, function () {});
// });

// onClick('zoomToTaipei', function () {
//     flyTo(taipei, function () {});
// });

function changeLegend() {
    var newRes = map.getView().getResolution();
    if (newRes >= 200) {
        document.getElementById('villageLegend').style.visibility = "hidden";
        document.getElementById('townLegend').style.visibility = "hidden";
        document.getElementById('countyLegend').style.visibility = "visible"
    } else if (newRes < 200 && newRes >= 20) {
        document.getElementById('villageLegend').style.visibility = "hidden";
        document.getElementById('townLegend').style.visibility = "visible";
        document.getElementById('countyLegend').style.visibility = "hidden";
    } else {
        document.getElementById('villageLegend').style.visibility = "visible";
        document.getElementById('townLegend').style.visibility = "hidden";
        document.getElementById('countyLegend').style.visibility = "hidden";
    }
}

map.on('moveend', changeLegend);

if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1 && mobile) {
    document.getElementsByClassName('ol-zoom')[0].style.bottom = '15%';
}

var selectCounty = document.getElementById("selectCounty")
var selectTown = document.getElementById("selectTown")
var selectVillage = document.getElementById("selectVillage")

selectCounty.addEventListener('change', function () {
    selectTown.innerHTML = '';
    var option = document.createElement("option");
    option.text = "鄉鎮市區";
    option.value = "pending";
    selectTown.appendChild(option);
    var selectedCounty = selectCounty.options[selectCounty.selectedIndex].value;
    var jsonData = request.json("https://gist.githubusercontent.com/imdataman/156fdb2d7b5fd99a3112e4cb16149787/raw/f03b21f245e28103c35d6bfb4c22d4bbf33cf268/village-data.json",
        function (error, json) {
            if (error) throw error;
            var townList = [];
            var selectedVillage = json.features.filter(function (d) {
                return d.properties.COUNTYNAME == selectedCounty;
            });
            selectedVillage.forEach(function (d) {
                if (!townList.includes(d.properties.TOWNNAME)) {
                    townList.push(d.properties.TOWNNAME);
                    var option = document.createElement("option");
                    option.text = d.properties.TOWNNAME;
                    option.value = d.properties.TOWNNAME;
                    selectTown.appendChild(option);
                }
            });
            selectTown.addEventListener('change', function () {
                var villageList = [];
                selectVillage.innerHTML = '';
                var option = document.createElement("option");
                option.text = "村里";
                option.value = "pending";
                selectVillage.appendChild(option);
                var selectedTown = selectTown.options[selectTown.selectedIndex].value;
                selectedVillage.filter(function (d) {
                        return d.properties.TOWNNAME == selectedTown;
                    })
                    .forEach(function (d) {
                        if (!villageList.includes(d.properties.VILLNAME) && d.properties.VILLNAME !== "") {
                            villageList.push(d.properties.VILLNAME);
                            var option = document.createElement("option");
                            option.text = d.properties.VILLNAME;
                            option.value = d.properties.VILLNAME;
                            selectVillage.appendChild(option);
                        }
                    });
                selectVillage.addEventListener('change', function () {
                    var selectedVillageName = selectVillage.options[selectVillage.selectedIndex].value;
                    var destination = selectedVillage.filter(function (d) {
                        return d.properties.VILLNAME == selectedVillageName;
                    })[0];
                    var boundingBox = [fromLonLat(destination.geometry.coordinates[0][0])[0] - 500,
                        fromLonLat(destination.geometry.coordinates[0][0])[1] - 500,
                        fromLonLat(destination.geometry.coordinates[0][2])[0] + 500,
                        fromLonLat(destination.geometry.coordinates[0][2])[1] + 500
                    ];

                    map.getView().fit(boundingBox, {
                        // duration: 4000,
                        callback: function () {
                            map.once('rendercomplete', function (event) {
                                if (selectedPolygon) {
                                    selectedPolygon.setStyle(function (feature, resolution) {
                                        if (feature.id_.length == 5) {
                                            return getStyle(feature, resolution, countyThreshold, false, colorPalette);
                                        } else if (feature.id_.length == 8) {
                                            return getStyle(feature, resolution, townThreshold, false, colorPalette);
                                        } else {
                                            return getStyle(feature, resolution, villageThreshold, false, colorPalette);
                                        }
                                    });
                                }
                                var feature = village.getSource().getFeatures()
                                    .filter(function (d) {
                                        return d.values_.name == destination.properties.COUNTYNAME + destination.properties.TOWNNAME + destination.properties.VILLNAME
                                    })[0];
                                feature.setStyle(function (feature, resolution) {
                                    if (resolution < 200) {
                                        return getStyle(feature, resolution, villageThreshold, true, colorPalette);
                                    }
                                });
                                tooltip.style.display = feature ? '' : 'none';
                                document.getElementById("tooltip").style.padding = '20px 30px 20px 30px';
                                document.getElementById("tooltip").innerHTML = "<span>地區</span><br/>" + feature.get('name') + "<br/><br/><span>人口密度</span><br/>" + feature.get('pop') + "人/km²";
                                selectedPolygon = feature;
                            })
                        }
                    });
                });
            });
        });
});