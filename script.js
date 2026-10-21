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

const preguntasPreTest = [
  "¿Considera usted que puede reconocer las características histológicas de los órganos del sistema digestivo?",
  "¿Considera usted que puede distinguir microscópicamente la capa mucosa de la submucosa?",
  "¿Considera usted que puede identificar las células de Paneth en una microfotografía histológica del intestino delgado específicamente en el yeyuno?",
  "¿Considera usted que la zona de transición epitelial esofagogástrica es compleja de identificar?",
  "¿Considera usted que los materiales anteriores le brindan suficientes pautas para el estudio autónomo de la asignatura Histología II?",
  "¿Suele usted apoyarse en herramientas digitales para preparar las prácticas de Histología del sistema digestivo?",
  "¿Usa usted un método de estudio que integre de forma estructurada esquemas teóricos, microfotografías con sus aumentos y textos explicativos?",
  "¿Puede usted revisar cómodamente microfotografías de láminas histológicas desde cualquier dispositivo?",
  "¿Considera usted que un recurso adicional le serviría como complemento para su aprendizaje en las prácticas del sistema digestivo?",
  "¿Considera usted que domina el uso de herramientas e interfaces digitales interactivas aplicadas al aprendizaje de la histología?",
  "¿Aplica usted un método ordenado para explorar y analizar los preparados del sistema digestivo?",
  "¿Considera usted que domina los conceptos teóricos requeridos para comprender las prácticas del sistema digestivo?",
];

const preguntasPostTest = [
  "¿Considera usted que la guía digital le permitió identificar con precisión los órganos digestivos presentados?",
  "¿Considera usted que la guía le permitió reconocer sistemáticamente las cuatro capas tisulares digestivas?",
  "¿Considera usted que la guía le facilitó reconocer con precisión las células de Paneth y diferenciarlas de otras células del epitelio intestinal?",
  "¿Considera usted que la guía le facilitó localizar el cambio de epitelio en las zonas de transición?",
  "¿La guía digital le proporcionó pautas claras para orientar su estudio autónomo de la asignatura Histología II?",
  "¿Considera usted que la guía digital le ayuda a preparar las actividades prácticas de la asignatura?",
  "¿La organización visual de la guía digital (esquemas, aumentos y descripciones) le permitió seguir una secuencia clara para interpretar el sistema digestivo?",
  "¿Considera usted que acceder a la guía digital desde diferentes dispositivos o computadoras es cómodo para su estudio autónomo?",
  "¿Considera usted que la guía digital fue el recurso adicional adecuado para consolidar su aprendizaje en las prácticas del sistema digestivo?",
  "¿Considera usted que la interactividad ofrecida por la guía digital le facilitó el análisis detallado de los tejidos del sistema digestivo?",
  "¿Considera usted que la guía digital facilitó su método para explorar y analizar los preparados del sistema digestivo?",
  "¿Considera usted que la guía digital contribuyó a dominar los conceptos teóricos requeridos para comprender las prácticas del sistema digestivo?",
];
const pruebas = {
  pre: { nombre: "Pre-Test", preguntas: preguntasPreTest },
  post: { nombre: "Post-Test", preguntas: preguntasPostTest },
};
const PREGUNTAS_VERSION_ANTERIOR = 4;
const TAMANO_PAGINA = 1000;
const welcomeScreen = document.querySelector("#welcome-screen");
const startSurveyButton = document.querySelector("#start-survey-btn");
const testSwitchButtons = document.querySelectorAll(".test-switch-button");
const welcomeTitle = document.querySelector("#welcome-title");
const welcomeDescription = document.querySelector("#welcome-description");
const themeToggleButton = document.querySelector("#themeToggleButton");
const quizCard = document.querySelector(".quiz-card");
const quizSection = document.querySelector("#quizSection");
const resultsSection = document.querySelector("#resultsSection");
const quizEyebrow = document.querySelector("#quiz-eyebrow");
const resultsEyebrow = document.querySelector("#results-eyebrow");
const resultsTitle = document.querySelector("#resultsTitle");
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
const resultsList = document.querySelector("#results-list");
const refreshResultsButton = document.querySelector("#refreshResultsButton");
const restartButton = document.querySelector("#restartButton");
const backToTopButton = document.querySelector("#backToTopButton");

