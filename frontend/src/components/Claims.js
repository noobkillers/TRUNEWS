import { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { extractClaims } from '../api/api';
import useWebSocket from 'react-use-websocket';

function Claims() {
  const [text, setText] = useState('');
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);

  const { lastMessage } = useWebSocket('ws://localhost:8000/ws');

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      if (data.story_id) {
        alert(`Story Update: ${data.story_id} updated`);
      }
    }
  }, [lastMessage]);

  const handleExtract = async () => {
    setLoading(true);
    try {
      const response = await extractClaims(token, text);
      setClaims(response.claims);
    } catch (error) {
      alert('Extraction failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Extract Claims</h2>
      <textarea
        placeholder="Enter text to analyze"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        rows="5"
      />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <button
          onClick={handleExtract}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Extract
        </button>
      )}
      <div className="mt-4">
        {claims.map((claim, index) => (
          <div key={index} className="p-4 mb-2 bg-gray-100 dark:bg-gray-700 rounded">
            <p><strong>Text:</strong> {claim.text}</p>
            <p><strong>Severity:</strong> {claim.severity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Claims;