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
// import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import XYZ from 'ol/source/XYZ';
import Select from 'ol/interaction/Select';
import {
    pointerMove
} from 'ol/events/condition';
import config from './js/config';
import getStyle from './js/getStyle';

var mykey = config.MY_KEY;

var taichung = fromLonLat([120.6736877, 24.1415118]),
    taipei = fromLonLat([121.5642203, 25.0337007]),
    centerCoordinate = [120.973882, 23.57565];

var grey = "189,189,189",
    colorPalette = ["247,251,255", "222,235,247", "198,219,239", "158,202,225", "107,174,214", "66,146,198", "33,113,181", "8,69,148", grey];

var zoomThreshold = [20, 200];

var lineWidth = 2,
    borderColor = 'rgba(250,250,250,1)';

var villageThreshold = [1, 500, 1000, 2500, 5000, 10000, 25000, 50000],
    townThreshold = [1, 250, 500, 1000, 2500, 5000, 10000, 25000],
    countyThreshold = [1, 100, 250, 500, 1000, 2500, 5000, 10000];

var halfMapWidth = document.getElementById('map').offsetWidth / 3,
    halfMapHeight = document.getElementById('map').offsetHeight / 5;

var villageURL = 'https://gist.githubusercontent.com/imdataman/4837ecbf70185e6747d1b762223a9ff1/raw/2dc73c4d3532ba7918e2a967a19a15d7b4a9f3f7/village-original.json',
    townURL = 'https://gist.githubusercontent.com/imdataman/e5fc3ebb21f82b660e274de654e3d407/raw/b6930d6378b7e2d937a6fce5deed273ef0cc205f/town-original.json',
    countyURL = 'https://gist.githubusercontent.com/imdataman/227f92cd2f01d0143ce6e079f51a0a0a/raw/213e72400cd9c576e2f93b9113ed7f551a4158f8/county-original.json';

// var raster = new TileLayer({
//     source: new OSM()
// });

var mapboxLayer = new TileLayer({
    source: new XYZ({
        url: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token=' + mykey
    })
})

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
        return getStyle(feature, resolution, countyThreshold, false, colorPalette);
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
    zoom: 7.5
});

var map = new Map({
    layers: [mapboxLayer, village, town, county, townBorder, countyBorder],
    target: 'map',
    view: view
});

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
        tooltip.innerHTML = feature.get('name') + "<br/>" + feature.get('pop') + "人/km²";
    }
};

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

function onClick(id, callback) {
    document.getElementById(id).addEventListener('click', callback);
}

var selectPointerMove = new Select({
    condition: pointerMove,
    layers: function (layer) {
        return layer.get('type') !== 'border';
    },
    style: function (feature, resolution) {
        if (feature.id_.length == 5) {
            return getStyle(feature, resolution, countyThreshold, true, colorPalette);
        } else if (feature.id_.length == 8) {
            return getStyle(feature, resolution, townThreshold, true, colorPalette);
        } else {
            return getStyle(feature, resolution, villageThreshold, true, colorPalette);
        }
    }
});

map.on('pointermove', displayTooltip);
map.addInteraction(selectPointerMove);

onClick('zoomToTaichung', function () {
    flyTo(taichung, function () {});
});

onClick('zoomToTaipei', function () {
    flyTo(taipei, function () {});
});

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