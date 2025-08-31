import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import Login from './components/Login';
import Evidence from './components/Evidence';
import Claims from './components/Claims';
import Stories from './components/Stories';
import StoryDetails from './components/StoryDetails';
import GlobalNews from './components/GlobalNews';
import CountryNews from './components/CountryNews';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <AuthProvider>
          <Router>
            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/evidence" element={<Evidence />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/stories/:id" element={<StoryDetails />} />
              <Route path="/global-news" element={<GlobalNews />} />
              <Route path="/country-news" element={<CountryNews />} />
            </Routes>
          </Router>
        </AuthProvider>
      </div>
    </div>
  );
}

export default App;