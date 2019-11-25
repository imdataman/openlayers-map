import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TopoJSON from 'ol/format/TopoJSON';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import {Fill, Stroke, Style} from 'ol/style';
import {fromLonLat} from 'ol/proj';
import OSM from 'ol/source/OSM';

var key = 'pk.eyJ1IjoidHNjaGF1YiIsImEiOiJjaW5zYW5lNHkxMTNmdWttM3JyOHZtMmNtIn0.CDIBD8H-G2Gf-cPkIuWtRg';
var raster = new TileLayer({source: new OSM()});

var style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)'
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1
  })
});

var vector = new VectorLayer({
  source: new VectorSource({
    url: 'https://gist.githubusercontent.com/imdataman/7e91e95d45c5c51fc0171f03e0a619c3/raw/f35623ba2e30eebafc5d84ca84794f0354643f38/village-quantized.topo.json',
    format: new TopoJSON({
      // don't want to render the full world polygon (stored as 'land' layer),
      // which repeats all countries
    }),
    overlaps: false
  }),
  maxResolution: 30,
  style: style
});

var map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: fromLonLat([121.5346808, 25.0641423]),
    zoom: 12
  })
});