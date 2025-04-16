import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  onTablesFetch: () => Promise<void>;
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
  onTableSelect,
  onTablesFetch
}) => {
  const { toast } = useToast();
  // Local state to handle form input
  const [localClickhouseConfig, setLocalClickhouseConfig] = useState(clickhouseConfig);
  const [localFlatFileConfig, setLocalFlatFileConfig] = useState(flatFileConfig);
  const [file, setFile] = useState<File | null>(null);


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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setLocalFlatFileConfig({...localFlatFileConfig, file: e.target.files[0]})
    }
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

  // Check if ClickHouse config is valid
  const isClickhouseValid = () => {
    return (
      localClickhouseConfig.host && 
      localClickhouseConfig.port && 
      localClickhouseConfig.database && 
      localClickhouseConfig.user && 
      localClickhouseConfig.password
    );
  };

  // Check if Flat File config is valid
  const isFlatFileValid = () => {
    return (
      localFlatFileConfig.file &&
      localFlatFileConfig.delimiter
    );
  };

  // Fetch tables from API
  const fetchTables = async () => {
    try {
      await onTablesFetch();
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the ClickHouse instance. Please check your connection details.",
        variant: "destructive"
      });
    }
  };

  // Check if form is valid for continuing to next step
  const isFormValid = () => {
    // ClickHouse and Flat File validation
    const configsValid = (direction === 'clickhouseToFlatFile' && isFlatFileValid()) || (direction === 'flatFileToClickhouse' && isClickhouseValid());

    // Table must be selected only for ClickHouse to FlatFile
    const isTableSelected = direction === 'clickhouseToFlatFile' ? selectedTable !== "" : true;

    return configsValid && isTableSelected;
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
                placeholder="Enter your JWT token" 
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
              <Label htmlFor="fileUpload">File Upload</Label>
              <input type="file" id="fileUpload" name="fileUpload" onChange={handleFileUpload} />
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
        {direction === 'flatfile_to_clickhouse' && (
          <div className="p-4 border border-neutral-200 rounded-lg">
            <h3 className="text-md font-medium text-neutral-500 mb-3">Table Selection</h3>

            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="table">Select Table</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      if (isClickhouseValid()) {
                        onClickhouseConfigChange(localClickhouseConfig);
                        onFlatFileConfigChange(localFlatFileConfig);
                        fetchTables();
                      } else {
                        toast({
                          title: "Missing Connection Details",
                          description: "Please fill in all the required connection details first.",
                          variant: "destructive"
                        });
                      }
                    }}
                    disabled={isFetchingTables}
                    className="h-8"
                  >
                    {isFetchingTables ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Fetching Tables...
                      </>
                    ) : (
                      <>Test Connection</>
                    )}
                  </Button>
                </div>

                <Select 
                  value={selectedTable} 
                  onValueChange={onTableSelect}
                  disabled={isFetchingTables || availableTables.length === 0}
                >
                  <SelectTrigger id="table">
                    <SelectValue placeholder={availableTables.length === 0 ? "No tables available - test connection first" : "Select a table"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTables.length === 0 ? (
                      <SelectItem value="sample">Sample tables will appear here</SelectItem>
                    ) : (
                      availableTables.map(table => (
                        <SelectItem key={table} value={table}>{table}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {!isFetchingTables && availableTables.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Click "Test Connection" to fetch available tables from your ClickHouse instance.
                  <br />
                  <strong>Tip:</strong> For demo purposes, sample tables like "uk_price_paid", "ontime", etc. will be displayed.
                </div>
              )}
            </div>
          </div>
        )}
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