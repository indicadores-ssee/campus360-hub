'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect } from 'react';

import AnnouncementCarousel from '@/components/AnnouncementCarousel';
import BusinessHoursWatcher from '@/components/BusinessHoursWatcher';
import ErrorBoundary from '@/components/ErrorBoundary';
import MobileWarningModal from '@/components/MobileWarningModal';
import PageHeader from '@/components/PageHeader';
import ScheduleHydrator from '@/components/ScheduleHydrator';
import FormStepIndicator from '@/components/FormStepIndicator';
import ContactTimeModal from '@/components/wizard/ContactTimeModal';
import GuideModal from '@/components/wizard/GuideModal';
import { FormProvider, useFormContext } from '@/contexts/FormContext';
import { c } from '@/data/content';
import { useBannerAnnouncements } from '@/hooks/use-banner-announcements';
import { buildRoute } from '@/lib/navigation-utilities';

const ROUTE_TO_STEP: Record<string, number> = {
  '/tipo': 1,
  '/datos': 2,
  '/servicio': 3,
  '/detalle': 4,
  '/resultado': 5,
};

function FormShell({ children }: { children: React.ReactNode }) {
  const {
    data,
    dispatch,
    submitError,
    guideModalOpen,
    contactTimeModalOpen,
    handleContactTimeConfirm,
    closeContactTimeModal,
    setStep,
  } = useFormContext();
  const pathname = usePathname();

  useEffect(() => {
    for (const [route, step] of Object.entries(ROUTE_TO_STEP)) {
      if (pathname.endsWith(route)) {
        if (data.step !== step) {
          setStep(step);
        }
        return;
      }
    }
  }, [pathname, data.step, setStep]);

  const isTipoPage = pathname.endsWith('/tipo');
  const isResultadoPage = pathname.endsWith('/resultado');
  const { messages, rotationIntervalMs, isLoading } = useBannerAnnouncements();

  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader />

      <div>
        <section className="relative z-10 bg-utpl-blue pb-6 pt-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-display text-[52px] font-extrabold leading-[1] tracking-tight text-white">
              {c.layout.brand}
              <span className="text-utpl-gold">{c.layout.brandAccent}</span>
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 bg-[#febe10] py-2.5 text-center">
        <p className="font-display text-[11px] font-extrabold uppercase tracking-[3px] text-utpl-navy">
          Escribiendo historias que transforman el mundo
        </p>
      </section>

      <div className="relative z-10 bg-utpl-blue py-5 text-center">
        <p className="font-display text-[22.9px] font-semibold text-white sm:text-[25.7px]">
          {c.layout.welcome.banner}
        </p>
      </div>

      </div>

      <main className="relative z-10 mx-auto flex w-full flex-1 max-w-3xl flex-col px-4 py-8">
        {submitError && (
          <motion.div
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p className="text-sm font-semibold text-red-700">{c.layout.errorHeading}</p>
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          </motion.div>
        )}

        <div className="rounded-xl bg-white px-6 py-7 sm:px-8">
          {!isResultadoPage && !isLoading && messages.length > 0 && (
            <div className="mb-6">
              <AnnouncementCarousel messages={messages} rotationIntervalMs={rotationIntervalMs} />
            </div>
          )}
          {!isTipoPage && (
            <div className="mb-8">
              <FormStepIndicator />
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="relative z-10 shrink-0 bg-utpl-blue py-5 text-center">
        <p className="text-xs tracking-wider text-white/50">
          &copy; {new Date().getFullYear()} {c.layout.footer}
        </p>
      </footer>

      <GuideModal isOpen={guideModalOpen} />
      <ContactTimeModal
        isOpen={contactTimeModalOpen}
        onClose={closeContactTimeModal}
        onConfirm={handleContactTimeConfirm}
      />
      <MobileWarningModal />
    </div>
  );
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParameters = useSearchParams();

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(buildRoute(path, searchParameters));
    },
    [router, searchParameters]
  );

  return (
    <FormProvider onNavigate={handleNavigate}>
      <ScheduleHydrator />
      <BusinessHoursWatcher />
      <FormShell>{children}</FormShell>
    </FormProvider>
  );
}

export default function FormLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={<div className="py-8 text-center text-sm text-utpl-muted">{c.layout.loading}</div>}
    >
      <LayoutWrapper>{children}</LayoutWrapper>
    </Suspense>
  );
}