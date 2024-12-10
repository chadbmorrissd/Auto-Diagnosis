
import axios from 'axios';

const NHTSA_API_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

export async function fetchCarData() {
  try {
    // Get all makes
    const makesResponse = await axios.get(
      `${NHTSA_API_URL}/GetAllMakes?format=json`
    );
    const makes = makesResponse.data.Results;

    // Get detailed information for each make
    const carData = await Promise.all(
      makes.slice(0, 100).map(async (make) => { // Process in batches to avoid rate limiting
        try {
          const modelsResponse = await axios.get(
            `${NHTSA_API_URL}/GetModelsForMakeId/${make.Make_ID}?format=json`
          );
          
          const yearsResponse = await axios.get(
            `${NHTSA_API_URL}/GetModelYearsForMakeId/${make.Make_ID}?format=json`
          );

          const availableYears = yearsResponse.data.Results.map(y => parseInt(y.ModelYear)).filter(y => !isNaN(y));
          const yearStart = Math.min(...availableYears);
          const yearEnd = Math.max(...availableYears);

          const models = modelsResponse.data.Results.map(model => ({
            name: model.Model_Name,
            yearStart: yearStart,
            yearEnd: yearEnd
          }));

          return {
            name: make.Make_Name,
            models: models
          };
        } catch (error) {
          console.error(`Error fetching data for ${make.Make_Name}:`, error);
          return {
            name: make.Make_Name,
            models: []
          };
        }
      })
    );

    return carData.filter(make => make.models.length > 0);
  } catch (error) {
    console.error('Error fetching car data:', error);
    throw error;
  }
}
