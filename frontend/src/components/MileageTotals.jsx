import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../utilities/UserContext';
import { getMileageTotals, deleteMileageHistory } from '../../utilities/mileageUtils';

const MileageTotals = () => {
  const { user } = useContext(UserContext);
  const [quarterlyTotals, setQuarterlyTotals] = useState([]);
  const [yearlyTotals, setYearlyTotals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch mileage totals when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchMileageTotals();
    } else {
      setQuarterlyTotals([]);
      setYearlyTotals([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchMileageTotals = async () => {
    setIsLoading(true);
    await getMileageTotals(setQuarterlyTotals, setYearlyTotals);
    setIsLoading(false);
  };

  // Handle deleting mileage history
  const handleDeleteHistory = async () => {
    // Show confirmation popup
    const confirmed = window.confirm(
      "Are you sure you want to delete all mileage history? This action cannot be undone. " +
      "Your current mileage will remain unchanged, but all quarterly and yearly records will be deleted."
    );
    
    if (confirmed) {
      setMessage('Deleting mileage history...');
      const success = await deleteMileageHistory();
      
      if (success) {
        // Clear the data in the UI
        setQuarterlyTotals([]);
        setYearlyTotals([]);
        setMessage('Mileage history deleted successfully.');
      } else {
        setMessage('Failed to delete mileage history. Please try again.');
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Format date as MM/DD/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Get quarter name
  const getQuarterName = (quarter) => {
    const quarterNames = {
      1: "Q1 (Jan-Mar)",
      2: "Q2 (Apr-Jun)",
      3: "Q3 (Jul-Sep)",
      4: "Q4 (Oct-Dec)"
    };
    return quarterNames[quarter] || `Q${quarter}`;
  };

  // Only show loading if specifically loading the mileage data
  if (isLoading) {
    return <div className="loading-spinner">Loading mileage totals...</div>;
  }

  // If user is not logged in, show a message
  if (!user) {
    return (
      <div className="mileage-totals">
        <h2>Mileage History</h2>
        <p>Please log in to view your mileage history.</p>
      </div>
    );
  }

  // Check if there is any history data
  const hasHistoryData = quarterlyTotals.length > 0 || yearlyTotals.length > 0;

  return (
    <div className="mileage-totals">
      <h2>Mileage History</h2>
      
      {message && <div className="message">{message}</div>}
      
      <div className="totals-container">
        <div className="quarterly-totals">
          <h3>Quarterly Totals</h3>
          {quarterlyTotals.length > 0 ? (
            <table className="totals-table">
              <thead>
                <tr>
                  <th>Quarter</th>
                  <th>Year</th>
                  <th>Miles</th>
                  <th>Saved On</th>
                </tr>
              </thead>
              <tbody>
                {/* Sort by most recent first */}
                {[...quarterlyTotals]
                  .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
                  .map((qt, index) => (
                    <tr key={index}>
                      <td>{getQuarterName(qt.quarter)}</td>
                      <td>{qt.year}</td>
                      <td>{qt.total}</td>
                      <td>{formatDate(qt.savedAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p>No quarterly totals saved yet.</p>
          )}
        </div>
        
        <div className="yearly-totals">
          <h3>Yearly Totals</h3>
          {yearlyTotals.length > 0 ? (
            <table className="totals-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Miles</th>
                  <th>Saved On</th>
                  {/* Only include Notes column if we have year-end totals */}
                  {yearlyTotals.some(yt => new Date(yt.savedAt).getFullYear() > yt.year) && (
                    <th>Notes</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {/* Sort by most recent first */}
                {[...yearlyTotals]
                  .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
                  .map((yt, index) => (
                    <tr key={index}>
                      <td>{yt.year}</td>
                      <td>{yt.total}</td>
                      <td>{formatDate(yt.savedAt)}</td>
                      {/* Only show Notes cell if we have year-end totals */}
                      {yearlyTotals.some(yt => new Date(yt.savedAt).getFullYear() > yt.year) && (
                        <td>
                          {new Date(yt.savedAt).getFullYear() > yt.year ? 
                            <span className="total-notes">Year-end total for {yt.year}</span> : 
                            <span className="total-notes"></span>
                          }
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p>No yearly totals saved yet.</p>
          )}
        </div>
      </div>
      
      <div className="mileage-info">
        <p>
          Quarterly totals are saved at midnight on the first day of each quarter.
          Yearly totals are saved at the end of each year and the counter resets automatically.
        </p>
      </div>
      
      {/* Only show delete button if there is history data */}
      {hasHistoryData && (
        <div className="history-actions">
          <button 
            onClick={handleDeleteHistory} 
            className="delete-history-button"
            style={{
              backgroundColor: '#ffebeb',
              color: '#d32f2f',
              border: '1px solid #ffbaba',
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '15px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
          >
            Delete Mileage History
          </button>
          <p className="delete-note" style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
            This will delete all quarterly and yearly records, but keep your current mileage.
          </p>
        </div>
      )}
    </div>
  );
};

export default MileageTotals;