let preguntaActual = 0;
let respuestas = [];
let tipoPruebaActiva = "pre";
let preguntas = preguntasPreTest;

function aplicarTema(modoClaro) {
  document.body.classList.toggle("light-mode", modoClaro);
  const etiqueta = modoClaro ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
  themeToggleButton.setAttribute("aria-label", etiqueta);
  themeToggleButton.setAttribute("title", etiqueta);
  themeToggleButton.setAttribute("aria-pressed", String(modoClaro));
}

aplicarTema(localStorage.getItem("histoencuesta-theme") === "light");
themeToggleButton.addEventListener("click", () => {
  const modoClaro = !document.body.classList.contains("light-mode");
  localStorage.setItem("histoencuesta-theme", modoClaro ? "light" : "dark");
  aplicarTema(modoClaro);
});

function seleccionarTipoPrueba(tipo) {
  if (!Object.hasOwn(pruebas, tipo)) {
    throw new Error(`Tipo de prueba no válido: ${tipo}`);
  }

  tipoPruebaActiva = tipo;
  preguntas = pruebas[tipo].preguntas;
  testSwitchButtons.forEach((boton) => {
    boton.setAttribute("aria-pressed", String(boton.dataset.testType === tipo));
  });

  const nombrePrueba = pruebas[tipo].nombre;
  const tituloPrueba = `Encuesta sobre Histología II - ${nombrePrueba}`;
  const sufijoTitulo = document.createElement("span");
  sufijoTitulo.className = "no-wrap";
  sufijoTitulo.textContent = nombrePrueba;
  welcomeTitle.replaceChildren(
    document.createTextNode("Encuesta sobre Histología II - "),
    sufijoTitulo,
  );
  document.title = tituloPrueba;
  welcomeDescription.textContent =
    `Responde las 12 preguntas del ${nombrePrueba} sobre Histología II y el ` +
    "sistema digestivo usando una escala Likert del 1 al 5.";
  quizEyebrow.textContent = `ENCUESTA DE HISTOLOGÍA II · ${nombrePrueba.toUpperCase()}`;
  resultsEyebrow.textContent =
    `RESULTADOS DE LA ENCUESTA · ${nombrePrueba.toUpperCase()}`;
  resultsTitle.textContent = `Resultados globales · ${nombrePrueba}`;
}

