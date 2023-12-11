const nodemailer = require('nodemailer');

const sendEmail = async options => {

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_HOST,
        // host: process.env.EMAIL_HOST,
        // port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })


    const html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blue Button</title>
    <style>
        /* Style for the container div */
        .container {
            text-align: center;
            margin: 20px;
        }

        /* Style for the link button */
        .blue-button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            text-align: center;
            text-decoration: none;
            color: #fff; /* Text color */
            background-color: #3498db; /* Blue color */
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }

        .blue-button:hover {
            background-color: #2980b9; /* Darker blue on hover */
        }
    </style>
</head>
<body>

    <div class="container">
        <a href=${process.env.CLIENT_URL + '/changePassword/' + options.resetToken} class="blue-button">Change Password</a>
    </div>

</body>
</html>
`

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: options.email,
        subject: options.subject,
        // text: options.message,
        html
    }
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail