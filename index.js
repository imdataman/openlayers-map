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
    Style
} from 'ol/style';
import {
    fromLonLat
} from 'ol/proj';
/* import OSM from 'ol/source/OSM'; */
import Overlay from 'ol/Overlay';
import XYZ from 'ol/source/XYZ';
import Select from 'ol/interaction/Select';
import {
    pointerMove
} from 'ol/events/condition';

var styleGenerator = function (fill, stroke, fillOpacity, strokeOpacity) {
    return new Style({
        fill: new Fill({
            color: 'rgba(' + fill + ',' + fillOpacity + ')'
        }),
        stroke: new Stroke({
            color: 'rgba(' + stroke + ',' + strokeOpacity + ')',
            width: lineWidth
        })
    })
}

var getStyle = function (feature, resolution, threshold, interaction) {
    var featureStyle;
    var fillOpacity = 0.8;
    var strokeOpacity = interaction ? 1 : 0;
    var strokeColor = "0,0,0";
    if (feature.get('pop') >= threshold[0] && feature.get('pop') < threshold[1]) {
        featureStyle = styleGenerator(colorPalette[0], strokeColor, fillOpacity, strokeOpacity);
    } else if (feature.get('pop') >= threshold[1] && feature.get('pop') < threshold[2]) {
        featureStyle = styleGenerator(colorPalette[1], strokeColor, fillOpacity, strokeOpacity);
    } else if (feature.get('pop') >= threshold[2] && feature.get('pop') < threshold[3]) {
        featureStyle = styleGenerator(colorPalette[2], strokeColor, fillOpacity, strokeOpacity);
    } else if (feature.get('pop') >= threshold[3] && feature.get('pop') < threshold[4]) {
        featureStyle = styleGenerator(colorPalette[3], strokeColor, fillOpacity, strokeOpacity);
    } else if (feature.get('pop') >= threshold[4] && feature.get('pop') < threshold[5]) {
        featureStyle = styleGenerator(colorPalette[4], strokeColor, fillOpacity, strokeOpacity);
    } else if (feature.get('pop') >= threshold[5] && feature.get('pop') < threshold[6]) {
        featureStyle = styleGenerator(colorPalette[5], strokeColor, fillOpacity, strokeOpacity);
    } else if (feature.get('pop') >= threshold[6] && feature.get('pop') < threshold[7]) {
        featureStyle = styleGenerator(colorPalette[6], strokeColor, fillOpacity, strokeOpacity);
    } else if (feature.get('pop') >= threshold[7]) {
        featureStyle = styleGenerator(colorPalette[7], strokeColor, fillOpacity, strokeOpacity);
    } else {
        featureStyle = styleGenerator(colorPalette[8], strokeColor, fillOpacity, strokeOpacity);
    }
    return featureStyle;
};

var mapboxKey = "pk.eyJ1IjoiaW1hbmR5bGluMiIsImEiOiJhYzg1YzcyNDNiYWE3MTFiY2QxN2JmNTg1ODQzOTIyZCJ9.5ZxE4iFh-Myp-eKwHk0qwg";

var taichung = fromLonLat([120.6736877, 24.1415118]),
    taipei = fromLonLat([121.5642203, 25.0337007]),
    centerCoordinate = [120.973882, 23.97565];

var colorPalette = ["247,251,255", "222,235,247", "198,219,239", "158,202,225", "107,174,214", "66,146,198", "33,113,181", "8,69,148", "189,189,189"];

var zoomThreshold = [20, 200];

var lineWidth = 2,
    borderColor = "white";

var villageThreshold = [1, 500, 1000, 2500, 5000, 10000, 25000, 50000],
    townThreshold = [1, 250, 500, 1000, 2500, 5000, 10000, 25000],
    countyThreshold = [1, 100, 250, 500, 1000, 2500, 5000, 10000];

var halfMapWidth = document.getElementById('map').offsetWidth / 3,
    halfMapHeight = document.getElementById('map').offsetHeight / 5;

