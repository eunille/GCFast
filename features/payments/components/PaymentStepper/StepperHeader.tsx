// features/payments/components/PaymentStepper/StepperHeader.tsx
// Layer 4 — PRESENTATIONAL: Visual 3-step progress indicator

interface Step {
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { label: "Select Member", description: "Step 1" },
  { label: "Payment Details", description: "Step 2" },
  { label: "Confirmation", description: "Step 3" },
];

interface Props {
  currentStep: 1 | 2 | 3;
}

export function StepperHeader({ currentStep }: Props) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={stepNum} className="flex items-center flex-1 last:flex-none">
            {/* Step bubble + label */}
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isDone
                    ? "bg-accent text-white"
                    : isActive
                    ? "bg-accent text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <div className="hidden sm:block">
                <p
                  className={`text-sm font-semibold leading-tight ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>

            {/* Connector line (not on last step) */}
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 mx-3 h-0.5 transition-colors ${
                  stepNum < currentStep ? "bg-accent" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
