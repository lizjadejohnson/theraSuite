import React, { useContext } from 'react';
import { UserContext } from '../../utilities/UserContext';
import MileageTracker from '../components/MileageTracker';
import MileageTotals from '../components/MileageTotals';
import { Link } from 'react-router-dom';

const MileagePage = () => {
  const { user } = useContext(UserContext);

  // If not logged in, show login prompt
  if (!user) {
    return (
      <div className="mileage-page">
        <h1>Mileage Tracker</h1>
        <p>You need to be logged in to track your mileage. Please <Link to="/signup">create an account</Link> or log in.</p>
      </div>
    );
  }

  return (
    <div className="mileage-page">
      <h1>Mileage Tracker</h1>
      <p className="mileage-description">
        Track your business mileage for tax purposes. The system will automatically save your 
        quarterly totals and then reset at the end of each year. Feel free to add or subtract in the meantime.
      </p>
      
      <div className="mileage-content">
        <section className="mileage-tracker-section">
          <MileageTracker />
        </section>
        
        <section className="mileage-history-section">
          <MileageTotals />
        </section>
      </div>
    </div>
  );
};

export default MileagePage;