var villageURL = 'https://gist.githubusercontent.com/imdataman/7e91e95d45c5c51fc0171f03e0a619c3/raw/c6ae345a5135432b1d7ca7db5c50015e4a3780c0/village-quantized.topo.json',
    townURL = 'https://gist.githubusercontent.com/imdataman/a1531ada33ba6028196a916e595b1454/raw/9e0dfef60f6456bea9b4b5f6256a8e6636b7c44e/town-quantized-topo.json',
    countyURL = 'https://gist.githubusercontent.com/imdataman/9b75c4d1802595f5a5c2d8cce4ae825b/raw/77cff183c9ca947a34155be458b2f9548d5d4fa5/county-quantized-topo.json';

/* var raster = new TileLayer({
    source: new OSM()
}); */

var mapboxLayer = new TileLayer({
    source: new XYZ({
        url: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token=' + mapboxKey
    })
})

var village = new VectorLayer({
    source: new VectorSource({
        url: villageURL,
        format: new TopoJSON({})
    }),
    maxResolution: zoomThreshold[0],
    style: function (feature, resolution) {
        return getStyle(feature, resolution, villageThreshold, false);
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
        return getStyle(feature, resolution, townThreshold, false);
    }
});

var townBorder = new VectorLayer({
    source: new VectorSource({
        url: townURL,
        format: new TopoJSON({})
    }),
    type: "border",
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
        return getStyle(feature, resolution, countyThreshold, false);
    }
});

var countyBorder = new VectorLayer({
    source: new VectorSource({
        url: countyURL,
        format: new TopoJSON({})
    }),
    type: "border",
    minResolution: zoomThreshold[0],
    maxResolution: zoomThreshold[1],
    style: new Style({
        stroke: new Stroke({
            color: borderColor,
            width: lineWidth
        })
    })
});

var view = new View({
    center: fromLonLat(centerCoordinate),
    zoom: 8
});

var map = new Map({
    layers: [mapboxLayer, village, town, county, townBorder, countyBorder],
    target: 'map',
    view: view
});



var tooltip = document.getElementById('tooltip');
var overlay = new Overlay({
    element: tooltip
});

/* var mapContainer = document.getElementById('map'); */

/* mapContainer.appendChild(document.getElementById('villageLegend'));
mapContainer.appendChild(document.getElementById('townLegend'));
mapContainer.appendChild(document.getElementById('countyLegend')); */

map.addOverlay(overlay);

function displayTooltip(evt) {
    var pixel = evt.pixel;
    var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    }, {
        layerFilter: function (layer) {
            return layer.get('type') !== 'border';
        }
    });
    tooltip.style.display = feature ? '' : 'none';
    if (feature) {
        overlay.setPosition(evt.coordinate);
        overlay.setPositioning("bottom-right");
        overlay.setOffset([125, -15]);
        tooltip.innerHTML = feature.get('name') + "<br/>" + feature.get('pop') + "人/km²";
    }
};

/* function changeLegend() {
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
} */

function flyTo(location, done) {
    var duration = 4000;
    var zoom = view.getZoom();
    var finalZoom = 14;
    var parts = 2;
    var called = false;

    function callback(complete) {
        --parts;
        if (called) {
            return;
        }
        if (parts === 0 || !complete) {
            called = true;
            done(complete);
        }
    }
    view.animate({
        center: location,
        duration: duration
    }, callback);
    view.animate({
        zoom: zoom - (zoom / 4),
        duration: duration / 2
    }, {
        zoom: finalZoom,
        duration: duration / 2
    }, callback);
}

onClick('zoomToTaichung', function () {
    flyTo(taichung, function () {});
});

onClick('zoomToTaipei', function () {
    flyTo(taipei, function () {});
});

function onClick(id, callback) {
    document.getElementById(id).addEventListener('click', callback);
}

map.on('pointermove', displayTooltip);
/* map.on('moveend', changeLegend); */

var selectPointerMove = new Select({
    condition: pointerMove,
    layers: function (layer) {
        return layer.get('type') !== 'border';
    },
    style: function (feature, resolution) {
        if (feature.id_.length == 5) {
            return getStyle(feature, resolution, countyThreshold, true);
        } else if (feature.id_.length == 8) {
            return getStyle(feature, resolution, townThreshold, true);
        } else {
            return getStyle(feature, resolution, villageThreshold, true);
        }
    }
});

map.addInteraction(selectPointerMove);