const session = require('express-session');
const Health = require('../models/Health');


async function indexPredict(req, res) {
    const uid = req.session.user.id;

        // Retrieve health data based on uid
    const healthData = await Health.findOne({
        where: { uid },
    });
    // console.log(healthData);
    res.render('predict',  {healthData});
}

const saveMeasurement = async (req, res) => {
    try {
        const {
            measurementNumber,
            heartRate,
            temperature,
            spo2,
        } = req.body;

        // Assuming uid is coming from your authentication or session
        // const uid = req.session.user.id; // Replace with the actual user ID
        const uid = req.session.user ? req.session.user.id : 7;

        // Construct the column names dynamically based on the measurement number
        const columns = [
            'uid',
            `temperature_${measurementNumber}`,
            `heart_rate_${measurementNumber}`,
            `spo2_${measurementNumber}`,
        ];

        const data = {
            uid,
            [ `temperature_${measurementNumber}` ]: temperature,
            [ `heart_rate_${measurementNumber}` ]:  heartRate,
            [ `spo2_${measurementNumber}` ]: spo2,
        };

    

        // Save the measurement to the database
        const [instance, created] = await Health.findOrCreate({
            where: { uid: data.uid },
            defaults: data,
        });
        
        if (!created) {
            // If the record already exists, update it
            await instance.update(data);
        }


    } catch (error) {
        console.error('Error saving measurement:', error);
    }
};

async function resetMeasurements(req, res) {
    try {
        // Assuming you have a user ID in the session
        const uid = req.session.user.id; // Replace with your actual user ID retrieval logic

        // Reset the measurements for the user with the given ID
        await Health.update(
            {
                temperature_1: null,
                heart_rate_1: null,
                spo2_1: null,
                temperature_2: null,
                heart_rate_2: null,
                spo2_2: null,
                temperature_3: null,
                heart_rate_3: null,
                spo2_3: null,
            },
            {
                where: { uid },
            }
        );

    } catch (error) {
        console.error('Error resetting measurements:', error);
    }
}

module.exports = {
    indexPredict,
    saveMeasurement,
    resetMeasurements
}