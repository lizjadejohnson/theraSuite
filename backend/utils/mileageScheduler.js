const Mileage = require('../models/mileage');

/**
 * Handles saving yearly totals and resetting mileage counters
 */
const handleYearlyReset = async () => {
    try {
        console.log("Running yearly mileage task");
        // We need to do this for all users with mileage data
        const allMileages = await Mileage.find({});
        const now = new Date();
        
        // IMPORTANT: On Jan 1st, we're saving the previous year's data
        // So we explicitly calculate the previous year
        const yearBeingSaved = now.getFullYear() - 1;
        
        for (const mileage of allMileages) {
            // Save yearly total with explicit year reference
            mileage.yearlyTotals.push({
                year: yearBeingSaved, // This makes it clear which year the data is for
                total: mileage.currentMileage,
                savedAt: now
            });
            
            // Reset current mileage
            mileage.currentMileage = 0;
            
            await mileage.save();
            console.log(`Saved yearly total for ${yearBeingSaved} and reset for user: ${mileage.user}`);
        }
    } catch (error) {
        console.error("Error in yearly mileage schedule:", error);
    }
};

/**
 * Handles saving quarterly totals
 */
const handleQuarterlySave = async () => {
    try {
        console.log("Running quarterly mileage task");
        const allMileages = await Mileage.find({});
        const now = new Date();
        
        // On first day of quarter, get previous quarter details
        // This is needed because we're at the start of a new quarter
        const previousDate = new Date(Date.now() - 86400000); // Previous day
        const previousYear = previousDate.getFullYear();
        const previousMonth = previousDate.getMonth();
        const previousQuarter = Math.floor(previousMonth / 3) + 1;
        
        // Get current quarter details
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3) + 1;
        
        for (const mileage of allMileages) {
            // For Q1 (January 1), we need to use the previous year's Q4
            // For all other quarters, we use current year
            const quarterYear = (currentQuarter === 1) ? previousYear : currentYear;
            const quarterNumber = (currentQuarter === 1) ? 4 : previousQuarter;
            
            mileage.quarterlyTotals.push({
                quarter: quarterNumber,
                year: quarterYear,
                total: mileage.currentMileage,
                savedAt: now
            });
            
            await mileage.save();
            console.log(`Saved quarterly total for user: ${mileage.user}, Q${quarterNumber} ${quarterYear}`);
        }
    } catch (error) {
        console.error("Error in quarterly mileage schedule:", error);
    }
};

/**
 * Check conditions and run appropriate tasks
 */
const checkAndRunTasks = async () => {
    const now = new Date();
    
    // Only run at midnight (00:00)
    if (now.getHours() === 0 && now.getMinutes() < 5) { // Allow for a 5-minute window to catch it
        console.log("Checking mileage tasks at midnight");
        
        // If it's January 1st, save yearly total and reset
        if (now.getMonth() === 0 && now.getDate() === 1) {
            await handleYearlyReset();
        }
        
        // If it's the first day of a new quarter, save quarterly total
        const isFirstDayOfQuarter = (
            (now.getMonth() === 0 && now.getDate() === 1) || // Q1: January 1
            (now.getMonth() === 3 && now.getDate() === 1) || // Q2: April 1
            (now.getMonth() === 6 && now.getDate() === 1) || // Q3: July 1
            (now.getMonth() === 9 && now.getDate() === 1)    // Q4: October 1
        );
        
        if (isFirstDayOfQuarter) {
            await handleQuarterlySave();
        }
    }
};

/**
 * Start the scheduler
 */
const startMileageScheduler = () => {
    // Run the check every hour
    const scheduleInterval = setInterval(checkAndRunTasks, 3600000); // 1 hour
    
    // Run once when server starts to catch any missed events
    // if the server was down at midnight
    checkAndRunTasks();
    
    console.log("Mileage scheduler started");
    
    // Return the interval so it can be cleared if needed
    return scheduleInterval;
};

module.exports = {
    startMileageScheduler,
    handleYearlyReset, // Export for testing
    handleQuarterlySave, // Export for testing
};