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
    showLocation: true,
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
    showLocation: true,
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
    showLocation: true,
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
    showLocation: true,
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
    showLocation: true,
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
    showLocation: true,
    id: "nav5"
}];

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

    // Resize stuff...
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
    });


}

function setUpMarkers() {


    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // Use location array to create an array of map Markers on initialize
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        locations[i].marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        var currentMarker = locations[i].marker;
        // mapMarkers.push(marker);
        bounds.extend(currentMarker.position);
        currentMarker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });
        //Click nav element to view infoWindow
        //zoom in and center location on click
        var searchNav = $('#nav' + i);
        // console.log(locations);
        searchNav.on('click', (function(marker) {
            return function() {
                populateInfoWindow(marker, largeInfowindow);
            };

        })(currentMarker));

    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);

}


//Function to populate the infowindow when marker is clicked
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
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
                infowindow.setContent('<div class="title">' + marker.title + '</div><div id="wikipedia"></div><div id="pano"></div>');

                //Wikipedia links
                var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title +
                    '&format=json&callback=wikiCallback';
                // do an ajax request and wiki links for the city to display in infowindow
                var contentString = '<div class="wikipedia-container">' +
                    '<h5>Relevant Wikipedia Links about this location </h5>' + '<ul class="wikipedia-links">';

                $.ajax({
                    url: wikiUrl,
                    dataType: "jsonp",
                    async: false,
                    success: function(response) {
                        var articleList = response[1];

                        for (var i = 0; i < articleList.length; i++) {
                            var articleStr = articleList[i];
                            var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                            contentString += '<li><a class="wikipedia-links text-center" target="_blank" href="' + url + '">' + articleStr + '</a></li>';
                        }
                        contentString += '</ul></div>';

                        // infoWindows are the little helper windows that open when you click
                        // or hover over a pin on a map. They usually contain more information
                        // about a location.
                        $('#wikipedia').append(contentString);


                    },
                    error: function(resp) {
                        console.log("error: " + resp);
                        contentString = 'Could not get wikipedia links for: ' + marker.title;
                        $('#wikipedia').append(contentString);

                    }

                });
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30 // will have us looking slightly up at the building
                    }
                };
                // if streetview image is found, create a panorama and put it in the div with id pano
                // else say no streetview found
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div>' +
                    '<div>No Street View Found</div>');
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

// function to show/hide markers based on search
function updateSeenMarkers() {
    for (var i = 0; i < locations.length; i++) {
        if (locations[i].showLocation === true) {
            locations[i].marker.setMap(map);
        } else {
            locations[i].marker.setMap(null);
        }
    }

}

// also update markers when search results in true and we have to add markers
// not adding updateSeenMarkers inside the search matching condition as it will fail
// during the initial load of the UI where markers have not been created
$('#searchBox').on('keyup', function() {
    updateSeenMarkers();
});

var viewModel = function() {
    var self = this;

    this.filter = ko.observable('');

    this.locations = ko.computed(function() {
        var search = self.filter().toLowerCase();
        locations.forEach(function(location) {
            if (location.title.toLowerCase().indexOf(search) >= 0 || location.addr1.toLowerCase().indexOf(search) >= 0 || location.addr2.toLowerCase().indexOf(search) >= 0) {
                location.showLocation = true;
                location.visible(true);
                // updateSeenMarkers();

            } else {
                location.showLocation = false;
                // setAllMap();
                location.visible(false);
                updateSeenMarkers();
            }

        });
        return locations;

    }, this);
};

ko.applyBindings(new viewModel());
