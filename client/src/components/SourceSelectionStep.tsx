import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DataSource, Direction } from "@shared/schema";

interface SourceSelectionStepProps {
  dataSource: DataSource;
  direction: Direction;
  onDataSourceChange: (source: DataSource) => void;
  onDirectionChange: (direction: Direction) => void;
  onNextStep: () => void;
}

const SourceSelectionStep: React.FC<SourceSelectionStepProps> = ({
  dataSource,
  direction,
  onDataSourceChange,
  onDirectionChange,
  onNextStep,
}) => {
  const isNextDisabled = !dataSource || !direction;

  return (
    <div>
      <h2 className="text-lg font-medium text-neutral-500 mb-6">Step 1: Select Data Source and Direction</h2>

      <div className="space-y-8">
        {/* Data Source Selection */}
        <div>
          <h3 className="text-md font-medium text-neutral-500 mb-3">Data Source</h3>
          <RadioGroup
            value={dataSource}
            onValueChange={(value) => onDataSourceChange(value as DataSource)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="clickhouse" id="clickhouse" />
              <Label htmlFor="clickhouse" className="text-sm font-medium cursor-pointer">
                ClickHouse Database
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="flatfile" id="flatfile" />
              <Label htmlFor="flatfile" className="text-sm font-medium cursor-pointer">
                Flat File (CSV/TSV)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Direction Selection */}
        <div>
          <h3 className="text-md font-medium text-neutral-500 mb-3">Transfer Direction</h3>
          <RadioGroup
            value={direction}
            onValueChange={(value) => onDirectionChange(value as Direction)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="clickhouse_to_flatfile" id="clickhouse_to_flatfile" />
              <Label htmlFor="clickhouse_to_flatfile" className="text-sm font-medium cursor-pointer">
                ClickHouse to Flat File
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="flatfile_to_clickhouse" id="flatfile_to_clickhouse" />
              <Label htmlFor="flatfile_to_clickhouse" className="text-sm font-medium cursor-pointer">
                Flat File to ClickHouse
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={onNextStep}
          disabled={isNextDisabled}
          className="bg-primary text-white hover:bg-primary-dark"
        >
          Continue to Connection
        </Button>
      </div>
    </div>
  );
};

export default SourceSelectionStep;
