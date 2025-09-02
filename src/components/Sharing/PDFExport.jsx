import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const PDFExport = ({ onClose }) => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('complete');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year ago
    end: new Date().toISOString().split('T')[0]
  });

  const generatePDF = async () => {
    setLoading(true);
    try {
      // Load all data
      const [profileData, prescriptionsData, testsData, symptomsData, pressureData] = await Promise.all([
        loadProfile(),
        loadPrescriptions(),
        loadVisualTests(),
        loadSymptoms(),
        loadPressureMeasurements()
      ]);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFillColor(30, 144, 255); // azul
      pdf.rect(0, 0, pageWidth, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('MiOptiData Report', pageWidth / 2, 12.5, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      // Patient Information
      pdf.setFillColor(245, 245, 245); // gris claro
      pdf.roundedRect(15, yPosition - 2, pageWidth - 30, 40, 3, 3, 'F');

      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Patient Information', 20, yPosition + 5);
      // yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Name: ${profileData.name}`, 25, yPosition);
      yPosition += 5;
      pdf.text(`Relationship: ${profileData.relationship}`, 25, yPosition);
      yPosition += 5;
      pdf.text(`Date of Birth: ${new Date(profileData.date_of_birth).toLocaleDateString()}`, 25, yPosition);
      yPosition += 5;
      pdf.text(`Report Generated: ${new Date().toLocaleDateString()}`, 25, yPosition);
      yPosition += 5;
      pdf.text(`Report Period: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`, 25, yPosition);
      yPosition += 15;

      pdf.setDrawColor(200);
      pdf.setLineWidth(0.5);
      pdf.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 5;

      // Summary Statistics
      if (reportType === 'complete' || reportType === 'summary') {
        const stats = [
        { label: 'Total Prescriptions', value: prescriptionsData.length },
        { label: 'Total Visual Tests', value: testsData.length },
        { label: 'Total Symptoms Records', value: symptomsData.length },
        { label: 'Total Pressure Measurements', value: pressureData.length }
      ];

      pdf.setFontSize(10);
      stats.forEach((stat, i) => {
        const xPos = 17 + (i % 2) * 90; // dos columnas
        const yPos = yPosition + Math.floor(i / 2) * 12;

        pdf.setFillColor(224, 235, 255); // celda azul clara
        pdf.roundedRect(xPos - 2, yPos - 4, 85, 10, 2, 2, 'F');

        pdf.setTextColor(30, 144, 255);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${stat.value}`, xPos + 2, yPos + 3);

        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'normal');
        pdf.text(stat.label, xPos + 2, yPos + 8);
      });
      yPosition += Math.ceil(stats.length / 2) * 12 + 10;

      pdf.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 5;
    }

      // Current Prescription
      if (prescriptionsData.length > 0 && (reportType === 'complete' || reportType === 'prescriptions')) {
        const latestPrescription = prescriptionsData[prescriptionsData.length - 1];
        
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Current Prescription', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Date: ${new Date(latestPrescription.prescription_date).toLocaleDateString()}`, 20, yPosition);
        yPosition += 5;
        if (latestPrescription.doctor_name) {
          pdf.text(`Doctor: ${latestPrescription.doctor_name}`, 20, yPosition + 6);
          yPosition += 5;
        }

        // Prescription table
        yPosition += 5;
        const tableData = [
          ['Eye', 'Sphere', 'Cylinder', 'Axis', 'Add', 'Prism', 'Base'],
          [
            'OD (Right)',
            latestPrescription.od_sphere?.toFixed(2) || '-',
            latestPrescription.od_cylinder?.toFixed(2) || '-',
            latestPrescription.od_axis?.toString() || '-',
            latestPrescription.od_add?.toFixed(2) || '-',
            latestPrescription.od_prism?.toFixed(2) || '-',
            latestPrescription.od_base || '-'
          ],
          [
            'OS (Left)',
            latestPrescription.os_sphere?.toFixed(2) || '-',
            latestPrescription.os_cylinder?.toFixed(2) || '-',
            latestPrescription.os_axis?.toString() || '-',
            latestPrescription.os_add?.toFixed(2) || '-',
            latestPrescription.os_prism?.toFixed(2) || '-',
            latestPrescription.os_base || '-'
          ]
        ];

        drawTable(pdf, tableData, 20, yPosition, pageWidth - 40);
        yPosition += (tableData.length * 8) + 15;
      }

      // Check if new page needed
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      // Latest Visual Acuity
      if (testsData.length > 0 && (reportType === 'complete' || reportType === 'vision')) {
        const latestTest = testsData[testsData.length - 1];
        
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Latest Visual Acuity Test', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Date: ${new Date(latestTest.test_date).toLocaleDateString()}`, 20, yPosition);
        yPosition += 5;
        pdf.text(`Test Type: ${latestTest.test_type.toUpperCase()}`, 20, yPosition);
        yPosition += 5;
        pdf.text(`With Correction: ${latestTest.with_correction ? 'Yes' : 'No'}`, 20, yPosition);
        yPosition += 10;

        pdf.text(`Right Eye (OD): ${latestTest.od_result || 'Not tested'}`, 20, yPosition);
        yPosition += 5;
        pdf.text(`Left Eye (OS): ${latestTest.os_result || 'Not tested'}`, 20, yPosition);
        yPosition += 5;
        pdf.text(`Both Eyes: ${latestTest.binocular_result || 'Not tested'}`, 20, yPosition);
        yPosition += 15;
      }

      // Recent Symptoms
      if (symptomsData.length > 0 && (reportType === 'complete' || reportType === 'symptoms')) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Recent Symptoms (Last 30 days)', 20, yPosition);
        yPosition += 10;

        const recentSymptoms = symptomsData.filter(symptom => {
          const symptomDate = new Date(symptom.symptom_date);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return symptomDate >= thirtyDaysAgo;
        }).slice(-5);

        if (recentSymptoms.length > 0) {
          recentSymptoms.forEach(symptom => {
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            pdf.text(`${new Date(symptom.symptom_date).toLocaleDateString()}: ${getSymptomTypeLabel(symptom.symptom_type)} (Severity: ${symptom.severity}/10)`, 20, yPosition);
            yPosition += 5;
            if (symptom.trigger_activity) {
              pdf.text(`  Trigger: ${symptom.trigger_activity}`, 25, yPosition);
              yPosition += 5;
            }
            yPosition += 2;
          });
        } else {
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'normal');
          pdf.text('No symptoms recorded in the last 30 days', 20, yPosition);
          yPosition += 5;
        }
        yPosition += 10;
      }

      // Prescription History
      if (prescriptionsData.length > 1 && (reportType === 'complete' || reportType === 'prescriptions')) {
        // Check if new page needed
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Prescription History', 20, yPosition);
        yPosition += 10;

        const historyTableData = [
          ['Date', 'OD Sphere', 'OD Cylinder', 'OS Sphere', 'OS Cylinder', 'Doctor']
        ];

        prescriptionsData.slice(-5).forEach(prescription => {
          historyTableData.push([
            new Date(prescription.prescription_date).toLocaleDateString(),
            prescription.od_sphere?.toFixed(2) || '-',
            prescription.od_cylinder?.toFixed(2) || '-',
            prescription.os_sphere?.toFixed(2) || '-',
            prescription.os_cylinder?.toFixed(2) || '-',
            prescription.doctor_name || '-'
          ]);
        });

        drawTable(pdf, historyTableData, 20, yPosition, pageWidth - 40);
        yPosition += (historyTableData.length * 6) + 15;
      }

      // Footer
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.text('Generated by MiOptiData App', pageWidth / 2, footerY, { align: 'center' });
      pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, pageWidth - 20, footerY, { align: 'right' });

      // Save PDF
      const fileName = `eye-health-report-${profileData.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      navigate('/');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

const drawTable = (pdf, data, x, y, width) => {
  const rowHeight = 7; // un poco más alto
  const colWidth = width / data[0].length;

  data.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellX = x + colIndex * colWidth;
      const cellY = y + rowIndex * rowHeight;

      // Encabezado
      if (rowIndex === 0) {
        pdf.setFillColor(41, 128, 185); // azul oscuro
        pdf.setTextColor(255, 255, 255); // texto blanco
        pdf.setFont(undefined, 'bold');
      } else {
        // Zebra stripes
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(245, 245, 245); // gris claro
        } else {
          pdf.setFillColor(255, 255, 255); // blanco
        }
        pdf.setTextColor(0, 0, 0); // texto negro
        pdf.setFont(undefined, 'normal');
      }

      // Fondo de la celda
      pdf.rect(cellX, cellY - 5, colWidth, rowHeight, 'F');

      // Texto centrado
      pdf.setFontSize(9);
      pdf.text(cell.toString(), cellX + colWidth / 2, cellY, { align: 'center', baseline: 'middle' });

      // Borde de la celda
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(cellX, cellY - 5, colWidth, rowHeight);
    });
  });

  return y + data.length * rowHeight + 2; // devuelve la nueva Y
};


  const loadProfile = async () => {
    const { data, error } = await supabase
      .from('app_061iy_profiles')
      .select('*')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  };

  const loadPrescriptions = async () => {
    const { data, error } = await supabase
      .from('app_061iy_prescriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('profile_id', profileId)
      .gte('prescription_date', dateRange.start)
      .lte('prescription_date', dateRange.end)
      .order('prescription_date', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const loadVisualTests = async () => {
    const { data, error } = await supabase
      .from('app_061iy_visual_tests')
      .select('*')
      .eq('user_id', user.id)
      .eq('profile_id', profileId)
      .gte('test_date', dateRange.start)
      .lte('test_date', dateRange.end)
      .order('test_date', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const loadSymptoms = async () => {
    const { data, error } = await supabase
      .from('app_061iy_symptoms')
      .select('*')
      .eq('user_id', user.id)
      .eq('profile_id', profileId)
      .gte('symptom_date', dateRange.start)
      .lte('symptom_date', dateRange.end)
      .order('symptom_date', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const loadPressureMeasurements = async () => {
    const { data, error } = await supabase
      .from('app_061iy_pressure_measurements')
      .select('*')
      .eq('user_id', user.id)
      .eq('profile_id', profileId)
      .gte('measurement_date', dateRange.start)
      .lte('measurement_date', dateRange.end)
      .order('measurement_date', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const getSymptomTypeLabel = (type) => {
    const labels = {
      'dry_eyes': 'Dry Eyes',
      'eye_strain': 'Eye Strain',
      'headaches': 'Headaches',
      'blurred_vision': 'Blurred Vision',
      'double_vision': 'Double Vision',
      'light_sensitivity': 'Light Sensitivity',
      'eye_pain': 'Eye Pain',
      'redness': 'Redness',
      'tearing': 'Excessive Tearing',
      'itching': 'Itching',
      'burning': 'Burning Sensation',
      'foreign_body_sensation': 'Foreign Body Sensation'
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Generate PDF Report</h2>
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="complete">Complete Report</option>
              <option value="summary">Summary Only</option>
              <option value="prescriptions">Prescriptions Only</option>
              <option value="vision">Vision Tests Only</option>
              <option value="symptoms">Symptoms Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Report Will Include:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Patient information and summary statistics</li>
              {(reportType === 'complete' || reportType === 'prescriptions') && (
                <li>• Current prescription and history</li>
              )}
              {(reportType === 'complete' || reportType === 'vision') && (
                <li>• Latest visual acuity test results</li>
              )}
              {(reportType === 'complete' || reportType === 'symptoms') && (
                <li>• Recent symptoms and patterns</li>
              )}
              <li>• Professional medical formatting</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={generatePDF}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Generate PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFExport;