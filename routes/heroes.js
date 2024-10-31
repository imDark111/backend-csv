const { Router } = require('express');
const router = Router();

var { getHeroes, getHeroeById, addHeroe, updateHeroe, deleteHeroe } = require('../controllers/heroes');

// Routes endpoint para heroes
router.get('/heroes', getHeroes);
router.get('/heroe/:id', getHeroeById);
router.post('/heroes', addHeroe);
router.put('/heroes/:codigo', updateHeroe);
router.delete('/heroes/:id', deleteHeroe);

module.exports = router;
