import apiUrl from '../src/config';

// Fetch mileage data for the current user
export async function getMileageData(setMileageData) {
  try {
    const response = await fetch(`${apiUrl}/mileage`, {
      credentials: 'include' // Include credentials (cookies)
    });
    
    const data = await response.json();
    
    if (data.mileage) {
      setMileageData(data.mileage);
    } else {
      console.error("Expected 'mileage' in the response but got:", data);
      setMileageData({ currentMileage: 0, quarterlyTotals: [], yearlyTotals: [] });
    }
  } catch (error) {
    console.error("Failed to fetch mileage data:", error);
    setMileageData({ currentMileage: 0, quarterlyTotals: [], yearlyTotals: [] });
  }
}

// Update the current mileage
export async function updateMileage(newMileage, setMileageData) {
  try {
    const response = await fetch(`${apiUrl}/mileage/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include credentials (cookies)
      body: JSON.stringify({ newMileage })
    });
    
    const data = await response.json();
    
    if (data.mileage) {
      setMileageData(data.mileage);
      return true;
    } else {
      console.error("Expected 'mileage' in the response but got:", data);
      return false;
    }
  } catch (error) {
    console.error("Failed to update mileage:", error);
    return false;
  }
}

// Reset mileage to zero
export async function resetMileage(setMileageData) {
  try {
    const response = await fetch(`${apiUrl}/mileage/reset`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include' // Include credentials (cookies)
    });
    
    const data = await response.json();
    
    if (data.mileage) {
      setMileageData(data.mileage);
      return true;
    } else {
      console.error("Expected 'mileage' in the response but got:", data);
      return false;
    }
  } catch (error) {
    console.error("Failed to reset mileage:", error);
    return false;
  }
}

// Delete mileage history
export async function deleteMileageHistory(setMileageData) {
  try {
    const response = await fetch(`${apiUrl}/mileage/history`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include' // Include credentials (cookies)
    });
    
    const data = await response.json();
    
    if (data.success && data.mileage) {
      setMileageData(data.mileage);
      return true;
    } else {
      console.error("Failed to delete mileage history:", data.message || "Unknown error");
      return false;
    }
  } catch (error) {
    console.error("Failed to delete mileage history:", error);
    return false;
  }
}

// Get totals (quarterly and yearly)
export async function getMileageTotals(setQuarterlyTotals, setYearlyTotals) {
  try {
    const response = await fetch(`${apiUrl}/mileage/totals`, {
      credentials: 'include' // Include credentials (cookies)
    });
    
    const data = await response.json();
    
    if (data.quarterlyTotals && data.yearlyTotals) {
      setQuarterlyTotals(data.quarterlyTotals);
      setYearlyTotals(data.yearlyTotals);
      return true;
    } else {
      console.error("Expected 'quarterlyTotals' and 'yearlyTotals' in the response but got:", data);
      setQuarterlyTotals([]);
      setYearlyTotals([]);
      return false;
    }
  } catch (error) {
    console.error("Failed to fetch mileage totals:", error);
    setQuarterlyTotals([]);
    setYearlyTotals([]);
    return false;
  }
}

// Save quarterly total
export async function saveQuarterlyTotal() {
  try {
    const response = await fetch(`${apiUrl}/mileage/save-quarterly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include' // Include credentials (cookies)
    });
    
    const data = await response.json();
    return !!data.mileage;
  } catch (error) {
    console.error("Failed to save quarterly total:", error);
    return false;
  }
}

// Save yearly total and reset
export async function saveYearlyTotalAndReset(setMileageData) {
  try {
    const response = await fetch(`${apiUrl}/mileage/save-yearly-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include' // Include credentials (cookies)
    });
    
    const data = await response.json();
    
    if (data.mileage) {
      setMileageData(data.mileage);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Failed to save yearly total and reset:", error);
    return false;
  }
}