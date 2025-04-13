/**
 * Function to add data to a Google Sheet via a web app URL
 * The data will be displayed in enterprise-grade formatting with row-oriented keys
 * 
 * @param {Object} data - The data to be added to the sheet (contains metadata, mixingStep, phAdjustment)
 * @returns {Promise} A promise that resolves to the response from the sheet
 */
export async function addToSheet(data) {
  try {

    // Create form data object for the request
    const formData = new FormData();

    // Add each data section to the form data
    if (data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata));
    }

    if (data.mixingStep) {
      formData.append('mixingStep', JSON.stringify(data.mixingStep));
    }

    if (data.phAdjustment) {
      formData.append('phAdjustment', JSON.stringify(data.phAdjustment));
    }

    // Add a timestamp for tracking
    formData.append('timestamp', new Date().toISOString());

    // Make the POST request to the Google Apps Script
    const response = await fetch(import.meta.env.VITE_GOOGLE_SHEET_WEB_APP_URL, {
      method: 'POST',
      body: formData
    });

    // Handle response
    if (!response.ok) {
      throw new Error(`Failed to add data to sheet: ${response.status}`);
    }

    // Get response as text
    const responseText = await response.text();

    // Try parsing as JSON if possible
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      // If not valid JSON, return the text in a simple object
      result = {
        status: "success",
        message: responseText
      };
    }

    console.log("Data successfully added to sheet:", result);
    return result;
  } catch (error) {
    console.error("Error adding data to sheet:", error);
    throw error;
  }
}
