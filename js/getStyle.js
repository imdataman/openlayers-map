import styleGenerator from './styleGenerator'

export default function (feature, resolution, threshold, interaction, colorPalette) {
    var featureStyle;
    if (feature.get('pop') >= threshold[0] && feature.get('pop') < threshold[1]) {
        featureStyle = styleGenerator(colorPalette[0], interaction);
    } else if (feature.get('pop') >= threshold[1] && feature.get('pop') < threshold[2]) {
        featureStyle = styleGenerator(colorPalette[1], interaction);
    } else if (feature.get('pop') >= threshold[2] && feature.get('pop') < threshold[3]) {
        featureStyle = styleGenerator(colorPalette[2], interaction);
    } else if (feature.get('pop') >= threshold[3] && feature.get('pop') < threshold[4]) {
        featureStyle = styleGenerator(colorPalette[3], interaction);
    } else if (feature.get('pop') >= threshold[4] && feature.get('pop') < threshold[5]) {
        featureStyle = styleGenerator(colorPalette[4], interaction);
    } else if (feature.get('pop') >= threshold[5] && feature.get('pop') < threshold[6]) {
        featureStyle = styleGenerator(colorPalette[5], interaction);
    } else if (feature.get('pop') >= threshold[6] && feature.get('pop') < threshold[7]) {
        featureStyle = styleGenerator(colorPalette[6], interaction);
    } else if (feature.get('pop') >= threshold[7]) {
        featureStyle = styleGenerator(colorPalette[7], interaction);
    } else {
        featureStyle = styleGenerator(colorPalette[8], interaction);
    }
    return featureStyle;
}