const {Pool} = require('pg');

const pool = new Pool ({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'utm123',
    database: 'HR',
    port: 5432
});

async function getEmployees(req, res){
    try{
        const client = await pool.connect();
        console.log ('Conexion exitosa')
        const result = await pool.query('SELECT * FROM employees');
        client.release();
        res.json(result.rows);
    }catch (error){
        console.log(error)
        res.status(500).json({error: 'Error al obtener empleados'});
    }
}

async function getEmployeesById(req, res){
    const {id} = req.params
    const query = 'SELECT * FROM employees WHERE employee_id = $1'
    const values = [id];
    try{
        const client = await pool.connect();
        const result = await client.query(query,values)
        client.release();
        if(result.rowCount > 0){
            res.json(result.rows)
        }else{
            res.status(400).json({error: 'Error al obtener al empleado por ID'});
        }
     }catch (error){
        console.log(error)
        res.status(500).json({error: 'Error en el Servidor'});
}
}

// Endpoint para agregar un nuevo empleado
async function addEmployees(req, res) {
    const { employee_id, first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id } = req.body;
    const query = `INSERT INTO employees (employee_id, first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11) RETURNING *`;
    const values = [employee_id, first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id];
  
    try {
      const client = await pool.connect();
      const result = await client.query(query, values);
      client.release();
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error al agregar el empleado' });
    }
  }


// Endpoint para modificar un empleado
async function updateEmployees(req, res) {
    const { employee_id } = req.params;
    const {  first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id } = req.body;
    const query = `
        UPDATE employees 
        SET first_name = $1 , last_name = $2, email = $3, phone_number = $4, hire_date = $5, job_id = $6, salary = $7, commission_pct= $8 , manager_id= $9, department_id = $10
        WHERE employee_id = $11
        RETURNING *;
    `;
    const values = [first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id, employee_id];

    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'empleado no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al modificar el empleado' });
    }
}


// Endpoint para eliminar un empleado
async function deleteEmployees(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM employees WHERE employee_id = $1 RETURNING *;';
    const values = [id];

    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'empleado no encontrado' });
        }
        res.status(200).json({ message: 'empleado eliminado exitosamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al eliminar el empleado' });
    }
}
module.exports = {
    getEmployees,
    getEmployeesById,
    addEmployees,
    updateEmployees,
    deleteEmployees
}