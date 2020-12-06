const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = './token.json';
const fs = require('fs');
const credentials = require('./credentials.json');
const { google } = require('googleapis');

function getOAuthClient() {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

async function getAuthorization(response) {
    const oAuth2Client = getOAuthClient();

    if (!fs.existsSync(TOKEN_PATH)) {
        const url = await oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        return response.redirect(url);
    }

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);

    return oAuth2Client;
}

async function getAccessToken(request, response) {
    try {
        const oAuth2Client = getOAuthClient();
        const {tokens} = await oAuth2Client.getToken(request.query.code);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        return getAuthorization(response);
    } catch (err) {
        return console.error('Error retrieving access token', err);
    }
}

async function listFiles() {
    const oauthClient = await getAuthorization();
    const drive = google.drive({ version: 'v3', auth: oauthClient });

    try {
        const res = await drive.files.list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name)',
        });

        return res.data.files;
    } catch (err) {
        return console.log('The API returned an error: ' + err);
    }
}

async function fileUpload(fileName, filePath, mimeType, folderId) {
    const oauthClient = await getAuthorization();
    const fileMetadata = { 
        name: fileName,
        parents: [folderId]
    };

    const media = {
        mimeType,// "image/jpeg",
        body: fs.createReadStream(filePath)
    }

    const drive = google.drive({ version: 'v3', auth: oauthClient });

    try {
        const file = await drive.files.create({
            resource: fileMetadata,
            media: media
        });
        
        return file.data.id;
    } catch (err) {
        return console.log('The API returned an error: ' + err);
    }
}

module.exports = { listFiles, getAccessToken, getAuthorization, fileUpload }