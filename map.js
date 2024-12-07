// mapboxgl.accessToken = "pk.eyJ1Ijoia2Jlbml0ZXoiLCJhIjoiY20xanRkNDJjMDU2bDJpb2tkaTltN2R5NiJ9.LHpehjaR0swXOUvk8D5F9w"; // YOUR STYLE URL
// mapboxgl.accessToken = "pk.eyJ1Ijoia2Jlbml0ZXoiLCJhIjoiY20xanRkNDJjMDU2bDJpb2tkaTltN2R5NiJ9.LHpehjaR0swXOUvk8D5F9w"; // HAND DRAWN
mapboxgl.accessToken = "pk.eyJ1Ijoia2Jlbml0ZXoiLCJhIjoiY20xanRkNDJjMDU2bDJpb2tkaTltN2R5NiJ9.LHpehjaR0swXOUvk8D5F9w" // HAND DRAWN WITH LABELS

// CREATE A NEW OBJECT CALLED MAP
const map = new mapboxgl.Map({
    container: "map", // container ID for the map object (this points to the HTML element)
    // style: "mapbox://styles/kbenitez/cm1jtlviw004a01pdb4x7btn4", // YOUR STYLE URL
    // style: "mapbox://styles/kbenitez/cm2tclyo1000001pa7olh0953", // HAND DRAWN
    style: "mapbox://styles/kbenitez/cm4ekcxup00hf01rw5oiucyub", // HAND DRAWN WITH LABELS
    center: [-73.9442, 40.6482], // starting position [lng, lat] (google brooklyn)
    pitch: 60,
    zoom: 11, // starting zoom (adjust it as you wish)
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
const musicPlayer = document.getElementById('musicPlayer');
const embedDiv = document.getElementById('embedDiv');
const hidePlayer = document.getElementById('hidePlayer');

// Get static elements of form overlay by their ID
const formContainer = document.getElementById('form');
const formDiv = document.getElementById('formDiv');
const closeForm = document.getElementById('closeForm');

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
  locationHeader.innerHTML = `<h3>${location || 'Unknown Location'}</h3>`;
  lyricDiv.innerHTML = `<h4>${reference}</h4>
                           <img src="${media}" width="400" height="auto" />
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
  musicPlayer.classList.add('visible');
})

// Hide Music Player
hidePlayer.addEventListener('click', () => {
  musicPlayer.classList.remove('visible');
  showPlayer.classList.remove('hide');
})


// Close Overlay (deprecated)
// map.on('click', (e) => {
//   const features = map.queryRenderedFeatures(e.point, { layers: ['mongoLayer']});

//   if (!features.length) {
//     const overlay = document.getElementById('container');
//     overlay.classList.remove('visible');
//   }
// });
  