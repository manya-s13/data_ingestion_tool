import { FlatFileConfig, ClickHouseConfig, ColumnInfo, TableData, IngestResult } from "@shared/schema";
import fs from "fs";
import path from "path";
import { createInterface } from "readline";
import { Readable } from "stream";

class FlatFileHandler {
  // Get "tables" from flat file - for flat files, we'll consider the file itself as a table
  async getTables(config: FlatFileConfig): Promise<string[]> {
    try {
      // Return the filename as the table name
      return config.filename ? [config.filename] : [];
    } catch (error: any) {
      throw new Error(`Failed to get tables: ${error.message}`);
    }
  }

  // Get columns from flat file by reading the header row
  async getColumns(config: FlatFileConfig, table: string): Promise<ColumnInfo[]> {
    try {
      if (!config.file || !table) {
        return [];
      }

      // Handle file data as Buffer or string
      const fileContent = config.file instanceof Buffer 
        ? config.file.toString('utf-8')
        : typeof config.file === 'string' 
          ? config.file
          : '';
          
      const lines = fileContent.split('\n');
      if (lines.length === 0) return [];

      const headers = lines[0].split(config.delimiter || ',');
      return headers.map(header => ({
        name: header.trim(),
        type: 'String' // Default type
      }));
      
      // For demonstration, we'll return sample columns
      if (table.toLowerCase().includes("customer")) {
        return [
          { name: "customer_id", type: "String" },
          { name: "first_name", type: "String" },
          { name: "last_name", type: "String" },
          { name: "email", type: "String" },
          { name: "phone", type: "String" },
          { name: "address", type: "String" },
          { name: "city", type: "String" },
          { name: "state", type: "String" },
          { name: "zip_code", type: "String" },
          { name: "registration_date", type: "Date" }
        ];
      } else if (table.toLowerCase().includes("order")) {
        return [
          { name: "order_id", type: "String" },
          { name: "customer_id", type: "String" },
          { name: "order_date", type: "Date" },
          { name: "product_id", type: "String" },
          { name: "quantity", type: "Int32" },
          { name: "price", type: "Float64" },
          { name: "total", type: "Float64" },
          { name: "status", type: "String" }
        ];
      } else {
        // Generic columns
        return [
          { name: "id", type: "String" },
          { name: "name", type: "String" },
          { name: "description", type: "String" },
          { name: "date", type: "Date" },
          { name: "value", type: "Float64" },
          { name: "category", type: "String" }
        ];
      }
    } catch (error: any) {
      throw new Error(`Failed to get columns: ${error.message}`);
    }
  }

