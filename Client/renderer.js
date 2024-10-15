const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const Datastore = require('nedb');

let ads = [];
let currentAdIndex = 0;
const db = new Datastore({ filename: 'ads.db', autoload: true });
const downloadDir = path.join(__dirname, 'downloads');

// Crear carpeta para descargas si no existe
fs.ensureDirSync(downloadDir);

async function downloadFile(url, filename, updatedAt) {
    const filePath = path.join(downloadDir, filename);

    // Si el archivo ya existe y está actualizado, no descargarlo de nuevo
    if (fs.existsSync(filePath)) {
        const stats = await fs.promises.stat(filePath);
        const fileModifiedTime = new Date(stats.mtime);

        if (fileModifiedTime >= new Date(updatedAt)) {
            console.log(`El archivo ${filename} ya está actualizado.`);
            return filePath;
        }
    }

    try {
        console.log(`Descargando archivo: ${filename} desde ${url}`);
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        // Verifica si la solicitud fue exitosa
        if (response.status !== 200) {
            console.error(`Error en la descarga del archivo. Status: ${response.status}`);
            return null;
        }

        const writer = fs.createWriteStream(filePath);

        // Pipe para escribir el archivo en disco
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', async () => {
                const fileSize = (await fs.promises.stat(filePath)).size;
                
                if (fileSize > 0) {
                    console.log(`Archivo descargado exitosamente: ${filename} (${fileSize} bytes)`);
                    resolve(filePath);
                } else {
                    console.error(`El archivo ${filename} tiene 0 KB. Descarga fallida.`);
                    reject(new Error(`El archivo ${filename} tiene 0 KB.`));
                }
            });
            writer.on('error', (err) => {
                console.error(`Error escribiendo el archivo ${filename}:`, err);
                reject(err);
            });
        });
    } catch (error) {
        console.error(`Error durante la descarga del archivo ${filename} desde ${url}:`, error.message);
        return null;
    }
}


// Obtener anuncios del backend y guardarlos en NeDB
async function fetchAds() {
    try {
        const response = await axios.get('http://localhost:3000/ads');
        const newAds = response.data;

        for (let ad of newAds) {
            const filename = path.basename(ad.url);

            // Primero verificamos si el anuncio ya existe en la base de datos
            db.findOne({ _id: ad._id }, async (err, existingAd) => {
                if (err) return console.error("Error al buscar en la base de datos", err);
                
                // Si no existe o ha sido actualizado, lo descargamos y actualizamos la base de datos
                if (!existingAd || new Date(ad.updated_at) > new Date(existingAd.updated_at)) {
                    ad.localPath = await downloadFile(ad.url, filename, ad.updated_at);
                    db.update({ _id: ad._id }, ad, { upsert: true }, (err) => {
                        if (err) console.error("Error al actualizar el anuncio", err);
                    });
                }
            });
        }

        // Cargar anuncios locales después de la actualización
        db.find({}, (err, docs) => {
            if (err) return console.error(err);
            ads = docs;
            console.log("Anuncios cargados localmente:", ads);
            playAds(); // Reproducir anuncios después de cargar la base de datos
        });
    } catch (error) {
        console.error("Error al obtener los anuncios", error);
    }
}

// Llamar a fetchAds cada 10 segundos
setInterval(fetchAds, 10000);

let videoElement = document.getElementById('video-player');
let imgElement = document.getElementById('img-player');

// Función para reproducir los anuncios
function playAds() {
    if (ads.length === 0) return;

    const currentAd = ads[currentAdIndex];

    if (currentAd.type === 'video') {
        showVideoAd(currentAd);
    } else if (currentAd.type === 'image') {
        showImageAd(currentAd);
    }

    // Precargar el siguiente anuncio
    const nextAdIndex = (currentAdIndex + 1) % ads.length;
    const nextAd = ads[nextAdIndex];
    preloadAd(nextAd);

    // Cambiar al siguiente anuncio tras la duración especificada
    setTimeout(() => {
        currentAdIndex = nextAdIndex;
        playAds();
    }, currentAd.length);
}

// Preload de anuncio (precarga en segundo plano)
function preloadAd(ad) {
    if (ad.type === 'video') {
        videoElement.src = ad.localPath;
    } else if (ad.type === 'image') {
        imgElement.src = ad.localPath;
    }
}

// Mostrar video
function showVideoAd(ad) {
    imgElement.style.display = 'none'; // Ocultar imagen si está visible
    videoElement.src = ad.localPath;   // Establecer el path local del video
    videoElement.style.display = 'block';
    videoElement.style.objectFit = ad.fill_screen ? 'fill' : 'contain';
    videoElement.play();
}

// Mostrar imagen
function showImageAd(ad) {
    videoElement.style.display = 'none'; // Ocultar video si está visible
    imgElement.src = ad.localPath;       // Establecer el path local de la imagen
    imgElement.style.display = 'block';
    imgElement.style.objectFit = ad.fill_screen ? 'fill' : 'contain';
}
