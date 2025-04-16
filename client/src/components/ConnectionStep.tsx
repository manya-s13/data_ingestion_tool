import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { 
  DataSource,
  Direction,
  ClickHouseConfig,
  FlatFileConfig
} from "@shared/schema";

interface ConnectionStepProps {
  dataSource: DataSource;
  direction: Direction;
  clickhouseConfig: ClickHouseConfig;
  flatFileConfig: FlatFileConfig;
  onClickhouseConfigChange: (config: ClickHouseConfig) => void;
  onFlatFileConfigChange: (config: FlatFileConfig) => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
  isFetchingTables: boolean;
  availableTables: string[];
  selectedTable: string;
  onTableSelect: (table: string) => void;
}

const ConnectionStep: React.FC<ConnectionStepProps> = ({
  dataSource,
  direction,
  clickhouseConfig,
  flatFileConfig,
  onClickhouseConfigChange,
  onFlatFileConfigChange,
  onPreviousStep,
  onNextStep,
  isFetchingTables,
  availableTables,
  selectedTable,
  onTableSelect
}) => {
  // Local state to handle form input
  const [localClickhouseConfig, setLocalClickhouseConfig] = useState(clickhouseConfig);
  const [localFlatFileConfig, setLocalFlatFileConfig] = useState(flatFileConfig);
  
  // Update local state when props change
  useEffect(() => {
    setLocalClickhouseConfig(clickhouseConfig);
    setLocalFlatFileConfig(flatFileConfig);
  }, [clickhouseConfig, flatFileConfig]);

  // Handle ClickHouse config changes
  const handleClickhouseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalClickhouseConfig({
      ...localClickhouseConfig,
      [name]: value
    });
  };

  // Handle Flat File config changes
  const handleFlatFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFlatFileConfig({
      ...localFlatFileConfig,
      [name]: value
    });
  };

  // Handle delimiter select change
  const handleDelimiterChange = (value: string) => {
    setLocalFlatFileConfig({
      ...localFlatFileConfig,
      delimiter: value
    });
  };

  // Save changes to parent component before navigating
  const handleNextStep = () => {
    onClickhouseConfigChange(localClickhouseConfig);
    onFlatFileConfigChange(localFlatFileConfig);
    onNextStep();
  };

  // Check if form is valid
  const isFormValid = () => {
    // ClickHouse validation is needed for both directions
    const isClickhouseValid = 
      localClickhouseConfig.host && 
      localClickhouseConfig.port && 
      localClickhouseConfig.database && 
      localClickhouseConfig.user && 
      localClickhouseConfig.jwt;
    
    // Flat File validation is needed for both directions
    const isFlatFileValid = 
      localFlatFileConfig.filename && 
      localFlatFileConfig.delimiter;
    
    // Table must be selected
    const isTableSelected = selectedTable !== "";
    
    return isClickhouseValid && isFlatFileValid && isTableSelected;
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-neutral-500 mb-6">Step 2: Configure Connection</h2>

      <div className="space-y-6">
        {/* ClickHouse Configuration */}
        <div className="p-4 border border-neutral-200 rounded-lg">
          <h3 className="text-md font-medium text-neutral-500 mb-3">ClickHouse Connection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input 
                id="host" 
                name="host" 
                placeholder="clickhouse-server.example.com" 
                value={localClickhouseConfig.host}
                onChange={handleClickhouseChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input 
                id="port" 
                name="port" 
                placeholder="9440 or 8123" 
                value={localClickhouseConfig.port}
                onChange={handleClickhouseChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="database">Database</Label>
              <Input 
                id="database" 
                name="database" 
                placeholder="analytics_db" 
                value={localClickhouseConfig.database}
                onChange={handleClickhouseChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Input 
                id="user" 
                name="user" 
                placeholder="data_engineer" 
                value={localClickhouseConfig.user}
                onChange={handleClickhouseChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="jwt">JWT Token</Label>
              <Input 
                id="jwt" 
                name="jwt" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                value={localClickhouseConfig.jwt}
                onChange={handleClickhouseChange}
                type="password"
              />
            </div>
          </div>
        </div>

        {/* Flat File Configuration */}
        <div className="p-4 border border-neutral-200 rounded-lg">
          <h3 className="text-md font-medium text-neutral-500 mb-3">Flat File Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input 
                id="filename" 
                name="filename" 
                placeholder="data.csv" 
                value={localFlatFileConfig.filename}
                onChange={handleFlatFileChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delimiter">Delimiter</Label>
              <Select 
                value={localFlatFileConfig.delimiter} 
                onValueChange={handleDelimiterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delimiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Comma (,)</SelectItem>
                  <SelectItem value="\t">Tab</SelectItem>
                  <SelectItem value=";">Semicolon (;)</SelectItem>
                  <SelectItem value="|">Pipe (|)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Selection */}
        <div className="p-4 border border-neutral-200 rounded-lg">
          <h3 className="text-md font-medium text-neutral-500 mb-3">Table Selection</h3>
          
          {isFetchingTables ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
              <span>Loading tables...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="table">Select Table</Label>
              <Select 
                value={selectedTable} 
                onValueChange={onTableSelect}
              >
                <SelectTrigger id="table">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map(table => (
                    <SelectItem key={table} value={table}>{table}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between">
        <Button
          onClick={onPreviousStep}
          variant="outline"
          className="mt-3 sm:mt-0 border-primary-light text-primary hover:bg-primary-light hover:text-white"
        >
          Back to Source
        </Button>
        
        <Button
          onClick={handleNextStep}
          disabled={!isFormValid() || isFetchingTables}
          className="bg-primary text-white hover:bg-primary-dark"
        >
          Continue to Column Selection
        </Button>
      </div>
    </div>
  );
};

export default ConnectionStep;
