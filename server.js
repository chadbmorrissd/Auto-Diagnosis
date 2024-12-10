import express from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';
import { fetchCarData } from './carDataService.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Initialize database
const db = createClient({
  url: 'file:cars.db',
});

// Create tables
async function initDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS makes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      year_start INTEGER,
      year_end INTEGER,
      FOREIGN KEY (make_id) REFERENCES makes(id),
      UNIQUE(make_id, name)
    )
  `);
}

// API endpoints
app.get('/api/makes', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM makes ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching makes:', error);
    res.status(500).json({ error: 'Failed to fetch makes' });
  }
});

app.get('/api/models/:makeId', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM models WHERE make_id = ? ORDER BY name', [req.params.makeId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

app.post('/api/update-database', async (req, res) => {
  try {
    const carData = await fetchCarData();
    
    for (const make of carData) {
      // Insert make
      const makeResult = await db.execute(
        'INSERT OR IGNORE INTO makes (name) VALUES (?)',
        [make.name]
      );
      
      // Get make ID
      const makeIdResult = await db.execute(
        'SELECT id FROM makes WHERE name = ?',
        [make.name]
      );
      const makeId = makeIdResult.rows[0].id;

      // Insert models
      for (const model of make.models) {
        await db.execute(`
          INSERT OR IGNORE INTO models (make_id, name, year_start, year_end)
          VALUES (?, ?, ?, ?)
        `, [makeId, model.name, model.yearStart, model.yearEnd]);
      }
    }

    res.json({ message: 'Database updated successfully' });
  } catch (error) {
    console.error('Error updating database:', error);
    res.status(500).json({ error: 'Failed to update database' });
  }
});

// Initialize database and start server
initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Car API server running at http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
