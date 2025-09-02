import React, { useState, useEffect} from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams } from "react-router-dom";

import { supabase } from '../../lib/supabase';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PDFExport = () => {
  const { profileId } = useParams();
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);

    try {
      const { data: profile } = await supabase
        .from("app_061iy_profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (!profile) {
        alert("Profile not found!");
        setLoading(false);
        return;
      }

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      // 🔹 Función de tablas corregida
      const drawTable = (pdf, tableData, startY) => {
        const [headers, ...rows] = tableData;

        autoTable(pdf, {
          startY: startY,
          head: [headers],
          body: rows,
          theme: "grid",
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            halign: "center",
          },
          bodyStyles: {
            halign: "center",
          },
        });

        return pdf.lastAutoTable.finalY + 10;
      };

      // 🔹 Título principal
      pdf.setFontSize(18);
      pdf.text("Medical Report", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 20;

      // 🔹 Profile section
      pdf.setFontSize(14);
      pdf.text("Profile Information", 14, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.text(`Name: ${profile.name}`, 14, yPosition);
      yPosition += 7;
      pdf.text(`Date of Birth: ${profile.date_of_birth || "N/A"}`, 14, yPosition);
      yPosition += 7;
      pdf.text(`Gender: ${profile.gender || "N/A"}`, 14, yPosition);
      yPosition += 10;

      // ==========================
      // 🔹 Prescriptions (Current)
      // ==========================
      const { data: prescriptions } = await supabase
        .from("app_061iy_prescriptions")
        .select("*")
        .eq("profile_id", profileId)
        .order("prescription_date", { ascending: true });

      if (prescriptions && prescriptions.length > 0) {
        pdf.setFontSize(14);
        pdf.text("Current Prescription", 14, yPosition);
        yPosition += 10;

        const tableData = [
          ["Medication", "Dosage", "Start Date", "End Date"],
          ...prescriptions.map((p) => [
            p.medication || "N/A",
            p.dosage || "N/A",
            p.start_date || "N/A",
            p.end_date || "N/A",
          ]),
        ];

        yPosition = drawTable(pdf, tableData, yPosition);
      }

      // ==========================
      // 🔹 Prescription History
      // ==========================
      const { data: history } = await supabase
        .from("app_061iy_prescriptions")
        .select("*")
        .eq("profile_id", profileId)
        .order("prescription_date", { ascending: false });

      if (history && history.length > 0) {
        pdf.setFontSize(14);
        pdf.text("Prescription History", 14, yPosition);
        yPosition += 10;

        const tableData = [
          ["Medication", "Dosage", "Date"],
          ...history.map((h) => [
            h.medication || "N/A",
            h.dosage || "N/A",
            h.prescription_date || "N/A",
          ]),
        ];

        yPosition = drawTable(pdf, tableData, yPosition);
      }

      // Guardar PDF
      pdf.save(`${profile.name}_Medical_Report.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      generatePDF();
    }
  }, [profileId]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">PDF Export</h1>
      {loading && <p>Generating PDF...</p>}
    </div>
  );
};

export default PDFExport;