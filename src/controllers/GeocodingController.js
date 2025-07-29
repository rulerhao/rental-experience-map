const GeocodingService = require('../services/GeocodingService');

class GeocodingController {
    constructor() {
        this.geocodingService = new GeocodingService();
    }

    async geocodeAddress(req, res) {
        const { address } = req.body;
        
        try {
            const result = await this.geocodingService.geocodeAddress(address);
            res.json(result);
        } catch (error) {
            res.status(500).json({ 
                status: 'ERROR',
                error: 'Geocoding failed' 
            });
        }
    }
}

module.exports = GeocodingController;