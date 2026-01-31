/**
 * Generates a unique product code based on the product name.
 * @param {string} name - The full name of the product.
 * @param {string} category - Optional category prefix.
 * @returns {string} - The generated product code.
 */
function generateProductCode(name) {
    // 1. Clean the name and split into words
    const cleanName = name.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
    const words = cleanName.split(/\s+/).filter(word => word.length > 0);

    // 2. Build the prefix from word initials (up to 3 words)
    let prefix = words.map(word => word[0]).join('').slice(0, 3);
    
    // Fallback if the name is only one word
    if (words.length === 1) {
        prefix = words[0].slice(0, 3);
    }

    // 3. Generate a short unique identifier (random hex or timestamp)
    const uniqueId = Math.random().toString(36).substring(2, 6).toUpperCase();

    // 4. Get current Year/Month for versioning
    const datePart = new Date().getFullYear().toString().slice(-2);

    return `${prefix}-${uniqueId}-${datePart}`;
}

export default generateProductCode;