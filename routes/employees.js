const {Router} = require('express');
const router = Router();

// Importar los controladores necesarios
var {getEmployees, getEmployeesById, addEmployees, updateEmployees, deleteEmployees} = require('../controllers/employees');

// Definir las rutas para los empleados
router.get('/employees', getEmployees);
router.get('/employees/:id', getEmployeesById);
router.post('/employees', addEmployees);
router.put('/employees/:employee_id', updateEmployees);
router.delete('/employees/:id', deleteEmployees);

// Exportar el router
module.exports = router;