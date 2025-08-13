// server.js
// -----------------------------------------------------------------------------
// --- 1. IMPORTACIÓN DE MÓDULOS ---
// -----------------------------------------------------------------------------
const express = require('express'); // Framework para crear el servidor web
const sqlite3 = require('sqlite3').verbose(); // Driver para interactuar con SQLite
const cors = require('cors'); // Middleware para permitir peticiones desde otros orígenes (Cross-Origin Resource Sharing)

// -----------------------------------------------------------------------------
// --- 2. CONFIGURACIÓN INICIAL ---
// -----------------------------------------------------------------------------
const app = express(); // Se crea la instancia de la aplicación Express
const PORT = process.env.PORT || 3001; // Se define el puerto del servidor. Usará el puerto 3001 por defecto.
const DB_PATH = './database.db'; // Ruta donde se guardará el archivo de la base de datos

// -----------------------------------------------------------------------------
// --- 3. MIDDLEWARE ---
// -----------------------------------------------------------------------------
app.use(cors()); // Habilita CORS para todas las rutas, permitiendo que un frontend pueda hacerle peticiones.
app.use(express.json()); // Habilita el parsing de cuerpos de petición en formato JSON.

// -----------------------------------------------------------------------------
// --- 4. CONEXIÓN Y CONFIGURACIÓN DE LA BASE DE DATOS ---
// -----------------------------------------------------------------------------
// Se crea una nueva instancia de la base de datos. Si el archivo no existe, se creará.
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error al abrir la base de datos:", err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
    // Se crea la tabla 'productos' si no existe.
    // `id` es la clave primaria autoincremental.
    // `nombre` y `precio` son los campos de nuestros productos.
    db.run(`CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL
    )`, (err) => {
      if (err) {
        console.error("Error al crear la tabla:", err.message);
      } else {
        console.log("Tabla 'productos' lista.");
      }
    });
  }
});

// -----------------------------------------------------------------------------
// --- 5. DEFINICIÓN DE RUTAS (ENDPOINTS CRUD) ---
// -----------------------------------------------------------------------------

// --- RUTA DE BIENVENIDA (GET /) ---
app.get('/', (req, res) => {
  res.status(200).json({ message: '¡Bienvenido a la API de Productos con Node.js, Express y SQLite!' });
});

// --- CREATE: Añadir un nuevo producto (POST /api/productos) ---
app.post('/api/productos', (req, res) => {
  const { nombre, precio } = req.body;

  // Validación simple de los datos de entrada
  if (!nombre || precio === undefined) {
    return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
  }

  const sql = `INSERT INTO productos (nombre, precio) VALUES (?, ?)`;
  db.run(sql, [nombre, precio], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // `this.lastID` contiene el ID del último elemento insertado
    res.status(201).json({
      message: 'Producto creado exitosamente',
      producto: { id: this.lastID, nombre, precio }
    });
  });
});

// --- READ: Obtener todos los productos (GET /api/productos) ---
app.get('/api/productos', (req, res) => {
  const sql = `SELECT * FROM productos`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ productos: rows });
  });
});

// --- READ: Obtener un solo producto por ID (GET /api/productos/:id) ---
app.get('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM productos WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.status(200).json({ producto: row });
    } else {
      res.status(404).json({ message: `Producto con id ${id} no encontrado.` });
    }
  });
});

// --- UPDATE: Actualizar un producto por ID (PUT /api/productos/:id) ---
app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio } = req.body;

  if (!nombre || precio === undefined) {
    return res.status(400).json({ error: 'El nombre y el precio son obligatorios para la actualización.' });
  }

  const sql = `UPDATE productos SET nombre = ?, precio = ? WHERE id = ?`;
  db.run(sql, [nombre, precio, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // `this.changes` contiene el número de filas afectadas.
    if (this.changes > 0) {
      res.status(200).json({
        message: `Producto con id ${id} actualizado.`,
        producto: { id: Number(id), nombre, precio }
      });
    } else {
      res.status(404).json({ message: `Producto con id ${id} no encontrado.` });
    }
  });
});

// --- DELETE: Eliminar un producto por ID (DELETE /api/productos/:id) ---
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM productos WHERE id = ?`;
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes > 0) {
      res.status(200).json({ message: `Producto con id ${id} eliminado.` });
    } else {
      res.status(404).json({ message: `Producto con id ${id} no encontrado.` });
    }
  });
});


// -----------------------------------------------------------------------------
// --- 6. INICIO DEL SERVIDOR ---
// -----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
