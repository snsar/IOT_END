const session = require('express-session');
const Health = require('../models/Health');
const nodemailer = require('nodemailer');
require('dotenv').config();

let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_CODE
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});


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

        res.redirect('back');
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
                predict_result: null
            },
            {
                where: { uid },
            }
        );

        res.redirect('back');

    } catch (error) {
        console.error('Error resetting measurements:', error);
    }
}

const getDataPredict = async (req, res) => {

    const uid = req.session.user.id;
    
    const healthData = await Health.findOne({
        where: { uid },
    });

    const data1 = healthData.dataValues;

    const new_data = {
        data: [
            [
                data1.temperature_1,
                data1.heart_rate_1,
                data1.spo2_1,
                data1.temperature_2,
                data1.heart_rate_2,
                data1.spo2_2,
                data1.temperature_3,
                data1.heart_rate_3,
                data1.spo2_3
            ]
        ]
    };
    
    const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(new_data)
    });

    // Lấy dữ liệu trả về từ API
    const predictionData = await response.json();
    const predict_result1 = predictionData.predicted_class;
    let data_save_db = 'Khoẻ mạnh';
    switch (predict_result1) {
        case 'healthy':
            data_save_db = 'Khoẻ mạnh';
            break;
        case 'fever':
            data_save_db = 'Bị ốm';
            break;
        case 'fatigued':
            data_save_db = 'Mệt mỏi';
            break;
        case 'heart pain':
            data_save_db = 'Bị đau tim';
            break;
    }

    Health.update(
        {
            predict_result: `${data_save_db}`
        },
        {
            where: { uid },
        }
    )

    var content = '';
        content += `
            <div style="padding: 10px; background-color: #003375">
                <div style="padding: 10px; background-color: white;">
                    <h4 style="color: #0085ff">Tình trạng sức khoẻ của bạn được AI của tôi dự đoán!</h4>
                    <h5 style="color: black">Kết quả: ${data_save_db}</h5>
                    <span style="color: black">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi ❤!</span>
                </div>
                <div style="width: 100%; color: #c3dd73;">
                    <p style="margin-top: 20px; font-size: 14px;">Best regards,</p>
                    <p>QuyenLT</p>
                </div>
                
            </div>
        `;

        let mailDetails = {
            from: {
                name: 'IOT TEAM',
                address: process.env.GMAIL_USER
            },
            to: req.session.user.email,
            subject: 'Tình trạng sức khoẻ',
            html: content,
        };
         
        await mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                console.log(err);
            } else {
                console.log('Email sent successfully');
            }
        });

    // Sử dụng dữ liệu predictionData cho các mục đích tiếp theo
    console.log(data_save_db); // In dữ liệu ra console
    res.redirect('back');
    
}

module.exports = {
    indexPredict,
    saveMeasurement,
    resetMeasurements,
    getDataPredict
}