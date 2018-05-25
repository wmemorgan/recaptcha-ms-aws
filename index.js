const https = require('https');
const request = require('request');
const querystring = require('querystring');
const AWS = require("aws-sdk");
const secretKey = process.env.SECRET;
const contactformapi = process.env.CONTACTFORMAPI;

exports.handler = (event, context, callback) => {
  // Validate the recaptcha
  const input_data = event;
  console.log('input_data is: ', input_data);
  console.log('Captcha Response is: ', input_data['g-recaptcha-response']);
  const postData = querystring.stringify({
    'secret': secretKey,
    'response': input_data['g-recaptcha-response']
  });
 
  console.log('postData is: ', postData);
  const options = {
    hostname: 'www.google.com',
    port: 443,
    path: '/recaptcha/api/siteverify',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const body = {
    name: input_data['name'],
    company: input_data['company'],
    email: input_data['email'],
    phone: input_data['phone'],
    subject: 'From WILFREMORGAN.COM',
    message: input_data['message']
  }

  const req = https.request(options, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      const captchaResponse = JSON.parse(chunk);
      console.log('captchaResponse is: ', captchaResponse)
      if (captchaResponse.success) {
        console.log('Success! Sending the following contents to the contact form:', body)
        const submitContactForm = new request(contactformapi, {
          method: 'POST',
          // NOTE: change this setting in production
          mode: 'no-cors',
          body: JSON.stringify(body)
        });
      } else {
        callback(null, {
          statusCode: '500',
          headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
          },
          body: JSON.stringify({ message: 'Invalid recaptcha' })
        });
      }
    });
  });

  req.on('error', (e) => {
    callback(null, {
      statusCode: '500',
      headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify({ message: e.message })
    });
  });

  // write data to request body
  req.write(postData);
  req.end();
};