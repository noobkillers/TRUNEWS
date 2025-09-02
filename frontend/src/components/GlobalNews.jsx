import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStories } from '../api/api';
import useWebSocket from 'react-use-websocket';

function GlobalNews() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { lastMessage } = useWebSocket('https://urban-zebra-q765gxqv55p424wpp-8000.app.github.dev/');

  useEffect(() => {
    const fetchGlobalNews = async () => {
      setLoading(true);
      try {
        const response = await getStories(null, null, null, 'confirmed');
        setStories(response);
      } catch (error) {
        alert('Fetch failed: ' + (error.response?.data?.detail || error.message));
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalNews();
  }, []);

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      if (data.story_id && data.verification_level === 'confirmed') {
        alert(`New Verified Global Story: ${data.story_id} - ${data.headline || 'Updated'}`);
        const fetchGlobalNews = async () => {
          setLoading(true);
          try {
            const response = await getStories(null, null, null, 'confirmed');
            setStories(response);
          } catch (error) {
            alert('Fetch failed: ' + (error.response?.data?.detail || error.message));
          } finally {
            setLoading(false);
          }
        };
        fetchGlobalNews();
      }
    }
  }, [lastMessage]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Global Verified News</h2>
      <p className="mb-4">Displaying verified news stories from all regions.</p>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="mt-4">
          {stories.length === 0 ? (
            <p>No verified stories available.</p>
          ) : (
            stories.map((story) => (
              <div key={story.id} className="p-4 mb-2 bg-gray-100 dark:bg-gray-700 rounded">
                <p><strong>Headline:</strong> {story.headline}</p>
                <p><strong>Regions:</strong> {story.regions.join(', ')}</p>
                <p><strong>Topics:</strong> {story.topics.join(', ')}</p>
                <p><strong>Published:</strong> {new Date(story.published_at).toLocaleString()}</p>
                <button
                  onClick={() => navigate(`/stories/${story.id}`)}
                  className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalNews;