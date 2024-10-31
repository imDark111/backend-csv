const express = require('express');
const router = express.Router();

// Importar los controladores de departments.js
const {getDepartments, uploadDepartmentsCSV,getDepartmentsById,addDepartments,updateDepartments,deleteDepartments} = require('../controllers/departments');
const multer = require('multer');
// Rutas para los endpoints de departamentos



// Configura multer para manejar la carga de archivos
const upload = multer({ dest: 'uploads/' });


router.post('/departments/cargar-csv', upload.single('file'), uploadDepartmentsCSV);
router.get('/departments', getDepartments);
router.get('/departments/:id', getDepartmentsById);
router.post('/departments', addDepartments);
router.put('/departments/:department_id', updateDepartments);
router.delete('/departments/:id', deleteDepartments);





module.exports = router;