import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { getStories } from '../api/api';
import useWebSocket from 'react-use-websocket';

function Stories() {
  const [region, setRegion] = useState('');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const { lastMessage } = useWebSocket('ws://localhost:8000/ws');

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      if (data.story_id) {
        alert(`Story Update: ${data.story_id} updated: ${data.headline || data.verification_level || 'Correction added'}`);
      }
    }
  }, [lastMessage]);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const response = await getStories(token, region, topic, level);
      setStories(response);
    } catch (error) {
      alert('Fetch failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Stories</h2>
      <input
        type="text"
        placeholder="Region (e.g., US)"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <input
        type="text"
        placeholder="Topic (e.g., disaster)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <input
        type="text"
        placeholder="Verification Level (e.g., confirmed)"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <button
          onClick={handleFetch}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Fetch Stories
        </button>
      )}
      <div className="mt-4">
        {stories.map((story) => (
          <div key={story.id} className="p-4 mb-2 bg-gray-100 dark:bg-gray-700 rounded">
            <p>{story.headline}</p>
            <button
              onClick={() => navigate(`/stories/${story.id}`)}
              className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stories;