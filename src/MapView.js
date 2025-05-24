import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapView() {
  const [countriesGeoJSON, setCountriesGeoJSON] = useState(null);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(null);
  const [popupData, setPopupData] = useState(null);

  useEffect(() => {
    fetch('/ne_50m_admin_0_countries.json')  // <-- changed this line to load from public folder
      .then((res) => res.json())
      .then((data) => {
        setCountriesGeoJSON(data);
        setFilteredCountries(null); // default: show nothing
      })
      .catch((err) => {
        console.error('Failed to load countries.json', err);
      });
  }, []);

  useEffect(() => {
    if (!countriesGeoJSON || selectedContinent === '') {
      setFilteredCountries(null);
      return;
    }

    const filtered = {
      ...countriesGeoJSON,
      features: countriesGeoJSON.features.filter(
        (f) => f.properties.CONTINENT === selectedContinent
      ),
    };

    setFilteredCountries(filtered);
  }, [selectedContinent, countriesGeoJSON]);

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        setPopupData({
          latlng: layer.getBounds().getCenter(),
          name: feature.properties.ADMIN,
          continent: feature.properties.CONTINENT,
        });
      },
    });
  };

  const countryStyle = {
    color: '#0066cc',
    weight: 1,
    fillOpacity: 0.3,
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          zIndex: 1000,
          top: 10,
          left: 10,
          background: '#fff',
          padding: 10,
          borderRadius: 8,
        }}
      >
        <label>Filter by Continent: </label>
        <select
          value={selectedContinent}
          onChange={(e) => setSelectedContinent(e.target.value)}
        >
          <option value="">-- Select --</option>
          <option value="Africa">Africa</option>
          <option value="Asia">Asia</option>
          <option value="Europe">Europe</option>
          <option value="Oceania">Oceania</option>
          <option value="North America">North America</option>
          <option value="South America">South America</option>
        </select>
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredCountries && (
          <GeoJSON
            key={selectedContinent} // forces refresh when continent changes
            data={filteredCountries}
            style={countryStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {popupData && (
          <Popup position={popupData.latlng}>
            <div>
              <strong>{popupData.name}</strong>
              <br />
              Continent: {popupData.continent}
            </div>
          </Popup>
        )}
      </MapContainer>
    </>
  );
}
