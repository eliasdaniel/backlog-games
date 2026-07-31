const express = require('express');
const router = express.Router();
const Juego = require('../models/Juego');

// GET /api/juegos — 
router.get('/', async (req, res) => {
    try {
        const { estado, genero, busqueda } = req.query;
        let filtro = {};

        if (estado && estado !== 'Todos') filtro.estado = estado;
        if (genero && genero !== 'Todos') filtro.genero = genero;
        if (plataforma && plataforma !== 'Todas') filtro.plataforma = plataforma;
        if (busqueda) filtro.titulo = { $regex: busqueda, $options: 'i' };

        const juegos = await Juego.find(filtro).sort({ createdAt: -1 });

        // Estadísticas generales
        const total = await Juego.countDocuments();
        const porEstado = await Juego.aggregate([
            { $group: { _id: '$estado', count: { $sum: 1 } } }
        ]);
        const calificados = await Juego.find({ calificacion: { $ne: null } });
        const promedio = calificados.length
            ? (calificados.reduce((s, j) => s + j.calificacion, 0) / calificados.length).toFixed(1)
            : null;

        res.json({ juegos, stats: { total, porEstado, promedio } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/juegos/:id — detalle de un juego
router.get('/:id', async (req, res) => {
    try {
        const juego = await Juego.findById(req.params.id);
        if (!juego) return res.status(404).json({ error: 'Juego no encontrado' });
        res.json(juego);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/juegos — crear nuevo juego
router.post('/', async (req, res) => {
    try {
        const juego = new Juego(req.body);
        const guardado = await juego.save();
        res.status(201).json(guardado);
    } catch (err) {
        if (err.name === 'ValidationError') {
            const mensajes = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ error: mensajes.join(', ') });
        }
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/juegos/:id — actualizar juego
router.put('/:id', async (req, res) => {
    try {
        const juego = await Juego.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!juego) return res.status(404).json({ error: 'Juego no encontrado' });
        res.json(juego);
    } catch (err) {
        if (err.name === 'ValidationError') {
            const mensajes = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ error: mensajes.join(', ') });
        }
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/juegos/:id — eliminar juego
router.delete('/:id', async (req, res) => {
    try {
        const juego = await Juego.findByIdAndDelete(req.params.id);
        if (!juego) return res.status(404).json({ error: 'Juego no encontrado' });
        res.json({ mensaje: 'Juego eliminado correctamente', id: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
