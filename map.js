// import 'tippy.js/dist/tippy.css';
// mapboxgl.accessToken = "pk.eyJ1Ijoia2Jlbml0ZXoiLCJhIjoiY20xanRkNDJjMDU2bDJpb2tkaTltN2R5NiJ9.LHpehjaR0swXOUvk8D5F9w"; // YOUR STYLE URL
// mapboxgl.accessToken = "pk.eyJ1Ijoia2Jlbml0ZXoiLCJhIjoiY20xanRkNDJjMDU2bDJpb2tkaTltN2R5NiJ9.LHpehjaR0swXOUvk8D5F9w"; // HAND DRAWN
mapboxgl.accessToken = "pk.eyJ1Ijoia2Jlbml0ZXoiLCJhIjoiY20xanRkNDJjMDU2bDJpb2tkaTltN2R5NiJ9.LHpehjaR0swXOUvk8D5F9w" // HAND DRAWN WITH LABELS

// CREATE A NEW OBJECT CALLED MAP
const map = new mapboxgl.Map({
    container: "mapPage", // container ID for the map object (this points to the HTML element)
    // style: "mapbox://styles/kbenitez/cm1jtlviw004a01pdb4x7btn4", // YOUR STYLE URL
    // style: "mapbox://styles/kbenitez/cm2tclyo1000001pa7olh0953", // HAND DRAWN
    style: "mapbox://styles/kbenitez/cm4ekcxup00hf01rw5oiucyub", // HAND DRAWN WITH LABELS
    center: [-73.9442, 40.6482], // starting position [lng, lat] (google brooklyn)
    pitch: 60,
    zoom: 12, // starting zoom (adjust it as you wish)
    projection: "globe", // display the map as a 3D globe
  });

const size = 100;

// This implements `StyleImageInterface`
// to draw a pulsing dot icon on the map.
const pulsingDot = {
  width: size,
  height: size,
  data: new Uint8Array(size * size * 4),

  // When the layer is added to the map,
  // get the rendering context for the map canvas.
  onAdd: function () {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext('2d');
  },

  // Call once before every frame where the icon will be used.
  render: function () {
    const duration = 1000;
    const t = (performance.now() % duration) / duration;

    const radius = (size / 2) * 0.3;
    const outerRadius = (size / 2) * 0.7 * t + radius;
    const context = this.context;

    // Draw the outer circle.
    context.clearRect(0, 0, this.width, this.height);
    context.beginPath();
    context.arc(
      this.width / 2,
      this.height / 2,
      outerRadius,
      0,
      Math.PI * 2
    );
    context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
    context.fill();

    // Draw the inner circle.
    context.beginPath();
    context.arc(
      this.width / 2,
      this.height / 2,
      radius,
      0,
      Math.PI * 2
    );
    context.fillStyle = 'rgba(255, 100, 100, 1)';
    context.strokeStyle = 'white';
    context.lineWidth = 2 + 4 * (1 - t);
    context.fill();
    context.stroke();

    // Update this image's data with data from the canvas.
    this.data = context.getImageData(
      0,
      0,
      this.width,
      this.height
    ).data;

    // Continuously repaint the map, resulting
    // in the smooth animation of the dot.
    map.triggerRepaint();

    // Return `true` to let the map know that the image was updated.
    return true;
  }
};