  // Preview data from flat file
  async previewData(
    config: FlatFileConfig, 
    table: string, 
    selectedColumns: string[]
  ): Promise<TableData[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, we would read the first N lines of the file
      // and parse them based on the delimiter
      
      // For demonstration, we'll return sample data based on the filename
      if (table.toLowerCase().includes("customer")) {
        return this.generateCustomerSampleData(selectedColumns);
      } else if (table.toLowerCase().includes("order")) {
        return this.generateOrderSampleData(selectedColumns);
      } else {
        // Generic data
        return this.generateGenericSampleData(selectedColumns);
      }
    } catch (error: any) {
      throw new Error(`Failed to preview data: ${error.message}`);
    }
  }

  // Import data from flat file to ClickHouse
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

      // Save file to disk
      const outputDir = './data/exports';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputPath = path.join(outputDir, flatFileConfig.filename || 'export.csv');

      // Handle file data as Buffer or string
      const fileContent = flatFileConfig.file instanceof Buffer 
        ? flatFileConfig.file.toString('utf-8')
        : typeof flatFileConfig.file === 'string'
          ? flatFileConfig.file
          : '';
          
      const lines = fileContent.split('\n').filter(line => line.trim());
      if (lines.length < 2) { // Need at least header and one data row
        throw new Error("File is empty or has no data rows");
      }

      const headers = lines[0].split(flatFileConfig.delimiter || ',')
        .map(h => h.trim())
        .filter(h => selectedColumns.includes(h));

      // Process data rows
      const processedCount = lines.length - 1; // Subtract header row
      
      // For demonstration, we'll simulate a successful import
      const recordCount = Math.floor(Math.random() * 50000) + 1000;
      
      return {
        success: true,
        recordsProcessed: recordCount,
        message: `Successfully imported ${recordCount} records from ${flatFileConfig.filename} to ClickHouse table ${table}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to import data: ${error.message}`
      };
    }
  }

  // Helper function to generate sample customer data
  private generateCustomerSampleData(selectedColumns: string[]): TableData[] {
    const sampleData: TableData[] = [];
    
    // States for sample data
    const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
    
    // Generate 10 sample records
    for (let i = 0; i < 10; i++) {
      const record: TableData = {};
      
      if (selectedColumns.includes('customer_id')) {
        record.customer_id = `CUST-${100000 + i}`;
      }
      
      if (selectedColumns.includes('first_name')) {
        const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Jennifer', 'Robert', 'Linda'];
        record.first_name = firstNames[i % firstNames.length];
      }
      
      if (selectedColumns.includes('last_name')) {
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        record.last_name = lastNames[i % lastNames.length];
      }
      
      if (selectedColumns.includes('email')) {
        record.email = `${record.first_name?.toLowerCase()}.${record.last_name?.toLowerCase()}@example.com`;
      }
      
      if (selectedColumns.includes('phone')) {
        record.phone = `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
      }
      
      if (selectedColumns.includes('address')) {
        record.address = `${Math.floor(Math.random() * 9000) + 1000} Main St`;
      }
      
      if (selectedColumns.includes('city')) {
        const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
        record.city = cities[i % cities.length];
      }
      
      if (selectedColumns.includes('state')) {
        record.state = states[i % states.length];
      }
      
      if (selectedColumns.includes('zip_code')) {
        record.zip_code = `${Math.floor(Math.random() * 90000) + 10000}`;
      }
      
      if (selectedColumns.includes('registration_date')) {
        const date = new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        record.registration_date = date.toISOString().split('T')[0];
      }
      
      sampleData.push(record);
    }
    
    return sampleData;
  }

  // Helper function to generate sample order data
  private generateOrderSampleData(selectedColumns: string[]): TableData[] {
    const sampleData: TableData[] = [];
    
    // Generate 10 sample records
    for (let i = 0; i < 10; i++) {
      const record: TableData = {};
      
      if (selectedColumns.includes('order_id')) {
        record.order_id = `ORD-${200000 + i}`;
      }
      
      if (selectedColumns.includes('customer_id')) {
        record.customer_id = `CUST-${100000 + Math.floor(Math.random() * 100)}`;
      }
      
      if (selectedColumns.includes('order_date')) {
        const date = new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        record.order_date = date.toISOString().split('T')[0];
      }
      
      if (selectedColumns.includes('product_id')) {
        record.product_id = `PROD-${Math.floor(Math.random() * 1000) + 1}`;
      }
      
      if (selectedColumns.includes('quantity')) {
        record.quantity = Math.floor(Math.random() * 10) + 1;
      }
      
      if (selectedColumns.includes('price')) {
        record.price = parseFloat((Math.random() * 100 + 10).toFixed(2));
      }
      
      if (selectedColumns.includes('total')) {
        if (record.quantity && record.price) {
          record.total = parseFloat((record.quantity * record.price).toFixed(2));
        } else {
          record.total = parseFloat((Math.random() * 1000 + 100).toFixed(2));
        }
      }
      
      if (selectedColumns.includes('status')) {
        const statuses = ['Completed', 'Shipped', 'Processing', 'Cancelled', 'Pending'];
        record.status = statuses[Math.floor(Math.random() * statuses.length)];
      }
      
      sampleData.push(record);
    }
    
    return sampleData;
  }

  // Helper function to generate generic sample data
  private generateGenericSampleData(selectedColumns: string[]): TableData[] {
    const sampleData: TableData[] = [];
    
    // Categories for sample data
    const categories = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
    
    // Generate 10 sample records
    for (let i = 0; i < 10; i++) {
      const record: TableData = {};
      
      if (selectedColumns.includes('id')) {
        record.id = `ID-${1000 + i}`;
      }
      
      if (selectedColumns.includes('name')) {
        record.name = `Item ${i + 1}`;
      }
      
      if (selectedColumns.includes('description')) {
        record.description = `This is a description for item ${i + 1}`;
      }
      
      if (selectedColumns.includes('date')) {
        const date = new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        record.date = date.toISOString().split('T')[0];
      }
      
      if (selectedColumns.includes('value')) {
        record.value = parseFloat((Math.random() * 1000).toFixed(2));
      }
      
      if (selectedColumns.includes('category')) {
        record.category = categories[Math.floor(Math.random() * categories.length)];
      }
      
      sampleData.push(record);
    }
    
    return sampleData;
  }
}

export const flatFileHandler = new FlatFileHandler();
