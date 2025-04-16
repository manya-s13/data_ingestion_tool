import React from "react";

interface StepProgressProps {
  currentStep: number;
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep }) => {
  const steps = [
    { label: "Source", step: 1 },
    { label: "Connect", step: 2 },
    { label: "Columns", step: 3 },
    { label: "Ingestion", step: 4 },
    { label: "Results", step: 5 },
  ];

  const getStepClassName = (step: number) => {
    if (step < currentStep) return "step-complete";
    if (step === currentStep) return "step-active";
    return "step-inactive";
  };

  const getConnectorClassName = (step: number) => {
    return step < currentStep ? "step-connector step-connector-active" : "step-connector";
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStepClassName(
                  step.step
                )} mb-2`}
              >
                <span>{step.step}</span>
              </div>
              <span
                className={`text-sm font-medium ${
                  step.step <= currentStep ? "text-neutral-500" : "text-neutral-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className={`flex-1 ${getConnectorClassName(step.step)} mx-2`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepProgress;
