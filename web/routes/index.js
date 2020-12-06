const express = require('express');
const router = express.Router();
const gdrive = require('../gdrive');
const formidable = require('formidable');

/* GET home page. */
router.get('/', async (req, res, next) => {
  let oauthClient;
  if (req.query.code)
    oauthClient = await gdrive.getAccessToken(req, res);
  else
    oauthClient = await gdrive.getAuthorization(res);

  res.render('index', { 
    title: 'Express', 
    audio: 'https://drive.google.com/uc?export=view&id=141WOah-IRriLkDDvl1V65kA_1bj3TCoj', 
    video: 'https://drive.google.com/uc?export=view&id=1H6xwm724tzwY3jmAWdKfpO-lmrAJb5Es', 
    image: 'https://drive.google.com/uc?export=view&id=1KCeQYsi4qtYWAgGbWGuDpZEDFM0Hwx3H', 
    auth: oauthClient != null 
  });
});

/* POST auth */
router.post('/auth', async (req, res, next) => {
  const oauthClient = await gdrive.getAuthorization(res);
  res.send(JSON.stringify(oauthClient));
})

/* POST a new video */
router.post('/videos', (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return console.log(err);

    const fileId = await gdrive.fileUpload(files.video.name, files.video.path, files.video.type, fields.folder);
    const videoUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    res.render('index', { title: 'Express', audio: '', video: videoUrl, image: '', auth: true });
  });
})

/* POST a new image */
router.post('/images', async (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return console.log(err);

    const fileId = await gdrive.fileUpload(files.image.name, files.image.path, files.image.type, fields.folder);
    const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    res.render('index', { title: 'Express', audio: '', video: '', image: imageUrl, auth: true });
  });
})

/* POST a new audio */
router.post('/audios', (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return console.log(err);

    const fileId = await gdrive.fileUpload(files.audio.name, files.audio.path, files.audio.type, fields.folder);
    console.log(fileId);
    const audioUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    res.render('index', { title: 'Express', audio: audioUrl, video: '', image: '', auth: true });
  });
})

module.exports = router;
