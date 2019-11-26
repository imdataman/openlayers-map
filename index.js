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

var getStyle = function (feature, resolution) {
    if (feature.get('pop') >= 1 && feature.get('pop') < 500) {
        return new Style({
            fill: new Fill({
                color: "#f7fbff"
            })
        });
    } else if (feature.get('pop') >= 500 && feature.get('pop') < 1000) {
        return new Style({
            fill: new Fill({
                color: "#deebf7"
            })
        });
    } else if (feature.get('pop') >= 1000 && feature.get('pop') < 2500) {
        return new Style({
            fill: new Fill({
                color: "#c6dbef"
            })
        });
    } else if (feature.get('pop') >= 2500 && feature.get('pop') < 5000) {
        return new Style({
            fill: new Fill({
                color: "#9ecae1"
            })
        });
    } else if (feature.get('pop') >= 5000 && feature.get('pop') < 10000) {
        return new Style({
            fill: new Fill({
                color: "#6baed6"
            })
        });
    } else if (feature.get('pop') >= 10000 && feature.get('pop') < 25000) {
        return new Style({
            fill: new Fill({
                color: "#4292c6"
            })
        });
    } else if (feature.get('pop') >= 25000 && feature.get('pop') < 50000) {
        return new Style({
            fill: new Fill({
                color: "#2171b5"
            })
        });
    } else if (feature.get('pop') >= 50000) {
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
        return getStyle(feature, resolution);
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
        return getStyle(feature, resolution);
    }
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
        return getStyle(feature, resolution);
    }
});

var map = new Map({
    layers: [raster, village, town, county],
    target: 'map',
    view: new View({
        center: fromLonLat([120.973882, 23.97565]),
        zoom: 8
    })
});

var tooltip = document.getElementById('tooltip');
var overlay = new Overlay({
    element: tooltip,
    offset: [10, 0],
    positioning: 'bottom-left'
});
map.addOverlay(overlay);

function displayTooltip(evt) {
    var pixel = evt.pixel;
    var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    });
    tooltip.style.display = feature ? '' : 'none';
    if (feature) {
        overlay.setPosition(evt.coordinate);
        tooltip.innerHTML = feature.get('name') + "<br/>" + feature.get('pop') + "人/km²";
    }
};

map.on('pointermove', displayTooltip);