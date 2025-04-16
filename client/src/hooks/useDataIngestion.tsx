import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  DataSource,
  Direction,
  ClickHouseConfig,
  FlatFileConfig,
  ColumnInfo,
  TableData,
  IngestResult
} from "@shared/schema";

// Default empty values
const defaultClickhouseConfig: ClickHouseConfig = {
  host: "",
  port: "",
  database: "",
  user: "",
  password: ""
};

const defaultFlatFileConfig: FlatFileConfig = {
  filename: "",
  delimiter: ","
};

const defaultIngestionResults: IngestResult = {
  success: false,
  recordsProcessed: 0,
  message: "",
  error: ""
};

export const useDataIngestion = () => {
  const { toast } = useToast();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Data source and direction
  const [dataSource, setDataSource] = useState<DataSource>("clickhouse");
  const [direction, setDirection] = useState<Direction>("clickhouse_to_flatfile");
  
  // Configuration
  const [clickhouseConfig, setClickhouseConfig] = useState<ClickHouseConfig>(defaultClickhouseConfig);
  const [flatFileConfig, setFlatFileConfig] = useState<FlatFileConfig>(defaultFlatFileConfig);
  
  // Schema discovery
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [availableColumns, setAvailableColumns] = useState<ColumnInfo[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  
  // Data preview
  const [previewData, setPreviewData] = useState<TableData[]>([]);
  
  // Loading states
  const [isFetchingTables, setIsFetchingTables] = useState<boolean>(false);
  const [isFetchingColumns, setIsFetchingColumns] = useState<boolean>(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  
  // Results
  const [ingestionResults, setIngestionResults] = useState<IngestResult>(defaultIngestionResults);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // When table changes, fetch columns
  useEffect(() => {
    if (selectedTable) {
      fetchColumns();
    }
  }, [selectedTable]);

  // Reset selected columns when available columns change
  useEffect(() => {
    if (availableColumns.length > 0) {
      setSelectedColumns(availableColumns.map(col => col.name));
    } else {
      setSelectedColumns([]);
    }
  }, [availableColumns]);

  // Fetch available tables
  const fetchTables = async () => {
    setIsFetchingTables(true);
    setError(null);
    
    try {
      let endpoint;
      
      if (direction === "clickhouse_to_flatfile") {
        endpoint = "/api/clickhouse/tables";
      } else {
        endpoint = "/api/flatfile/tables";
      }
      
      const res = await apiRequest("POST", endpoint, {
        clickhouseConfig,
        flatFileConfig
      });
      
      const data = await res.json();
      setAvailableTables(data.tables);
      
      // If tables are available, select the first one
      if (data.tables.length > 0) {
        setSelectedTable(data.tables[0]);
      } else {
        setSelectedTable("");
        setAvailableColumns([]);
        toast({
          title: "No tables found",
          description: "No tables were found in the selected data source.",
          variant: "destructive"
        });
      }
      
      return data.tables;
    } catch (err: any) {
      setError(err.message || "Failed to fetch tables. Please check your connection settings.");
      toast({
        title: "Error fetching tables",
        description: err.message || "Please check your connection settings.",
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsFetchingTables(false);
    }
  };

  // Fetch columns for selected table
  const fetchColumns = async () => {
    if (!selectedTable) return;
    
    setIsFetchingColumns(true);
    setError(null);
    
    try {
      let endpoint;
      
      if (direction === "clickhouse_to_flatfile") {
        endpoint = "/api/clickhouse/columns";
      } else {
        endpoint = "/api/flatfile/columns";
      }
      
      const res = await apiRequest("POST", endpoint, {
        clickhouseConfig,
        flatFileConfig,
        table: selectedTable
      });
      
      const data = await res.json();
      setAvailableColumns(data.columns);
      return data.columns;
    } catch (err: any) {
      setError(err.message || "Failed to fetch columns. Please check your connection settings.");
      toast({
        title: "Error fetching columns",
        description: err.message || "Please check your connection settings.",
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsFetchingColumns(false);
    }
  };

  // Preview data
  const fetchPreviewData = async () => {
    if (!selectedTable || selectedColumns.length === 0) return;
    
    setIsPreviewLoading(true);
    setError(null);
    
    try {
      let endpoint;
      
      if (direction === "clickhouse_to_flatfile") {
        endpoint = "/api/clickhouse/preview";
      } else {
        endpoint = "/api/flatfile/preview";
      }
      
      const res = await apiRequest("POST", endpoint, {
        clickhouseConfig,
        flatFileConfig,
        table: selectedTable,
        selectedColumns
      });
      
      const data = await res.json();
      setPreviewData(data.preview);
      return data.preview;
    } catch (err: any) {
      setError(err.message || "Failed to preview data. Please check your connection settings.");
      toast({
        title: "Error previewing data",
        description: err.message || "Please check your connection settings.",
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Start ingestion process
  const startIngestion = async () => {
    if (!selectedTable || selectedColumns.length === 0) return;
    
    setIsIngesting(true);
    setError(null);
    
    try {
      let endpoint = "/api/ingest";
      
      const res = await apiRequest("POST", endpoint, {
        sourceType: dataSource,
        direction,
        clickhouseConfig,
        flatFileConfig,
        table: selectedTable,
        selectedColumns
      });
      
      const result = await res.json();
      setIngestionResults(result);
      
      if (result.success) {
        toast({
          title: "Ingestion Successful",
          description: `Processed ${result.recordsProcessed} records.`,
        });
      } else {
        setError(result.error || "Ingestion failed. Please try again.");
        toast({
          title: "Ingestion Failed",
          description: result.error || "Please try again.",
          variant: "destructive"
        });
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to ingest data. Please check your settings.";
      setError(errorMessage);
      setIngestionResults({
        success: false,
        error: errorMessage
      });
      toast({
        title: "Ingestion Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsIngesting(false);
    }
  };

  // Reset all configuration
  const resetConfiguration = () => {
    setDataSource("clickhouse");
    setDirection("clickhouse_to_flatfile");
    setClickhouseConfig(defaultClickhouseConfig);
    setFlatFileConfig(defaultFlatFileConfig);
    setAvailableTables([]);
    setSelectedTable("");
    setAvailableColumns([]);
    setSelectedColumns([]);
    setPreviewData([]);
    setIngestionResults(defaultIngestionResults);
    setError(null);
    setCurrentStep(1);
  };

  return {
    // State
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
    isFetchingTables,
    isFetchingColumns,
    error,
    
    // Setters
    setCurrentStep,
    setDataSource,
    setDirection,
    setClickhouseConfig,
    setFlatFileConfig,
    setSelectedTable,
    setSelectedColumns,
    setError,
    
    // Actions
    fetchTables,
    fetchColumns,
    fetchPreviewData,
    startIngestion,
    resetConfiguration
  };
};
