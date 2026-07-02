const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
        LevelFormat, PageNumber, Header, Footer } = require('docx');
const fs = require('fs');

// Fecha actual formateada
const today = new Date();
const dateStr = today.toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function cell(text, options = {}) {
  const { bold = false, fill = null, width = 4680 } = options;
  const shading = fill ? { fill, type: ShadingType.CLEAR } : undefined;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: "center",
    children: [new Paragraph({
      children: [new TextRun({ text, bold, font: "Arial", size: 22 })]
    })]
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, font: "Arial", size: 32 })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, font: "Arial", size: 28 })]
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 24, ...opts })]
  });
}

function bullet(text, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 24 })]
  });
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 24 }
      }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1F4E79" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }
        ]
      }
    ]
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "Reporte de Mejoras — Asesoría Virtual", font: "Arial", size: 18, color: "888888" })]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Página ", font: "Arial", size: 18, color: "888888" }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "888888" })
              ]
            })
          ]
        })
      },
      children: [
        // Título principal
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: "Reporte de Mejoras", bold: true, font: "Arial", size: 48, color: "1F4E79" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [new TextRun({ text: "Asesoría Virtual", bold: true, font: "Arial", size: 40, color: "2E75B6" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 480 },
          children: [new TextRun({ text: dateStr, font: "Arial", size: 24, color: "666666" })]
        }),

        // Introducción
        heading1("Introducción"),
        body("El presente documento describe la transformación del proceso de atención en la asesoría virtual de la universidad. Se busca mostrar de manera clara cómo se atendía a los estudiantes antes y cómo el nuevo sistema mejora la experiencia tanto para quienes reciben la atención como para quienes la brindan."),
        body("La asesoría virtual es un servicio fundamental, especialmente durante los períodos de matrícula, cuando la demanda de los estudiantes aumenta considerablemente. Por ello, contar con un proceso ágil, ordenado y transparente se vuelve esencial para garantizar una experiencia positiva."),

        // Sección: El Proceso Anterior
        heading1("1. El Proceso Anterior"),
        body("Antes de contar con el sistema actual, la asesoría virtual funcionaba de la siguiente manera:", { bold: true }),
        bullet("Los estudiantes ingresaban a una reunión virtual a través de un enlace de Zoom."),
        bullet("Al llegar, un anfitrión les daba la bienvenida y les pedía que llenaran un formulario en una herramienta llamada Microsoft Forms."),
        bullet("Cada respuesta del formulario generaba automáticamente una fila en una hoja de cálculo de Excel, almacenada en una plataforma llamada SharePoint."),
        bullet("El anfitrión se encargaba de revisar esa hoja y asignar un número de turno a cada estudiante siguiendo el orden de llegada."),
        bullet("Para mantener el orden, el anfitrión debía renombrar manualmente a cada estudiante dentro de la reunión virtual, asignándole un número de turno."),
        bullet("Debido a que muchos estudiantes usaban un nombre diferente en la plataforma de videollamadas, el anfitrión tenía que preguntar repetidamente quién había enviado cada respuesta, generando confusión y demoras."),
        bullet("Una vez identificados, los estudiantes eran asignados a salas pequeñas donde un asesor les brindaba atención personalizada."),

        body("El principal problema de este proceso radicaba en la falta de claridad. Los estudiantes, aunque el número de turnos no fuera excesivamente grande en días normales, no lograban identificar cuál era su posición en la fila después de que sus nombres fueran cambiados. Esta confusión generaba inquietud, preguntas constantes y, en muchos casos, una sensación de desorden."),
        body("La situación se complicaba aún más en períodos de alta demanda, como las matrículas, donde la cantidad de estudiantes aumentaba drásticamente. Los tiempos de espera se volvían exagerados, el trabajo del anfitrión se duplicaba y la experiencia general se deterioraba para todos los involucrados.", { bold: true }),

        // Sección: El Nuevo Proceso
        heading1("2. El Nuevo Proceso"),
        body("Con la implementación del nuevo sistema, el flujo de atención cambió por completo. Ahora, el proceso es el siguiente:", { bold: true }),
        bullet("Los estudiantes acceden a una plataforma web sencilla e intuitiva, donde ingresan sus datos y seleccionan el servicio que necesitan."),
        bullet("El sistema asigna automáticamente un número de turno, sin necesidad de que el anfitrión realice ninguna acción manual."),
        bullet("Al ingresar a la reunión virtual, el nombre del estudiante se actualiza de forma automática con su número de turno, liberando al anfitrión de esa tarea repetitiva."),
        bullet("El estudiante puede ver en todo momento su posición en la fila, lo que le brinda tranquilidad y claridad sobre cuándo será atendido."),
        bullet("El anfitrión, libre de la carga administrativa, puede concentrarse en asignar a los estudiantes a las salas de asesoría de manera más rápida y eficiente."),
        bullet("Adicionalmente, el anfitrión ahora tiene la oportunidad de asesorar, dar información relevante o comunicar anuncios importantes mientras los estudiantes esperan, enriqueciendo la experiencia de atención."),

        body("Este nuevo enfoque elimina la confusión del proceso anterior y permite que cada persona en la reunión virtual cumpla un rol más claro y productivo."),

        // Comparativa
        heading1("3. Comparativa: Antes vs. Ahora"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 3120, 3120],
          rows: [
            new TableRow({
              children: [
                cell("Aspecto", { bold: true, fill: "1F4E79", width: 3120 }),
                cell("Antes", { bold: true, fill: "D5E8F0", width: 3120 }),
                cell("Ahora", { bold: true, fill: "D5E8F0", width: 3120 })
              ]
            }),
            new TableRow({
              children: [
                cell("Registro de turno", { width: 3120 }),
                cell("Manual mediante formulario y hoja de cálculo", { width: 3120 }),
                cell("Automático al ingresar a la plataforma", { width: 3120 })
              ]
            }),
            new TableRow({
              children: [
                cell("Identificación del estudiante", { width: 3120 }),
                cell("Confusa, nombres no coincidían con el formulario", { width: 3120 }),
                cell("Clara y ordenada desde el inicio", { width: 3120 })
              ]
            }),
            new TableRow({
              children: [
                cell("Asignación de número de turno", { width: 3120 }),
                cell("El anfitrión lo hacía uno por uno", { width: 3120 }),
                cell("El sistema lo genera instantáneamente", { width: 3120 })
              ]
            }),
            new TableRow({
              children: [
                cell("Rol del anfitrión", { width: 3120 }),
                cell("Renombrar manualmente y organizar la fila", { width: 3120 }),
                cell("Asignar salas, asesorar y dar información", { width: 3120 })
              ]
            }),
            new TableRow({
              children: [
                cell("Experiencia del estudiante", { width: 3120 }),
                cell("No sabía su turno ni su posición en la fila", { width: 3120 }),
                cell("Ve su número con tranquilidad y claridad", { width: 3120 })
              ]
            }),
            new TableRow({
              children: [
                cell("Tiempos en alta demanda", { width: 3120 }),
                cell("Exagerados y caóticos", { width: 3120 }),
                cell("Fluidos y controlados", { width: 3120 })
              ]
            })
          ]
        }),

        // Beneficios por rol
        heading1("4. Beneficios por Rol"),
        heading2("Para el anfitrión"),
        body("El anfitrión deja de ser un administrador de nombres y números para convertirse en un verdadero coordinador de la experiencia. Al eliminar la tarea manual de renombrar a cada estudiante, su tiempo se libera para actividades de mayor valor: asignar rápidamente a los estudiantes a las salas de asesoría, resolver dudas generales, dar indicaciones claras y mantener una comunicación constante y amigable con quienes esperan. Esto no solo mejora su productividad, sino también su satisfacción laboral."),

        heading2("Para el estudiante"),
        body("El estudiante vive una experiencia mucho más tranquila y predecible. Desde el momento en que ingresa, sabe exactamente qué número de turno tiene y puede estimar su tiempo de espera. Esto elimina la ansiedad de no saber si fue pasado por alto o si su nombre quedó perdido en la fila. La claridad genera confianza y una percepción positiva del servicio."),

        heading2("Para el asesor"),
        body("El asesor que atiende en las salas privadas también se beneficia, ya que recibe estudiantes ya identificados y organizados. No hay interrupciones para verificar identidades ni demoras por confusiones en la fila general. La atención es más directa, enfocada y eficiente."),

        heading2("Para la institución"),
        body("La universidad proyecta una imagen más profesional y moderna. El proceso es escalable, lo que significa que puede soportar grandes volúmenes de estudiantes sin degradar la calidad del servicio. Durante las épocas críticas de matrícula, el sistema mantiene el orden y evita que los tiempos de espera se descontrolen."),

        // Stack Tecnológico
        heading1("5. Stack Tecnológico Utilizado"),
        body("A continuación se presentan las herramientas y tecnologías que hacen posible el nuevo sistema. Se incluye una breve explicación de cada una en lenguaje sencillo."),

        heading2("Next.js"),
        body("Es un marco de trabajo que permite construir aplicaciones web modernas y rápidas. En términos simples, es la base sobre la cual se desarrolló la plataforma que los estudiantes utilizan para solicitar su turno."),

        heading2("TypeScript y React"),
        body("TypeScript es una forma de escribir código de programación de manera más organizada y segura. React es una librería que permite crear las pantallas visuales con las que el usuario interactúa. Juntos, garantizan que la plataforma sea estable y agradable de usar."),

        heading2("Tailwind CSS"),
        body("Es un sistema que define el diseño y los colores de las pantallas de la aplicación. Gracias a esto, la plataforma tiene un aspecto limpio, profesional y consistente en todos sus pasos."),

        heading2("Upstash Redis"),
        body("Es un servicio de memoria de alta velocidad que funciona como una pizarra temporal donde se guardan los turnos y la información de la fila en tiempo real. Esto permite que los estudiantes vean su posición actualizada al instante."),

        heading2("Microsoft Power Automate"),
        body("Es un conector que permite que la plataforma web se comunique automáticamente con otras herramientas de Microsoft, como SharePoint y Excel. De esta forma, la información fluye sin necesidad de intervención humana."),

        heading2("Zoom"),
        body("Es la plataforma de videollamadas donde se lleva a cabo la asesoría virtual. El sistema se integra con Zoom para gestionar las salas y la identificación de los participantes."),

        heading2("PostgreSQL y Prisma"),
        body("PostgreSQL es una base de datos donde se almacena de forma segura toda la información de los estudiantes y los turnos. Prisma es una herramienta que facilita la comunicación entre la aplicación web y esa base de datos."),

        // Conclusión
        heading1("6. Conclusión"),
        body("La implementación del nuevo sistema de asesoría virtual representa un cambio significativo en la forma en que se atiende a la comunidad estudiantil. Lo que antes era un proceso manual, confuso y propenso a errores en momentos de alta demanda, ahora es un flujo automatizado, transparente y escalable."),
        body("El anfitrión recupera su tiempo para actividades de verdadero valor agregado. El estudiante gana tranquilidad y claridad. La institución fortalece su imagen de modernidad y eficiencia."),
        body("En épocas de matrícula, donde cada minuto cuenta y la presión es mayor, contar con un sistema que mantenga el orden sin depender de acciones manuales se convierte en una ventaja competitiva indispensable. El camino hacia una atención más humana pasa, paradójicamente, por automatizar lo que no debería ser humano: el orden.")
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/joech/campus360-hub/Reporte_de_Mejoras_Asesoria_Virtual.docx", buffer);
  console.log("Documento creado exitosamente: Reporte_de_Mejoras_Asesoria_Virtual.docx");
}).catch(err => {
  console.error("Error al crear el documento:", err);
});
