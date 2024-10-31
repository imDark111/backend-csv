const {Router} = require('express');
const router = Router();

var {getActores, getActoresById, addActor, updateActor, deleteActor} = require('../controllers/actores');

// Routes endpoint para actores
router.get('/actores', getActores);
router.get('/actor/:id', getActoresById);
router.post('/actores', addActor);
router.put('/actores/:cod_act', updateActor);
router.delete('/actor/:id', deleteActor);
module.exports = router;