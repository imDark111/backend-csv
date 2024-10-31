const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'utm123',
    database: 'hollywood',
    port: 5432
});

// Endpoint para devolver todos los héroes
async function getHeroes(req, res) {
    const { name, house } = req.query;
    let query = 'SELECT * FROM heroes';
    const values = [];
    
    // Construir la cláusula WHERE según los parámetros proporcionados
    if (name && house) {
        query += ' WHERE nombre ILIKE $1 OR casa ILIKE $2';
        values.push(`%${name}%`, `%${house}%`);
    } else if (name) {
        query += ' WHERE nombre ILIKE $1';
        values.push(`%${name}%`);
    } else if (house) {
        query += ' WHERE casa ILIKE $1';
        values.push(`%${house}%`);
    }
    
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al obtener héroes' });
    }
}




// Endpoint para devolver un héroe por ID
async function getHeroeById(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM heroes WHERE codigo = $1';
    const values = [id];
    try {
        const result = await pool.query(query, values);
        if (result.rowCount > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Héroe no encontrado' });
        }
    } catch (error) {
        console.error('Error en getHeroeById:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

// Endpoint para agregar un nuevo héroe
async function addHeroe(req, res) {
    const { codigo, nombre, bio, img, aparicion, casa } = req.body;
    const query = `INSERT INTO heroes (codigo, nombre, bio, img, aparicion, casa) 
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [codigo, nombre, bio, img, aparicion, casa];
    try {
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error en addHeroe:', error);
        res.status(500).json({ error: 'Error al agregar el héroe' });
    }
}

// Endpoint para modificar un héroe
async function updateHeroe(req, res) {
    const { codigo } = req.params;
    const { nombre, bio, img, aparicion, casa } = req.body;
    const query = `
        UPDATE heroes 
        SET nombre = $1, bio = $2, img = $3, aparicion = $4, casa = $5
        WHERE codigo = $6
        RETURNING *;
    `;
    const values = [nombre, bio, img, aparicion, casa, codigo];
    try {
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Héroe no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error en updateHeroe:', error);
        res.status(500).json({ error: 'Error al modificar el héroe' });
    }
}

// Endpoint para eliminar un héroe
async function deleteHeroe(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM heroes WHERE codigo = $1 RETURNING *;';
    const values = [id];
    try {
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Héroe no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error en deleteHeroe:', error);
        res.status(500).json({ error: 'Error al eliminar el héroe' });
    }
}

module.exports = {
    getHeroes,
    getHeroeById,
    addHeroe,
    updateHeroe,
    deleteHeroe
}
