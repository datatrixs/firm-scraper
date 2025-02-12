import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";

const GOOGLE_PLACES_API_KEY = "AIzaSyB-HtS4Y3Yk7wgPZ7zOVkP_5dBvxz1wzQ4"; // Replace with your API Key

const CpaScraperApp = () => {
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCPAData = async () => {
    if (!location) return alert("Please enter a location");
    setLoading(true);
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=CPA+firms+in+${encodeURIComponent(
        location
      )}&key=${GOOGLE_PLACES_API_KEY}`
    );

    const data = await response.json();
    setLoading(false);
    
    if (data.status !== "OK") {
      alert("No results found or API error.");
      return;
    }
    
    const formattedResults = data.results.map((place) => ({
      name: place.name,
      location: place.formatted_address,
      phone: place.formatted_phone_number || "N/A",
      contact: "N/A" // Google Places API doesn't always provide contact names
    }));
    
    setResults(formattedResults);
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cpa_firms.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">CPA Firm Finder</h1>
      <input
        type="text"
        placeholder="Enter city, state (e.g., Los Angeles, CA)"
        className="border p-2 rounded w-full mb-4"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <Button onClick={fetchCPAData} disabled={loading}>
        {loading ? "Searching..." : "Find CPA Firms"}
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
