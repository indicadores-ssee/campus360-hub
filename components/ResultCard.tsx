'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, Mail, Ticket, Video, X, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useFormContext } from '@/contexts/FormContext';
import { c } from '@/data/content';
import { formatTurnoForDisplay } from '@/lib/simulation';

const EXPIRATION_MINUTES = 2;
const EXPIRATION_MS = EXPIRATION_MINUTES * 60 * 1000;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

interface ResultCardProperties {
  mode: 'completed' | 'turno' | 'fuera-horario';
  turnoNumber?: string;
  nombres?: string;
  apellidos?: string;
  horaContacto?: string;
  zoomLink?: string | null;
  webZoomLink?: string | null;
}

export default function ResultCard({
  mode,
  turnoNumber,
  nombres,
  apellidos,
  horaContacto,
  zoomLink,
  webZoomLink,
}: ResultCardProperties) {
  if (mode === 'fuera-horario') {
    return (
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-utpl-surface"
          variants={itemVariants}
        >
          <Clock className="h-8 w-8 text-utpl-blue" />
        </motion.div>
        <motion.h2
          className="text-2xl font-black text-utpl-blue sm:text-3xl"
          variants={itemVariants}
        >
          Gracias por tu solicitud
        </motion.h2>
        <motion.p
          className="mt-2 text-sm leading-relaxed text-utpl-muted sm:text-base"
          variants={itemVariants}
        >
          Tus datos han sido registrados exitosamente.
        </motion.p>
        {horaContacto && (
          <motion.div
            className="mx-auto mt-6 max-w-xs rounded-2xl border-2 border-blue-100 bg-blue-50/50 p-5"
            variants={itemVariants}
          >
            <p className="text-sm font-bold text-utpl-blue">Un asesor se contactará contigo en:</p>
            <p className="mt-1 text-2xl font-black text-utpl-blue">{horaContacto}</p>
            <p className="mt-1 text-xs text-utpl-muted">Por favor mantente atento a tu teléfono</p>
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (mode === 'completed') {
    return (
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50"
          variants={itemVariants}
        >
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </motion.div>
        <motion.h2
          className="text-2xl font-black text-utpl-blue sm:text-3xl"
          variants={itemVariants}
        >
          ¡Gracias por confiar en nosotros!
        </motion.h2>
        <motion.p
          className="mt-2 text-sm leading-relaxed text-utpl-muted sm:text-base"
          variants={itemVariants}
        >
          Tu requerimiento ha sido registrado exitosamente.
        </motion.p>
        {turnoNumber && (
          <motion.div
            className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-blue-100 bg-blue-50 px-5 py-2.5"
            variants={itemVariants}
          >
            <Ticket className="h-5 w-5 text-utpl-blue" />
            <span className="text-base font-bold text-utpl-blue">
              Turno: {formatTurnoForDisplay(turnoNumber)}
            </span>
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (mode === 'turno' && turnoNumber && zoomLink && webZoomLink) {
    const displayNumber = formatTurnoForDisplay(turnoNumber);
    return <TurnoResult displayNumber={displayNumber} zoomLink={zoomLink} webZoomLink={webZoomLink} />;
  }

  return null;
}

function TurnoResult({
  displayNumber,
  zoomLink,
  webZoomLink,
}: {
  displayNumber: string;
  zoomLink: string;
  webZoomLink: string;
}) {
  const { data, dispatch } = useFormContext();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(EXPIRATION_MS);
  const [isExpired, setIsExpired] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasExpiredRef = useRef(false);

  const isMobile = useMemo(
    () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
    [],
  );

  // Calcular tiempo restante
  useEffect(() => {
    if (data.turnoUsed || !data.turnoAssignedAt) return;

    hasExpiredRef.current = false;
    const assignedAt = new Date(data.turnoAssignedAt).getTime();
    const now = Date.now();
    const elapsed = now - assignedAt;
    const remaining = Math.max(0, EXPIRATION_MS - elapsed);

    setTimeLeft(remaining);
    if (remaining <= 0) setIsExpired(true);

    timerRef.current = setInterval(() => {
      const elapsed2 = Date.now() - assignedAt;
      const remaining2 = Math.max(0, EXPIRATION_MS - elapsed2);
      setTimeLeft(remaining2);

      if (remaining2 <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsExpired(true);

        if (data.turnoRequestId && data.turnoNumber && !hasExpiredRef.current) {
          hasExpiredRef.current = true;
          fetch('/api/turno/caducar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requestId: data.turnoRequestId,
              turno: data.turnoNumber,
              nuevoEstado: 'CADUCADO',
              fechaCaducidad: new Date().toISOString(),
            }),
          }).catch((error) => {
            console.warn('Error marcando turno como caducado automáticamente:', error);
          });
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [data.turnoAssignedAt, data.turnoUsed, data.turnoRequestId, data.turnoNumber]);

  const handleJoinZoom = useCallback(() => {
    dispatch({ type: 'SET_TURNO_USED', used: true });
    if (timerRef.current) clearInterval(timerRef.current);

    if (isMobile) {
      window.open(webZoomLink, '_blank');
    } else {
      window.location.href = zoomLink;
      const fallback = setTimeout(() => window.open(webZoomLink, '_blank'), 2000);
      const onBlur = () => clearTimeout(fallback);
      window.addEventListener('blur', onBlur, { once: true });
    }
  }, [zoomLink, webZoomLink, isMobile, dispatch]);

  const handleGenerateNewTurno = async () => {
    if (isGenerating || data.turnoAttempts >= 3) return;
    setIsGenerating(true);

    // 1. Marcar como CADUCADO en Power Automate (si hay URL configurada y no se caducó automáticamente)
    if (data.turnoRequestId && data.turnoNumber && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      try {
        await fetch('/api/turno/caducar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: data.turnoRequestId,
            turno: data.turnoNumber,
            nuevoEstado: 'CADUCADO',
            fechaCaducidad: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.warn('Error marcando turno como caducado:', error);
      }
    }

    // 2. Incrementar contador de intentos
    dispatch({ type: 'INCREMENT_TURNO_ATTEMPTS' });

    // 3. Generar nuevo turno
    try {
      const modalidad = data.userType === 'aspirante' ? 'ASPIRANTE' : data.modalidad;

      const response = await fetch('/api/turno?action=reasignar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          nombres: data.nombres,
          apellidos: data.apellidos,
          cedula: data.cedula,
          email: data.email,
          telefono: data.telefono,
          servicio: data.selectedCategoryTitle || 'Consulta general',
          freeText: data.freeText,
          modalidad,
          origen: 'TURNO',
          pais: data.pais,
          prefijoTelefonico: data.prefijoTelefonico,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.turnoNumber) {
          dispatch({ type: 'SET_TURNO_NUMBER', turnoNumber: result.turnoNumber });
          dispatch({
            type: 'SET_ZOOM_LINKS',
            zoomLink: result.zoomLink,
            webZoomLink: result.webZoomLink,
          });
          if (result.requestId) {
            dispatch({ type: 'SET_TURNO_REQUEST_ID', requestId: result.requestId });
          }
          dispatch({ type: 'SET_TURNO_ASSIGNED_AT', assignedAt: new Date().toISOString() });
          dispatch({ type: 'SET_TURNO_USED', used: false });
          setIsExpired(false);
          setTimeLeft(EXPIRATION_MS);
        }
      }
    } catch (error) {
      console.error('Error generando nuevo turno:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoHome = () => {
    dispatch({ type: 'RESET' });
    window.location.href = '/';
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  // Si superó los 3 intentos, mostrar pantalla final
  if (data.turnoAttempts >= 3 && !data.turnoUsed) {
    return (
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50"
          variants={itemVariants}
        >
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </motion.div>
        <motion.h2
          className="text-2xl font-black text-red-600 sm:text-3xl"
          variants={itemVariants}
        >
          Lo sentimos
        </motion.h2>
        <motion.p
          className="mt-4 text-base leading-relaxed text-utpl-muted"
          variants={itemVariants}
        >
          Has perdido tu turno.
          <br />
          Superaste el límite de 3 intentos.
        </motion.p>
        <motion.div className="mx-auto mt-8 max-w-xs" variants={itemVariants}>
          <button
            type="button"
            onClick={handleGoHome}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-utpl-blue px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-utpl-blue-hover active:scale-[0.98]"
          >
            Volver al inicio
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
    <motion.div
      className="text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Banner encuesta - se oculta al entrar al Zoom */}
      {!data.turnoUsed && (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed top-20 right-4 z-50 max-w-xs rounded-2xl border-2 border-amber-400 bg-white p-4 shadow-xl shadow-amber-200/50"
      >
        <button
          type="button"
          onClick={() => {}}
          className="absolute right-2 top-2 text-amber-500 hover:text-amber-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          >
            <Mail className="h-5 w-5 text-amber-500" />
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-utpl-blue">
              Encuesta de satisfacción
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Al finalizar tu atención, recibirás un correo.{' '}
              <span className="font-bold text-amber-600">Tu opinión nos permitirá evaluar y optimizar la calidad de nuestro servicio.</span>
            </p>
          </div>
        </div>
      </motion.div>
      )}

      {/* Contador de caducidad */}
      {!data.turnoUsed && !isExpired && (
        <motion.div
          className={`mx-auto mb-4 max-w-xs rounded-xl border-2 p-3 ${
            timeLeft < 60000
              ? 'border-red-300 bg-red-50'
              : 'border-blue-200 bg-blue-50'
          }`}
          variants={itemVariants}
        >
          <div className="flex items-center justify-center gap-2">
            <Clock className={`h-4 w-4 ${timeLeft < 60000 ? 'text-red-500' : 'text-blue-500'}`} />
            <p className={`text-sm font-bold ${timeLeft < 60000 ? 'text-red-600' : 'text-blue-700'}`}>
              Tu turno expira en: {formatTime(timeLeft)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Mensaje de turno asegurado */}
      {data.turnoUsed && (
        <motion.div
          className="mx-auto mb-4 max-w-xs rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-bold text-emerald-700">
              Turno asegurado. Puedes ingresar cuando quieras.
            </p>
          </div>
        </motion.div>
      )}

      {/* Mensaje de caducado + botón generar nuevo */}
      {isExpired && !data.turnoUsed && (
        <motion.div
          className="mx-auto mb-6 max-w-sm space-y-4"
          variants={itemVariants}
        >
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-sm font-bold text-red-700">
                Tu turno #{data.turnoNumber} ha caducado por inactividad.
              </p>
            </div>
            <p className="mt-2 text-xs text-red-600">
              Intento {data.turnoAttempts + 1} de 3
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateNewTurno}
            disabled={isGenerating || data.turnoAttempts >= 3}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-utpl-blue px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-utpl-blue-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generando turno...
              </>
            ) : (
              <>
                <Ticket className="h-4 w-4" />
                Generar nuevo turno
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Solo mostrar ticket y botón de Zoom si NO ha caducado */}
      {!isExpired && (
        <>
          <motion.div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-utpl-surface"
            variants={itemVariants}
          >
            <Ticket className="h-7 w-7 text-utpl-blue" />
          </motion.div>
          <motion.h2
            className="text-xl font-black text-utpl-blue sm:text-2xl"
            variants={itemVariants}
          >
            Turno asignado
          </motion.h2>

          <div className="mx-auto mt-6 max-w-xs">
            <motion.div
              className="ticket-shine relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#004270] via-[#003a60] to-[#002d4d] p-6 shadow-xl sm:p-8"
              variants={itemVariants}
            >
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white" />
                <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white" />
              </div>

              <div className="absolute left-0 top-0 flex -translate-x-1/2 flex-col gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-2 w-2 rounded-full bg-white/20" />
                ))}
              </div>
              <div className="absolute right-0 top-0 flex translate-x-1/2 flex-col gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-2 w-2 rounded-full bg-white/20" />
                ))}
              </div>

              <div className="relative">
                <motion.p
                  className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-utpl-gold"
                  variants={itemVariants}
                >
                  Tu turno es
                </motion.p>
                <motion.p
                  className="text-5xl font-black leading-none text-white sm:text-6xl"
                  variants={itemVariants}
                >
                  {displayNumber}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>

      {!isExpired && (
        <motion.div
          className="mx-auto mt-4 max-w-xs"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            type="button"
            onClick={handleJoinZoom}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-utpl-blue/20 bg-white px-5 py-3 text-sm font-bold text-utpl-blue shadow-lg transition-all hover:bg-utpl-blue hover:text-white focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Video className="h-4 w-4" />
            Unirse a Zoom
          </motion.button>
          {!isMobile && (
            <p className="mt-2 text-center text-[10px] text-slate-400">
              o{' '}
              <a
                href={webZoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline transition-colors hover:text-utpl-blue focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                abrir en navegador
              </a>
            </p>
          )}
        </motion.div>
      )}

      {!isExpired && (
        <motion.div
          className="mx-auto mt-5 max-w-xs"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-left">
              <Video className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-justify text-xs leading-relaxed text-amber-800">
                {c.result.recordingNotice}
              </p>
            </div>

            <div className="mt-3 rounded-xl border-2 border-utpl-blue/50 bg-white p-3 text-left shadow-sm">
              <p className="text-xs font-medium leading-relaxed text-utpl-text">
                {c.result.ethicsRegulationIntro}{' '}
                <a
                  href={c.result.ethicsRegulationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-utpl-blue underline underline-offset-2 hover:text-utpl-blue-hover"
                >
                  {c.result.ethicsRegulationLinkText}
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