// Added part
map.on('load', () => {
  // Add a GeoJSON source with data from the API
  map.addSource('mongoLayer', {
    type: 'geojson',
    // data: 'http://localhost:3000/api/geojson' // Replace with your API endpoint
    data: 'https://mapping-hip-hop-app-b84522a59d4d.herokuapp.com/api/geojson'
  });

  // startTour();

  // Add a layer to display MongoDB data
  map.addLayer({
    id: 'mongoLayer',
    type: 'circle', // Options: 'circle', 'line', 'fill'
    source: 'mongoLayer',
    paint: {
      'circle-radius': 7,
      'circle-color': '#ff0000'
    }
  });

  // Create a pop-up instance
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  // startTour();

  // Add mouseenter event to show the pop-up
  map.on('mouseenter', 'mongoLayer', (e) => {
    // Change the cursor to a pointer to indicate interactivity
    map.getCanvas().style.cursor = 'pointer';

    // Extract the coordinate and properties of the hovered point
    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;
    const location = properties['Location Name'];

    // Set the content of the pop-up
    popup.setLngLat(coordinates)
         .setHTML(`<h1>${location || 'Unknown Location'}</h1>`)
          .addTo(map);
  });

  // Add mouseleave event to remove the pop-up
  map.on('mouseleave', 'mongoLayer', () => {
    // Reset the cursor style
    map.getCanvas().style.cursor = '';
    // Remove the pop-up
    popup.remove();
  });

  // Step 4: Add Pulsing Animation Image
  map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

  // Step 5: Add the Pulsing Dot Source and Layer
  map.addSource('pulsing-point', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  map.addLayer({
    id: 'pulsing-point-layer',
    type: 'symbol',
    source: 'pulsing-point',
    layout: {
      'icon-image': 'pulsing-dot'
    }
  });

  // Step 5: Add Click Event
  map.on('click', 'mongoLayer', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['mongoLayer'] });

    if (features.length) {
      const feature = features[0];
      const coordinates = feature.geometry.coordinates;

      // Update the pulsing-point source to the new coordinates
      map.getSource('pulsing-point').setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: coordinates }
          }
        ]
      });
    }
  });

  // startTour();

});

// Navigation
const homeButton = document.getElementById("home-button-div");
const menuButton = document.getElementById("menu-button-div");
const menuButtonH = document.getElementById("menu-button-divH");
const menuButtonA = document.getElementById("menu-button-divA");
const menu = document.getElementById("menu");
const collage = document.getElementById("collage");

function navigate(pageID) {
  // Get all pages
  const pages = document.querySelectorAll('.page');

  // Hide all pages
  pages.forEach((page) => {
    page.classList.remove('active');
  });

  // Show the selected page
  // map.resize();
  const activePage = document.getElementById(pageID);
  if (activePage) {
    activePage.classList.add('active');
    window.location.hash = pageID; // Update the URL hash
  }
  map.resize();

  menu.style.top = '-100%';
}

// Load the correct page based on the URL hash
window.addEventListener('load', () => {
  const hash = window.location.hash.substring(1); // Remove the # from the hash
  navigate(hash || 'home'); // Default to 'home' if no hash is present
});

// Get static elements on information overlay by their ID
const overlay = document.getElementById('container');
const locationHeader = document.getElementById('locationHeader');
const closeInfo = document.getElementById('closeInfo');
const lyricDiv = document.getElementById('lyricDiv');
const playerButton = document.getElementById('playerButton');
const descriptionDiv = document.getElementById('descriptionDiv');
const contributeButton = document.getElementById('contribute');

// Get static elements of player overlay
const showPlayer = document.getElementById('showPlayer');
// showPlayer.classList.add('rainbow');
const musicPlayer = document.getElementById('musicPlayer');
const embedDiv = document.getElementById('embedDiv');
const hidePlayer = document.getElementById('hidePlayer');

// Get static elements of form overlay by their ID
const formContainer = document.getElementById('form');
const formDiv = document.getElementById('formDiv');
const closeForm = document.getElementById('closeForm');

// Get static elements of guide overlay by their ID
const guideOverlay = document.getElementById('guideOverlay');
const tooltip = document.getElementById('tooltip');
const tooltipText = document.getElementById('tooltip-text');
const closeGuide = document.getElementById('closeGuide');
const acceptGuide = document.getElementById('acceptGuide');

const steps = [
  { element: document.getElementById('showPlayer'), text:'Click here to access player'}
]

let currentStep = 0;

// Function to start the tour
function startTour() {
  guideOverlay.classList.remove('hidden');
  showStep(currentStep);
}

// Function to show a specific step
function showStep(stepIndex) {
  if (stepIndex >= steps.length) {
    endTour();
    return;
  }
  const step = steps[stepIndex];
  const rect = step.element.getBoundingClientRect();
  // featureHighlight(rect);
  tooltipText.textContent = step.text;
}

