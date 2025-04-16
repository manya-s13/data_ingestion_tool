import { FlatFileConfig, ClickHouseConfig, ColumnInfo, TableData, IngestResult } from "@shared/schema";
import fs from "fs";
import path from "path";
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

class FlatFileHandler {
  async getTables(config: FlatFileConfig): Promise<string[]> {
    try {
      return config.filename ? [config.filename] : [];
    } catch (error: any) {
      throw new Error(`Failed to get tables: ${error.message}`);
    }
  }

  async getColumns(config: FlatFileConfig, table: string): Promise<ColumnInfo[]> {
    try {
      if (!config.file) {
        throw new Error("No file provided");
      }

      let fileContent = '';
      if (Buffer.isBuffer(config.file)) {
        fileContent = config.file.toString('utf-8');
      } else if (typeof config.file === 'string') {
        fileContent = config.file;
      } else if (config.file instanceof Object) {
        if (config.file.buffer) {
          fileContent = Buffer.from(config.file.buffer).toString('utf-8');
        } else {
          fileContent = config.file.toString();
        }
      }

      if (!fileContent.trim()) {
        throw new Error("Empty file content");
      }

      // Remove BOM if present
      fileContent = fileContent.replace(/^\uFEFF/, '');

      // Parse CSV with relaxed options
      const records = parse(fileContent, {
        delimiter: config.delimiter || ',',
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        trim: true
      });

      if (records.length === 0) {
        throw new Error("Empty file");
      }

      const header = Object.keys(records[0]);
      const types = this.inferColumnTypes(records[0]);

      return header.map((name, index) => ({
        name,
        type: types[index]
      }));

    } catch (error: any) {
      throw new Error(`Failed to get columns: ${error.message}`);
    }
  }

  private inferColumnTypes(row: Record<string, string>): string[] {
    return Object.values(row).map(value => {
      if (!isNaN(Number(value))) {
        return value.includes('.') ? 'Float64' : 'Int64';
      }
      // Try to parse as date
      const date = new Date(value);
      if (!isNaN(date.getTime()) && value.includes('-')) {
        return 'Date';
      }
      return 'String';
    });
  }

  async previewData(config: FlatFileConfig, table: string, selectedColumns: string[]): Promise<TableData[]> {
    try {
      if (!config.file) {
        throw new Error("No file provided");
      }

      let fileContent = '';
      if (Buffer.isBuffer(config.file)) {
        fileContent = config.file.toString('utf-8');
      } else if (typeof config.file === 'string') {
        fileContent = config.file;
      } else if (config.file instanceof Object) {
        fileContent = config.file.toString();
      }

      // Parse CSV
      const records = parse(fileContent, {
        delimiter: config.delimiter || ',',
        columns: true,
        skip_empty_lines: true
      });

      // Filter selected columns and limit to 100 rows
      return records.slice(0, 100).map(record => {
        const filteredRecord: TableData = {};
        selectedColumns.forEach(column => {
          if (column in record) {
            filteredRecord[column] = record[column];
          }
        });
        return filteredRecord;
      });

    } catch (error: any) {
      throw new Error(`Failed to preview data: ${error.message}`);
    }
  }

  async importToClickHouse(
    flatFileConfig: FlatFileConfig,
    clickhouseConfig: ClickHouseConfig,
    table: string,
    selectedColumns: string[]
  ): Promise<IngestResult> {
    try {
      if (!flatFileConfig.file || !table) {
        throw new Error("File or table name is missing");
      }

      let fileContent = '';
      if (Buffer.isBuffer(flatFileConfig.file)) {
        fileContent = flatFileConfig.file.toString('utf-8');
      } else if (typeof flatFileConfig.file === 'string') {
        fileContent = flatFileConfig.file;
      } else if (flatFileConfig.file instanceof Object) {
        fileContent = flatFileConfig.file.toString();
      }

      // Parse CSV
      const records = parse(fileContent, {
        delimiter: flatFileConfig.delimiter || ',',
        columns: true,
        skip_empty_lines: true
      });

      // Create export directory if it doesn't exist
      const outputDir = './data/exports';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write filtered data to output file
      const outputPath = path.join(outputDir, flatFileConfig.filename || 'export.csv');
      const filteredRecords = records.map(record => {
        const filtered: Record<string, any> = {};
        selectedColumns.forEach(col => {
          if (col in record) {
            filtered[col] = record[col];
          }
        });
        return filtered;
      });

      fs.writeFileSync(outputPath, stringify(filteredRecords, {
        header: true,
        columns: selectedColumns
      }));

      return {
        success: true,
        recordsProcessed: records.length,
        message: `Successfully processed ${records.length} records from ${flatFileConfig.filename}`
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Failed to import data: ${error.message}`
      };
    }
  }
}

export const flatFileHandler = new FlatFileHandler();
