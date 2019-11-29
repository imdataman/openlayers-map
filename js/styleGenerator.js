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
            color: 'rgba(' + "250,250,250" + ',' + strokeOpacity + ')',
            width: 2
        }),
        zIndex: zIndexSelected
    })
}