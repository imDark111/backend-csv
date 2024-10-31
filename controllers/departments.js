const {Pool} = require('pg');
const { Parser } = require('json2csv');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const multer = require('multer');

const pool = new Pool ({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'utm123',
    database: 'HR',
    port: 5432
});




const upload = multer({ dest: 'uploads/' }); 
// Endpoint para 
async function uploadDepartmentsCSV(req, res) {
    const departments = [];
    let duplicates = 0;
    let invalidEntries = 0;

    
    if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ningún archivo.' });
    }

    const filePath = req.file.path;

    
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            const { department_id, department_name, manager_id, location_id } = row;

            if (isNaN(department_id) || department_id === '') {
                invalidEntries++;
                return;
            }

            const parsedDepartmentId = parseInt(department_id);
            const parsedManagerId = manager_id !== '' ? parseInt(manager_id) : null;
            const parsedLocationId = location_id !== '' ? parseInt(location_id) : null;

            departments.push([parsedDepartmentId, department_name, parsedManagerId, parsedLocationId]);
        })
        .on('end', async () => {
            const client = await pool.connect();
            const query = `
                INSERT INTO departments (department_id, department_name, manager_id, location_id)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (department_id) DO NOTHING;
            `;

            try {
                for (const values of departments) {
                    const result = await client.query(query, values);
                    if (result.rowCount === 0) {
                        duplicates++;
                    }
                }
                client.release();
                fs.unlinkSync(filePath); 
                let message = `Departamentos cargados desde el archivo CSV exitosamente.`;
                if (duplicates > 0) message += ` ${duplicates} duplicados no se añadieron.`;
                if (invalidEntries > 0) message += ` ${invalidEntries} filas no válidas ignoradas.`;
                res.status(201).json({ message });
            } catch (error) {
                client.release();
                fs.unlinkSync(filePath);
                console.error(error);
                res.status(500).json({ error: 'Error al cargar los departamentos' });
            }
        })
        .on('error', (error) => {
            fs.unlinkSync(filePath);
            console.error(error);
            res.status(500).json({ error: 'Error al procesar el archivo CSV' });
        });
}
// Endpoint para obtener todos los departamentos
async function getDepartments(req, res) {
    try {
        const client = await pool.connect();
        console.log('Conexión exitosa');
        const result = await pool.query('SELECT * FROM departments');
        client.release();

        
        const format = req.query.format || 'json'; 

        if (format === 'csv') {
            try {
                const json2csvParser = new Parser();
                const csvData = json2csvParser.parse(result.rows);

                const filePath = path.join('D:\\2024-E2\\Programacion Web\\archivos\\Guardar', 'departments.csv');
                fs.writeFileSync(filePath, csvData);

                res.header('Content-Type', 'text/csv');
                res.header('Content-Disposition', 'attachment; filename="departments.csv"');
                res.send(csvData);
            } catch (error) {
                console.error('Error al convertir los datos a CSV:', error);
                res.status(500).json({ error: 'Error al convertir los datos a CSV' });
            }
        } else {
            res.json(result.rows);
        }
    } catch (error) {
        console.error('Error al obtener departamentos:', error);
        res.status(500).json({ error: 'Error al obtener departamentos' });
    }
}


//Endpoint para obtener departamento por ID
async function getDepartmentsById(req, res) {
    const { id } = req.params;
    
   
    if (isNaN(id)) {
        return res.status(400).json({ error: 'El ID debe ser un número válido' });
    }

    const query = 'SELECT * FROM departments WHERE department_id = $1';
    const values = [parseInt(id)]; 

    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount > 0) {
            res.json(result.rows);
        } else {
            res.status(404).json({ error: 'Departamento no encontrado' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

// Endpoint para agregar un nuevo empleado
async function addDepartments(req, res) {
    const { department_id, department_name, manager_id, location_id } = req.body;
    const query = `INSERT INTO departments (department_id, department_name, manager_id, location_id) 
                   VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [department_id, department_name, manager_id, location_id];
  
    try {
      const client = await pool.connect();
      const result = await client.query(query, values);
      client.release();
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error al agregar el departamento' });
    }
  }


// Endpoint para modificar un empleado
async function updateDepartments(req, res) {
    const { department_id } = req.params;
    const {  department_name, manager_id, location_id} = req.body;
    const query = `
        UPDATE departments
        SET department_name = $1 , manager_id = $2, location_id = $3
        WHERE department_id = $4
        RETURNING *;
    `;
    const values = [department_name, manager_id, location_id,department_id];

    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'departamento no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al modificar el departamento' });
    }
}


// Endpoint para eliminar un departamento
async function deleteDepartments(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM departments WHERE department_id = $1 RETURNING *;';
    const values = [id];

    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'departamento no encontrado' });
        }
        res.status(200).json({ message: 'departamento eliminado exitosamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al eliminar el departamento' });
    }
}
module.exports = {
    getDepartments,
    uploadDepartmentsCSV,
    getDepartmentsById,
    addDepartments,
    updateDepartments,
    deleteDepartments
    
}