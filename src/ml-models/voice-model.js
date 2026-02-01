// Modelo de Reconocimiento de Voz - Generado automáticamente
// Entrenado el: 1/2/2026, 11:29:36
// Palabras: hola, adios, silencio
// Muestras por palabra: 5

const VOICE_MODEL = {
  "hola": [
    {
      "mean": 13.43,
      "max": 211,
      "range": 211,
      "peaks": 1,
      "energy": 1720.15,
      "lowBand": 53.72,
      "midBand": 0,
      "highBand": 0
    },
    {
      "mean": 10.45,
      "max": 171,
      "range": 171,
      "peaks": 1,
      "energy": 1032.81,
      "lowBand": 41.81,
      "midBand": 0,
      "highBand": 0
    },
    {
      "mean": 17.08,
      "max": 207,
      "range": 207,
      "peaks": 2,
      "energy": 1999.55,
      "lowBand": 68.31,
      "midBand": 0,
      "highBand": 0
    },
    {
      "mean": 15.37,
      "max": 190,
      "range": 190,
      "peaks": 0,
      "energy": 1615.05,
      "lowBand": 61.47,
      "midBand": 0,
      "highBand": 0
    },
    {
      "mean": 13.95,
      "max": 189,
      "range": 189,
      "peaks": 0,
      "energy": 1490.84,
      "lowBand": 55.81,
      "midBand": 0,
      "highBand": 0
    }
  ],
  "adios": [
    {
      "mean": 28.98,
      "max": 195,
      "range": 195,
      "peaks": 0,
      "energy": 3179.12,
      "lowBand": 105.94,
      "midBand": 4.98,
      "highBand": 0
    },
    {
      "mean": 21.89,
      "max": 180,
      "range": 180,
      "peaks": 1,
      "energy": 2074.97,
      "lowBand": 82.38,
      "midBand": 2.59,
      "highBand": 0
    },
    {
      "mean": 27.47,
      "max": 210,
      "range": 210,
      "peaks": 3,
      "energy": 3020.72,
      "lowBand": 103.03,
      "midBand": 3.42,
      "highBand": 0
    },
    {
      "mean": 28.41,
      "max": 189,
      "range": 189,
      "peaks": 2,
      "energy": 3005.36,
      "lowBand": 102.78,
      "midBand": 5.42,
      "highBand": 0
    },
    {
      "mean": 31.6,
      "max": 254,
      "range": 254,
      "peaks": 3,
      "energy": 4361.95,
      "lowBand": 119.03,
      "midBand": 3.69,
      "highBand": 0
    }
  ],
  "silencio": [
    {
      "mean": 0.26,
      "max": 17,
      "range": 17,
      "peaks": 0,
      "energy": 4.26,
      "lowBand": 1.03,
      "midBand": 0,
      "highBand": 0
    },
    {
      "mean": 0.27,
      "max": 20,
      "range": 20,
      "peaks": 0,
      "energy": 4.66,
      "lowBand": 1.06,
      "midBand": 0,
      "highBand": 0
    },
    {
      "mean": 0.03,
      "max": 4,
      "range": 4,
      "peaks": 0,
      "energy": 0.13,
      "lowBand": 0.13,
      "midBand": 0,
      "highBand": 0
    },
    {
      "mean": 0.06,
      "max": 5,
      "range": 5,
      "peaks": 0,
      "energy": 0.27,
      "lowBand": 0.25,
      "midBand": 0,
      "highBand": 0
    },
    {
      "mean": 0.18,
      "max": 13,
      "range": 13,
      "peaks": 0,
      "energy": 2.1,
      "lowBand": 0.72,
      "midBand": 0,
      "highBand": 0
    }
  ]
};

const VOICE_MODEL_INFO = {
    words: ["hola","adios","silencio"],
    samplesPerWord: 5,
    trainedAt: "2026-02-01T16:29:36.067Z"
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VOICE_MODEL, VOICE_MODEL_INFO };
}
