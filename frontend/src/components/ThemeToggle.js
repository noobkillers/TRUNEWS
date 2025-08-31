import { FaSun, FaMoon } from 'react-icons/fa';

function ThemeToggle({ isDarkMode, setIsDarkMode }) {
  return (
    <div className="fixed top-4 right-4 flex items-center">
      <span className="mr-2">{isDarkMode ? 'Dark' : 'Light'}</span>
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="p-2 bg-gray-200 dark:bg-gray-700 rounded"
      >
        {isDarkMode ? <FaSun /> : <FaMoon />}
      </button>
    </div>
  );
}

export default ThemeToggle;