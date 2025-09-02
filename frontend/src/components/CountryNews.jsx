import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStories } from '../api/api';
import useWebSocket from 'react-use-websocket';
import { getCountries } from 'country-list';

function CountryNews() {
  const [country, setCountry] = useState('');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const countries = getCountries();

  const { lastMessage } = useWebSocket('https://urban-zebra-q765gxqv55p424wpp-8000.app.github.dev/');

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      if (data.story_id && data.verification_level === 'confirmed' && country) {
        alert(`New Verified Story in ${country}: ${data.story_id} - ${data.headline || 'Updated'}`);
        const fetchCountryNews = async () => {
          setLoading(true);
          try {
            const response = await getStories(null, country, null, 'confirmed');
            setStories(response);
          } catch (error) {
            alert('Fetch failed: ' + (error.response?.data?.detail || error.message));
          } finally {
            setLoading(false);
          }
        };
        fetchCountryNews();
      }
    }
  }, [lastMessage, country]);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const response = await getStories(null, country, null, 'confirmed');
      setStories(response);
    } catch (error) {
      alert('Fetch failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Country-Wise Verified News</h2>
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="">Select a country</option>
        {Object.entries(countries).map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
      {country && (
        <button
          onClick={handleFetch}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4"
        >
          Fetch News for {countries[country] || country}
        </button>
      )}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="mt-4">
          {stories.length === 0 ? (
            <p>No verified stories available for {countries[country] || country}.</p>
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

export default CountryNews;