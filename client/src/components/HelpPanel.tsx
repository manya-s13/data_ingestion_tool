import React from "react";

interface HelpPanelProps {
  currentStep: number;
}

const HelpPanel: React.FC<HelpPanelProps> = ({ currentStep }) => {
  const getStepHelpContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-sm text-neutral-400 space-y-2">
            <p>✓ Choose your data source and transfer direction</p>
            <p>✓ This will determine the flow of data between systems</p>
            <p>✓ You can transfer data from ClickHouse to Flat File or vice versa</p>
          </div>
        );
      case 2:
        return (
          <div className="text-sm text-neutral-400 space-y-2">
            <p>✓ Enter connection details for your selected source/target</p>
            <p>✓ For ClickHouse, you'll need host, port, database, user, and JWT token</p>
            <p>✓ For Flat File, specify the filename and delimiter</p>
          </div>
        );
      case 3:
        return (
          <div className="text-sm text-neutral-400 space-y-2">
            <p>✓ Select the columns you want to include in the data transfer</p>
            <p>✓ You can preview data before starting the ingestion process</p>
            <p>✓ The ingestion process may take time for large datasets</p>
            <p>✓ All errors will be displayed in the results panel</p>
          </div>
        );
      case 4:
        return (
          <div className="text-sm text-neutral-400 space-y-2">
            <p>✓ Review your configuration before starting the ingestion</p>
            <p>✓ The process may take time depending on the dataset size</p>
            <p>✓ Please don't close the browser during ingestion</p>
            <p>✓ You'll see a progress indicator during the process</p>
          </div>
        );
      case 5:
        return (
          <div className="text-sm text-neutral-400 space-y-2">
            <p>✓ Review the results of your data ingestion</p>
            <p>✓ The total number of records processed is displayed</p>
            <p>✓ Any errors that occurred will be shown here</p>
            <p>✓ You can start a new ingestion by clicking Reset</p>
          </div>
        );
      default:
        return (
          <div className="text-sm text-neutral-400 space-y-2">
            <p>✓ Follow the step-by-step process to configure and run your data ingestion</p>
            <p>✓ Each step will guide you through the required information</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-neutral-500 mb-4">Help & Tips</h2>
      {getStepHelpContent()}
    </div>
  );
};

export default HelpPanel;
