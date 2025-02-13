import React, { useState } from "react";
import { Button } from "@mui/material";
import Papa from "papaparse";

const BACKEND_URL = "https://scraper-backend-three.vercel.app"; // Replace with your actual deployed backend URL

const CpaScraperApp = () => {
  const [location, setLocation] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [radius, setRadius] = useState(5000); // Default radius in meters
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBusinessData = async () => {
    if (!location || !businessType) return alert("Please enter a location, business type, and radius");
    setLoading(true);
    
    try {
      // Call backend API instead of Google Maps API
      const response = await fetch(`${BACKEND_URL}/api/places?keyword=${encodeURIComponent(
        businessType
      )}&location=${encodeURIComponent(location)}&radius=${radius}&type=${businessType}`);
      
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        setLoading(false);
        alert("No results found.");
        return;
      }

      const places = data.results;

      // Fetch details for each place
      const detailedResults = await Promise.all(
        places.map(async (place) => {
          const detailsResponse = await fetch(`${BACKEND_URL}/api/place/details?place_id=${place.place_id}`);
          const detailsData = await detailsResponse.json();

          return {
            name: detailsData.result?.name || place.name,
            location: detailsData.result?.vicinity || place.vicinity || "N/A",
            phone: detailsData.result?.formatted_phone_number || "N/A",
            contact: "N/A", // Google Places API doesn't return contacts
          };
        })
      );

      setResults(detailedResults);
    } catch (error) {
      alert("Error fetching business data.");
      console.error(error);
    }

    setLoading(false);
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "businesses.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Business Finder</h1>
      <input
        type="text"
        placeholder="Enter business type (e.g., CPA, restaurant)"
        className="border p-2 rounded w-full mb-4"
        value={businessType}
        onChange={(e) => setBusinessType(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter latitude,longitude (e.g., 34.0522,-118.2437)"
        className="border p-2 rounded w-full mb-4"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        type="number"
        placeholder="Enter search radius (meters)"
        className="border p-2 rounded w-full mb-4"
        value={radius}
        onChange={(e) => setRadius(e.target.value)}
      />
      <Button onClick={fetchBusinessData} disabled={loading}>
        {loading ? "Searching..." : "Find Businesses"}
      </Button>
      {results.length > 0 && (
        <div className="mt-6">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Name</th>
                <th className="border p-2">Location</th>
                <th className="border p-2">Phone</th>
              </tr>
            </thead>
            <tbody>
              {results.map((firm, index) => (
                <tr key={index}>
                  <td className="border p-2">{firm.name}</td>
                  <td className="border p-2">{firm.location}</td>
                  <td className="border p-2">{firm.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button onClick={downloadCSV} className="mt-4">Download CSV</Button>
        </div>
      )}
    </div>
  );
};

export default CpaScraperApp;
