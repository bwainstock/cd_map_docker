var mapBounds = [[0.17578097424708533,-214.98046875],[73.82482034613932, 25.13671875]];
var geojsonLayer;
var map = L.map('map',{maxBounds: mapBounds});
var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

CartoDB_Positron.addTo(map);

var geomStyle = {
    'color': 'black',
    'dashArray': '1, 5',
    // 'fillColor': '#ff7800'
    'opacity': 0.65,
    'weight': 1,
    'fillOpacity': 0.15
};
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}
function resetHighlight(e) {
    var layer = e.target;
    layer.setStyle(geomStyle);
}
function getInfo(e) {
    var properties = e.target.feature.properties;
    console.log(e.target.feature);
    $.ajax({
        url: '/api/district/',
        dataType: 'json',
        data: {
            'idcode': properties.stateabbr + properties.cd114fp
        },
        success: function(data) {
            var templateHtml =
                '<div class="candidate">' +
                    '<div class="row">' +
                '<div class="col-md-6">'+
                '    <span class="name"></span>' +
                    '</div>'+
                    '<div class="col-md-6">'+
                '    <span class="term"></span>' +
                    '</div>'+
                    '</div>'+
                    '<div class="row">' +
                '<div class="col-md-6">'+
                '    <span class="phone"></span>' +
                    '</div>'+
                    '<div class="col-md-6">'+
                '    <span class="fax"></span>' +
                    '</div>'+
                    '</div>'+
                '    <span class="contact"></span>' +
                '    <span class="website"></span>' +
                '    <div class="social">' +
                '        <span class="twitter"></span>' +
                '        <span class="facebook"></span>' +
                '    </div>' +
                '</div>';
            $('#info-state').html('<h1 style="text-align: center;">'+properties.state+'</h1>')
            $('#info-district').html('<h3 style="text-align: center;">'+properties.namelsad+'</h3>')
            var infoContainer = $('#info-info');
            infoContainer.empty();
            data.forEach(function(e, i){
                var element = e['@attributes'];
                //console.log(e);
                infoContainer.append(templateHtml);
                var currentCandidate = $('.candidate:last');
                if (element.party === 'R') {
                    currentCandidate.css("background", 'url("./img/transparent-red.png")');
                }
                else { currentCandidate.css("background", 'url("./img/transparent-blue.png")'); }
                currentCandidate.find('.name').html('<b>'+element.firstlast+' ('+element.party+')'+'</b>');
                currentCandidate.find('.term').html('<i>First elected </i>  ' + element.first_elected);
                currentCandidate.find('.phone').html('<i class="fa fa-phone"></i>  ' + element.phone);
                currentCandidate.find('.fax').html('<i class="fa fa-fax"></i>  ' + element.fax);
                currentCandidate.find('.contact').html('<i class="fa fa-envelope"></i>  <a href="'+element.webform+'" target="_blank">Contact</a>');
                currentCandidate.find('.website').html('<i class="fa fa-share"></i>  <a href="'+element.website+'" target="_blank">Website</a>');
                currentCandidate.find('.twitter').html('<i class="fa fa-twitter"></i>  <a href="https://twitter.com/'+element.twitter_id+'" target="_blank">'+element.twitter_id+'</a>');
                currentCandidate.find('.facebook').html('<i class="fa fa-facebook"></i>  <a href="https://www.facebook.com/'+element.facebook_id+'" target="_blank">'+element.firstlast+'</a>');
            });

            foo = data;
            console.log(data);
        },
        error: function(error) {
            $('#info-info').html('<div class="candidate"><h2 class="">No information available</h2></div>');
        }
    });
    $('.geoid').text(properties.geoid);
    $('.state').text(properties.state);
    $('.namelsad').text(properties.namelsad);
    $('.cd114fp').text(properties.stateabbr + properties.cd114fp);
}
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: getInfo
    });
}

map.on('load', function(e) {
    $.ajax({
        url: '/api/bbox/',
        dataType: 'json',
        data: {
            'bbox': e.target.getBounds().toBBoxString(),
            'zoom': map.getZoom()
        },
        success: function (data) {
	    console.log('loaded');
            geojsonLayer = L.geoJson(data, {style: geomStyle, onEachFeature: onEachFeature});
            geojsonLayer.addTo(map);
            console.log(data);
        },
        error: function (error) {
		console.log('loaded');
            console.log(error);
        }
    });
});
map.on('moveend', function(e) {
    $.ajax({
        url: '/api/bbox/',
        dataType: 'json',
        data: {
            'bbox': e.target.getBounds().toBBoxString(),
            'zoom': e.target.getZoom()
        },
        success: function (data) {
            map.removeLayer(geojsonLayer);
            console.log('removed');
            geojsonLayer = L.geoJson(data, {style: geomStyle, onEachFeature: onEachFeature});
            geojsonLayer.addTo(map);
            // geojsonData.addTo(map);
            console.log(data);
        },
        error: function (error) {
		console.log('movened');
            console.log(error);
        }
    });
});
map.setView([39.232253, -101.909179], 4);
