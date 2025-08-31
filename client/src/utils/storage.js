const STORAGE_KEY = 'tone-picker-data';
const MAX_HISTORY_SIZE = 50; // Limit history to prevent localStorage bloat

/**
 * Save data to localStorage
 * @param {Object} data - The data to save
 * @param {string} data.text - Current text content
 * @param {Array} data.history - Revision history
 * @param {number} data.currentIndex - Current position in history
 */
export const saveToLocalStorage = (data) => {
  try {
    // Limit history size to prevent localStorage bloat
    const limitedHistory = data.history.slice(-MAX_HISTORY_SIZE);
    
    const storageData = {
      text: data.text || '',
      history: limitedHistory,
      currentIndex: Math.min(data.currentIndex, limitedHistory.length - 1),
      timestamp: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    // If localStorage is full, try to clear old data
    try {
      localStorage.clear();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        text: data.text || '',
        history: [],
        currentIndex: -1,
        timestamp: Date.now()
      }));
    } catch (clearError) {
      console.error('Failed to clear localStorage:', clearError);
    }
  }
};

/**
 * Load data from localStorage
 * @returns {Object|null} - The saved data or null if not found
 */
export const loadFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    
    // Validate the data structure
    if (!data || typeof data !== 'object') {
      return null;
    }

    // Ensure all required fields exist
    return {
      text: data.text || '',
      history: Array.isArray(data.history) ? data.history : [],
      currentIndex: typeof data.currentIndex === 'number' ? data.currentIndex : -1,
      timestamp: data.timestamp || Date.now()
    };
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

/**
 * Clear all saved data from localStorage
 */
export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};

/**
 * Get storage usage information
 * @returns {Object} - Storage usage stats
 */
export const getStorageInfo = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        size: 0,
        historyCount: 0,
        lastSaved: null
      };
    }

    const data = JSON.parse(stored);
    return {
      size: stored.length,
      historyCount: Array.isArray(data.history) ? data.history.length : 0,
      lastSaved: data.timestamp ? new Date(data.timestamp) : null
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return {
      size: 0,
      historyCount: 0,
      lastSaved: null
    };
  }
};

/**
 * Check if localStorage is available and working
 * @returns {boolean} - True if localStorage is available
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Export data as JSON file
 * @param {Object} data - The data to export
 */
export const exportData = (data) => {
  try {
    const exportData = {
      ...data,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tone-picker-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export data:', error);
    throw new Error('Failed to export data');
  }
};

/**
 * Import data from JSON file
 * @param {File} file - The file to import
 * @returns {Promise<Object>} - The imported data
 */
export const importData = async (file) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate imported data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid file format');
    }

    return {
      text: data.text || '',
      history: Array.isArray(data.history) ? data.history : [],
      currentIndex: typeof data.currentIndex === 'number' ? data.currentIndex : -1
    };
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Failed to import data: ' + error.message);
  }
};
