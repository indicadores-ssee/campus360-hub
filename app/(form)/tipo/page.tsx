'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import FormStepIndicator from '@/components/FormStepIndicator';
import StepUserType from '@/components/wizard/StepUserType';
import { useFormContext } from '@/contexts/FormContext';
import { c } from '@/data/content';
import { buildRoute } from '@/lib/navigation-utilities';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// function RecordingNotice() {
//   const noticeText = c.steps.tipo.recordingNotice;
//   const url = c.steps.tipo.recordingNoticeUrl;
//   const linkText = 'aquí';
//
//   const parts = noticeText.split(linkText);
//
//   return (
//     <div className="w-full rounded-xl border-l-4 border-utpl-gold bg-white px-4 py-3">
//       <p className="text-xs font-medium leading-relaxed text-utpl-navy/70">
//         {parts[0]}
//         <a
//           href={url}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="font-semibold text-utpl-navy underline decoration-utpl-gold/50 underline-offset-2 hover:text-utpl-navy-light"
//         >
//           {linkText}
//         </a>
//         {parts[1]}
//       </p>
//     </div>
//   );
// }

function TipoContent() {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const { setUserType, validateCurrentStep, dispatch, errors } = useFormContext();

  const handleSelectUserType = (type: 'estudiante' | 'aspirante') => {
    setUserType(type);
    // Validar inmediatamente después de setear
    setTimeout(() => {
      if (!validateCurrentStep()) {
        dispatch({ type: 'ATTEMPT_VALIDATION', step: 1 });
        return;
      }
      router.push(buildRoute('/datos', searchParameters));
    }, 0);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="mb-6 text-center"
      >
        <p className="font-display text-xl font-bold text-utpl-navy sm:text-2xl">
          {c.layout.welcome.heading}
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.15em] text-utpl-muted">
          Selecciona tu tipo de usuario
        </p>
        <FormStepIndicator className="mb-6" />
        <StepUserType onSelect={handleSelectUserType} />
      </motion.div>

      {/* <motion.div variants={itemVariants}>
        <RecordingNotice />
      </motion.div> */}

      {errors.userType && (
        <motion.p
          variants={itemVariants}
          className="mt-4 text-center text-xs font-medium text-red-500"
        >
          {errors.userType}
        </motion.p>
      )}
    </motion.div>
  );
}

export default function TipoPage() {
  return (
    <Suspense
      fallback={<div className="py-8 text-center text-sm text-utpl-muted">Cargando...</div>}
    >
      <TipoContent />
    </Suspense>
  );
}