// function featureHighlight(rect) {
//   const spotlight = document.getElementsById('spotlight');
//   spotlight.style.top = `${rect.top}px`;
//   spotlight.style.left = `${rect.left}px`;
//   // transparency.width = bbox.width;
//   // transparency.height = bbox.height;
//   // const top = bbox.top;
//   // const right = bbox.right;
//   // const bottom = bbox.bottom;
//   // const left = bbox.left;
//   // transparency.style.clip = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
//   // transparency.style.maskImage = `inset(${top} ${right} ${bottom} ${left})`;
//   // guideOverlay.classList.add('transparent-section');
// }

// Function to go to the next step
function nextStep() {
  currentStep++;
  showStep(currentStep);
}

// Function to end the tour
function endTour() {
 guideOverlay.classList.add('hidden');
}

closeGuide.addEventListener('click', nextStep);

// Changing variables
let prefillData = {};
let embedLink = '';

// Open Overlay
map.on('click', 'mongoLayer', (e) => {
  // get marker coordinates
  const coordinates = e.features[0].geometry.coordinates.slice();
  const lon = coordinates[0];
  const lat = coordinates[1];

  // Data from marker
  const properties = e.features[0].properties;
  const location = properties['Location Name'];
  const artist = properties['Artist'];
  const title = properties['Song Name'];
  const year = properties['Song Year'];
  const reference = properties['Year Referenced'];
  const media = properties.Media;
  const verse = properties.Verse;
  const verseEscaped = verse.replace(/\n/g, '<br>');
  const description = properties.Description;
  const descEscaped = description.replace(/\n/g, '<br>');
  const embed = properties['Embed Link'];
  const img_caption = properties['Caption'];
  const address = properties['Address']
  embedLink = embed;

  // Data that will be sent to form
  prefillData = {
    location: location,
    title: title,
    artist: artist,
    lon: lon,
    lat: lat
  };
    
  overlay.classList.remove('visible');
  locationHeader.innerHTML = `<h3>${location || 'Unknown Location'}</h3>
                              <p>${address}</p>`;
  lyricDiv.innerHTML = `<h4>${reference}</h4>
                           <img src="${media}" width="400" height="auto" />
                           <small>${img_caption} </small>
                           <p>${verseEscaped || 'Unknown Lyrics'}</p>
                           <p>- ${artist}, "${title}"</p>`;
  descriptionDiv.innerHTML = `<p>${descEscaped || 'Description'}</p>`;
  overlay.classList.add('visible');
  const visible = overlay.classList.contains('visible');
  const padding = visible ? 500 : 0; // 500 if visible, 0 otherwise

  // Zoom to marker
  map.easeTo({
    center: coordinates,
    zoom: 14,
    duration: 1000
  })

});

// Music Player Button
playerButton.addEventListener('click', () => {
  embedDiv.innerHTML = `<iframe `+ embedLink +` />`;
  showPlayer.classList.add('hide');
  musicPlayer.classList.add('visible');
  homeButton.classList.add('hide-above');
  menuButton.classList.add('hide-above');
})

// Contribute Button
contributeButton.addEventListener('click', () => {
  formDiv.innerHTML = `<iframe id="formIframe" src="https://mapping-hip-hop-app-b84522a59d4d.herokuapp.com/form" width="410" height="510" 
                        sandbox="allow-forms allow-scripts" ></iframe>`;
  // For local testing
  // formDiv.innerHTML = `<iframe id="formIframe" src="http://localhost:3000/form" width="410" height="510" 
  //                       sandbox="allow-forms allow-scripts" ></iframe>`;

  const iframe = document.getElementById("formIframe");
  iframe.onload = () => {
    iframe.contentWindow.postMessage(prefillData, '*');
  };
  // iframe.addEventListener('message', (event) => {
  //   const data = event.data;
  //   formDiv.innerHTML = `<h3>Thank you for your submission</h3>`;
  // })  
  formContainer.classList.add('visible');
})

// Close information tab
closeInfo.addEventListener('click', () => {
  overlay.classList.remove('visible');
})

// Close form tab
closeForm.addEventListener('click', () => {
  formContainer.classList.remove('visible');
})

