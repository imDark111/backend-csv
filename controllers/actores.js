const {Pool} = require('pg');

const pool = new Pool ({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'utm123',
    database: 'hollywood',
    port: 5432
});


// Endpoint para devolver todos los actores
async function getActores(req, res){
    try{
        const client = await pool.connect();
        console.log ('Conexion exitosa')
        const result = await pool.query('SELECT * FROM actores');
        client.release();
        res.json(result.rows);
    }catch (error){
        console.log(error)
        res.status(500).json({error: 'Error al obtener actores'});
    }
}


// Endpoint para devolver los actores por ID
async function getActoresById(req, res){
        const {id} = req.params
        const query = 'SELECT * FROM actores WHERE cod_act = $1'
        const values = [id];
        try{
            const client = await pool.connect();
            const result = await client.query(query,values)
            client.release();
            if(result.rowCount > 0){
                res.json(result.rows)
            }else{
                res.status(400).json({error: 'Error al obtener el actor por ID'});
            }
         }catch (error){
            console.log(error)
            res.status(500).json({error: 'Error en el Servidor'});
    }
}


// Endpoint para agregar un nuevo actor
async function addActor(req, res) {
    const { cod_act, nom_act, nom_rea_act, fec_nac_act, fec_mue_act, naciona_act } = req.body;
    const query = `INSERT INTO actores (cod_act, nom_act, nom_rea_act, fec_nac_act, fec_mue_act, naciona_act) 
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [cod_act, nom_act, nom_rea_act, fec_nac_act, fec_mue_act, naciona_act];
  
    try {
      const client = await pool.connect();
      const result = await client.query(query, values);
      client.release();
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error al agregar el actor' });
    }
  }


// Endpoint para modificar un actor
async function updateActor(req, res) {
    const { cod_act } = req.params;
    const {  nom_act, nom_rea_act, fec_nac_act, fec_mue_act, naciona_act } = req.body;
    const query = `
        UPDATE actores 
        SET nom_act = $1, nom_rea_act = $2, fec_nac_act = $3, fec_mue_act = $4, naciona_act = $5
        WHERE cod_act = $6
        RETURNING *;
    `;
    const values = [nom_act, nom_rea_act, fec_nac_act, fec_mue_act, naciona_act, cod_act];

    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Actor no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al modificar el actor' });
    }
}


// Endpoint para eliminar un actor
async function deleteActor(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM actores WHERE cod_act = $1 RETURNING *;';
    const values = [id];

    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Actor no encontrado' });
        }
        res.status(200).json({ message: 'Actor eliminado exitosamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al eliminar el actor' });
    }
}


module.exports = {
    getActores,
    getActoresById,
    addActor,
    updateActor,
    deleteActor
}