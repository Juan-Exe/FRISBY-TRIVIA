// 🎵 música-rondas.js

const rutasMusica = {
    facil: [
        "/Assets/Musica/Musica Facil/ATLUS Sound Team - Butterfly Kiss.mp3",
        "/Assets/Musica/Musica Facil/ATLUS Sound Team - Endless Days.mp3",
        "/Assets/Musica/Musica Facil/ATLUS Sound Team - Have a Short Rest.mp3",
        "/Assets/Musica/Musica Facil/ATLUS Sound Team - Phantom.mp3",
        "/Assets/Musica/Musica Facil/ATLUS Sound Team - Wicked Plan.mp3",
        "/Assets/Musica/Musica Facil/Dark_souls_inicio.mp3",
        "/Assets/Musica/Musica Facil/Naruto OST 2 - Afternoon of Konoha - ostdelta1.mp3"
    ],
    intermedio: [
        "/Assets/Musica/Msuica Intermedia/02 - Introduction - MetalGearSolidF4N.mp3",
        "/Assets/Musica/Msuica Intermedia/07 - Intruder 2 - MetalGearSolidF4N.mp3",
        "/Assets/Musica/Msuica Intermedia/ATLUS Sound Team - King, Queen, and Slaves.mp3",
        "/Assets/Musica/Msuica Intermedia/ATLUS Sound Team - Mementos.mp3",
        "/Assets/Musica/Msuica Intermedia/Metal Gear Solid 2 [Sons of Liberty] - Complete Soundtrack - 102 - Sons of Liberty Main Titles - Ragitsu.mp3",
        "/Assets/Musica/Msuica Intermedia/Mission - Yasuharu Takanashi.mp3",
        "/Assets/Musica/Msuica Intermedia/Naruto OST 2 - Sasuke's Theme - ostdelta1.mp3",
        "/Assets/Musica/Msuica Intermedia/Shrine (The Legend of Zelda Breath of the Wild OST) - Peaches Lamb.mp3"
    ],
    dificil: [
        "/Assets/Musica/Musica Dificil/05 - Intruder 1 - MetalGearSolidF4N.mp3",
        "/Assets/Musica/Musica Dificil/ATLUS Sound Team - Interrogation Room.mp3",
        "/Assets/Musica/Musica Dificil/ATLUS Sound Team - King, Queen, and Slaves -another version-.mp3",
        "/Assets/Musica/Musica Dificil/Call of Duty 4 Modern Warfare Soundtrack - 1.Main Theme - Thom9316.mp3",
        "/Assets/Musica/Musica Dificil/MGS3 OST CQC - Metal Gear Solid 3 Snake Eater - Nox.mp3"
    ]
};

let cancionesUsadas = {
    facil: [],
    intermedio: [],
    dificil: []
};

let audio = new Audio();
audio.loop = true;
audio.volume = 0;

function obtenerDificultad(ronda) {
    if (ronda <= 5) return "facil";
    if (ronda <= 10) return "intermedio";
    return "dificil";
}

function obtenerCancionAleatoria(dificultad) {
    const disponibles = rutasMusica[dificultad].filter(c => !cancionesUsadas[dificultad].includes(c));
    if (disponibles.length === 0) {
        cancionesUsadas[dificultad] = [];
        disponibles.push(...rutasMusica[dificultad]);
    }
    const seleccionada = disponibles[Math.floor(Math.random() * disponibles.length)];
    cancionesUsadas[dificultad].push(seleccionada);
    return seleccionada;
}

function reproducirMusicaParaRonda(ronda) {
    const dificultad = obtenerDificultad(ronda);
    const ruta = obtenerCancionAleatoria(dificultad);

    if (!ruta) return;

    detenerMusica(() => {
        audio.src = ruta;
        audio.volume = 0;
        audio.play().then(() => {
            const fadeInterval = setInterval(() => {
                if (audio.volume < 0.95) {
                    audio.volume += 0.05;
                } else {
                    audio.volume = 1;
                    clearInterval(fadeInterval);
                }
            }, 100);
        }).catch(err => console.error("🎵 Error al reproducir música:", err));
    });
}

function detenerMusica(callback) {
    if (!audio.src || audio.paused) {
        callback?.();
        return;
    }

    const fadeOut = setInterval(() => {
        if (audio.volume > 0.05) {
            audio.volume -= 0.05;
        } else {
            audio.volume = 0;
            clearInterval(fadeOut);
            audio.pause();
            audio.currentTime = 0;
            callback?.();
        }
    }, 100);
}
