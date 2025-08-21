import { useEffect, useState } from 'react';

function App() {
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const params = new URLSearchParams({
        sectionId: '123',
        title: 'My Report',
        format: 'table',
        pageSize: '10',
      });

      try {
        const response = await fetch(`http://localhost:3000/reports/generate?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReportData(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  return (
    <div>
      <h1>Report Viewer</h1>

      {loading && <p>Loading report...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {reportData.length > 0 && (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr>
              {/* Generate table headers from object keys */}
              {Object.keys(reportData[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((value, colIndex) => (
                  <td key={colIndex}>{String(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {reportData.length === 0 && !loading && !error && <p>No report data available.</p>}
    </div>
  );
}

export default App;
