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

// Added part
map.on('load', () => {
  // Add a GeoJSON source with data from the API
  map.addSource('mongoLayer', {
    type: 'geojson',
    data: 'http://localhost:3000/api/geojson' // Replace with your API endpoint
  });

  // Add a layer to display MongoDB data
  map.addLayer({
    id: 'mongoLayer',
    type: 'circle', // Options: 'circle', 'line', 'fill'
    source: 'mongoLayer',
    paint: {
      'circle-radius': 5,
      'circle-color': '#007cbf'
    }
  });
});
  