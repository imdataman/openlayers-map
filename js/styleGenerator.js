import {
    Fill,
    Stroke,
    Style
} from 'ol/style';

export default function (fill, interaction) {
    var fillOpacity = 0.8;
    var strokeOpacity = interaction ? 1 : 0;
    var zIndexSelected = interaction ? 1000 : 0;
    return new Style({
        fill: new Fill({
            color: 'rgba(' + fill + ',' + fillOpacity + ')'
        }),
        stroke: new Stroke({
            color: 'rgba(' + "50,50,50" + ',' + strokeOpacity + ')',
            width: 1
        }),
        zIndex: zIndexSelected
    })
}