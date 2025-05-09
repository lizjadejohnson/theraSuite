const Mileage = require('../models/mileage')

// Get mileage data for the current user
const getMileage = async (req, res) => {
    try {
        console.log("Fetching mileage for user:", req.user._id);
        const userId = req.user._id;
        
        // Find the mileage data or create if it doesn't exist
        let mileage = await Mileage.findOne({ user: userId });
        
        if (!mileage) {
            mileage = await Mileage.create({
                currentMileage: 0,
                quarterlyTotals: [],
                yearlyTotals: [],
                user: userId
            });
        }
        
        res.json({ mileage });
    } catch (error) {
        console.error("Error fetching mileage:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update the current mileage
const updateMileage = async (req, res) => {
    try {
        const userId = req.user._id;
        const { newMileage } = req.body;
        
        if (typeof newMileage !== 'number' || newMileage < 0) {
            return res.status(400).json({ message: "Invalid mileage value" });
        }
        
        let mileage = await Mileage.findOne({ user: userId });
        
        if (!mileage) {
            mileage = await Mileage.create({
                currentMileage: newMileage,
                quarterlyTotals: [],
                yearlyTotals: [],
                user: userId
            });
        } else {
            mileage.currentMileage = newMileage;
            await mileage.save();
        }
        
        res.json({ mileage });
    } catch (error) {
        console.error("Error updating mileage:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Reset mileage to zero
const resetMileage = async (req, res) => {
    try {
        const userId = req.user._id;
        
        let mileage = await Mileage.findOne({ user: userId });
        
        if (mileage) {
            mileage.currentMileage = 0;
            await mileage.save();
        } else {
            mileage = await Mileage.create({
                currentMileage: 0,
                quarterlyTotals: [],
                yearlyTotals: [],
                user: userId
            });
        }
        
        res.json({ mileage });
    } catch (error) {
        console.error("Error resetting mileage:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete mileage history (keeps current mileage, clears quarterly and yearly totals)
const deleteMileageHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        
        let mileage = await Mileage.findOne({ user: userId });
        
        if (mileage) {
            // Keep current mileage but clear history
            mileage.quarterlyTotals = [];
            mileage.yearlyTotals = [];
            await mileage.save();
            
            res.json({ 
                success: true, 
                message: "Mileage history cleared successfully",
                mileage 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: "No mileage data found to clear" 
            });
        }
    } catch (error) {
        console.error("Error clearing mileage history:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

// Save quarterly total
const saveQuarterlyTotal = async (req, res) => {
    try {
        const userId = req.user._id;
        const date = new Date();
        const year = date.getFullYear();
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        
        let mileage = await Mileage.findOne({ user: userId });
        
        if (!mileage) {
            return res.status(404).json({ message: "Mileage data not found" });
        }
        
        // Check if we already have a quarterly total for this quarter and year
        const existingQuarterlyIndex = mileage.quarterlyTotals.findIndex(
            qt => qt.quarter === quarter && qt.year === year
        );
        
        if (existingQuarterlyIndex >= 0) {
            // Update existing quarterly total
            mileage.quarterlyTotals[existingQuarterlyIndex].total = mileage.currentMileage;
            mileage.quarterlyTotals[existingQuarterlyIndex].savedAt = date;
        } else {
            // Add new quarterly total
            mileage.quarterlyTotals.push({
                quarter,
                year,
                total: mileage.currentMileage,
                savedAt: date
            });
        }
        
        await mileage.save();
        
        res.json({ mileage });
    } catch (error) {
        console.error("Error saving quarterly total:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Save yearly total and reset
const saveYearlyTotalAndReset = async (req, res) => {
    try {
        const userId = req.user._id;
        const date = new Date();
        const year = date.getFullYear();
        
        let mileage = await Mileage.findOne({ user: userId });
        
        if (!mileage) {
            return res.status(404).json({ message: "Mileage data not found" });
        }
        
        // Check if we already have a yearly total for this year
        const existingYearlyIndex = mileage.yearlyTotals.findIndex(
            yt => yt.year === year
        );
        
        if (existingYearlyIndex >= 0) {
            // Update existing yearly total
            mileage.yearlyTotals[existingYearlyIndex].total = mileage.currentMileage;
            mileage.yearlyTotals[existingYearlyIndex].savedAt = date;
        } else {
            // Add new yearly total
            mileage.yearlyTotals.push({
                year,
                total: mileage.currentMileage,
                savedAt: date
            });
        }
        
        // Reset current mileage
        mileage.currentMileage = 0;
        
        await mileage.save();
        
        res.json({ mileage });
    } catch (error) {
        console.error("Error saving yearly total and resetting:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get quarterly and yearly totals
const getTotals = async (req, res) => {
    try {
        const userId = req.user._id;
        
        let mileage = await Mileage.findOne({ user: userId });
        
        if (!mileage) {
            return res.status(404).json({ message: "Mileage data not found" });
        }
        
        res.json({ 
            quarterlyTotals: mileage.quarterlyTotals,
            yearlyTotals: mileage.yearlyTotals
        });
    } catch (error) {
        console.error("Error getting totals:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getMileage,
    updateMileage,
    resetMileage,
    deleteMileageHistory,
    saveQuarterlyTotal,
    saveYearlyTotalAndReset,
    getTotals
}