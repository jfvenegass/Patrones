
import { useEffect } from 'react';

function App() {
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
        console.log('Report data:', data);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    };

    fetchReport();
  }, []);

  return (
    <div>
      <h1>Report Viewer</h1>
    </div>
  );
}

export default App;