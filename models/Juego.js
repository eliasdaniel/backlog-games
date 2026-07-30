const mongoose = require('mongoose');

const juegoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true,
        minlength: [2, 'El título debe tener al menos 2 caracteres']
    },
    genero: {
        type: String,
        required: [true, 'El género es obligatorio'],
        enum: ['Acción', 'Aventura', 'RPG', 'Estrategia', 'Deportes', 'Terror', 'Plataformas', 'Simulación', 'Puzzle', 'Shooter', 'Pelea', 'Otro']
    },
    plataforma: {
        type: String,
        required: [true, 'La plataforma es obligatoria'],
        enum: ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X', 'Xbox One', 'Nintendo Switch', 'Móvil', 'Otra']
    },
    estado: {
        type: String,
        required: true,
        enum: ['Pendiente', 'Jugando', 'Completado', 'Abandonado'],
        default: 'Pendiente'
    },
    calificacion: {
        type: Number,
        min: 0,
        max: 10,
        default: null
    },
    notas: {
        type: String,
        trim: true,
        maxlength: [500, 'Las notas no pueden superar los 500 caracteres'],
        default: ''
    },
    fechaAgregado: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Juego', juegoSchema);
