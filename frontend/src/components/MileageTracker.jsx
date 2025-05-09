import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../utilities/UserContext';
import apiUrl from '../config';
import { 
  getMileageData, 
  updateMileage, 
  resetMileage, 
  saveQuarterlyTotal, 
  saveYearlyTotalAndReset 
} from '../../utilities/mileageUtils';

const MileageTracker = () => {
  const { user } = useContext(UserContext);
  const [mileageData, setMileageData] = useState({ currentMileage: 0, quarterlyTotals: [], yearlyTotals: [] });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTestButtons, setShowTestButtons] = useState(false);

  // Fetch mileage data when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchMileageData();
    } else {
      setMileageData({ currentMileage: 0, quarterlyTotals: [], yearlyTotals: [] });
      setIsLoading(false);
    }
  }, [user]);

  const fetchMileageData = async () => {
    setIsLoading(true);
    await getMileageData(setMileageData);
    setIsLoading(false);
  };

  // Update mileage with an increment or decrement
  const handleMileageChange = async (change) => {
    if (!user) {
      setMessage('Please log in to track mileage');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Calculate new mileage, ensuring it's not negative
    const newMileage = Math.max(0, mileageData.currentMileage + change);
    
    // Optimistically update UI
    setMileageData({ ...mileageData, currentMileage: newMileage });
    
    // Update in the backend
    const success = await updateMileage(newMileage, setMileageData);
    
    if (!success) {
      // If the backend update failed, revert to the original state
      fetchMileageData();
      setMessage('Failed to update mileage. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Reset mileage to zero
  const handleResetMileage = async () => {
    if (!user) {
      setMessage('Please log in to reset mileage');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Confirm with the user before resetting
    if (window.confirm('Are you sure you want to reset your mileage to zero?')) {
      // Optimistically update UI
      setMileageData({ ...mileageData, currentMileage: 0 });
      
      // Reset in the backend
      const success = await resetMileage(setMileageData);
      
      if (success) {
        setMessage('Mileage reset successfully!');
      } else {
        // If the backend reset failed, revert to the original state
        fetchMileageData();
        setMessage('Failed to reset mileage. Please try again.');
      }
      
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // TEST FUNCTIONS
  // Toggle test buttons visibility
  const toggleTestButtons = () => {
    setShowTestButtons(!showTestButtons);
  };

  // Test quarterly save function
  const handleTestQuarterlySave = async () => {
    setMessage('Saving quarterly total...');
    const success = await saveQuarterlyTotal();
    if (success) {
      setMessage('Quarterly total saved successfully! Refresh the page to see the updated totals.');
    } else {
      setMessage('Failed to save quarterly total. Please try again.');
    }
    fetchMileageData(); // Refresh the data
    setTimeout(() => setMessage(''), 5000);
  };

  // Test yearly save and reset function
  const handleTestYearlySaveAndReset = async () => {
    setMessage('Saving yearly total and resetting...');
    const success = await saveYearlyTotalAndReset(setMileageData);
    if (success) {
      setMessage('Yearly total saved and mileage reset successfully! Refresh the page to see the updated totals.');
    } else {
      setMessage('Failed to save yearly total and reset. Please try again.');
      fetchMileageData(); // Refresh the data in case of failure
    }
    setTimeout(() => setMessage(''), 5000);
  };

  // Only show loading if specifically loading the mileage data
  if (isLoading) {
    return <div className="loading-spinner">Loading mileage data...</div>;
  }

  // If user is not logged in, show a message
  if (!user) {
    return (
      <div className="mileage-tracker">
        <h2>Mileage Tracker</h2>
        <p>Please log in to track your mileage.</p>
      </div>
    );
  }

  return (
    <div className="mileage-tracker">
      <h2>Mileage Tracker</h2>
      
      <div className="current-mileage">
        <h3>Current Mileage: {mileageData.currentMileage} miles</h3>
      </div>
      
      <div className="mileage-controls">
        <h4>Adjust Mileage</h4>
        <div className="button-group">
          <button onClick={() => handleMileageChange(-10)} className="mileage-button">&minus; 10</button>
          <button onClick={() => handleMileageChange(-1)} className="mileage-button">&minus; 1</button>
          <button onClick={() => handleMileageChange(1)} className="mileage-button">+ 1</button>
          <button onClick={() => handleMileageChange(10)} className="mileage-button">+ 10</button>
        </div>
        
        <div className="reset-section">
          <button onClick={handleResetMileage} className="reset-button">Reset Mileage</button>
        </div>
      </div>
      
      {message && <div className="message">{message}</div>}
      
      <div className="mileage-info">
        <p>
          Your mileage is automatically saved. Quarterly totals are saved at midnight on the 
          first day of each quarter for tax purposes. At the end of the year, the total is saved 
          and the counter resets automatically.
        </p>
      </div>

      {/* Development/Testing Section */}
      <div className="test-section">
        <button 
          onClick={toggleTestButtons} 
          className="test-toggle-button"
          style={{ 
            backgroundColor: '#f0f0f0', 
            color: '#666', 
            fontSize: '0.8em',
            margin: '20px 0 0 0',
            padding: '5px 10px'
          }}
        >
          {showTestButtons ? 'Hide Test Functions' : 'Show Test Functions'}
        </button>
        
        {showTestButtons && (
          <div className="test-buttons" style={{ marginTop: '10px' }}>
            <p style={{ fontSize: '0.8em', color: '#666' }}>These buttons are for testing purposes only:</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                onClick={handleTestQuarterlySave}
                style={{ backgroundColor: '#e0e0ff', color: '#333' }}
              >
                Test Quarterly Save
              </button>
              <button 
                onClick={handleTestYearlySaveAndReset}
                style={{ backgroundColor: '#ffe0e0', color: '#333' }}
              >
                Test Yearly Save & Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MileageTracker;