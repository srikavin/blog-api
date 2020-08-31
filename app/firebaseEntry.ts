import * as functions from 'firebase-functions';
import app from './app';

exports.blog_api = functions.region('us-central1').https.onRequest(app);
