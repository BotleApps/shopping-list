/**
 * Format a date as a relative time string (e.g., "Today", "Yesterday", "3 days ago")
 */
export const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else if (diffDays < 14) {
        return '1 week ago';
    } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} weeks ago`;
    } else if (diffDays < 60) {
        return '1 month ago';
    } else {
        return date.toLocaleDateString();
    }
};

/**
 * Calculate when a product will run out based on consumption duration and quantity
 */
export const calculateRunOutDate = (consumptionDuration, quantity = 1) => {
    const totalDays = consumptionDuration * quantity;
    const runOutDate = new Date();
    runOutDate.setDate(runOutDate.getDate() + totalDays);

    const options = { month: 'short', day: 'numeric' };
    return runOutDate.toLocaleDateString('en-US', options);
};

/**
 * Get a friendly date string for run out prediction
 */
export const getRunOutPrediction = (consumptionDuration, quantity = 1) => {
    const totalDays = consumptionDuration * quantity;
    const date = calculateRunOutDate(consumptionDuration, quantity);

    if (totalDays <= 3) {
        return `Runs out soon (${date})`;
    } else if (totalDays <= 7) {
        return `Runs out by ${date}`;
    } else {
        return `Lasts until ${date}`;
    }
};
