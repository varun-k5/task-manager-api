const mailgun = require("mailgun-js");

const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
});

const sendWelcomeEmail=(email,name)=>{
    mg.messages().send({	
        from:'sample@gmail.com',//You can enter your email id here
        to: email,
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    },(error,body)=>{
        console.log(error)
        console.log(body)
    })
}

const sendCancelationEmail=(email,name)=>{
    mg.messages().send({	
        from:'sample@gmail.com',//You can enter your email id here
        to: email,
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`
    },(error,body)=>{
       // console.log(body)
    })
}

module.exports={
    sendWelcomeEmail,
    sendCancelationEmail
}