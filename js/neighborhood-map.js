'use strict';



// declare global map and map markers
var map;
// var mapMarkers = [];

var locations = [{
    title: 'Alviso Marina County Park',
    location: {
        lat: 37.429624,
        lng: -121.9813727
    },
    addr1: '1195 Hope St',
    addr2: 'San Jose CA 95002',
    visible: ko.observable(true),
    id: "nav0"
}, {
    title: 'Don Edwards San Francisco Bay National Wildlife Refuge',
    location: {
        lat: 37.532146,
        lng: -122.071551
    },
    addr1: '2 Marshlands Rd',
    addr2: ' Fremont CA 94555',
    visible: ko.observable(true),
    id: "nav1"
}, {
    title: 'Shoreline Park',
    location: {
        lat: 37.4316708,
        lng: -122.089691
    },
    addr1: '3070 N Shoreline Blvd',
    addr2: ' Mountain View CA 94043',
    visible: ko.observable(true),
    id: "nav2"
}, {
    title: 'Rose Garden',
    location: {
        lat: 37.3339681,
        lng: -121.9377729
    },
    addr1: 'Dana Ave',
    addr2: 'San Jose CA 95112',
    visible: ko.observable(true),
    id: "nav3"
}, {
    title: 'Kelley Park',
    location: {
        lat: 37.3236257,
        lng: -121.8607423
    },
    addr1: '1300 Senter Rd',
    addr2: 'San Jose CA 95112',
    visible: ko.observable(true),
    id: "nav4"
}, {
    title: 'Ed Levin County Park',
    location: {
        lat: 37.4474266,
        lng: -121.854144
    },
    addr1: '3100 Calaveras Rd',
    addr2: 'Milpitas CA 95035',
    visible: ko.observable(true),
    id: "nav5"
}];

var viewModel = function() {
    var self = this;

    self.filter = ko.observable('');

    // filter and show locations according to search box
    self.locations = ko.computed(function() {
        var search = self.filter().toLowerCase();
        locations.forEach(function(location) {
            if (location.title.toLowerCase().indexOf(search) >= 0 || location.addr1.toLowerCase().indexOf(search) >= 0 || location.addr2.toLowerCase().indexOf(search) >= 0) {
                location.visible(true);
                if (location.marker) {
                    location.marker.setMap(map);
                }

            } else {
                location.visible(false);
                if (location.marker) {
                    location.marker.setMap(null);
                }
            }
        });
        return locations;
    });

    // on clicking the list item, open marker for it
    self.listItemClick = function() {
        populateInfoWindow(this.marker, this.infoWindow);
    };

    // Toggle the list view on clicking the little menu icon
    self.toggleList = function() {
        if ($('.toggle-menu').css('left') === '280px') {
            $('.toggle-menu').animate({
                left: '0'
            });
            $('#search-container').animate({
                left: '-280px'
            });
        } else {
            $('.toggle-menu').animate({
                left: '280px'
            });
            $('#search-container').animate({
                left: '0px'
            });
        }
    };

};


/**
 * Initialize map
 */


function initMap() {
    var mapOptions = {
        center: {
            lat: 37.4444498,
            lng: -121.9772816
        },
        zoom: 12,
        mapTypeControl: false,
        disableDefaultUI: true
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    setUpMarkers();
    ko.applyBindings(new viewModel());

}

function setUpMarkers() {


    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // Maker Icon's courtesy of Ryan Vrba's - http://footprintseducation.org/vfw/
    var markerIcon = { // the marker icon, url is defined from location category
        url: "img/hiking.png",
        // This marker is 35 pixels wide by 41 pixels tall.
        size: new google.maps.Size(35, 41),
        // The origin for this image is 0,0. (top left)
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is at 17.5,41. (middle bottom)
        anchor: new google.maps.Point(17.5, 41)
    };
    var shape = { // The clickable region of the markerIcon, defined by x,y coordinates
        coords: [10, 1, 25, 1, 34, 12, 34, 24, 19, 40, 15, 40, 1, 24, 1, 11, 10, 1],
        type: 'poly'
    };

    // Use location array to create an array of map Markers on initialize
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        locations[i].infoWindow = largeInfowindow;
        locations[i].marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: markerIcon
        });
        var currentMarker = locations[i].marker;
        bounds.extend(currentMarker.position);
        // populateInfoWindow(currentMarker, largeInfowindow);
        currentMarker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });

    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);

    // Add event listener for resize and update map bounds to fit the markers
    window.onresize = function() {
        map.fitBounds(bounds);
    };

}

// utility function for offsetting center of the map
// http://stackoverflow.com/questions/10656743/how-to-offset-the-center-point-in-google-maps-api-v3
function offsetCenter(latlng, offsetx, offsety) {

    // latlng is the apparent centre-point
    // offsetx is the distance you want that point to move to the right, in pixels
    // offsety is the distance you want that point to move upwards, in pixels
    // offset can be negative
    // offsetx and offsety are both optional

    var scale = Math.pow(2, map.getZoom());

    var worldCoordinateCenter = map.getProjection().fromLatLngToPoint(latlng);
    var pixelOffset = new google.maps.Point((offsetx / scale) || 0, (offsety / scale) || 0);

    var worldCoordinateNewCenter = new google.maps.Point(
        worldCoordinateCenter.x - pixelOffset.x,
        worldCoordinateCenter.y + pixelOffset.y
    );

    var newCenter = map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);

    map.setCenter(newCenter);

}

//Function to populate the infowindow when marker is clicked
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        // pan to the position of the marker
        offsetCenter(marker.getPosition(), 0, -70);
        // bounce the map marker
        marker.setAnimation(google.maps.Animation.BOUNCE);
        // set a timeout for the map marker to stop bouncing after 2 seconds
        setTimeout(function() {
            marker.setAnimation(google.maps.Animation.null);
        }, 2000);
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });

        var streetViewService = new google.maps.StreetViewService();
        var radius = 500;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        var _getStreetView = function(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                var infoWindowContentString = '<div class="title">' + marker.title + '</div>';

                //Wikipedia links
                var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title +
                    '&format=json&callback=wikiCallback';
                // do an ajax request and wiki links for the city to display in infowindow

                $.ajax({
                        url: wikiUrl,
                        dataType: "jsonp"
                    })
                    .done(function(response) {
                        var articleList = response[1];
                        infoWindowContentString += '<div class="wikipedia-container">' +
                            '<h5>Relevant Wikipedia Links about this location </h5>' + '<ul class="wikipedia-links">';

                        for (var i = 0; i < Math.min(articleList.length, 4); i++) {
                            var articleStr = articleList[i];
                            var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                            infoWindowContentString += '<li><a class="wikipedia-links text-center" target="_blank" href="' + url + '">' + articleStr + '</a></li>';
                        }
                        infoWindowContentString += '</ul></div>';
                        console.log(infoWindowContentString);


                    }).fail(function(jqXHR, textStatus) {
                        console.log("Error getting info from wikipedia: " + textStatus);
                        infoWindowContentString += '<div class="wikipedia-container">' +
                            '<h5>Could not get wikipedia locations for' + marker.title + '</h5></div>';

                    });

                infoWindowContentString += '<div id="pano"></div>';
                infowindow.setContent(infoWindowContentString);

                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30 // will have us looking slightly up at the building
                    }
                };
                // if streetview image is found, create a panorama and put it in the div with id pano
                // else put in error message
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div>' +
                    '<div>Request to Google places to get streetview failed :-/</div>');
            }
        };
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        // get streetview is the callback to getpanoramabylocation
        streetViewService.getPanoramaByLocation(marker.position, radius, _getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}

// on google API error display error message
function googleError() {
    $('#search-container').hide();
    $('#toggle-list').hide();
    $('#map').addClass('google-error');
    $('#map').html('<h1>Could not connect and get map from google API, please try again later</h1>');
}
