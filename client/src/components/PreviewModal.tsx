import React from "react";
import { TableData } from "@shared/schema";

interface PreviewModalProps {
  selectedTable: string;
  selectedColumns: string[];
  previewData: TableData[];
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  selectedTable,
  selectedColumns,
  previewData,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-neutral-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen flex flex-col">
        <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-neutral-500">Data Preview: {selectedTable}</h3>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="text-sm text-neutral-400 mb-4">
            Showing {previewData.length > 100 ? '100' : previewData.length} records from selected source with chosen columns
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border border-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  {selectedColumns.map(column => (
                    <th 
                      key={column} 
                      className="py-2 px-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider border-b border-neutral-200"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {previewData.slice(0, 100).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-neutral-200 hover:bg-neutral-50">
                    {selectedColumns.map(column => (
                      <td key={`${rowIndex}-${column}`} className="py-2 px-3 text-sm text-neutral-500">
                        {String(row[column] !== null && row[column] !== undefined ? row[column] : '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="p-6 border-t border-neutral-200 flex justify-end">
          <button 
            onClick={onClose}
            className="rounded-md bg-neutral-100 text-neutral-500 px-4 py-2 text-sm font-medium hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