function renderizarPregunta() {
  const numeroPregunta = preguntaActual + 1;
  const porcentaje = Math.round(
    (preguntaActual / (preguntas.length - 1)) * 100,
  );

  questionText.textContent = preguntas[preguntaActual];
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    questionText.animate(
      [
        { opacity: 0, transform: "translateY(7px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 240, easing: "ease-out" },
    );
  }
  progressText.textContent = `Pregunta ${numeroPregunta} de ${preguntas.length}`;
  progressPercent.textContent = `${porcentaje} %`;
  progressBar.setAttribute("aria-valuemax", "100");
  progressBar.setAttribute("aria-valuenow", String(porcentaje));
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

function comenzarEncuesta() {
  welcomeScreen.hidden = true;
  quizSection.hidden = false;
  quizSection.classList.add("screen-enter");
  renderizarPregunta();
  questionText.focus();
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
    quizStatus.textContent = "Responde todas las preguntas antes de enviar.";
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
      .insert([{ respuestas: [...respuestas], tipo: tipoPruebaActiva }]);

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
  quizCard.classList.add("results-active");
  resultsStatus.textContent = "";
  participantCount.textContent = "Total de participantes: cargando…";
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
    const resumen = calcularResumenPorPregunta(filas);

    participantCount.textContent = `Total de participantes: ${resumen.participantes}`;
    resultText.textContent = "Distribución de respuestas para cada pregunta:";
    resultsStatus.textContent =
      resumen.respuestasAnteriores > 0
        ? `Se excluyeron ${resumen.respuestasAnteriores} ${
            resumen.respuestasAnteriores === 1 ? "respuesta" : "respuestas"
          } de la versión anterior de 4 preguntas, que no se pueden comparar con este cuestionario.`
        : "";
    renderizarResultados(resumen.preguntas, resumen.participantes);
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
      .eq("tipo", tipoPruebaActiva)
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

function calcularResumenPorPregunta(filas) {
  const cantidades = preguntas.map(
    () => new Map(escalaLikert.map((nivel) => [nivel.valor, 0])),
  );
  let participantes = 0;
  let respuestasAnteriores = 0;

  filas.forEach((fila, indice) => {
    if (
      Array.isArray(fila.respuestas) &&
      fila.respuestas.length === PREGUNTAS_VERSION_ANTERIOR &&
      fila.respuestas.every((valor) =>
        escalaLikert.some((nivel) => nivel.valor === valor),
      )
    ) {
      respuestasAnteriores += 1;
      return;
    }

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

    participantes += 1;
    fila.respuestas.forEach((valor, pregunta) => {
      cantidades[pregunta].set(
        valor,
        cantidades[pregunta].get(valor) + 1,
      );
    });
  });

  return {
    participantes,
    respuestasAnteriores,
    preguntas: cantidades.map((conteos) =>
      escalaLikert.map((nivel) => ({
        ...nivel,
        cantidad: conteos.get(nivel.valor),
      })),
    ),
  };
}

function renderizarResultados(resultadosPorPregunta, participantes) {
  resultsList.replaceChildren();

  resultadosPorPregunta.forEach((resultados, indicePregunta) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "result-question";

    const encabezado = document.createElement("h3");
    encabezado.className = "result-question-title";
    encabezado.textContent = `${indicePregunta + 1}. ${preguntas[indicePregunta]}`;

    const barras = document.createElement("div");
    barras.className = "result-bars";

    resultados.forEach((resultado) => {
      const porcentaje =
        participantes === 0 ? 0 : (resultado.cantidad / participantes) * 100;
      const fila = document.createElement("div");
      fila.className = "result-bar-row";
      fila.style.setProperty("--bar-color", resultado.color);

      const etiqueta = document.createElement("span");
      etiqueta.className = "result-bar-label";
      etiqueta.textContent = `${resultado.valor}. ${resultado.etiqueta}`;

      const pista = document.createElement("div");
      pista.className = "result-bar-track";
      pista.setAttribute("role", "progressbar");
      pista.setAttribute(
        "aria-label",
        `${resultado.etiqueta}: ${resultado.cantidad} ${
          resultado.cantidad === 1 ? "persona" : "personas"
        }`,
      );
      pista.setAttribute("aria-valuemin", "0");
      pista.setAttribute("aria-valuemax", String(participantes));
      pista.setAttribute("aria-valuenow", String(resultado.cantidad));

      const relleno = document.createElement("span");
      relleno.className = "result-bar-fill";
      relleno.style.width = `${porcentaje}%`;
      pista.append(relleno);

      const total = document.createElement("span");
      total.className = "result-bar-total";
      total.textContent =
        `${resultado.cantidad} ` +
        `${resultado.cantidad === 1 ? "persona" : "personas"} ` +
        `(${formatearPorcentaje(porcentaje)})`;

      fila.append(etiqueta, pista, total);
      barras.append(fila);
    });

    tarjeta.append(encabezado, barras);
    resultsList.append(tarjeta);
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
  preguntaActual = 0;
  respuestas = [];
  quizCard.classList.remove("results-active");
  quizStatus.textContent = "";
  resultsStatus.textContent = "";
  resultsSection.hidden = true;
  quizSection.hidden = false;
  renderizarPregunta();
  questionText.focus?.();
}

function volverAlInicio() {
  preguntaActual = 0;
  respuestas = [];
  quizCard.classList.remove("results-active");
  quizStatus.textContent = "";
  resultsStatus.textContent = "";
  resultsSection.hidden = true;
  quizSection.hidden = true;
  welcomeScreen.hidden = false;
  renderizarPregunta();
  resultsList.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "instant" });
}

submitButton.addEventListener("click", enviarRespuestas);
startSurveyButton.addEventListener("click", comenzarEncuesta);
showResultsButton.addEventListener("click", mostrarResultadosGlobales);
refreshResultsButton.addEventListener("click", cargarResultadosGlobales);
restartButton.addEventListener("click", reiniciarEncuesta);
backToTopButton.addEventListener("click", (event) => {
  event.preventDefault();
  volverAlInicio();
});
testSwitchButtons.forEach((boton) => {
  boton.addEventListener("click", () =>
    seleccionarTipoPrueba(boton.dataset.testType),
  );
});
seleccionarTipoPrueba(tipoPruebaActiva);
renderizarPregunta();
})();
