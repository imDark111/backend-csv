const express = require('express');
const cors = require('cors');
const app = express();


// Configura CORS
app.use(cors({
    origin: '*', // Permitir todas las solicitudes de cualquier origen. Puedes especificar dominios si es necesario.
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
  }));

//middleware
app.use(express.json())

app.use(express.urlencoded({extended:false}))

//routes
app.use(require('./routes/actores'));
app.use(require('./routes/peliculas'));
app.use(require('./routes/heroes'));
app.use(require('./routes/departments'));
app.use(require('./routes/employees'));



app.listen(3000)
console.log('Server on port', 3000)