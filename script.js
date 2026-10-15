(() => {
const SUPABASE_URL = "https://odxqegsvbonkgwxtdinz.supabase.co";
const SUPABASE_KEY = "sb_publishable_CovrCo9BVwkPTjqwI-0ySg_amF3TT6C";
const supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY);

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

const TAMANO_PAGINA = 1000;
const quizSection = document.querySelector("#quizSection");
const resultsSection = document.querySelector("#resultsSection");
const questionText = document.querySelector("#questionText");
const optionsList = document.querySelector("#optionsList");
const progressText = document.querySelector("#progressText");
const progressPercent = document.querySelector("#progressPercent");
const progressBar = document.querySelector("#progressBar");
const progressFill = document.querySelector("#progressFill");
const quizStatus = document.querySelector("#quizStatus");
const submitButton = document.querySelector("#submitButton");
const showResultsButton = document.querySelector("#showResultsButton");
const resultText = document.querySelector("#resultText");
const participantCount = document.querySelector("#participantCount");
const resultsStatus = document.querySelector("#resultsStatus");
const refreshResultsButton = document.querySelector("#refreshResultsButton");
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
    boton.setAttribute("aria-pressed", String(respuestas[preguntaActual] === opcion.valor));
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

  const ultimaPregunta = preguntaActual === preguntas.length - 1;
  submitButton.hidden = !ultimaPregunta || !Number.isInteger(respuestas[preguntaActual]);
  quizStatus.textContent = "";
}

function seleccionarOpcion(valor) {
  respuestas[preguntaActual] = valor;

  if (preguntaActual < preguntas.length - 1) {
    preguntaActual += 1;
    renderizarPregunta();
    return;
  }

  renderizarPregunta();
  optionsList.querySelectorAll(".likert-button").forEach((boton) => {
    boton.setAttribute("aria-pressed", String(Number(boton.dataset.value) === valor));
  });
  submitButton.focus();
}

async function enviarRespuestas() {
  if (!respuestasCompletas()) {
    quizStatus.textContent = "Responde todas las afirmaciones antes de enviar.";
    return;
  }

  if (!supabase) {
    quizStatus.textContent =
      "No se pudo cargar Supabase. Comprueba tu conexión e inténtalo de nuevo.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Enviando…";
  quizStatus.textContent = "Guardando tus respuestas…";

  try {
    const { error } = await supabase
      .from("respuestas")
      .insert({ respuestas: [...respuestas] });

    if (error) {
      quizStatus.textContent = `No se pudieron guardar tus respuestas: ${error.message}`;
      return;
    }

    await mostrarResultadosGlobales();
  } catch (error) {
    quizStatus.textContent =
      `No se pudo completar el envío: ${obtenerMensajeError(error)}`;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar respuestas";
  }
}

async function mostrarResultadosGlobales() {
  quizSection.hidden = true;
  resultsSection.hidden = false;
  resultsStatus.textContent = "";
  participantCount.textContent = "Respuestas registradas: cargando…";
  await cargarResultadosGlobales();
  refreshResultsButton.focus();
}

function respuestasCompletas() {
  return (
    respuestas.length === preguntas.length &&
    respuestas.every((respuesta) =>
      escalaLikert.some((opcion) => opcion.valor === respuesta),
    )
  );
}

async function cargarResultadosGlobales() {
  if (!supabase) {
    resultsStatus.textContent =
      "No se pudo cargar Supabase. Comprueba tu conexión e inténtalo de nuevo.";
    return;
  }

  refreshResultsButton.disabled = true;
  refreshResultsButton.textContent = "Actualizando…";
  resultsStatus.textContent = "Cargando resultados globales…";

  try {
    const filas = await consultarTodasLasRespuestas();
    const resumen = calcularResumenGlobal(filas);

    participantCount.textContent = `Respuestas registradas: ${resumen.participantes}`;
    resultText.textContent =
      `El ${formatearPorcentaje(resumen.porcentajeDeAcuerdo)} de todas las respuestas ` +
      `expresa acuerdo (“De acuerdo” o “Totalmente de acuerdo”). ` +
      `El promedio global es ${formatearNumero(resumen.promedio)} de 5 ` +
      `(1 = totalmente de acuerdo).`;
    resultsStatus.textContent = "";
    renderizarGrafica(resumen.niveles);
  } catch (error) {
    resultsStatus.textContent =
      `No se pudieron cargar los resultados globales: ${obtenerMensajeError(error)}`;
  } finally {
    refreshResultsButton.disabled = false;
    refreshResultsButton.textContent = "Actualizar resultados";
  }
}

async function consultarTodasLasRespuestas() {
  const filas = [];

  for (let desde = 0; ; desde += TAMANO_PAGINA) {
    const hasta = desde + TAMANO_PAGINA - 1;
    const { data, error } = await supabase
      .from("respuestas")
      .select("*")
      .range(desde, hasta);

    if (error) {
      throw error;
    }

    if (!Array.isArray(data)) {
      throw new Error("Supabase devolvió un formato de respuestas inesperado.");
    }

    filas.push(...data);
    if (data.length < TAMANO_PAGINA) {
      return filas;
    }
  }
}

function calcularResumenGlobal(filas) {
  const cantidades = new Map(escalaLikert.map((nivel) => [nivel.valor, 0]));
  let totalRespuestas = 0;
  let sumaPuntuaciones = 0;
  let respuestasDeAcuerdo = 0;

  filas.forEach((fila, indice) => {
    if (
      !Array.isArray(fila.respuestas) ||
      fila.respuestas.length !== preguntas.length ||
      !fila.respuestas.every((valor) =>
        escalaLikert.some((nivel) => nivel.valor === valor),
      )
    ) {
      throw new Error(
        `La fila ${indice + 1} no tiene un arreglo "respuestas" válido de ${preguntas.length} valores (1–5).`,
      );
    }

    fila.respuestas.forEach((valor) => {
      cantidades.set(valor, cantidades.get(valor) + 1);
      totalRespuestas += 1;
      sumaPuntuaciones += valor;
      if (valor <= 2) {
        respuestasDeAcuerdo += 1;
      }
    });
  });

  const niveles = escalaLikert.map((nivel) => {
    const cantidad = cantidades.get(nivel.valor);
    return {
      ...nivel,
      cantidad,
      porcentaje: totalRespuestas === 0 ? 0 : (cantidad / totalRespuestas) * 100,
    };
  });

  return {
    participantes: filas.length,
    niveles,
    porcentajeDeAcuerdo:
      totalRespuestas === 0 ? 0 : (respuestasDeAcuerdo / totalRespuestas) * 100,
    promedio: totalRespuestas === 0 ? 0 : sumaPuntuaciones / totalRespuestas,
  };
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

function obtenerMensajeError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return String(error);
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
  quizStatus.textContent = "";
  resultsStatus.textContent = "";
  resultsSection.hidden = true;
  quizSection.hidden = false;
  renderizarPregunta();
  questionText.focus?.();
}

submitButton.addEventListener("click", enviarRespuestas);
showResultsButton.addEventListener("click", mostrarResultadosGlobales);
refreshResultsButton.addEventListener("click", cargarResultadosGlobales);
restartButton.addEventListener("click", reiniciarEncuesta);
renderizarPregunta();
})();
