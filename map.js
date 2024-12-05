// mapboxgl.accessToken = "pk.eyJ1Ijoia2Jlbml0ZXoiLCJhIjoiY20xanRkNDJjMDU2bDJpb2tkaTltN2R5NiJ9.LHpehjaR0swXOUvk8D5F9w";
mapboxgl.accessToken = "pk.eyJ1Ijoia2Jlbml0ZXoiLCJhIjoiY20xanRkNDJjMDU2bDJpb2tkaTltN2R5NiJ9.LHpehjaR0swXOUvk8D5F9w";

// CREATE A NEW OBJECT CALLED MAP
const map = new mapboxgl.Map({
    container: "map", // container ID for the map object (this points to the HTML element)
    // style: "mapbox://styles/kbenitez/cm1jtlviw004a01pdb4x7btn4", //YOUR STYLE URL
    style: "mapbox://styles/kbenitez/cm2tclyo1000001pa7olh0953", //HAND DRAWN
    center: [-73.9442, 40.6482], // starting position [lng, lat] (google brooklyn)
    zoom: 11, // starting zoom (adjust it as you wish)
    projection: "globe", // display the map as a 3D globe
  });

// function toggleSidebar(id) {
//   const elem = document.getElementById(id);
//   const collapsed = elem.classList.toggle('collapsed');
//   const padding = {};
//   padding[id] = collapsed ? 0 : 300;
//   map.easeTo({
//     padding: padding,
//     duration: 1000
//   });
// };

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

});

// Open Overlay
map.on('click', 'mongoLayer', (e) => {
  const coordinates = e.features[0].geometry.coordinates.slice();
  map.easeTo({
    center: coordinates,
    zoom: 12,
    duration: 1000
  })
  const properties = e.features[0].properties;
  const location = properties['Location Name'];
  const artist = properties['Artist'];
  const title = properties['Song Name'];
  const year = properties['Song Year'];
  const reference = properties['Year Referenced'];
  const verse = properties.Verse;
  const verseEscaped = verse.replace(/\n/g, '<br>');
  const description = properties.Description;
  const embed = properties['Embed Link'];
    
  const overlay = document.getElementById('container');
  // overlay.innerHTML = `<h3>${location || 'Unknown Location'}</h3>
  //                      <h4>${reference}</h4>
  //                      <p>${verse || 'Unknown Lyrics'}</p>
  //                      <p>- ${artist}, "${title}"</p>
  //                      <iframe ${embed}></iframe>`
  overlay.innerHTML = `<h3>${location || 'Unknown Location'}</h3>
                       <h4>${reference}</h4>
                       <p>${verseEscaped || 'Unknown Lyrics'}</p>
                       <p>- ${artist}, "${title}"</p>`+
                      // `<p>${embed || 'No Embed'}</p>`
                      `<iframe `+ embed +` />`
  overlay.classList.add('visible');
});

// Close Overlay
map.on('click', (e) => {
  const features = map.queryRenderedFeatures(e.point, { layers: ['mongoLayer']});

  if (!features.length) {
    const overlay = document.getElementById('container');
    overlay.classList.remove('visible');
  }
});
  