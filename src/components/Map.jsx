import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'; // Import the MapLibre styles

const Map = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [layerVisibility, setLayerVisibility] = useState({
    buildings: true,
    roads: true,
    water: true,
    airports: true,
    railways: true,
    boundaries: true,
    landuse: true,
    nature: true,
  });

  useEffect(() => {
    // Initialize the map when the component mounts
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://demotiles.maplibre.org/style.json', // MapLibre basemap
      center: [-6.2195082, 54.7228692], // Default center coordinates
      zoom: 9, // Default zoom level
    });

    // Fetch and add building data
    fetch('http://localhost:3000/api/geojson/buildings')
      .then((response) => response.json())
      .then((data) => {
        data.features.forEach((feature) => {
          if (!feature.properties) feature.properties = {};
          feature.properties.randomHeight = Math.floor(Math.random() * (150 - 50 + 1)) + 50;
        });

        map.addSource('buildings', {
          type: 'geojson',
          data: data,
        });

        map.addLayer({
          id: 'buildings',
          type: 'fill-extrusion',
          source: 'buildings',
          paint: {
            'fill-extrusion-color': '#888',
            'fill-extrusion-height': ['get', 'randomHeight'],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.7,
          },
        });
      });

    // Add additional layers
    addLayer(map, 'roads', 'line', 'http://localhost:3000/api/geojson/roads', {
      'line-color': '#FF5733',
      'line-width': 0.5,
    }, 12);  // Load only after zoom level 12

    addLayer(map, 'water', 'fill', 'http://localhost:3000/api/geojson/water', {
      'fill-color': '#3498db',
      'fill-opacity': 0.3,
    });

    addLayer(map, 'airports', 'fill', 'http://localhost:3000/api/geojson/airports', {
      'fill-color': '#ffcc00',
      'fill-opacity': 0.6,
    });

    addLayer(map, 'railways', 'line', 'http://localhost:3000/api/geojson/railways', {
      'line-color': '#2ecc71',
      'line-width': 1.5,
    }, 12);  // Load railways after zoom level 12

    addLayer(map, 'boundaries', 'line', 'http://localhost:3000/api/geojson/boundaries', {
      'line-color': '#e74c3c',
      'line-width': 1.0,
    });

    addLayer(map, 'landuse', 'fill', 'http://localhost:3000/api/geojson/landuse', {
      'fill-color': '#9b59b6',
      'fill-opacity': 0.5,
    });

    addLayer(map, 'nature', 'fill', 'http://localhost:3000/api/geojson/nature_reserves', {
      'fill-color': '#2ecc71',
      'fill-opacity': 0.5,
    });

    // Set map instance to state for layer control toggles
    setMap(map);

    // Cleanup on unmount
    return () => map.remove();
  }, []);

  const toggleLayer = (layerId) => {
    if (!map) return;
    if (layerVisibility[layerId]) {
      map.setLayoutProperty(layerId, 'visibility', 'none');
    } else {
      map.setLayoutProperty(layerId, 'visibility', 'visible');
    }
    setLayerVisibility((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  const addLayer = (map, layerId, layerType, url, paintOptions, minZoom = 0) => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        map.addSource(layerId, {
          type: 'geojson',
          data: data,
        });

        map.addLayer({
          id: layerId,
          type: layerType,
          source: layerId,
          paint: paintOptions,
          minzoom: minZoom,
        });
      })
      .catch((error) => console.error(`Error fetching ${layerId} GeoJSON:`, error));
  };

  return (
    <div>
      {/* Layer Controls */}
      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={layerVisibility.buildings}
            onChange={() => toggleLayer('buildings')}
          />{' '}
          Buildings (3D)
        </label>
        <label>
          <input
            type="checkbox"
            checked={layerVisibility.roads}
            onChange={() => toggleLayer('roads')}
          />{' '}
          Roads
        </label>
        <label>
          <input
            type="checkbox"
            checked={layerVisibility.water}
            onChange={() => toggleLayer('water')}
          />{' '}
          Water
        </label>
        <label>
          <input
            type="checkbox"
            checked={layerVisibility.airports}
            onChange={() => toggleLayer('airports')}
          />{' '}
          Airports
        </label>
        <label>
          <input
            type="checkbox"
            checked={layerVisibility.railways}
            onChange={() => toggleLayer('railways')}
          />{' '}
          Railways
        </label>
        <label>
          <input
            type="checkbox"
            checked={layerVisibility.boundaries}
            onChange={() => toggleLayer('boundaries')}
          />{' '}
          Boundaries
        </label>
        <label>
          <input
            type="checkbox"
            checked={layerVisibility.landuse}
            onChange={() => toggleLayer('landuse')}
          />{' '}
          Land Use
        </label>
        <label>
          <input
            type="checkbox"
            checked={layerVisibility.nature}
            onChange={() => toggleLayer('nature')}
          />{' '}
          Nature Reserves
        </label>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height: '100vh', width: '100vw' }} />
    </div>
  );
};

export default Map;
