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
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';

var getStyle = function (feature, resolution, threshold) {
    if (feature.get('pop') >= threshold[0] && feature.get('pop') < threshold[1]) {
        return new Style({
            fill: new Fill({
                color: "#f7fbff"
            })
        });
    } else if (feature.get('pop') >= threshold[1] && feature.get('pop') < threshold[2]) {
        return new Style({
            fill: new Fill({
                color: "#deebf7"
            })
        });
    } else if (feature.get('pop') >= threshold[2] && feature.get('pop') < threshold[3]) {
        return new Style({
            fill: new Fill({
                color: "#c6dbef"
            })
        });
    } else if (feature.get('pop') >= threshold[3] && feature.get('pop') < threshold[4]) {
        return new Style({
            fill: new Fill({
                color: "#9ecae1"
            })
        });
    } else if (feature.get('pop') >= threshold[4] && feature.get('pop') < threshold[5]) {
        return new Style({
            fill: new Fill({
                color: "#6baed6"
            })
        });
    } else if (feature.get('pop') >= threshold[5] && feature.get('pop') < threshold[6]) {
        return new Style({
            fill: new Fill({
                color: "#4292c6"
            })
        });
    } else if (feature.get('pop') >= threshold[6] && feature.get('pop') < threshold[7]) {
        return new Style({
            fill: new Fill({
                color: "#2171b5"
            })
        });
    } else if (feature.get('pop') >= threshold[7]) {
        return new Style({
            fill: new Fill({
                color: "#084594"
            })
        });
    } else {
        return new Style({
            fill: new Fill({
                color: "#d9d9d9"
            })
        });
    }
};

var halfMapWidth = document.getElementById('map').offsetWidth / 2;
var halfMapHeight = document.getElementById('map').offsetHeight / 2;

var raster = new TileLayer({
    source: new OSM()
});

var village = new VectorLayer({
    source: new VectorSource({
        url: 'https://gist.githubusercontent.com/imdataman/7e91e95d45c5c51fc0171f03e0a619c3/raw/c6ae345a5135432b1d7ca7db5c50015e4a3780c0/village-quantized.topo.json',
        format: new TopoJSON({}),
        overlaps: false
    }),
    opacity: 0.8,
    maxResolution: 20,
    style: function (feature, resolution) {
        return getStyle(feature, resolution, [1, 500, 1000, 2500, 5000, 10000, 25000, 50000]);
    }
});

var town = new VectorLayer({
    source: new VectorSource({
        url: 'https://gist.githubusercontent.com/imdataman/a1531ada33ba6028196a916e595b1454/raw/15b6977ac19b96a50c4bfa752d26e5bac8092fe0/town-quantized-topo.json',
        format: new TopoJSON({}),
        overlaps: false
    }),
    opacity: 0.8,
    minResolution: 20,
    maxResolution: 200,
    style: function (feature, resolution) {
        return getStyle(feature, resolution, [1, 250, 500, 1000, 2500, 5000, 10000, 25000]);
    }
});

var townBorder = new VectorLayer({
    source: new VectorSource({
        url: 'https://gist.githubusercontent.com/imdataman/a1531ada33ba6028196a916e595b1454/raw/15b6977ac19b96a50c4bfa752d26e5bac8092fe0/town-quantized-topo.json',
        format: new TopoJSON({}),
        overlaps: false
    }),
    type: "border",
    opacity: 0.8,
    maxResolution: 20,
    style: new Style({
        stroke: new Stroke({
            color: '#319FD3',
            width: 1
        })
    })
});

var county = new VectorLayer({
    source: new VectorSource({
        url: 'https://gist.githubusercontent.com/imdataman/9b75c4d1802595f5a5c2d8cce4ae825b/raw/270f2afaf40af53f398bcd5c3ab393dcbbce5f19/county-quantized-topo.json',
        format: new TopoJSON({}),
        overlaps: false
    }),
    opacity: 0.8,
    minResolution: 200,
    style: function (feature, resolution) {
        return getStyle(feature, resolution, [1, 100, 250, 500, 1000, 2500, 5000, 10000]);
    }
});

var countyBorder = new VectorLayer({
    source: new VectorSource({
        url: 'https://gist.githubusercontent.com/imdataman/9b75c4d1802595f5a5c2d8cce4ae825b/raw/270f2afaf40af53f398bcd5c3ab393dcbbce5f19/county-quantized-topo.json',
        format: new TopoJSON({}),
        overlaps: false
    }),
    type: "border",
    opacity: 0.8,
    minResolution: 20,
    maxResolution: 200,
    style: new Style({
        stroke: new Stroke({
            color: '#319FD3',
            width: 1
        })
    })
});

var map = new Map({
    layers: [raster, village, town, county, townBorder, countyBorder],
    target: 'map',
    view: new View({
        center: fromLonLat([120.973882, 23.97565]),
        zoom: 8
    })
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
        if (evt.pixel[0] > halfMapWidth && evt.pixel[1] > halfMapHeight) {
            overlay.setPositioning("bottom-right");
            overlay.setOffset([-10, 0]);
        } else if (evt.pixel[0] > halfMapWidth && evt.pixel[1] < halfMapHeight) {
            overlay.setPositioning("top-right");
            overlay.setOffset([-10, 0]);
        } else if (evt.pixel[0] < halfMapWidth && evt.pixel[1] > halfMapHeight) {
            overlay.setPositioning("bottom-left");
            overlay.setOffset([10, 0]);
        } else {
            overlay.setPositioning("top-left");
            overlay.setOffset([10, 0]);
        }
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

map.on('pointermove', displayTooltip);
/* map.on('moveend', changeLegend); */