// Show Music Player
showPlayer.addEventListener('click', () => {
  showPlayer.classList.add('hide');
  homeButton.classList.add('hide-above');
  menuButton.classList.add('hide-above');
  musicPlayer.classList.add('visible');
})

// Hide Music Player
hidePlayer.addEventListener('click', () => {
  musicPlayer.classList.remove('visible');
  showPlayer.classList.remove('hide');
  homeButton.classList.remove('hide-above');
  menuButton.classList.remove('hide-above');
})

menuButton.addEventListener('click', () => {
  if (menu.style.top === '0%') {
    menu.style.top = '-100%'; // Hide the menu
  } else {
    menu.style.top = '0%'; // Show the menu
  }
})

menuButtonH.addEventListener('click', () => {
  if (menu.style.top === '0%') {
    menu.style.top = '-100%'; // Hide the menu
  } else {
    menu.style.top = '0%'; // Show the menu
  }
})

menuButtonA.addEventListener('click', () => {
  if (menu.style.top === '0%') {
    menu.style.top = '-100%'; // Hide the menu
  } else {
    menu.style.top = '0%'; // Show the menu
  }
})

homeButton.addEventListener('click', () => {
  navigate('home');
})

function hideMenuFunc() {
  if (menu.style.top === '0%') {
    menu.style.top = '-100%'; // Hide the menu
  } else {
    menu.style.top = '0%'; // Show the menu
  }
}

collage.addEventListener('click', () => {
  navigate('mapPage');
})


// Search function
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken, // Required: Mapbox access token
  mapboxgl: mapboxgl, // Required: Pass the mapbox-gl instance
  marker: true, // Optional: Add a marker for the search result
  placeholder: 'Search for places', // Optional: Placeholder text
  proximity: { longitude: -73.9442, latitude: 40.6482 } // Optional: Bias search results near this location
});

// Add the geocoder to the map
map.addControl(geocoder, 'bottom-right');

// Listen for the `result` event to move the camera
geocoder.on('result', (event) => {
  const location = event.result.geometry.coordinates; // [longitude, latitude]

  // Fly the camera to the selected location
  map.flyTo({
      center: location,
      zoom: 12, // Adjust zoom level as needed
      speed: 1.5, // Animation speed (1 is default, higher is faster)
      curve: 1.2 // Animation curve (default is 1.42, lower is linear)
  });

});

// Add the geolocate control to the map
const geolocateControl = new mapboxgl.GeolocateControl({
  positionOptions: {
      enableHighAccuracy: true // Use high-accuracy location if available
  },
  trackUserLocation: true, // Keep tracking user location
  showUserHeading: true // Show user orientation
});

map.addControl(geolocateControl, 'bottom-right');

// Trigger geolocation on load
// map.on('load', () => {
//   geolocateControl.trigger(); // Automatically trigger geolocation
// });

// Geolocate on click
geolocateControl.on('click', () => {
  geolocateControl.trigger();
});

const defaultPosition = {
  center: [-73.9442, 40.6482], // starting position [lng, lat] (google brooklyn)
  zoom: 12,
  bearing: 0,
  pitch: 60,
};

class DefaultViewControl {
  onAdd(map) {
      this.map = map;

      // Create a button element
      const button = document.createElement('button');
      button.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-default-view';
      button.type = 'button';
      button.title = 'Reset View';
      button.innerHTML = '↺'; // Reset icon (Unicode character)

      // Add a click event listener to reset the camera position
      button.onclick = () => {
          map.flyTo(defaultPosition); // Fly the camera to the default position
      };

      // Create a container for the control and append the button
      const container = document.createElement('div');
      container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
      container.appendChild(button);

      return container;
  }

  onRemove() {
      this.map = undefined; // Remove reference to the map instance
  }
};

// Add the custom control to the map
map.addControl(new DefaultViewControl(), 'bottom-right');


// Close Overlay (deprecated)
// map.on('click', (e) => {
//   const features = map.queryRenderedFeatures(e.point, { layers: ['mongoLayer']});

//   if (!features.length) {
//     const overlay = document.getElementById('container');
//     overlay.classList.remove('visible');
//   }
// });
  