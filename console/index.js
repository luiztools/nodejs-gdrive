//index.js
const gdrive = require("./gdrive");
gdrive.imageUpload("imagem.jpg", "./imagem.jpg", (id) => {
    console.log(id);
});