import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { logUserAction } from '../../utils/logger';

const STORAGE_KEY = 'syncsplit_onboarding_complete';
const STEP_KEY = 'syncsplit_onboarding_step';

const STEPS = [
  {
    id: 1,
    title: 'Connect Wallet',
    description: 'Connect your Freighter wallet on Stellar Testnet.',
    icon: 'account_balance_wallet',
    helpText: 'Install Freighter from freighter.app, switch to Testnet, then click Connect.',
  },
  {
    id: 2,
    title: 'Fund Wallet',
    description: 'Get free testnet XLM from Friendbot.',
    icon: 'savings',
    helpText: 'Click the Friendbot link below to fund your wallet with 10,000 test XLM.',
    friendbotUrl: 'https://laboratory.stellar.org/#account-creator?network=test',
  },
  {
    id: 3,
    title: 'Create a Split',
    description: 'Use the Split Calculator to create an on-chain bill split.',
    icon: 'call_split',
    helpText: 'Enter an amount, add participants, and submit to create a split on Soroban.',
  },
  {
    id: 4,
    title: 'Execute Transaction',
    description: 'Send XLM or mark a payment as paid.',
    icon: 'send',
    helpText: 'Go to the Transactions page to send XLM, or mark yourself as paid in a split.',
  },
  {
    id: 5,
    title: 'Verify on Explorer',
    description: 'Copy your transaction hash and verify on Stellar Expert.',
    icon: 'verified',
    helpText: 'Click the transaction hash to copy, then view it on stellar.expert.',
  },
];

/**
 * OnboardingStepper — Guided 5-step flow for new users.
 * Auto-advances based on wallet/contract state.
 * Persists completion to localStorage.
 */
export default function OnboardingStepper({
  isConnected,
  publicKey,
  balance,
  contractTxHash,
  paymentTxHash,
  onConnectClick,
}) {
  const [dismissed, setDismissed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Check if already completed
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      setDismissed(true);
    }
    const saved = localStorage.getItem(STEP_KEY);
    if (saved) {
      setCurrentStep(Math.min(parseInt(saved, 10) || 1, 5));
    }
  }, []);

  // Auto-advance: Step 1 — wallet connected
  useEffect(() => {
    if (isConnected && !completedSteps.has(1)) {
      markComplete(1);
    }
  }, [isConnected]);

  // Auto-advance: Step 2 — wallet funded
  useEffect(() => {
    const bal = parseFloat(balance);
    if (isConnected && bal > 0 && !completedSteps.has(2)) {
      markComplete(2);
    }
  }, [balance, isConnected]);

  // Auto-advance: Step 3 — split created
  useEffect(() => {
    if (contractTxHash && !completedSteps.has(3)) {
      markComplete(3);
    }
  }, [contractTxHash]);

  // Auto-advance: Step 4 — payment sent
  useEffect(() => {
    if (paymentTxHash && !completedSteps.has(4)) {
      markComplete(4);
    }
  }, [paymentTxHash]);

  const markComplete = useCallback((stepId) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });

    const step = STEPS.find(s => s.id === stepId);
    logUserAction({
      wallet: publicKey,
      action: `onboarding_step_${stepId}_complete`,
      details: { stepTitle: step?.title },
    });

    // Advance to next incomplete step
    const nextStep = Math.min(stepId + 1, 5);
    setCurrentStep(nextStep);
    localStorage.setItem(STEP_KEY, String(nextStep));
  }, [publicKey]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    logUserAction({ wallet: publicKey, action: 'onboarding_dismissed' });
  };

  const handleFinish = () => {
    markComplete(5);
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    logUserAction({ wallet: publicKey, action: 'onboarding_completed' });
  };

  const handleReset = () => {
    setDismissed(false);
    setCurrentStep(1);
    setCompletedSteps(new Set());
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STEP_KEY);
  };

  if (dismissed) return null;

  const activeStep = STEPS.find(s => s.id === currentStep) || STEPS[0];
  const progress = (completedSteps.size / STEPS.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding-stepper"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[55] w-[340px]"
      >
        <div className="bg-surface-container/90 backdrop-blur-2xl rounded-2xl border border-outline-variant/15 shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-surface-container-highest">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Header */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">rocket_launch</span>
              <span className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface">
                Getting Started
              </span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-outline hover:text-on-surface transition-colors cursor-pointer p-1"
              title="Dismiss"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Step Indicators */}
          <div className="px-5 py-2 flex gap-1.5">
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex-1 h-1.5 rounded-full transition-all cursor-pointer ${
                  completedSteps.has(step.id)
                    ? 'bg-tertiary'
                    : step.id === currentStep
                    ? 'bg-primary'
                    : 'bg-outline-variant/20'
                }`}
                title={`Step ${step.id}: ${step.title}`}
              />
            ))}
          </div>

          {/* Active Step Content */}
          <div className="px-5 py-3">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                completedSteps.has(activeStep.id)
                  ? 'bg-tertiary/15'
                  : 'bg-primary/10'
              }`}>
                <span className={`material-symbols-outlined text-lg ${
                  completedSteps.has(activeStep.id) ? 'text-tertiary' : 'text-primary'
                }`}
                  style={{ fontVariationSettings: completedSteps.has(activeStep.id) ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {completedSteps.has(activeStep.id) ? 'check_circle' : activeStep.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-outline">
                    {currentStep}/5
                  </span>
                  {completedSteps.has(activeStep.id) && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-tertiary">
                      Done
                    </span>
                  )}
                </div>
                <h4 className="font-headline font-bold text-sm text-on-surface mt-0.5">
                  {activeStep.title}
                </h4>
                <p className="text-xs text-outline mt-1 leading-relaxed">
                  {activeStep.description}
                </p>
              </div>
            </div>

            {/* Help Text */}
            <p className="text-[11px] text-on-surface-variant mt-3 leading-relaxed bg-surface-container-low rounded-lg p-3">
              {activeStep.helpText}
            </p>

            {/* Action Buttons */}
            <div className="mt-3 flex gap-2">
              {currentStep === 1 && !isConnected && (
                <button
                  onClick={onConnectClick}
                  className="flex-1 py-2 gradient-btn text-on-primary-fixed font-headline font-bold text-xs rounded-lg cursor-pointer"
                >
                  Connect Wallet
                </button>
              )}
              {currentStep === 2 && activeStep.friendbotUrl && (
                <a
                  href={activeStep.friendbotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 gradient-btn text-on-primary-fixed font-headline font-bold text-xs rounded-lg text-center"
                >
                  Open Friendbot
                </a>
              )}
              {currentStep === 5 && (
                <button
                  onClick={handleFinish}
                  className="flex-1 py-2 gradient-btn text-on-primary-fixed font-headline font-bold text-xs rounded-lg cursor-pointer"
                >
                  Complete Onboarding
                </button>
              )}
              {currentStep > 1 && currentStep < 5 && completedSteps.has(currentStep) && (
                <button
                  onClick={() => { setCurrentStep(currentStep + 1); localStorage.setItem(STEP_KEY, String(currentStep + 1)); }}
                  className="flex-1 py-2 bg-primary/10 text-primary font-headline font-bold text-xs rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                >
                  Next Step
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Export the reset function for admin usage
OnboardingStepper.resetOnboarding = function() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STEP_KEY);
  window.location.reload();
};
