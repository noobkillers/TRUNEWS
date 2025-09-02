import { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { submitEvidence } from '../api/api';
import useWebSocket from 'react-use-websocket';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Evidence() {
  const [file, setFile] = useState(null);
  const [type, setType] = useState('image');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [confidence, setConfidence] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);

  const { lastMessage } = useWebSocket('https://urban-zebra-q765gxqv55p424wpp-8000.app.github.dev/');

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      if (data.evidence_id) {
        alert(`New Evidence: ${data.evidence_id} added: ${data.uri}`);
      }
    }
  }, [lastMessage]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('captured_at', new Date().toISOString());
      formData.append('lat', parseFloat(lat));
      formData.append('lon', parseFloat(lon));
      formData.append('source_confidence', parseFloat(confidence));
      const response = await submitEvidence(token, formData);
      alert('Evidence submitted: ' + response.evidence_id);
    } catch (error) {
      alert('Submission failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Submit Evidence</h2>
      <input
        type="text"
        placeholder="Type (image, video, document)"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <input
        type="file"
        onChange={handleFileChange}
        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <input
        type="number"
        placeholder="Latitude"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <input
        type="number"
        placeholder="Longitude"
        value={lon}
        onChange={(e) => setLon(e.target.value)}
        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <input
        type="number"
        placeholder="Source Confidence (0-1)"
        value={confidence}
        onChange={(e) => setConfidence(e.target.value)}
        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      {lat && lon && (
        <MapContainer center={[parseFloat(lat) || 0, parseFloat(lon) || 0]} zoom={13} style={{ height: '200px', marginBottom: '1rem' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[parseFloat(lat) || 0, parseFloat(lon) || 0]} />
        </MapContainer>
      )}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      )}
    </div>
  );
}

export default Evidence;