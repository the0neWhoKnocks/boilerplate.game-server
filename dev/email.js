var nodemailer = require('nodemailer');
var appConfig = require('../conf.app.js');
var emailConfig = require('../sys.email.js');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailConfig.email,
    pass: emailConfig.pass
  }
});

module.exports = {
  sendMail: function(opts){
    // setup email data with unicode symbols
    var mailOptions = {
      from: `"${ opts.from.name }" <${ opts.from.email }>`, // sender address
      to: opts.to.join(', '), //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
      subject: opts.subject, // Subject line
      text: opts.body.text, // plain text body
      html: opts.body.html // html body
    };
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(err, info){
      if( err ){
        return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    });
  }
};