import createTransport from "../services/node-mailer/create-transporter.js";
import sendMail from "../services/node-mailer/send-mail.js";
import getText from './lang/get-text.js';
import errorHelper from './helpers/error-helper.js';


export default async (email, name, confirmCode, lang, type, req, res) => {

  if (!email || !confirmCode || (lang !== 'tr' && lang !== 'en')) {
    return res.status(400).send(errorHelper('00005', req)).end();
  }

  const emailTransfer = await createTransport();

  let body = '';
  //NOTE: You can customize the message that will be sent to the newly registered users according to your pleasure.
  if (type == 'register') {
    body = `${getText(lang, 'welcomeCode')} ${name} !\r\n\r\n${getText(lang, 'verificationMail')} ${email} \r\n\r\n${getText(lang, 'verificationCodeBody')} ${confirmCode} - \r\n\r\n${getText(lang, 'verificationUrl')}`;
  } else {
    body = `${getText(lang, 'verificationCodeBody')} ${confirmCode} - \r\n\r\n${getText(lang, 'verificationUrlSet')}`;
  }

  const check = await sendMail({ transporter: emailTransfer, emailTo: email, subject: getText(lang, 'verificationCodeTitle'), mail: body }).catch((err) => {
    return err;
  });
  return check;
};
