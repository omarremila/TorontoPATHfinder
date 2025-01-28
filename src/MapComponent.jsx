import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, InfoWindow } from '@react-google-maps/api';

const libraries = ['marker'];

const mapStyles = {
  height: "400px",
  width: "100%"
};

const defaultCenter = {
  lat: 43.6476,
  lng: -79.3790
};

// Complete PATH network locations from the map
const pathLocations = [
  // North Area
  {
    name: "Metro Toronto Convention Centre",
    coordinates: { lat: 43.6447, lng: -79.3885 },
    code: "A8"
  },
  {
    name: "Union Station",
    coordinates: { lat: 43.6453, lng: -79.3806 },
    code: "E9"
  },
  {
    name: "UP Express",
    coordinates: { lat: 43.6445, lng: -79.3808 },
    code: "E9"
  },
  // Central Area
  {
    name: "Metro Toronto Coach Terminal",
    coordinates: { lat: 43.6465, lng: -79.3847 },
    code: "B7"
  },
  {
    name: "Roy Thomson Hall",
    coordinates: { lat: 43.6465, lng: -79.3859 },
    code: "B7"
  },
  {
    name: "Pete Tower",
    coordinates: { lat: 43.6462, lng: -79.3835 },
    code: "C7"
  },
  {
    name: "25 York",
    coordinates: { lat: 43.6458, lng: -79.3812 },
    code: "E8"
  },
  // South Area
  {
    name: "Maple Leaf Square",
    coordinates: { lat: 43.6435, lng: -79.3810 },
    code: "E10"
  },
  {
    name: "One Queen's Quay",
    coordinates: { lat: 43.6428, lng: -79.3752 },
    code: "F10"
  },
  {
    name: "RBC WaterPark Place",
    coordinates: { lat: 43.6408, lng: -79.3775 },
    code: "E11"
  },
  // East Area
  {
    name: "Scotiabank Arena",
    coordinates: { lat: 43.6435, lng: -79.3789 },
    code: "F10"
  }
];

// PATH connections based on the map image
const pathConnections = [
  // Main North-South Line
  [
    { lat: 43.6447, lng: -79.3885 }, // Convention Centre
    { lat: 43.6465, lng: -79.3847 }, // Coach Terminal
    { lat: 43.6462, lng: -79.3835 }, // Pete Tower
    { lat: 43.6458, lng: -79.3812 }, // 25 York
    { lat: 43.6453, lng: -79.3806 }, // Union Station
    { lat: 43.6435, lng: -79.3810 }, // Maple Leaf Square
    { lat: 43.6428, lng: -79.3752 }, // One Queen's Quay
    { lat: 43.6408, lng: -79.3775 }  // RBC WaterPark Place
  ],
  // East-West Connection at Union
  [
    { lat: 43.6445, lng: -79.3808 }, // UP Express
    { lat: 43.6453, lng: -79.3806 }, // Union Station
    { lat: 43.6435, lng: -79.3789 }  // Scotiabank Arena
  ],
  // West Side Connection
  [
    { lat: 43.6465, lng: -79.3859 }, // Roy Thomson Hall
    { lat: 43.6465, lng: -79.3847 }, // Coach Terminal
    { lat: 43.6462, lng: -79.3835 }  // Pete Tower
  ]
];

const LevelSelector = ({ currentLevel, onLevelChange }) => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2">
      <select 
        value={currentLevel} 
        onChange={(e) => onLevelChange(e.target.value)}
        className="p-2 border rounded-md"
      >
        <option value="all">All Floors</option>
        <option value="ground">Ground Level</option>
        <option value="path">PATH Level</option>
        <option value="concourse">Concourse Level</option>
      </select>
    </div>
  );
};

const MapComponent = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [currentLevel, setCurrentLevel] = useState('all');
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const pathLinesRef = useRef([]);
  const markersRef = useRef([]);

  const clearMapObjects = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    pathLinesRef.current.forEach(line => line.setMap(null));
    pathLinesRef.current = [];
  };

  const drawPathConnections = () => {
    if (!mapRef.current || currentLevel !== 'all') return;

    pathConnections.forEach(path => {
      const pathLine = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#00B9E3', // Light blue color matching PATH map
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });
      pathLine.setMap(mapRef.current);
      pathLinesRef.current.push(pathLine);
    });
  };

  const updateMarkers = () => {
    if (!mapRef.current) return;

    clearMapObjects();
    
    pathLocations.forEach(location => {
      const marker = new window.google.maps.Marker({
        position: location.coordinates,
        map: mapRef.current,
        title: location.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#FF4444",
          fillOpacity: 0.8,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        }
      });

      marker.addListener('click', () => {
        setSelectedPlace(location);
      });

      markersRef.current.push(marker);
    });

    if (currentLevel === 'all') {
      drawPathConnections();
    }
  };

  useEffect(() => {
    updateMarkers();
  }, [currentLevel]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          updateUserMarker(userPos);
        },
        (error) => {
          setLocationError('Unable to retrieve your location');
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const updateUserMarker = (position) => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(position);
    } else {
      userMarkerRef.current = new window.google.maps.Marker({
        position: position,
        map: mapRef.current,
        title: "Your Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        }
      });
    }
  };

  const onLoad = (map) => {
    mapRef.current = map;
    updateMarkers();
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <div>
      <LevelSelector 
        currentLevel={currentLevel} 
        onLevelChange={setCurrentLevel}
      />
      
      {locationError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md">
          {locationError}
        </div>
      )}
      
      <LoadScript 
        googleMapsApiKey={apiKey} 
        version="weekly"
        libraries={libraries}
      >
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={15}
          center={userLocation || defaultCenter}
          onLoad={onLoad}
          options={{
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ],
            mapTypeControl: false,
            streetViewControl: false,
          }}
        >
          {selectedPlace && (
            <InfoWindow
              position={selectedPlace.coordinates}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold">{selectedPlace.name}</h3>
                <p className="text-sm mt-1">Grid Reference: {selectedPlace.code}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapComponent;