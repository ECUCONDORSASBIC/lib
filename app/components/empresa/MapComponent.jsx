"use client";

import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { GoogleMap, InfoWindow, LoadScript } from '@react-google-maps/api';
import { useCallback, useEffect, useRef, useState } from 'react';

// Estilos de mapa actualizados para un look más limpio y centrado en POIs médicos
const mapStyles = [
  {
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#f5f5f5" },
      { "visibility": "on" }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#e0e0e0" }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "poi.medical",
    "elementType": "all",
    "stylers": [
      { "visibility": "on" }
    ]
  },
  {
    "featureType": "poi.medical",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#ff9e80" }
    ]
  },
  {
    "featureType": "poi.medical",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#b71c1c" }
    ]
  },
  // Ocultar geometrías y etiquetas de todas las carreteras principales y arteriales
  {
    "featureType": "road.highway",
    "elementType": "geometry", // Aplica a fill y stroke
    "stylers": [
      { "visibility": "simplified" }, // Mantiene una línea fina
      { "color": "#e0e0e0" }      // Color más sutil para las líneas de carretera
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "simplified" },
      { "color": "#e8e8e8" }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  // Ocultar completamente las carreteras locales (geometría y etiquetas)
  {
    "featureType": "road.local",
    "elementType": "all", // Oculta tanto geometría como etiquetas
    "stylers": [
      { "visibility": "off" }
    ]
  },
  // Asegurar que las etiquetas de las localidades (barrios) estén visibles
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#616161" },
      { "visibility": "on" } // Asegurar visibilidad
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.stroke",
    "stylers": [
      { "color": "#ffffff" },
      { "weight": 3 },
      { "visibility": "on" } // Asegurar visibilidad del contorno para legibilidad
    ]
  }
];

// Función para determinar el icono y tamaño del marcador
const getMarkerIconConfig = (professional) => {
  // Ensure window.google.maps is available before trying to use its constructors
  if (typeof window === 'undefined' || !window.google || !window.google.maps) {
    console.warn("Google Maps API not available when getMarkerIconConfig was called. Professional:", professional?.name);
    // Fallback to a simple URL string, or return null/undefined to use default marker
    return { url: "/icons/avatar.svg" }; // Actualizado al nuevo avatar.svg por defecto
  }

  let iconPath = "/icons/avatar.svg"; // Usar avatar.svg como default
  let iconSize = new window.google.maps.Size(40, 40);
  let iconAnchor = new window.google.maps.Point(20, 40);

  if (professional.entityType === 'institution') {
    iconPath = "/icons/avatar-hospital.jpg";
    iconSize = new window.google.maps.Size(50, 50);
    iconAnchor = new window.google.maps.Point(25, 50);
  } else if (professional.entityType === 'individual') {
    // El tamaño para 'individual' (40x40) ya está establecido por defecto
    if (professional.gender === 'male') {
      iconPath = "/icons/avatar-male1.png";
    } else if (professional.gender === 'female') {
      iconPath = "/icons/avatar-female.png";
    } else {
      // Si es individual pero sin género específico, se mantiene el iconPath inicial (/icons/avatar.svg)
      // console.log(`Individual professional ${professional.name} has no gender, using default icon.`);
    }
  }
  // Si no es 'institution' ni 'individual', también usará el iconPath inicial.

  return {
    url: iconPath,
    scaledSize: iconSize,
    anchor: iconAnchor,
  };
};

// Ejemplo de datos para un profesional de tipo 'institution'
const hospitalAnuncio = {
  id: 'hospital-123',
  name: 'Hospital Central de Buenos Aires',
  lat: -34.6037, // Latitud del hospital
  lng: -58.3816, // Longitud del hospital
  entityType: 'institution', // Importante para la lógica del icono y la etiqueta de remuneración
  specialty: 'Oferta de Empleo: Médico/a de Guardia', // O la especialidad que buscan
  // ... otros datos del hospital
  guardiaRate: { // Para la remuneración ofrecida
    min: 150000, // Remuneración mínima ofrecida
    max: 200000, // Remuneración máxima ofrecida
    // currency: 'ARS' // Ya no es necesario aquí, se asume ARS en el componente
  },
  // Asegúrate de que los iconos para 'institution' estén configurados correctamente
  // en getMarkerIconConfig (actualmente usa /icons/avatar-hospital.jpg)
};

// Este objeto `hospitalAnuncio` se añadiría al array `professionals`
// que pasas al MapComponent.

// Ejemplo de cómo podrías añadirlo a tus datos de profesionales:
const exampleProfessionalsWithHospital = [
  // ... otros profesionales ...
  {
    id: 'hospital-clinicas-01',
    name: 'Hospital de Clínicas José de San Martín',
    lat: -34.60095, // Latitud aproximada del Hospital de Clínicas
    lng: -58.39745, // Longitud aproximada del Hospital de Clínicas
    entityType: 'institution',
    specialty: 'Oferta Laboral: Enfermero/a Jefe de Piso',
    guardiaRate: {
      min: 250000,
      max: 320000,
    },
    // otros datos relevantes para el hospital
    phone: '11-5950-8000' // Ejemplo de teléfono
  },
  // ... más profesionales ...
];

// EJEMPLO COMBINADO DE PROFESIONALES Y HOSPITALES/INSTITUCIONES
const sampleProfessionalsAndInstitutions = [
  // Profesionales Individuales (Empleados)
  {
    id: 'med-001',
    name: 'Dr. Carlos Bianchi',
    lat: -34.5889,
    lng: -58.4334,
    entityType: 'individual',
    gender: 'male',
    specialty: 'Cardiología Infantil',
    guardiaRate: { min: 10000, max: 15000 },
    phone: '11-2345-6789'
  },
  {
    id: 'med-002',
    name: 'Dra. Laura Fernández',
    lat: -34.6158,
    lng: -58.4333,
    entityType: 'individual',
    gender: 'female',
    specialty: 'Pediatría General',
    guardiaRate: { min: 9000, max: 13000 },
    phone: '11-3456-7890'
  },
  {
    id: 'med-003',
    name: 'Lic. Roberto Gómez',
    lat: -34.6037,
    lng: -58.3816, // Cerca del obelisco para variar
    entityType: 'individual',
    // Sin género especificado, usará avatar.svg por defecto
    specialty: 'Kinesiología Respiratoria',
    guardiaRate: { min: 7000, max: 10000 },
    phone: '11-4567-8901'
  },
  // Hospitales e Instituciones
  {
    id: 'hospital-clinicas-01',
    name: 'Hospital de Clínicas José de San Martín',
    lat: -34.60095,
    lng: -58.39745,
    entityType: 'institution',
    specialty: 'Oferta Laboral: Enfermero/a Jefe de Piso',
    guardiaRate: { min: 250000, max: 320000 },
    phone: '11-5950-8000'
  },
  {
    id: 'hospital-italiano-01',
    name: 'Hospital Italiano de Buenos Aires',
    lat: -34.6083,
    lng: -58.4209,
    entityType: 'institution',
    specialty: 'Medicina Interna de Alta Complejidad',
    // Sin guardiaRate, no mostrará remuneración o indicará 'No especificado'
    phone: '11-4959-0200'
  },
  {
    id: 'sanatorio-trinidad-01',
    name: 'Sanatorio de la Trinidad Palermo',
    lat: -34.5795,
    lng: -58.4244,
    entityType: 'institution',
    specialty: 'Oferta Laboral: Técnico/a en Hemoterapia',
    guardiaRate: { min: 180000, max: 240000 },
    phone: '11-5300-5500'
  }
];

