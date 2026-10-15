const escalaLikert = [
  { valor: 1, etiqueta: "Totalmente de acuerdo", color: "#78a9ff" },
  { valor: 2, etiqueta: "De acuerdo", color: "#4dd4ac" },
  { valor: 3, etiqueta: "Neutral", color: "#94a3b8" },
  { valor: 4, etiqueta: "En desacuerdo", color: "#fb923c" },
  { valor: 5, etiqueta: "Totalmente en desacuerdo", color: "#fb7185" },
];

const preguntas = [
  "Aprendo mejor cuando la información se presenta con imágenes, diagramas o videos.",
  "Me resulta útil escuchar explicaciones y conversar sobre lo que estoy aprendiendo.",
  "Comprendo mejor un tema cuando leo sobre él y tomo apuntes.",
  "Aprendo mejor cuando puedo practicar y experimentar por mi cuenta.",
];

const quizSection = document.querySelector("#quizSection");
const resultsSection = document.querySelector("#resultsSection");
const questionText = document.querySelector("#questionText");
const optionsList = document.querySelector("#optionsList");
const progressText = document.querySelector("#progressText");
const progressPercent = document.querySelector("#progressPercent");
const progressBar = document.querySelector("#progressBar");
const progressFill = document.querySelector("#progressFill");
const resultText = document.querySelector("#resultText");
const restartButton = document.querySelector("#restartButton");
const chartCanvas = document.querySelector("#miGrafica");

let preguntaActual = 0;
let respuestas = [];
let grafica = null;

function renderizarPregunta() {
  const numeroPregunta = preguntaActual + 1;
  const porcentaje = Math.round((numeroPregunta / preguntas.length) * 100);

  questionText.textContent = preguntas[preguntaActual];
  progressText.textContent = `Pregunta ${numeroPregunta} de ${preguntas.length}`;
  progressPercent.textContent = `${porcentaje} %`;
  progressBar.setAttribute("aria-valuemax", String(preguntas.length));
  progressBar.setAttribute("aria-valuenow", String(numeroPregunta));
  progressFill.style.width = `${porcentaje}%`;
  optionsList.replaceChildren();

  escalaLikert.forEach((opcion) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "likert-button";
    boton.dataset.value = String(opcion.valor);
    boton.setAttribute("aria-label", `${opcion.valor}: ${opcion.etiqueta}`);
    boton.addEventListener("click", () => seleccionarOpcion(opcion.valor));

    const valor = document.createElement("span");
    valor.className = "likert-value";
    valor.setAttribute("aria-hidden", "true");
    valor.textContent = String(opcion.valor);

    const etiqueta = document.createElement("span");
    etiqueta.className = "likert-label";
    etiqueta.textContent = opcion.etiqueta;

    boton.append(valor, etiqueta);
    optionsList.append(boton);
  });
}

function seleccionarOpcion(valor) {
  respuestas.push(valor);
  preguntaActual += 1;

  if (preguntaActual < preguntas.length) {
    renderizarPregunta();
    return;
  }

  mostrarResultados();
}

function mostrarResultados() {
  const totalRespuestas = respuestas.length;
  const resultados = escalaLikert.map((nivel) => {
    const cantidad = respuestas.filter((respuesta) => respuesta === nivel.valor).length;

    return {
      ...nivel,
      cantidad,
      porcentaje: (cantidad / totalRespuestas) * 100,
    };
  });
  const respuestasDeAcuerdo = respuestas.filter((respuesta) => respuesta <= 2).length;
  const porcentajeDeAcuerdo = (respuestasDeAcuerdo / totalRespuestas) * 100;
  const promedio = respuestas.reduce((total, respuesta) => total + respuesta, 0) / totalRespuestas;

  resultText.textContent =
    `El ${formatearPorcentaje(porcentajeDeAcuerdo)} de tus respuestas expresa acuerdo ` +
    `(“De acuerdo” o “Totalmente de acuerdo”). Tu puntuación promedio fue ` +
    `${formatearNumero(promedio)} de 5 (1 = totalmente de acuerdo).`;

  quizSection.hidden = true;
  resultsSection.hidden = false;
  renderizarGrafica(resultados);
  restartButton.focus();
}

function renderizarGrafica(resultados) {
  if (typeof Chart === "undefined") {
    throw new Error("No se pudo cargar Chart.js. Comprueba tu conexión e inténtalo de nuevo.");
  }

  if (grafica) {
    grafica.destroy();
  }

  grafica = new Chart(chartCanvas, {
    type: "doughnut",
    data: {
      labels: resultados.map((resultado) => resultado.etiqueta),
      datasets: [
        {
          data: resultados.map((resultado) => resultado.porcentaje),
          backgroundColor: resultados.map((resultado) => resultado.color),
          borderColor: "#111a2b",
          borderWidth: 4,
          hoverOffset: 7,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      cutout: "66%",
      animation: { duration: 650 },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyle: "circle",
            font: { family: "DM Sans", size: 12 },
            generateLabels(chart) {
              const dataset = chart.data.datasets[0];
              return chart.data.labels.map((etiqueta, indice) => ({
                text: `${etiqueta}: ${formatearPorcentaje(dataset.data[indice])}`,
                fontColor: dataset.backgroundColor[indice],
                fillStyle: dataset.backgroundColor[indice],
                strokeStyle: dataset.backgroundColor[indice],
                lineWidth: 0,
                hidden: false,
                index: indice,
              }));
            },
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              return ` ${context.label}: ${formatearPorcentaje(context.raw)}`;
            },
          },
        },
      },
    },
  });
}

function formatearPorcentaje(porcentaje) {
  return `${formatearNumero(porcentaje)} %`;
}

function formatearNumero(numero) {
  return Number(numero.toFixed(2)).toLocaleString("es-ES", {
    maximumFractionDigits: 2,
  });
}

function reiniciarEncuesta() {
  if (grafica) {
    grafica.destroy();
    grafica = null;
  }

  preguntaActual = 0;
  respuestas = [];
  resultsSection.hidden = true;
  quizSection.hidden = false;
  renderizarPregunta();
  questionText.focus?.();
}

restartButton.addEventListener("click", reiniciarEncuesta);
renderizarPregunta();
