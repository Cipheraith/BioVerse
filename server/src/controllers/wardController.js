const pool = require('./database');

// Get all wards
const getAllWards = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM wards');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new ward
const createWard = async (req, res) => {
    const { name, location } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO wards (name, location) VALUES ($1, $2) RETURNING *',
            [name, location]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single ward by ID
const getWardById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM wards WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ward not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a ward by ID
const updateWard = async (req, res) => {
    const { id } = req.params;
    const { name, location } = req.body;
    try {
        const result = await pool.query(
            'UPDATE wards SET name = $1, location = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [name, location, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ward not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a ward by ID
const deleteWard = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM wards WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ward not found' });
        }
        res.json({ message: 'Ward deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all rooms in a ward
const getRoomsInWard = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM rooms WHERE ward_id = $1', [id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new room in a ward
const createRoomInWard = async (req, res) => {
    const { id } = req.params;
    const { room_number, type } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO rooms (ward_id, room_number, type) VALUES ($1, $2, $3) RETURNING *',
            [id, room_number, type]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllWards,
    createWard,
    getWardById,
    updateWard,
    deleteWard,
    getRoomsInWard,
    createRoomInWard,
};