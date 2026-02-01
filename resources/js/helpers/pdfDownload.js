/**
 * Utility function to download HTML element as PDF
 * Uses html2canvas and jspdf to convert HTML to PDF
 */
export const downloadHTMLAsPDF = async (element, filename = 'report.pdf') => {
  try {
    // Dynamically import html2canvas and jspdf
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    if (!element) {
      throw new Error('Element not found');
    }

    // Get the element dimensions
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      width: elementWidth,
      height: elementHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');

    // Calculate PDF dimensions (A4 size in mm)
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
    });

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');

    // Download PDF
    pdf.save(filename);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

