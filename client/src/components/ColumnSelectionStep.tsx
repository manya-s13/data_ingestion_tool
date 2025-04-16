import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { DataSource, Direction, ColumnInfo } from "@shared/schema";

interface ColumnSelectionStepProps {
  dataSource: DataSource;
  direction: Direction;
  availableColumns: ColumnInfo[];
  selectedColumns: string[];
  onColumnsChange: (columns: string[]) => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onPreviewData: () => void;
  isFetchingColumns: boolean;
}

const ColumnSelectionStep: React.FC<ColumnSelectionStepProps> = ({
  dataSource,
  direction,
  availableColumns,
  selectedColumns,
  onColumnsChange,
  onPreviousStep,
  onNextStep,
  onPreviewData,
  isFetchingColumns
}) => {
  // State for tracking select all checkbox
  const [allSelected, setAllSelected] = useState(
    availableColumns.length > 0 && selectedColumns.length === availableColumns.length
  );

  // Handler for toggling individual column selection
  const handleToggleColumn = (columnName: string) => {
    const isSelected = selectedColumns.includes(columnName);
    let newSelectedColumns: string[];
    
    if (isSelected) {
      newSelectedColumns = selectedColumns.filter(col => col !== columnName);
    } else {
      newSelectedColumns = [...selectedColumns, columnName];
    }
    
    onColumnsChange(newSelectedColumns);
    setAllSelected(newSelectedColumns.length === availableColumns.length);
  };

  // Handler for toggling all columns selection
  const handleToggleAllColumns = (checked: boolean) => {
    if (checked) {
      onColumnsChange(availableColumns.map(col => col.name));
    } else {
      onColumnsChange([]);
    }
    setAllSelected(checked);
  };

  // Handler for selecting all columns
  const handleSelectAllColumns = () => {
    onColumnsChange(availableColumns.map(col => col.name));
    setAllSelected(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-neutral-500">Select Columns for Ingestion</h2>
        <div>
          <span className="text-neutral-300 text-sm mr-2">
            {selectedColumns.length} of {availableColumns.length} columns selected
          </span>
          <button 
            onClick={handleSelectAllColumns}
            className="text-sm text-primary font-medium"
          >
            Select All
          </button>
        </div>
      </div>
      
      {isFetchingColumns ? (
        <div className="py-8 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-neutral-400">Loading columns...</span>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto border border-neutral-200 rounded-lg">
          <table className="min-w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleToggleAllColumns}
                    aria-label="Select all columns"
                  />
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Column Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Data Type</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {availableColumns.map((column) => (
                <tr key={column.name} className="hover:bg-neutral-50">
                  <td className="py-2 px-4">
                    <Checkbox
                      checked={selectedColumns.includes(column.name)}
                      onCheckedChange={(checked) => handleToggleColumn(column.name)}
                      aria-label={`Select ${column.name}`}
                    />
                  </td>
                  <td className="py-2 px-4 text-sm text-neutral-500">{column.name}</td>
                  <td className="py-2 px-4 text-sm text-neutral-400">{column.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between">
        <Button
          onClick={onPreviousStep}
          variant="outline"
          className="mt-3 sm:mt-0 border-primary-light text-primary hover:bg-primary-light hover:text-white"
        >
          Back to Connection
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:space-x-3">
          <Button
            onClick={onPreviewData}
            variant="outline"
            className="w-full sm:w-auto border-secondary text-secondary hover:bg-secondary hover:text-white mb-2 sm:mb-0"
            disabled={selectedColumns.length === 0 || isFetchingColumns}
          >
            Preview Data
          </Button>
          <Button
            onClick={onNextStep}
            className="w-full sm:w-auto bg-primary text-white hover:bg-primary-dark"
            disabled={selectedColumns.length === 0 || isFetchingColumns}
          >
            Continue to Ingestion
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ColumnSelectionStep;
