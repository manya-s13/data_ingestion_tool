import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { DataSource, Direction } from "@shared/schema";

interface IngestionStepProps {
  dataSource: DataSource;
  direction: Direction;
  selectedTable: string;
  selectedColumns: string[];
  onPreviousStep: () => void;
  onStartIngestion: () => void;
  isIngesting: boolean;
}

const IngestionStep: React.FC<IngestionStepProps> = ({
  dataSource,
  direction,
  selectedTable,
  selectedColumns,
  onPreviousStep,
  onStartIngestion,
  isIngesting
}) => {
  // Format direction text for display
  const getDirectionText = () => {
    if (direction === "clickhouse_to_flatfile") {
      return "ClickHouse to Flat File";
    } else {
      return "Flat File to ClickHouse";
    }
  };

  // Source text based on direction
  const getSourceText = () => {
    if (direction === "clickhouse_to_flatfile") {
      return "ClickHouse";
    } else {
      return "Flat File";
    }
  };

  // Target text based on direction
  const getTargetText = () => {
    if (direction === "clickhouse_to_flatfile") {
      return "Flat File";
    } else {
      return "ClickHouse";
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-neutral-500 mb-6">Step 4: Data Ingestion</h2>

      {isIngesting ? (
        <div className="space-y-6">
          <div className="p-4 border border-neutral-200 rounded-lg">
            <h3 className="text-md font-medium text-neutral-500 mb-3">Ingestion in Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span className="text-neutral-500 text-lg">Processing data...</span>
              </div>
              <Progress value={70} className="h-2" />
              <p className="text-sm text-neutral-400 text-center">
                Please don't close this window. Data transfer is in progress.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 border border-neutral-200 rounded-lg">
            <h3 className="text-md font-medium text-neutral-500 mb-3">Ingestion Details</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-neutral-400">Direction:</span>
                <span className="font-medium text-neutral-500">{getDirectionText()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-neutral-400">Source:</span>
                <span className="font-medium text-neutral-500">{getSourceText()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-neutral-400">Target:</span>
                <span className="font-medium text-neutral-500">{getTargetText()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-neutral-400">Table:</span>
                <span className="font-medium text-neutral-500">{selectedTable}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-neutral-400">Columns:</span>
                <span className="font-medium text-neutral-500">{selectedColumns.length} selected</span>
              </div>
            </div>
          </div>

          <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
            <h3 className="text-md font-medium text-neutral-500 mb-3">Important Information</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>• The ingestion process may take several minutes for large datasets</li>
              <li>• Please don't close this window during the ingestion</li>
              <li>• You'll see a report with the processed records when completed</li>
              <li>• In case of errors, you'll get detailed information</li>
            </ul>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between">
        <Button
          onClick={onPreviousStep}
          variant="outline"
          className="mt-3 sm:mt-0 border-primary-light text-primary hover:bg-primary-light hover:text-white"
          disabled={isIngesting}
        >
          Back to Column Selection
        </Button>
        
        <Button
          onClick={onStartIngestion}
          className="bg-primary text-white hover:bg-primary-dark"
          disabled={isIngesting}
        >
          {isIngesting ? "Ingesting Data..." : "Start Ingestion"}
        </Button>
      </div>
    </div>
  );
};

export default IngestionStep;
