import twilio from 'twilio';
import config from '../config';

export const twilioClient = twilio(config.twilio_sid, config.twilio_auth_token);
