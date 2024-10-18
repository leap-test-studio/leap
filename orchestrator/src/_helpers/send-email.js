const nodemailer = require("nodemailer");
const path = require("path");
const EmailTemplates = require("swig-email-templates");
const templates = new EmailTemplates({
  root: path.join(__dirname, "templates")
});

module.exports = sendMailTemplate;

function sendMailTemplate(to, templateName, context, subject) {
  context.client = process.env.CLIENT_NAME || "LEAP";
  context.PUBLIC_URL = global.config.PUBLIC_URL;
  let mailOptions;
  return new Promise(function (resolve, reject) {
    if (!global.config.SMTP_ENABLED) {
      console.log("smtp is disabled", context);
      return resolve(true);
    }
    const config = global.config?.smtp;

    templates.render(templateName, context, function (err, html, text) {
      mailOptions = {
        from: context.client + " <" + config?.from + ">",
        to: to,
        html: html,
        body: "Hello",
        text: text,
        subject: subject
      };
      const transport = nodemailer.createTransport(config?.smtpOptions);

      // verify connection configuration
      transport.verify(function (error1) {
        if (error1) {
          console.error("Error in verifying mail credentials: ", error1);
          return reject(error1);
        } else {
          // sending email
          transport.sendMail(mailOptions, function (error, res) {
            if (error) {
              console.error("Mail sending failed: " + error);
              return resolve(false);
            } else {
              console.log(res);
              return resolve(true);
            }
          });
        }
      });
    });
  });
}
