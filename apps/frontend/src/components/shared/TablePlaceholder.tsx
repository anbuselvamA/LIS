import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface TablePlaceholderProps {
  title: string;
  columns: string[];
  data: any[];
}

export function TablePlaceholder({ title, columns, data }: TablePlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  {columns.map((col, i) => (
                    <th key={i} className="px-4 py-3 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50/50">
                    {columns.map((col, j) => (
                      <td key={j} className="px-4 py-3">
                        {/* Assuming row has keys matching column names or just stringify */}
                        {React.isValidElement(row[col.toLowerCase()])
                          ? row[col.toLowerCase()]
                          : typeof row[col.toLowerCase()] === 'object' && row[col.toLowerCase()] !== null
                            ? JSON.stringify(row[col.toLowerCase()]) 
                            : row[col.toLowerCase()] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 text-sm">
            No recent activity found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
