import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import StepProgress from "./StepProgress";
import ConfigSummary from "./ConfigSummary";
import HelpPanel from "./HelpPanel";
import SourceSelectionStep from "./SourceSelectionStep";
import ConnectionStep from "./ConnectionStep";
import ColumnSelectionStep from "./ColumnSelectionStep";
import IngestionStep from "./IngestionStep";
import ResultsStep from "./ResultsStep";
import PreviewModal from "./PreviewModal";
import ErrorNotification from "./ErrorNotification";
import { useDataIngestion } from "@/hooks/useDataIngestion";

const DataIngestionTool = () => {
  const {
    currentStep,
    dataSource,
    direction,
    clickhouseConfig,
    flatFileConfig,
    availableTables,
    selectedTable,
    availableColumns,
    selectedColumns,
    previewData,
    isPreviewLoading,
    ingestionResults,
    isIngesting,
    setCurrentStep,
    setDataSource,
    setDirection,
    setClickhouseConfig,
    setFlatFileConfig,
    setSelectedTable,
    setSelectedColumns,
    fetchTables,
    fetchColumns,
    fetchPreviewData,
    startIngestion,
    resetConfiguration,
    isFetchingTables,
    isFetchingColumns,
    error,
    setError
  } = useDataIngestion();

  const [showPreview, setShowPreview] = useState(false);

  // Handle preview button click
  const handlePreviewData = async () => {
    try {
      await fetchPreviewData();
      setShowPreview(true);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <SourceSelectionStep
            dataSource={dataSource}
            direction={direction}
            onDataSourceChange={setDataSource}
            onDirectionChange={setDirection}
            onNextStep={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <ConnectionStep
            dataSource={dataSource}
            direction={direction}
            clickhouseConfig={clickhouseConfig}
            flatFileConfig={flatFileConfig}
            onClickhouseConfigChange={setClickhouseConfig}
            onFlatFileConfigChange={setFlatFileConfig}
            onPreviousStep={() => setCurrentStep(1)}
            onNextStep={async () => {
              try {
                await fetchTables();
                setCurrentStep(3);
              } catch (err) {
                // Error handling is done in the hook
              }
            }}
            onTablesFetch={fetchTables}
            isFetchingTables={isFetchingTables}
            availableTables={availableTables}
            selectedTable={selectedTable}
            onTableSelect={setSelectedTable}
          />
        );
      case 3:
        return (
          <ColumnSelectionStep
            dataSource={dataSource}
            direction={direction}
            availableColumns={availableColumns}
            selectedColumns={selectedColumns}
            onColumnsChange={setSelectedColumns}
            onPreviousStep={() => setCurrentStep(2)}
            onNextStep={() => setCurrentStep(4)}
            onPreviewData={handlePreviewData}
            isFetchingColumns={isFetchingColumns}
          />
        );
      case 4:
        return (
          <IngestionStep
            dataSource={dataSource}
            direction={direction}
            selectedTable={selectedTable}
            selectedColumns={selectedColumns}
            onPreviousStep={() => setCurrentStep(3)}
            onStartIngestion={async () => {
              try {
                await startIngestion();
                setCurrentStep(5);
              } catch (err) {
                // Error handling is done in the hook
              }
            }}
            isIngesting={isIngesting}
          />
        );
      case 5:
        return (
          <ResultsStep
            results={ingestionResults}
            onReset={() => {
              resetConfiguration();
              setCurrentStep(1);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* App Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-500 mb-2">ClickHouse & Flat File Data Ingestion Tool</h1>
        <p className="text-neutral-400">Bidirectional data transfer between ClickHouse and Flat File formats</p>
      </header>

      {/* Step Progress Bar */}
      <StepProgress currentStep={currentStep} />

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel: Configuration Overview */}
        <div className="w-full md:w-1/3">
          <ConfigSummary
            dataSource={dataSource}
            direction={direction}
            clickhouseConfig={clickhouseConfig}
            flatFileConfig={flatFileConfig}
            selectedTable={selectedTable}
            onReset={resetConfiguration}
          />
          
          <HelpPanel currentStep={currentStep} />
        </div>
        
        {/* Right Panel: Current Step Interface */}
        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-lg shadow p-6">
            {renderStepContent()}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          selectedTable={selectedTable}
          selectedColumns={selectedColumns}
          previewData={previewData}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Error Notification */}
      {error && (
        <ErrorNotification
          error={error}
          onDismiss={() => setError(null)}
        />
      )}
    </div>
  );
};

export default DataIngestionTool;