const MapComponent = ({ initialCenter, initialZoom, professionals /* = sampleProfessionalsAndInstitutions */, canViewSensitiveData = false }) => { // Nueva prop canViewSensitiveData
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [map, setMap] = useState(null);
  const markerClustererRef = useRef(null);
  const markersRef = useRef([]);

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  const center = Array.isArray(initialCenter) && initialCenter.length === 2
    ? { lat: initialCenter[0], lng: initialCenter[1] }
    : { lat: -34.6037, lng: -58.3816 };

  const zoom = typeof initialZoom === 'number' ? initialZoom : 12;

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);

    const renderer = {
      render: ({ count, position, markers }) => {
        // Determina qué icono usar basado en 'count'
        let iconUrl = '/icons/cluster-default.png'; // Tu icono de clúster por defecto
        let labelColor = 'white';
        let width = 50;
        let height = 50;

        if (count > 100) {
          iconUrl = '/icons/cluster-large.png'; // Icono para clústeres grandes
          width = 70; height = 70;
        } else if (count > 10) {
          iconUrl = '/icons/cluster-medium.png'; // Icono para clústeres medianos
          width = 60; height = 60;
        }

        return new window.google.maps.Marker({
          position,
          icon: {
            url: iconUrl,
            scaledSize: new window.google.maps.Size(width, height),
          },
          label: {
            text: String(count),
            color: labelColor,
            fontSize: '12px',
            fontWeight: 'bold',
          },
          clickable: false,
          zIndex: 1000 + count // Asegura que los clústeres más grandes estén encima
        });
      }
    };

    if (!markerClustererRef.current) {
      markerClustererRef.current = new MarkerClusterer({
        map: mapInstance,
        markers: [],
        renderer: renderer // Aplicar el renderer personalizado
      });
    } else {
      markerClustererRef.current.setMap(mapInstance);
    }
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
      markerClustererRef.current = null;
    }
    markersRef.current = [];
  }, []);

  const handleCenterOnMyLocation = () => {
    if (map && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.panTo(userLocation);
          map.setZoom(15); // O el nivel de zoom que prefieras
        },
        (error) => {
          console.error("Error getting user location:", error);
          alert("No se pudo obtener tu ubicación. Asegúrate de haber concedido los permisos.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else if (!navigator.geolocation) {
      alert("La geolocalización no es compatible con tu navegador.");
    }
  };

  useEffect(() => {
    if (map && professionals && professionals.length > 0) {
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
      }
      markersRef.current = [];

      const bounds = new window.google.maps.LatLngBounds();
      const newMarkers = professionals
        .filter(prof => prof.lat != null && prof.lng != null)
        .map(prof => {
          const position = { lat: prof.lat, lng: prof.lng };
          bounds.extend(position);
          const iconConfig = getMarkerIconConfig(prof); // Get icon configuration
          console.log(`Professional: ${prof.name}, Icon Config:`, iconConfig); // Log the configuration

          const marker = new window.google.maps.Marker({
            position,
            title: prof.name,
            icon: iconConfig // Usar la configuración obtenida
          });
          marker.professionalData = prof;

          marker.addListener('click', () => {
            setSelectedProfessional(marker.professionalData);
          });

          // Efecto Hover
          marker.addListener('mouseover', () => {
            marker.setOpacity(0.7);
          });
          marker.addListener('mouseout', () => {
            marker.setOpacity(1.0);
          });

          return marker;
        });

      markersRef.current = newMarkers;

      if (markerClustererRef.current) {
        markerClustererRef.current.addMarkers(newMarkers);
      }

      if (newMarkers.length > 0) {
        map.fitBounds(bounds);
        const currentZoom = map.getZoom();
        if (currentZoom > 15) {
          map.setZoom(15);
        }
      }
    } else if (map && professionals && professionals.length === 0) {
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
      }
      markersRef.current = [];
    }
  }, [map, professionals]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    console.error("Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.");
    return (
      <div className="flex items-center justify-center w-full h-full p-4 text-center text-red-600 bg-gray-100">
        Google Maps API key is not configured. Please set the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      loadingElement={<div className="flex items-center justify-center w-full h-full">Cargando Mapa...</div>}
      libraries={['marker']}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={{
          styles: mapStyles,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          scrollwheel: true,
          gestureHandling: 'cooperative',
        }}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Botón para centrar en la ubicación actual */}
        {map && (
          <button
            onClick={handleCenterOnMyLocation}
            title="Centrar en mi ubicación"
            className="absolute z-10 p-2 bg-white rounded-md shadow-md top-4 right-14 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            style={{ transform: 'translateY(0)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm0 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-4a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v.01M12 16v.01M8 12h.01M16 12h.01" />
            </svg>
          </button>
        )}

        {selectedProfessional && selectedProfessional.lat != null && selectedProfessional.lng != null && (
          <InfoWindow
            position={{ lat: selectedProfessional.lat, lng: selectedProfessional.lng }}
            onCloseClick={() => {
              setSelectedProfessional(null);
            }}
            options={{
              pixelOffset: typeof window !== 'undefined' && window.google ? new window.google.maps.Size(0, -35) : undefined,
              disableAutoPan: false,
            }}
          >
            <div className="max-w-md p-4 bg-white rounded-lg shadow-lg w-72">
              <h3 className="mb-1 text-lg font-bold text-center text-gray-800 truncate" title={selectedProfessional.name}>
                {selectedProfessional.name}
              </h3>
              <p className="mb-2 text-sm text-center text-gray-600">
                {selectedProfessional.specialty || 'Especialidad no especificada'}
              </p>

              {/* Rango de Valores por Guardia / Remuneración */}
              {selectedProfessional.guardiaRate && (
                <div className="pt-2 mt-2 mb-2 text-sm text-gray-700 border-t">
                  <p className="font-semibold">
                    {selectedProfessional.entityType === 'institution' ? 'Remuneración Ofrecida:' : 'Tarifa Guardia:'}
                  </p>
                  <p>
                    {selectedProfessional.guardiaRate.min && selectedProfessional.guardiaRate.max ?
                      `${selectedProfessional.guardiaRate.min} - ${selectedProfessional.guardiaRate.max} ARS` :
                      selectedProfessional.guardiaRate.min ? `${selectedProfessional.guardiaRate.min} ARS` :
                        selectedProfessional.guardiaRate.max ? `${selectedProfessional.guardiaRate.max} ARS` :
                          'No especificado'
                    }
                  </p>
                </div>
              )}

              {/* Teléfono (condicional) */}
              <div className="pt-2 mt-2 mb-3 text-sm text-gray-700 border-t">
                <p className="font-semibold">Teléfono:</p>
                {canViewSensitiveData && selectedProfessional.phone ? (
                  <a href={`tel:${selectedProfessional.phone}`} className="text-sky-600 hover:text-sky-700">
                    {selectedProfessional.phone}
                  </a>
                ) : (
                  <p className="italic text-gray-500">
                    {selectedProfessional.phone ? 'Disponible para suscriptores' : 'No disponible'}
                  </p>
                )}
              </div>

              {selectedProfessional.id && (
                <a
                  href={`/dashboard/empresa/perfil-profesional/${selectedProfessional.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full px-3 py-2 text-sm font-semibold text-center text-white no-underline transition duration-150 ease-in-out rounded-md bg-sky-600 hover:bg-sky-700"
                >
                  Ver Perfil Completo
                </a>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
