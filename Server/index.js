const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

// Simulación de datos de anuncios con los enlaces proporcionados
let ads = [
    {
        type: "video",
        url: "https://publinet-prod.s3.amazonaws.com/assets/extras/latinad/contenidos-demo/videos/horizontales/video-horizontal-00001.mp4",
        length: 10000,
        position: 1,
        fill_screen: true,
        from_date: "2023-01-01 00:00:00",
        to_date: "2024-12-31 23:59:59",
        updated_at: "2023-01-01 00:00:00",
        _id: "aLdPdBhBWtwQAoWV"
    },
    {
        type: "video",
        url: "https://publinet-prod.s3.amazonaws.com/assets/extras/latinad/contenidos-demo/videos/verticales/video-vertical-00001.mp4",
        length: 10000,
        position: 2,
        fill_screen: false,
        from_date: "2023-01-01 00:00:00",
        to_date: "2024-12-31 23:59:59",
        updated_at: "2023-01-01 00:00:00",
        _id: "3PBAd8OHMfOjtZnk"
    },
    {
        type: "video",
        url: "https://publinet-prod.s3.amazonaws.com/assets/extras/latinad/contenidos-demo/videos/cuadrados/video-cuadrado-00001.mp4",
        length: 10000,
        position: 3,
        fill_screen: true,
        from_date: "2023-01-01 00:00:00",
        to_date: "2024-12-31 23:59:59",
        updated_at: "2023-01-01 00:00:00",
        _id: "RnyoM4WHHHix7Owh"
    },
    {
        type: "image",
        url: "https://publinet-prod.s3.amazonaws.com/assets/extras/latinad/contenidos-demo/imagenes/verticales/imagen-vertical-00001.jpg",
        length: 5000,
        position: 4,
        fill_screen: false,
        from_date: "2023-01-01 00:00:00",
        to_date: "2024-12-31 23:59:59",
        updated_at: "2023-01-01 00:00:00",
        _id: "rodPLKcSQXMQQSli"
    },
    {
        type: "image",
        url: "https://publinet-prod.s3.amazonaws.com/assets/extras/latinad/contenidos-demo/imagenes/horizontales/imagen-horizontal-00001.png",
        length: 5000,
        position: 5,
        fill_screen: true,
        from_date: "2023-01-01 00:00:00",
        to_date: "2024-12-31 23:59:59",
        updated_at: "2023-01-01 00:00:00",
        _id: "W7WK2RJImsdSOHC7"
    },
    {
        type: "image",
        url: "https://publinet-prod.s3.amazonaws.com/assets/extras/latinad/contenidos-demo/imagenes/cuadradas/imagen-cuadrada-00001.png",
        length: 5000,
        position: 6,
        fill_screen: true,
        from_date: "2023-01-01 00:00:00",
        to_date: "2024-12-31 23:59:59",
        updated_at: "2023-01-01 00:00:00",
        _id: "lRhf4N7hkoffBlRO"
    }
];

// Endpoint para obtener los anuncios
app.get('/ads', (req, res) => {
    const currentDate = new Date().toISOString();
    const activeAds = ads.filter(ad => ad.from_date <= currentDate && ad.to_date >= currentDate);
    res.json(activeAds);
});

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
