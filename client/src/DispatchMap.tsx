import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTranslation } from "react-i18next";

// Fix for default icon issue with Leaflet and Webpack
delete (L.Icon.Default.prototype as Partial<L.Icon.Default>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface Location {
  id: string;
  name: string;
  type: "ambulance" | "clinic" | "pharmacy";
  position: [number, number];
  bedsAvailable?: number; // Optional for clinics
  medicationStock?: string[]; // Optional for pharmacies
}

const DispatchMap: React.FC = () => {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<Location[]>([]);
  const center: [number, number] = [-15.4167, 28.2833]; // Lusaka, Zambia coordinates

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Authentication token not found.");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/locations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div className="container mx-auto p-4 dark:bg-dark-background dark:text-dark-text">
      <h2 className="text-4xl font-sans font-bold text-center mb-12 text-primary-700 dark:text-primary-300">
        {t("dispatch_map_title")}
      </h2>
      <div className="bg-card p-6 rounded-lg shadow-lg dark:bg-dark-card dark:border-dark-border">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {locations.map((location) => (
            <Marker key={location.id} position={location.position}>
              <Popup>
                <strong>{location.name}</strong>
                <br />
                Type: {location.type}
                {location.type === "clinic" &&
                  location.bedsAvailable !== undefined && (
                    <>
                      <br />
                      Beds Available: {location.bedsAvailable}
                    </>
                  )}
                {location.type === "pharmacy" && location.medicationStock && (
                  <>
                    <br />
                    Medication Stock: {location.medicationStock.join(", ")}
                  </>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default DispatchMap;
