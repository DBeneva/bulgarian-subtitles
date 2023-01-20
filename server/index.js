const express = require('express');
const fs = require('fs');
const file = fs.readdirSync('../../').filter(f => f.endsWith('.txt'))[0];

start();

async function start() {
    const app = express();
    const router = express.Router();

    // Solve CORS problem
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        next();
    });

    app.use(express.json());
    app.use('/', router);
    
    router.get('/', async (req, res) => {
        try {
            const script = fs.readFileSync(`../../${file}`, 'utf8');
            res.json(script);
        } catch (err) {
            res.status(err.status || 400).json(err.message);
        }
    });

    router.post('/', async (req, res) => {
        try {
            fs.writeFileSync(`../../${file || 'subtitles.txt'}`, req.body.subtitles);
            res.json({});
        } catch (err) {
            res.status(err.status || 400).json(err.message);
        }
    });

    router.post('/vtt', async (req, res) => {
        try {
            fs.writeFileSync('../../subtitles.vtt', req.body.subtitles);
            res.json({});
        } catch (err) {
            res.status(err.status || 400).json(err.message);
        }
    });

    app.listen(3000, () => console.log(`Application started at http://localhost:3000...`));
}