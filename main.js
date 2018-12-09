const utils = require('./lib/utils');

class MercedesMeConnect {

    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    init() {
        return new Promise((resolve, reject) => {
            return utils.authorize(this.clientId, this.clientSecret)
            .then(tokens => {
                this.tokens = tokens;
                return utils.getClient(this.tokens.access_token);
            })
            .then(client => {
                this.client = client;

                resolve();
            });
        });
    }

    getVehicles() {
        return this.client.apis.Vehicles.getAllVehicles();
    }

    getVehicleById(vehicleId) {
        return this.client.apis.Vehicles.getVehicleById({ vehicleId });
    }

    getTires(vehicleId) {
        return this.client.apis.Tires.getTiresStatus({ vehicleId });
    }

    getDoors(vehicleId) {
        return this.client.apis.Doors.getDoorsStatus({ vehicleId });
    }

    setDoors(vehicleId, state) {
        const stateString = state ? "LOCK" : "UNLOCK";
        return this.client.apis.Doors.postDoors({ vehicleId, command: stateString });
    }

    getLocation(vehicleId) {
        return this.client.apis.Location.getLocation({ vehicleId });
    }

    getOdometer(vehicleId) {
        return this.client.apis.Odometer.getOdometerStatus({ vehicleId });
    }

    getFuel(vehicleId) {
        return this.client.apis.Fuel.getFuelLevel({ vehicleId });
    }

    getCharge(vehicleId) {
        return this.client.apis['State of Charge']['getStateOfCharge']({ vehicleId });
    }
}

module.exports = MercedesMeConnect;