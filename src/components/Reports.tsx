import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Car, Download, RefreshCw, Calendar, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export const Reports: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [reportData, setReportData] = useState<any | null>(null);
  const [businessInfo, setBusinessInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summary, business] = await Promise.all([
        api.getReportSummary(),
        api.getBusinessConfig(),
      ]);
      setReportData(summary);
      setBusinessInfo(business);
    } catch (err) {
      console.error('Error cargando reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Carga de librerías vectoriales de jsPDF para generación 100% confiable
  const loadJsPdfLibraries = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).jspdf && (window as any).jspdf.jsPDF) {
        resolve((window as any).jspdf);
        return;
      }

      const scriptJsPdf = document.createElement('script');
      scriptJsPdf.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      
      scriptJsPdf.onload = () => {
        const scriptAutoTable = document.createElement('script');
        scriptAutoTable.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
        scriptAutoTable.onload = () => resolve((window as any).jspdf);
        scriptAutoTable.onerror = () => reject(new Error('Error al cargar complemento autotable.'));
        document.head.appendChild(scriptAutoTable);
      };
      scriptJsPdf.onerror = () => reject(new Error('Error al cargar librería jsPDF.'));
      document.head.appendChild(scriptJsPdf);
    });
  };

  const handleExportPDF = async () => {
    if (!reportData || !businessInfo) return;

    setExporting(true);
    try {
      const jspdfModule = await loadJsPdfLibraries();
      const { jsPDF } = jspdfModule;
      const doc = new jsPDF();

      const todayDate = new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const totalVehicles = reportData.totalVehiclesWeek || 0;
      const MASTER_VEHICLES = ['Automóvil', 'Motocicleta', 'Bicicleta', 'Otros'];

      // ENCABEZADO
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text(businessInfo.name || 'PARKCONTROL CENTRAL', 14, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text('Reporte Operativo y Financiero', 14, 26);
      doc.text(`Generado el: ${todayDate}`, 14, 31);

      // DATOS DEL NEGOCIO (ALINEADO A LA DERECHA)
      doc.setFontSize(9);
      doc.text(`NIT: ${businessInfo.nit || 'N/A'}`, 196, 20, { align: 'right' });
      doc.text(`Dirección: ${businessInfo.address || 'N/A'}`, 196, 25, { align: 'right' });
      doc.text(`Teléfono: ${businessInfo.phone || 'N/A'}`, 196, 30, { align: 'right' });

      // LÍNEA SEPARADORA
      doc.setDrawColor(219, 39, 119);
      doc.setLineWidth(0.8);
      doc.line(14, 36, 196, 36);

      // CUADROS DE RESUMEN
      let startY = 44;

      // Caja 1: Ingresos Hoy
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(14, startY, 56, 22, 3, 3, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52);
      doc.text('INGRESOS HOY', 18, startY + 6);
      doc.setFontSize(12);
      doc.setTextColor(21, 128, 61);
      doc.text(`$${(reportData.dailyRevenue || 0).toLocaleString()}`, 18, startY + 15);

      // Caja 2: Ingresos Semanales
      doc.setFillColor(239, 246, 255);
      doc.setDrawColor(191, 219, 254);
      doc.roundedRect(76, startY, 56, 22, 3, 3, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('INGRESOS (7 DÍAS)', 80, startY + 6);
      doc.setFontSize(12);
      doc.setTextColor(29, 78, 216);
      doc.text(`$${(reportData.weeklyRevenue || 0).toLocaleString()}`, 80, startY + 15);

      // Caja 3: Vehículos Atendidos
      doc.setFillColor(253, 242, 248);
      doc.setDrawColor(251, 207, 232);
      doc.roundedRect(138, startY, 58, 22, 3, 3, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(157, 23, 77);
      doc.text('VEHÍCULOS ATENDIDOS', 142, startY + 6);
      doc.setFontSize(12);
      doc.setTextColor(190, 24, 93);
      doc.text(`${totalVehicles}`, 142, startY + 15);

      startY += 30;

      // TABLA 1: FLUJO DIARIO
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Flujo de Ingresos Diario (Últimos 7 Días)', 14, startY);

      const chartTableBody = (reportData.weeklyChartData || []).map((d: any) => [
        d.day,
        `$${(d.revenue || 0).toLocaleString()}`
      ]);

      (doc as any).autoTable({
        startY: startY + 4,
        head: [['Día', 'Recaudo ($)']],
        body: chartTableBody,
        theme: 'striped',
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right', textColor: [15, 23, 42] }
        }
      });

      startY = (doc as any).lastAutoTable.finalY + 12;

      // TABLA 2: DISTRIBUCIÓN GARANTIZANDO LAS 4 CATEGORÍAS
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Distribución y Recaudo por Tipo de Vehículo', 14, startY);

      const vehicleTableBody = MASTER_VEHICLES.map((typeName) => {
        const match = (reportData.vehicleDistribution || []).find(
          (v: any) => v.vehicleType?.toLowerCase().trim() === typeName.toLowerCase().trim()
        );
        const count = match ? match.count : 0;
        const revenue = match ? match.revenue : 0;
        const pct = totalVehicles > 0 ? Math.round((count / totalVehicles) * 100) : 0;

        return [typeName, count.toString(), `${pct}%`, `$${(revenue || 0).toLocaleString()}`];
      });

      (doc as any).autoTable({
        startY: startY + 4,
        head: [['Tipo de Vehículo', 'Cantidad', 'Participación', 'Total Recaudado ($)']],
        body: vehicleTableBody,
        theme: 'striped',
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'center' },
          2: { halign: 'center', textColor: [190, 24, 93], fontStyle: 'bold' },
          3: { halign: 'right', textColor: [21, 128, 61], fontStyle: 'bold' }
        }
      });

      // PIE DE PÁGINA
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, finalY, 196, finalY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(businessInfo.receiptFooter || 'Sistema de Control e Inspección de Estacionamiento ParkControl', 105, finalY + 6, { align: 'center' });

      // GUARDA CON MARCA DE TIEMPO ÚNICA
      const timeStampStr = new Date().toISOString().replace(/[:.]/g, '-');
      doc.save(`Reporte_ParkControl_${timeStampStr}.pdf`);
    } catch (err: any) {
      alert(`Error al generar el PDF: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const chartData = reportData?.weeklyChartData || [];
  const maxRevenue = Math.max(...chartData.map((d: any) => d.revenue), 1000);
  const totalVehicles = reportData?.totalVehiclesWeek || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Reportes e Informes</h1>
              <p className="text-xs text-slate-400">Análisis operativo e ingresos consolidados</p>
            </div>
          </div>
        </div>

        <button onClick={loadData} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-pink-400 hover:bg-slate-800">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* MÉTRICAS PRINCIPALES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400">Ingresos de Hoy</p>
              <h2 className="text-2xl font-black text-white mt-1">
                ${(reportData?.dailyRevenue || 0).toLocaleString()}
              </h2>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400"><DollarSign size={24} /></div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-400">Ingresos Semanales (7 Días)</p>
              <h2 className="text-2xl font-black text-white mt-1">
                ${(reportData?.weeklyRevenue || 0).toLocaleString()}
              </h2>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400"><TrendingUp size={24} /></div>
          </div>
        </div>

        {/* GRÁFICO BARRAS DE INGRESOS SEMANALES */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-sm">Flujo de Ingresos Diario (Últimos 7 Días)</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={13} /> Sincronizado</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
            {chartData.map((item: any, idx: number) => {
              const heightPx = item.revenue > 0 ? Math.max(16, Math.round((item.revenue / maxRevenue) * 120)) : 4;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-[10px] text-pink-300 font-bold px-2 py-0.5 rounded transition-opacity whitespace-nowrap z-10">
                    ${item.revenue.toLocaleString()}
                  </div>
                  <div
                    style={{ height: `${heightPx}px` }}
                    className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                      item.revenue > 0 ? 'bg-gradient-to-t from-pink-600 to-pink-400 hover:brightness-125' : 'bg-slate-800'
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-slate-400">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DISTRIBUCIÓN Y RECAUDO POR VEHÍCULO */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="font-bold text-white text-sm">Distribución y Recaudo por Tipo de Vehículo</h3>

          <div className="space-y-3">
            {(reportData?.vehicleDistribution || []).map((v: any) => {
              const pct = totalVehicles > 0 ? Math.round((v.count / totalVehicles) * 100) : 0;

              return (
                <div key={v.vehicleType} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300">{v.vehicleType}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold">${(v.revenue || 0).toLocaleString()}</span>
                      <span className="text-pink-400">{v.count} veh. ({pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-pink-500 h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTÓN DESCARGAR PDF */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-blue-400">
              <Car size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total de Vehículos Atendidos</p>
              <h4 className="text-xl font-bold text-white">{totalVehicles}</h4>
            </div>
          </div>

          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20"
          >
            {exporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Exportar Reporte en PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};