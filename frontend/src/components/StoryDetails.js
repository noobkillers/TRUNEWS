import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { getStoryProvenance, submitCorrection } from '../api/api';
import useWebSocket from 'react-use-websocket';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function StoryDetails() {
  const { id } = useParams();
  const [provenance, setProvenance] = useState(null);
  const [correction, setCorrection] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);

  const { lastMessage } = useWebSocket('ws://localhost:8000/ws');

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      if (data.story_id === id) {
        alert(`Story Update: ${data.story_id} updated: ${data.verification_level || data.correction_id || 'Updated'}`);
      }
    }
  }, [lastMessage, id]);

  useEffect(() => {
    const fetchProvenance = async () => {
      setLoading(true);
      try {
        const response = await getStoryProvenance(token, id);
        setProvenance(response);
      } catch (error) {
        alert('Fetch failed: ' + (error.response?.data?.detail || error.message));
      } finally {
        setLoading(false);
      }
    };
    fetchProvenance();
  }, [id, token]);

  const handleCorrection = async () => {
    setLoading(true);
    try {
      const response = await submitCorrection(token, id, { text: correction });
      alert('Correction submitted: ' + response.correction_id);
      setCorrection('');
    } catch (error) {
      alert('Submission failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Story Details</h2>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        provenance && (
          <>
            <h3 className="text-xl font-semibold mb-2">Evidence</h3>
            {provenance.evidence.map((item) => (
              <div key={item.id} className="p-4 mb-2 bg-gray-100 dark:bg-gray-700 rounded">
                <p><strong>ID:</strong> {item.id}</p>
                <p><strong>Hash (SHA256):</strong> {item.hash || 'N/A'}</p>
                <p><strong>C2PA Signature:</strong> {item.provenance?.signature || 'N/A'}</p>
                <p><strong>Provenance Status:</strong> {item.provenance?.c2pa ? 'Verified' : 'Unverified'}</p>
                <p><strong>Related Evidence:</strong> {item.related.join(', ') || 'None'}</p>
                {item.provenance?.location && (
                  <MapContainer
                    center={[item.provenance.location.lat || 0, item.provenance.location.lon || 0]}
                    zoom={13}
                    style={{ height: '200px', marginTop: '1rem' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[item.provenance.location.lat || 0, item.provenance.location.lon || 0]} />
                  </MapContainer>
                )}
              </div>
            ))}
            <h3 className="text-xl font-semibold mb-2 mt-4">Verification</h3>
            <p><strong>Level:</strong> {provenance.verification?.level || 'Unverified'}</p>
            <p><strong>Checks:</strong> {JSON.stringify(provenance.verification?.checks || [])}</p>
          </>
        )
      )}
      <textarea
        placeholder="Submit a correction"
        value={correction}
        onChange={(e) => setCorrection(e.target.value)}
        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        rows="5"
      />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <button
          onClick={handleCorrection}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Submit Correction
        </button>
      )}
    </div>
  );
}

export default StoryDetails;