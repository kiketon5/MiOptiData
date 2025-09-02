import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const PDFExport = ({ onClose }) => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("complete");
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 1 year ago
    end: new Date().toISOString().split("T")[0],
  });
  const imgData =
    "data:image/png;base64,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";

  const generatePDF = async () => {
    setLoading(true);
    try {
      // Load all data
      const [
        profileData,
        prescriptionsData,
        testsData,
        symptomsData,
        pressureData,
      ] = await Promise.all([
        loadProfile(),
        loadPrescriptions(),
        loadVisualTests(),
        loadSymptoms(),
        loadPressureMeasurements(),
      ]);

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFillColor(30, 144, 255); // azul
      pdf.rect(0, 0, pageWidth, 25, "F");

      pdf.addImage(imgData, 'PNG', 10, 2.5, 20, 20); // a la izquierda

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont(undefined, "bold");
      pdf.text("MiOptiData Report", pageWidth / 2, 15, { align: "center" });
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      // Patient Information
      pdf.setFillColor(245, 245, 245); // gris claro
      pdf.roundedRect(15, yPosition - 2, pageWidth - 30, 40, 3, 3, "F");

      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.text("Patient Information", 20, yPosition + 5);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont(undefined, "normal");
      pdf.text(`Name: ${profileData.name}`, 25, yPosition);
      yPosition += 5;
      pdf.text(`Relationship: ${profileData.relationship}`, 25, yPosition);
      yPosition += 5;
      pdf.text(
        `Date of Birth: ${new Date(
          profileData.date_of_birth
        ).toLocaleDateString()}`,
        25,
        yPosition
      );
      yPosition += 5;
      pdf.text(
        `Report Generated: ${new Date().toLocaleDateString()}`,
        25,
        yPosition
      );
      yPosition += 5;
      pdf.text(
        `Report Period: ${new Date(
          dateRange.start
        ).toLocaleDateString()} - ${new Date(
          dateRange.end
        ).toLocaleDateString()}`,
        25,
        yPosition
      );
      yPosition += 8;

      pdf.setDrawColor(200);
      pdf.setLineWidth(0.5);
      pdf.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 10;

      // Summary Statistics
      if (reportType === "complete" || reportType === "summary") {
        const stats = [
          { label: "Total Prescriptions", value: prescriptionsData.length },
          { label: "Total Visual Tests", value: testsData.length },
          { label: "Total Symptoms Records", value: symptomsData.length },
          { label: "Total Pressure Measurements", value: pressureData.length },
        ];

        pdf.setFontSize(10);
        stats.forEach((stat, i) => {
          const xPos = 17 + (i % 2) * 90; // dos columnas
          const yPos = yPosition + Math.floor(i / 2) * 12;

          pdf.setFillColor(224, 235, 255); // celda azul clara
          pdf.roundedRect(xPos - 2, yPos - 4, 85, 15, 2, 2, "F");

          pdf.setTextColor(30, 144, 255);
          pdf.setFont(undefined, "bold");
          pdf.text(`${stat.value}`, xPos + 2, yPos + 1);

          pdf.setTextColor(0, 0, 0);
          pdf.setFont(undefined, "normal");
          pdf.text(stat.label, xPos + 2, yPos + 6);
        });
        yPosition += Math.ceil(stats.length / 2) * 12 + 10;

        pdf.line(15, yPosition - 5, pageWidth - 15, yPosition - 5);
        yPosition += 5;
      }

      // Current Prescription
      if (
        prescriptionsData.length > 0 &&
        (reportType === "complete" || reportType === "prescriptions")
      ) {
        const latestPrescription =
          prescriptionsData[prescriptionsData.length - 1];

        pdf.setFontSize(14);
        pdf.setFont(undefined, "bold");
        pdf.text("Current Prescription", 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont(undefined, "normal");
        pdf.text(
          `Date: ${new Date(
            latestPrescription.prescription_date
          ).toLocaleDateString()}`,
          20,
          yPosition
        );
        yPosition += 5;
        if (latestPrescription.doctor_name) {
          pdf.text(`Doctor: ${latestPrescription.doctor_name}`, 20, yPosition);
          yPosition += 5;
        }

        // Prescription table
        yPosition += 5;
        const tableData = [
          ["Eye", "Sphere", "Cylinder", "Axis", "Add", "Prism", "Base"],
          [
            "OD (Right)",
            latestPrescription.od_sphere?.toFixed(2) || "-",
            latestPrescription.od_cylinder?.toFixed(2) || "-",
            latestPrescription.od_axis?.toString() || "-",
            latestPrescription.od_add?.toFixed(2) || "-",
            latestPrescription.od_prism?.toFixed(2) || "-",
            latestPrescription.od_base || "-",
          ],
          [
            "OS (Left)",
            latestPrescription.os_sphere?.toFixed(2) || "-",
            latestPrescription.os_cylinder?.toFixed(2) || "-",
            latestPrescription.os_axis?.toString() || "-",
            latestPrescription.os_add?.toFixed(2) || "-",
            latestPrescription.os_prism?.toFixed(2) || "-",
            latestPrescription.os_base || "-",
          ],
        ];

        drawTable(pdf, tableData, 20, yPosition, pageWidth - 40);
        yPosition += tableData.length * 8 + 5;
      }

      // Check if new page needed
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      // Latest Visual Acuity
      if (
        testsData.length > 0 &&
        (reportType === "complete" || reportType === "vision")
      ) {
        const latestTest = testsData[testsData.length - 1];

        pdf.setFontSize(14);
        pdf.setFont(undefined, "bold");
        pdf.text("Latest Visual Acuity Test", 20, yPosition);
        yPosition += 10;

        const tableData = [
          [
            "Date",
            "Test Type",
            "With Correction",
            "Right Eye (OD)",
            "Left Eye (OD)",
            "Both Eyes",
          ],
          [
            new Date(latestTest.test_date).toLocaleDateString(),
            latestTest.test_type.toUpperCase() || "-",
            latestTest.with_correction ? "Yes" : "No",
            latestTest.od_result || "Not tested",
            latestTest.os_result || "Not tested",
            latestTest.binocular_result || "Not tested",
          ],
        ];

        drawTable(pdf, tableData, 20, yPosition, pageWidth - 40);
        yPosition += tableData.length * 8 + 5;
      }

      // Recent Symptoms
      if (
        symptomsData.length > 0 &&
        (reportType === "complete" || reportType === "symptoms")
      ) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, "bold");
        pdf.text("Recent Symptoms (Last 30 days)", 20, yPosition);
        yPosition += 10;

        const recentSymptoms = symptomsData
          .filter((symptom) => {
            const symptomDate = new Date(symptom.symptom_date);
            const thirtyDaysAgo = new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            );
            return symptomDate >= thirtyDaysAgo;
          })
          .slice(-5);

        if (recentSymptoms.length > 0) {
          recentSymptoms.forEach((symptom) => {
            pdf.setFontSize(10);
            pdf.setFont(undefined, "normal");
            pdf.text(
              `${new Date(
                symptom.symptom_date
              ).toLocaleDateString()}: ${getSymptomTypeLabel(
                symptom.symptom_type
              )} (Severity: ${symptom.severity}/10)`,
              20,
              yPosition
            );
            yPosition += 5;
            if (symptom.trigger_activity) {
              pdf.text(`  Trigger: ${symptom.trigger_activity}`, 25, yPosition);
              yPosition += 5;
            }
            yPosition += 2;
          });
        } else {
          pdf.setFontSize(10);
          pdf.setFont(undefined, "normal");
          pdf.text("No symptoms recorded in the last 30 days", 20, yPosition);
          yPosition += 5;
        }
        yPosition += 10;
      }

      // Prescription History
      console.log(prescriptionsData);
      if (
        prescriptionsData.length > 1 &&
        (reportType === "complete" || reportType === "prescriptions")
      ) {
        // Check if new page needed
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont(undefined, "bold");
        pdf.text("Prescription History", 20, yPosition);
        yPosition += 10;

        const historyTableData = [
          [
            "Date",
            "OD Sphere",
            "OD Cylinder",
            "OS Sphere",
            "OS Cylinder",
            "Doctor",
          ],
        ];

        prescriptionsData.slice(-5).forEach((prescription) => {
          historyTableData.push([
            new Date(prescription.prescription_date).toLocaleDateString(),
            prescription.od_sphere?.toFixed(2) || "-",
            prescription.od_cylinder?.toFixed(2) || "-",
            prescription.os_sphere?.toFixed(2) || "-",
            prescription.os_cylinder?.toFixed(2) || "-",
            prescription.doctor_name || "-",
          ]);
        });

        drawTable(pdf, historyTableData, 20, yPosition, pageWidth - 40);
        yPosition += historyTableData.length * 6 + 15;
      }

      // Footer
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setFont(undefined, "normal");
      pdf.text("Generated by MiOptiData App", pageWidth / 2, footerY, {
        align: "center",
      });
      pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, pageWidth - 20, footerY, {
        align: "right",
      });

      // Save PDF
      const fileName = `MiOptiData-${profileData.name.replace(/\s+/g, "-")}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);
      navigate("/");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
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
          pdf.setFont(undefined, "bold");
        } else {
          // Zebra stripes
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(245, 245, 245); // gris claro
          } else {
            pdf.setFillColor(255, 255, 255); // blanco
          }
          pdf.setTextColor(0, 0, 0); // texto negro
          pdf.setFont(undefined, "normal");
        }

        // Fondo de la celda
        pdf.rect(cellX, cellY - 5, colWidth, rowHeight, "F");

        // Texto centrado
        pdf.setFontSize(9);
        pdf.text(cell.toString(), cellX + colWidth / 2, cellY, {
          align: "center",
          baseline: "middle",
        });

        // Borde de la celda
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(cellX, cellY - 5, colWidth, rowHeight);
      });
    });

    return y + data.length * rowHeight + 2; // devuelve la nueva Y
  };

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("app_061iy_profiles")
      .select("*")
      .eq("id", profileId)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return data;
  };

  const loadPrescriptions = async () => {
    const { data, error } = await supabase
      .from("app_061iy_prescriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("profile_id", profileId)
      .gte("prescription_date", dateRange.start)
      .lte("prescription_date", dateRange.end)
      .order("prescription_date", { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const loadVisualTests = async () => {
    const { data, error } = await supabase
      .from("app_061iy_visual_tests")
      .select("*")
      .eq("user_id", user.id)
      .eq("profile_id", profileId)
      .gte("test_date", dateRange.start)
      .lte("test_date", dateRange.end)
      .order("test_date", { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const loadSymptoms = async () => {
    const { data, error } = await supabase
      .from("app_061iy_symptoms")
      .select("*")
      .eq("user_id", user.id)
      .eq("profile_id", profileId)
      .gte("symptom_date", dateRange.start)
      .lte("symptom_date", dateRange.end)
      .order("symptom_date", { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const loadPressureMeasurements = async () => {
    const { data, error } = await supabase
      .from("app_061iy_pressure_measurements")
      .select("*")
      .eq("user_id", user.id)
      .eq("profile_id", profileId)
      .gte("measurement_date", dateRange.start)
      .lte("measurement_date", dateRange.end)
      .order("measurement_date", { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const getSymptomTypeLabel = (type) => {
    const labels = {
      dry_eyes: "Dry Eyes",
      eye_strain: "Eye Strain",
      headaches: "Headaches",
      blurred_vision: "Blurred Vision",
      double_vision: "Double Vision",
      light_sensitivity: "Light Sensitivity",
      eye_pain: "Eye Pain",
      redness: "Redness",
      tearing: "Excessive Tearing",
      itching: "Itching",
      burning: "Burning Sensation",
      foreign_body_sensation: "Foreign Body Sensation",
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Generate PDF Report
          </h2>
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
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
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Report Will Include:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Patient information and summary statistics</li>
              {(reportType === "complete" ||
                reportType === "prescriptions") && (
                <li>• Current prescription and history</li>
              )}
              {(reportType === "complete" || reportType === "vision") && (
                <li>• Latest visual acuity test results</li>
              )}
              {(reportType === "complete" || reportType === "symptoms") && (
                <li>• Recent symptoms and patterns</li>
              )}
              <li>• Professional medical formatting</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => navigate("/")}
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
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
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
