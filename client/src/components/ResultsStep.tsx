import React from "react";
import { Button } from "@/components/ui/button";
import { IngestResult } from "@shared/schema";
import { CheckCircle, XCircle } from "lucide-react";

interface ResultsStepProps {
  results: IngestResult;
  onReset: () => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({ results, onReset }) => {
  return (
    <div>
      <h2 className="text-lg font-medium text-neutral-500 mb-6">Step 5: Ingestion Results</h2>

      <div className="space-y-6">
        <div className={`p-6 border rounded-lg ${results.success ? 'border-success bg-success/5' : 'border-error bg-error/5'}`}>
          <div className="flex items-center">
            {results.success ? (
              <CheckCircle className="h-8 w-8 text-success mr-3" />
            ) : (
              <XCircle className="h-8 w-8 text-error mr-3" />
            )}
            <h3 className={`text-xl font-semibold ${results.success ? 'text-success-dark' : 'text-error-dark'}`}>
              {results.success ? 'Ingestion Successful' : 'Ingestion Failed'}
            </h3>
          </div>

          <div className="mt-4 space-y-4">
            {results.success && results.recordsProcessed !== undefined && (
              <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                <span className="text-neutral-500">Records Processed:</span>
                <span className="text-lg font-semibold text-neutral-600">{results.recordsProcessed.toLocaleString()}</span>
              </div>
            )}

            {results.message && (
              <div className="py-2">
                <span className="text-neutral-500">Message:</span>
                <p className="mt-1 text-neutral-600">{results.message}</p>
              </div>
            )}

            {!results.success && results.error && (
              <div className="py-2 text-error-dark bg-error/10 p-3 rounded">
                <span className="font-medium">Error:</span>
                <p className="mt-1">{results.error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
          <h3 className="text-md font-medium text-neutral-500 mb-3">What's Next?</h3>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li>• You can start a new data ingestion by clicking "Start New Ingestion"</li>
            <li>• All your previous configuration will be reset</li>
            {results.success && (
              <li>• Your data has been successfully transferred and is ready to use</li>
            )}
            {!results.success && (
              <li>• Review the error message, fix any issues, and try again</li>
            )}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={onReset}
          className="bg-primary text-white hover:bg-primary-dark px-6"
        >
          Start New Ingestion
        </Button>
      </div>
    </div>
  );
};

export default ResultsStep;
