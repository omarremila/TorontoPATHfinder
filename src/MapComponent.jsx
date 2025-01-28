import { GoogleMap, LoadScript, InfoWindow } from '@react-google-maps/api';
import React, { useState, useRef, useEffect } from 'react';

// Define libraries array outside component to keep it static
const libraries = ['marker'];

// Map styles as static constant
const mapStyles = {
  height: "400px",
  width: "100%"
};

// Default center as static constant
const defaultCenter = {
  lat: 43.6532,
  lng: -79.3832
};

const MapComponent = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  
  const pathLocations = [
    // Financial District
    {
      name: "First Canadian Place",
      coordinates: { lat: 43.6489, lng: -79.3815 },
      code: "E6"
    },
    {
      name: "Scotia Plaza",
      coordinates: { lat: 43.6489, lng: -79.3799 },
      code: "F6"
    },
    {
      name: "TD North Tower",
      coordinates: { lat: 43.6483, lng: -79.3810 },
      code: "E7"
    },
    {
      name: "TD South Tower",
      coordinates: { lat: 43.6478, lng: -79.3812 },
      code: "E8"
    }
  ];

  // Function to create or update user marker
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

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newPos);
          updateUserMarker(newPos);
          
          if (mapRef.current) {
            mapRef.current.panTo(newPos);
          }
        },
        (error) => {
          console.error('Error watching location:', error);
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
          userMarkerRef.current = null;
        }
      };
    } else {
      setLocationError('Geolocation is not supported by your browser');
    }
  }, []);

  const onLoad = (map) => {
    mapRef.current = map;

    pathLocations.forEach(location => {
      const marker = new window.google.maps.Marker({
        position: location.coordinates,
        map: map,
        title: location.name,
      });

      marker.addListener('click', () => {
        setSelectedPlace(location);
      });
    });
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <div>
      {locationError && (
        <div style={{ color: 'red', marginBottom: '8px' }}>{locationError}</div>
      )}
      <LoadScript 
        googleMapsApiKey={apiKey} 
        version="weekly"
        libraries={libraries}
      >
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={16}
          center={userLocation || defaultCenter}
          onLoad={onLoad}
          options={{
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          {selectedPlace && (
            <InfoWindow
              position={selectedPlace.coordinates}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div>
                <h3>{selectedPlace.name}</h3>
                <p>Grid Reference: {selectedPlace.code}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapComponent;