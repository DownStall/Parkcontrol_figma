const express = require('express');
const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;

async function initDb() {
  try {
    db = await open({
      filename: path.join(__dirname, 'parkcontrol_local.db'),
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS parking_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plate TEXT NOT NULL,
        vehicleType TEXT NOT NULL,
        rateType TEXT NOT NULL,
        spotName TEXT,
        entryTimeMillis INTEGER NOT NULL,
        exitTimeMillis INTEGER,
        totalAmount REAL DEFAULT 0,
        paymentMethod TEXT,
        isCompleted INTEGER DEFAULT 0,
        isAnnulled INTEGER DEFAULT 0,
        annulmentReason TEXT
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        username TEXT NOT NULL,
        details TEXT NOT NULL,
        timestampMillis INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleType TEXT NOT NULL,
        rateType TEXT DEFAULT 'Por Hora',
        pricePerHour REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cash_shifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        openTimeMillis INTEGER NOT NULL,
        closeTimeMillis INTEGER,
        initialCash REAL NOT NULL,
        declaredCash REAL DEFAULT 0,
        expenses REAL DEFAULT 0,
        operatorUsername TEXT NOT NULL,
        isOpen INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clientName TEXT NOT NULL,
        phone TEXT,
        plate TEXT NOT NULL,
        vehicleType TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        monthlyFee REAL NOT NULL,
        paymentMethod TEXT DEFAULT 'Efectivo',
        createdAtMillis INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS business_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        nit TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        receiptFooter TEXT
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        createdAtMillis INTEGER NOT NULL
      );
    `);

    // Migraciones preventivas
    try { await db.exec("ALTER TABLE rates ADD COLUMN rateType TEXT DEFAULT 'Por Hora'"); } catch (e) {}
    try { await db.exec("ALTER TABLE cash_shifts ADD COLUMN expenses REAL DEFAULT 0"); } catch (e) {}
    try { await db.exec("ALTER TABLE subscribers ADD COLUMN paymentMethod TEXT DEFAULT 'Efectivo'"); } catch (e) {}
    try { await db.exec("ALTER TABLE subscribers ADD COLUMN createdAtMillis INTEGER DEFAULT 0"); } catch (e) {}

    // Crear usuario admin inicial si la tabla está vacía (Clave por defecto: admin123)
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
      await db.run(
        `INSERT INTO users (username, fullName, email, password, role, createdAtMillis) 
         VALUES ('admin', 'Administrador ParkControl', 'admin@parkcontrol.com', 'admin123', 'Administrador', ?)`,
        [Date.now()]
      );
    }

    const busCount = await db.get('SELECT COUNT(*) as count FROM business_config');
    if (busCount.count === 0) {
      await db.run(
        `INSERT INTO business_config (id, name, nit, address, phone, receiptFooter) 
         VALUES (1, 'PARKCONTROL CENTRAL', '900.123.456-7', 'Calle 10 # 15-20, Centro', '310 000 0000', '¡Gracias por su confianza!')`
      );
    }

    console.log('Base de datos SQLite conectada con autenticación estricta.');
  } catch (err) {
    console.error('Error inicializando BD:', err.message);
  }
}

initDb();

app.get('/', (req, res) => res.send('Servidor ParkControl activo'));

// --- AUTENTICACIÓN Y PERFIL DE USUARIO ---
app.post('/api/user/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.get(
      'SELECT * FROM users WHERE LOWER(username) = LOWER(?) AND password = ?',
      [(username || '').trim(), password]
    );

    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    res.json({
      status: 'OK',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user/profile', async (req, res) => {
  try {
    const user = await db.get('SELECT id, username, fullName, email, role, createdAtMillis FROM users WHERE username = ?', ['admin']);
    const entries = await db.get('SELECT COUNT(*) as count FROM parking_sessions WHERE isAnnulled = 0');
    const exits = await db.get('SELECT COUNT(*) as count FROM parking_sessions WHERE isCompleted = 1 AND isAnnulled = 0');

    res.json({
      ...(user || {
        username: 'admin',
        fullName: 'Administrador ParkControl',
        email: 'admin@parkcontrol.com',
        role: 'Administrador',
        createdAtMillis: Date.now()
      }),
      totalEntries: entries?.count || 0,
      totalExits: exits?.count || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({ 
        error: 'La contraseña actual ingresada es incorrecta. (Nota: La clave inicial por defecto es admin123)' 
      });
    }

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres.' });
    }

    await db.run('UPDATE users SET password = ? WHERE id = ?', [newPassword, user.id]);
    res.json({ status: 'PASSWORD_CAMBIADA' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DATOS DEL NEGOCIO ---
app.get('/api/business', async (req, res) => {
  try {
    const config = await db.get('SELECT * FROM business_config WHERE id = 1');
    res.json(config || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/business', async (req, res) => {
  const { name, nit, address, phone, receiptFooter } = req.body;
  try {
    await db.run(
      `UPDATE business_config SET name = ?, nit = ?, address = ?, phone = ?, receiptFooter = ? WHERE id = 1`,
      [name, nit, address, phone, receiptFooter || '']
    );
    res.json({ status: 'OK' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REPORTES Y ESTADÍSTICAS ---
app.get('/api/reports/summary', async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - (6 * 24 * 60 * 60 * 1000);

    const todayParking = await db.get(
      `SELECT SUM(totalAmount) as total FROM parking_sessions WHERE isCompleted = 1 AND isAnnulled = 0 AND exitTimeMillis >= ?`,
      [startOfToday]
    );
    const todaySubs = await db.get(
      `SELECT SUM(monthlyFee) as total FROM subscribers WHERE createdAtMillis >= ?`,
      [startOfToday]
    );
    const dailyRevenue = (todayParking?.total || 0) + (todaySubs?.total || 0);

    const weekParking = await db.get(
      `SELECT SUM(totalAmount) as total FROM parking_sessions WHERE isCompleted = 1 AND isAnnulled = 0 AND exitTimeMillis >= ?`,
      [startOfWeek]
    );
    const weekSubs = await db.get(
      `SELECT SUM(monthlyFee) as total FROM subscribers WHERE createdAtMillis >= ?`,
      [startOfWeek]
    );
    const weeklyRevenue = (weekParking?.total || 0) + (weekSubs?.total || 0);

    const weekVehicles = await db.get(
      `SELECT COUNT(*) as count FROM parking_sessions WHERE isCompleted = 1 AND isAnnulled = 0 AND exitTimeMillis >= ?`,
      [startOfWeek]
    );

    const ALL_TYPES = ['Automóvil', 'Motocicleta', 'Bicicleta', 'Otros'];
    const parkingByVehicle = await db.all(
      `SELECT vehicleType, COUNT(*) as count, SUM(totalAmount) as revenue 
       FROM parking_sessions 
       WHERE isCompleted = 1 AND isAnnulled = 0 AND exitTimeMillis >= ? 
       GROUP BY vehicleType`,
      [startOfWeek]
    );

    const subByVehicle = await db.all(
      `SELECT vehicleType, SUM(monthlyFee) as revenue 
       FROM subscribers 
       WHERE createdAtMillis >= ? 
       GROUP BY vehicleType`,
      [startOfWeek]
    );

    const vehicleDistribution = ALL_TYPES.map(type => {
      const parkMatch = parkingByVehicle.find(r => r.vehicleType.toLowerCase() === type.toLowerCase());
      const subMatch = subByVehicle.find(r => r.vehicleType.toLowerCase() === type.toLowerCase());

      const count = parkMatch ? parkMatch.count : 0;
      const parkRev = parkMatch ? (parkMatch.revenue || 0) : 0;
      const subRev = subMatch ? (subMatch.revenue || 0) : 0;

      return {
        vehicleType: type,
        count,
        revenue: parkRev + subRev
      };
    });

    const daysName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weeklyChartData = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i).getTime();
      const dayEnd = dayStart + (24 * 60 * 60 * 1000) - 1;
      const dayLabel = daysName[new Date(dayStart).getDay()];

      const dayRev = await db.get(
        `SELECT SUM(totalAmount) as total FROM parking_sessions 
         WHERE isCompleted = 1 AND isAnnulled = 0 AND exitTimeMillis >= ? AND exitTimeMillis <= ?`,
        [dayStart, dayEnd]
      );

      const daySubs = await db.get(
        `SELECT SUM(monthlyFee) as total FROM subscribers 
         WHERE createdAtMillis >= ? AND createdAtMillis <= ?`,
        [dayStart, dayEnd]
      );

      weeklyChartData.push({
        day: dayLabel,
        revenue: (dayRev?.total || 0) + (daySubs?.total || 0)
      });
    }

    res.json({
      dailyRevenue,
      weeklyRevenue,
      totalVehiclesWeek: weekVehicles?.count || 0,
      vehicleDistribution,
      weeklyChartData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CAJA Y TURNOS ---
app.get('/api/shifts/active', async (req, res) => {
  try {
    const activeShift = await db.get('SELECT * FROM cash_shifts WHERE isOpen = 1 ORDER BY openTimeMillis DESC LIMIT 1');
    if (!activeShift) return res.json({ isOpen: false });

    const cashSales = await db.get(
      `SELECT SUM(totalAmount) as total FROM parking_sessions 
       WHERE isCompleted = 1 AND isAnnulled = 0 AND paymentMethod = 'Efectivo' 
       AND exitTimeMillis >= ?`,
      [activeShift.openTimeMillis]
    );

    const subscriberCash = await db.get(
      `SELECT SUM(monthlyFee) as total FROM subscribers 
       WHERE paymentMethod = 'Efectivo' AND createdAtMillis >= ?`,
      [activeShift.openTimeMillis]
    );

    const systemCash = (cashSales?.total || 0) + (subscriberCash?.total || 0);
    res.json({ ...activeShift, isOpen: true, systemCash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shifts/open', async (req, res) => {
  const { initialCash, operatorUsername } = req.body;
  try {
    const existing = await db.get('SELECT id FROM cash_shifts WHERE isOpen = 1');
    if (existing) return res.status(400).json({ error: 'Ya existe un turno abierto.' });

    const result = await db.run(
      `INSERT INTO cash_shifts (openTimeMillis, initialCash, operatorUsername, isOpen, expenses) VALUES (?, ?, ?, 1, 0)`,
      [Date.now(), initialCash || 0, operatorUsername || 'admin']
    );
    res.json({ id: result.lastID, status: 'TURNO_ABIERTO' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shifts/expense', async (req, res) => {
  const { amount } = req.body;
  try {
    const activeShift = await db.get('SELECT id, expenses FROM cash_shifts WHERE isOpen = 1');
    if (!activeShift) return res.status(400).json({ error: 'No hay turno abierto.' });

    const newExpenses = (activeShift.expenses || 0) + parseFloat(amount || 0);
    await db.run('UPDATE cash_shifts SET expenses = ? WHERE id = ?', [newExpenses, activeShift.id]);
    res.json({ status: 'GASTO_REGISTRADO' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shifts/close', async (req, res) => {
  const { declaredCash } = req.body;
  try {
    const activeShift = await db.get('SELECT id FROM cash_shifts WHERE isOpen = 1');
    if (!activeShift) return res.status(400).json({ error: 'No hay turno abierto.' });

    await db.run(
      `UPDATE cash_shifts SET closeTimeMillis = ?, declaredCash = ?, isOpen = 0 WHERE id = ?`,
      [Date.now(), declaredCash || 0, activeShift.id]
    );
    res.json({ status: 'TURNO_CERRADO' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ABONADOS ---
app.get('/api/subscribers', async (req, res) => {
  const subs = await db.all('SELECT * FROM subscribers ORDER BY id DESC');
  res.json(subs);
});

app.post('/api/subscribers', async (req, res) => {
  const { clientName, phone, plate, vehicleType, startDate, endDate, monthlyFee, paymentMethod } = req.body;
  try {
    const result = await db.run(
      `INSERT INTO subscribers (clientName, phone, plate, vehicleType, startDate, endDate, monthlyFee, paymentMethod, createdAtMillis) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clientName, phone || '', plate.toUpperCase().trim(), vehicleType || 'Automóvil', startDate, endDate, monthlyFee, paymentMethod || 'Efectivo', Date.now()]
    );
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/subscribers/:id', async (req, res) => {
  await db.run('DELETE FROM subscribers WHERE id = ?', [req.params.id]);
  res.json({ status: 'OK' });
});

// --- TARIFAS ---
app.get('/api/rates', async (req, res) => {
  const rates = await db.all('SELECT * FROM rates ORDER BY id ASC');
  res.json(rates);
});

app.post('/api/rates', async (req, res) => {
  const { vehicleType, rateType, pricePerHour } = req.body;
  const result = await db.run('INSERT INTO rates (vehicleType, rateType, pricePerHour) VALUES (?, ?, ?)', [vehicleType, rateType || 'Por Hora', pricePerHour]);
  res.json({ id: result.lastID });
});

app.put('/api/rates/:id', async (req, res) => {
  const { id } = req.params;
  const { vehicleType, rateType, pricePerHour } = req.body;
  await db.run('UPDATE rates SET vehicleType = ?, rateType = ?, pricePerHour = ? WHERE id = ?', [vehicleType, rateType || 'Por Hora', pricePerHour, id]);
  res.json({ status: 'OK' });
});

app.delete('/api/rates/:id', async (req, res) => {
  await db.run('DELETE FROM rates WHERE id = ?', [req.params.id]);
  res.json({ status: 'OK' });
});

// --- SESIONES Y AUDITORÍA ---
app.get('/api/sessions/active', async (req, res) => {
  const sessions = await db.all('SELECT * FROM parking_sessions WHERE isCompleted = 0 AND isAnnulled = 0 ORDER BY entryTimeMillis DESC');
  res.json(sessions);
});

app.post('/api/sessions/entry', async (req, res) => {
  const { plate, vehicleType, rateType, spotName, entryTimeMillis } = req.body;
  const cleanPlate = (plate || '').toUpperCase().trim();

  const existingPlate = await db.get('SELECT id FROM parking_sessions WHERE plate = ? AND isCompleted = 0 AND isAnnulled = 0', [cleanPlate]);
  if (existingPlate) return res.status(400).json({ error: `El vehículo con placa ${cleanPlate} ya está dentro.` });

  const existingSpot = await db.get('SELECT id FROM parking_sessions WHERE spotName = ? AND isCompleted = 0 AND isAnnulled = 0', [spotName]);
  if (existingSpot) return res.status(400).json({ error: `La plaza ${spotName} ya está ocupada.` });

  const result = await db.run('INSERT INTO parking_sessions (plate, vehicleType, rateType, spotName, entryTimeMillis) VALUES (?, ?, ?, ?, ?)', [cleanPlate, vehicleType, rateType, spotName, entryTimeMillis || Date.now()]);
  res.json({ id: result.lastID });
});

app.post('/api/sessions/exit', async (req, res) => {
  const { id, exitTimeMillis, totalAmount, paymentMethod } = req.body;
  await db.run('UPDATE parking_sessions SET exitTimeMillis = ?, totalAmount = ?, paymentMethod = ?, isCompleted = 1 WHERE id = ?', [exitTimeMillis || Date.now(), totalAmount, paymentMethod, id]);
  res.json({ status: 'OK' });
});

app.post('/api/sessions/annul', async (req, res) => {
  const { id, annulmentReason } = req.body;
  await db.run('UPDATE parking_sessions SET isAnnulled = 1, annulmentReason = ?, isCompleted = 1 WHERE id = ?', [annulmentReason, id]);
  res.json({ status: 'OK' });
});

app.get('/api/audit', async (req, res) => {
  const logs = await db.all('SELECT * FROM audit_logs ORDER BY timestampMillis DESC LIMIT 100');
  res.json(logs);
});

app.post('/api/audit', async (req, res) => {
  const { action, username, details, timestampMillis } = req.body;
  await db.run('INSERT INTO audit_logs (action, username, details, timestampMillis) VALUES (?, ?, ?, ?)', [action, username, details, timestampMillis || Date.now()]);
  res.json({ status: 'OK' });
});

app.listen(PORT, () => console.log(`Servidor ParkControl corriendo en http://localhost:${PORT}`));