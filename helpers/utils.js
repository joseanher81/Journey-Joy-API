// Check if any field in an array of fields is empty
const checkEmptyFields = (fields) => {
    let emptyFields = [];
    for (const [key, value] of Object.entries(fields)) {
      if (!value) {
        emptyFields.push(key);
      }
    }
    return emptyFields;
};

// Load a picture from Unsplash service for a given place
const loadPlacePicture = async(place) => {
  
  try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${place}&client_id=${process.env.UNSPLASH_KEY}`);
      
      
      if (!response.ok) {
        throw new Error('Unsplash API error');
      }
  
      const data = await response.json();
      const photo = data.results[0]; // First image from results
      const photoUrl = photo.urls.regular; // Photo url

      return photoUrl;
  } catch (error) {
    console.log("Error in loadPlacePicture", error);
    throw new Error(error);
  }
}

// Return ISO and Country name for a given place
const findISOAndCountryByPlace = async(place) => {
    try {

        const res = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(place)}&key=${process.env.GEOLOCATION_KEY}&no_annotations=1`;
    
        
        const response = await fetch(res);
        const data = await response.json();
    
        if (data.results.length > 0) {
          const result = data.results[0];
          console.log('results', result)
          const countryCode = result.components['ISO_3166-1_alpha-3']; // country ISO code
          const countryName = result.components['country']; 
          return [countryCode, countryName];
        } else {
          throw new Error('Could not get location info');
        }
      } catch (error) {
        console.log("Error in findISOAndCountryByPlace", error);
        throw error;
      }
} 

  
module.exports = { checkEmptyFields, loadPlacePicture, findISOAndCountryByPlace };
  