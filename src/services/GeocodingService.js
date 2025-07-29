class GeocodingService {
    constructor() {
        this.baseUrl = 'https://nominatim.openstreetmap.org/search';
        this.userAgent = 'RentalExperienceMap/1.0';
    }

    async geocodeAddress(address) {
        try {
            const response = await fetch(
                `${this.baseUrl}?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': this.userAgent
                    }
                }
            );
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                const result = data[0];
                return {
                    status: 'OK',
                    results: [{
                        formatted_address: result.display_name,
                        geometry: {
                            location: {
                                lat: parseFloat(result.lat),
                                lng: parseFloat(result.lon)
                            }
                        }
                    }]
                };
            } else {
                return {
                    status: 'ZERO_RESULTS',
                    results: []
                };
            }
        } catch (error) {
            console.error('Geocoding 錯誤:', error);
            throw new Error('Geocoding failed');
        }
    }
}

module.exports = GeocodingService;