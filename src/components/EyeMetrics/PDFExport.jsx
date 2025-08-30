import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PDFExport = ({ userProfile, prescriptions, visualAcuity, onClose }) => {
  const reportRef = useRef();

  // Sample data processing for charts
  const processDataForChart = (data, field) => {
    if (!data || data.length === 0) return { labels: [], datasets: [] };
    
    const labels = data.map((item, index) => `Reading ${index + 1}`);
    const values = data.map(item => parseFloat(item[field]) || 0);
    
    return {
      labels,
      datasets: [{
        label: field.charAt(0).toUpperCase() + field.slice(1),
        data: values,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Vision Trend Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const generatePDF = async () => {
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `eye-metrics-report-${userProfile?.name || 'user'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      if (onClose) onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const leftEyeData = prescriptions?.filter(p => p.eye === 'left') || [];
  const rightEyeData = prescriptions?.filter(p => p.eye === 'right') || [];
  const leftEyeChart = processDataForChart(leftEyeData, 'sphere');
  const rightEyeChart = processDataForChart(rightEyeData, 'sphere');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-full overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">PDF Export Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={generatePDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div ref={reportRef} className="p-8 bg-white">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">EyeMetrics Report</h1>
            <p className="text-lg text-gray-600">Comprehensive Vision Health Analysis</p>
            <p className="text-sm text-gray-500 mt-2">Generated on {getCurrentDate()}</p>
          </div>

          {/* Patient Information */}
          <div className="mb-8 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Patient Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-800">{userProfile?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium text-gray-800">{userProfile?.dateOfBirth || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Eye Color</p>
                <p className="font-medium text-gray-800">{userProfile?.eyeColor || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Medical History</p>
                <p className="font-medium text-gray-800">{userProfile?.medicalHistory || 'None reported'}</p>
              </div>
            </div>
          </div>

          {/* Current Prescription */}
          {prescriptions && prescriptions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Current Prescription</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-gray-300 p-3 text-left font-semibold">Eye</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Sphere (SPH)</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Cylinder (CYL)</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Axis</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.slice(-2).map((prescription, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 p-3 capitalize">{prescription.eye}</td>
                        <td className="border border-gray-300 p-3">{prescription.sphere}</td>
                        <td className="border border-gray-300 p-3">{prescription.cylinder}</td>
                        <td className="border border-gray-300 p-3">{prescription.axis}°</td>
                        <td className="border border-gray-300 p-3">{prescription.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Visual Acuity */}
          {visualAcuity && visualAcuity.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Visual Acuity Measurements</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-gray-300 p-3 text-left font-semibold">Eye</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Distance Vision</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Near Vision</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visualAcuity.slice(-4).map((acuity, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 p-3 capitalize">{acuity.eye}</td>
                        <td className="border border-gray-300 p-3">{acuity.distanceVision}</td>
                        <td className="border border-gray-300 p-3">{acuity.nearVision}</td>
                        <td className="border border-gray-300 p-3">{acuity.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Charts */}
          {prescriptions && prescriptions.length > 1 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Prescription Trends</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {leftEyeData.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-center">Left Eye Sphere Trend</h3>
                    <div style={{ height: '200px' }}>
                      <Line data={leftEyeChart} options={chartOptions} />
                    </div>
                  </div>
                )}
                {rightEyeData.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-center">Right Eye Sphere Trend</h3>
                    <div style={{ height: '200px' }}>
                      <Line data={rightEyeChart} options={chartOptions} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary & Recommendations */}
          <div className="mb-8 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Summary & Recommendations</h2>
            <div className="space-y-3 text-gray-700">
              <p>• Regular eye examinations are recommended every 1-2 years for optimal eye health.</p>
              <p>• Monitor any changes in vision and consult with your eye care professional if you notice deterioration.</p>
              <p>• Keep track of your prescription changes to identify patterns or rapid changes that may require attention.</p>
              <p>• This report is for informational purposes only and should not replace professional medical advice.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>This report was generated by EyeMetrics - Your Personal Eye Health Tracker</p>
            <p>For questions about your eye health, please consult with a qualified eye care professional.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFExport;