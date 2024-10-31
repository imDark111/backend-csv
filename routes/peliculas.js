const {Router} = require('express');
const router = Router();

var {getPeliculas} = require('../controllers/peliculas');

//routes endpoint para actores
router.get('/peliculas', getPeliculas);

module.exports = router;