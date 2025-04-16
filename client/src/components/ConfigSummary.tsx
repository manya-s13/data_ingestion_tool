import React from "react";
import { 
  DataSource, 
  Direction, 
  ClickHouseConfig, 
  FlatFileConfig 
} from "@shared/schema";

interface ConfigSummaryProps {
  dataSource: DataSource;
  direction: Direction;
  clickhouseConfig: ClickHouseConfig;
  flatFileConfig: FlatFileConfig;
  selectedTable: string;
  onReset: () => void;
}

const ConfigSummary: React.FC<ConfigSummaryProps> = ({
  dataSource,
  direction,
  clickhouseConfig,
  flatFileConfig,
  selectedTable,
  onReset
}) => {
  // Helper to determine if section should be visible based on configuration
  const shouldShowClickHouseConfig = () => clickhouseConfig.host !== "";
  const shouldShowFlatFileConfig = () => flatFileConfig.filename !== "";
  const shouldShowDirection = () => direction !== "" as Direction;
  const shouldShowSelectedTable = () => selectedTable !== "";

  // Helper to format direction display
  const formatDirection = () => {
    if (direction === "clickhouse_to_flatfile") {
      return (
        <>
          <span className="font-medium">ClickHouse</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="font-medium">Flat File</span>
        </>
      );
    } else {
      return (
        <>
          <span className="font-medium">Flat File</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="font-medium">ClickHouse</span>
        </>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-medium text-neutral-500 mb-4">Configuration Summary</h2>
      
      <div>
        {shouldShowDirection() && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-neutral-400 mb-1">Transfer Direction</h3>
            <div className="flex items-center text-neutral-500">
              {formatDirection()}
            </div>
          </div>
        )}
        
        {shouldShowClickHouseConfig() && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-neutral-400 mb-1">
              {direction === "clickhouse_to_flatfile" ? "Source: ClickHouse" : "Target: ClickHouse"}
            </h3>
            <ul className="text-sm">
              <li className="mb-1"><span className="font-medium">Host:</span> {clickhouseConfig.host}</li>
              <li className="mb-1"><span className="font-medium">Port:</span> {clickhouseConfig.port}</li>
              <li className="mb-1"><span className="font-medium">Database:</span> {clickhouseConfig.database}</li>
              <li className="mb-1"><span className="font-medium">User:</span> {clickhouseConfig.user}</li>
              <li className="mb-1"><span className="font-medium">JWT Auth:</span> <span className="text-neutral-300">••••••••</span></li>
            </ul>
          </div>
        )}
        
        {shouldShowFlatFileConfig() && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-neutral-400 mb-1">
              {direction === "clickhouse_to_flatfile" ? "Target: Flat File" : "Source: Flat File"}
            </h3>
            <ul className="text-sm">
              <li className="mb-1"><span className="font-medium">Filename:</span> {flatFileConfig.filename}</li>
              <li className="mb-1">
                <span className="font-medium">Delimiter:</span> {
                  flatFileConfig.delimiter === "," 
                    ? "Comma (,)" 
                    : flatFileConfig.delimiter === "\t" 
                      ? "Tab" 
                      : flatFileConfig.delimiter === ";" 
                        ? "Semicolon (;)" 
                        : flatFileConfig.delimiter
                }
              </li>
            </ul>
          </div>
        )}

        {shouldShowSelectedTable() && (
          <div className="mb-2">
            <h3 className="text-sm font-medium text-neutral-400 mb-1">Selected Source</h3>
            <p className="text-sm">Table: <span className="font-medium">{selectedTable}</span></p>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-neutral-100">
        <button 
          onClick={onReset}
          className="text-primary flex items-center text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
          Reset Configuration
        </button>
      </div>
    </div>
  );
};

export default ConfigSummary;
