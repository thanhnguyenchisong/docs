/**
 * Proof of Concept: PDF Text Overlay Translation
 * 
 * Approach: "Cover and Overdraw"
 * 1. Read original PDF with pdfjs-dist to get text positions
 * 2. Use pdf-lib to load the same PDF
 * 3. Draw white rectangles over English text
 * 4. Draw Vietnamese text at the same positions
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

async function loadPdfjs() {
  return await import('pdfjs-dist/legacy/build/pdf.mjs');
}

// Extract text items with positions from a specific page
async function extractTextWithPositions(pdfjsLib, pdfPath, pageNum) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(pageNum);
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1.0 });
  
  const items = textContent.items.map(item => {
    // transform: [scaleX, skewY, skewX, scaleY, translateX, translateY]
    const x = item.transform[4];
    const y = item.transform[5]; // PDF coordinates (bottom-left origin)
    const fontSize = Math.abs(item.transform[3]); // scaleY approximates font size
    const width = item.width;
    const height = item.height;
    
    return {
      text: item.str,
      x,
      y,
      fontSize,
      width,
      height,
      fontName: item.fontName || 'unknown'
    };
  }).filter(item => item.text.trim().length > 0);
  
  return {
    items,
    pageWidth: viewport.width,
    pageHeight: viewport.height
  };
}

async function main() {
  const pdfjsLib = await loadPdfjs();
  const pdfPath = path.join(__dirname, 'Client-side Script.pdf');
  
  console.log('=== Extracting text positions from page 1 ===\n');
  
  // Extract text with positions from page 1
  const { items, pageWidth, pageHeight } = await extractTextWithPositions(pdfjsLib, pdfPath, 1);
  
  console.log(`Page dimensions: ${pageWidth} x ${pageHeight}`);
  console.log(`Total text items: ${items.length}\n`);
  
  // Show first 30 items with their positions
  items.slice(0, 30).forEach((item, i) => {
    console.log(`[${i}] "${item.text}" -> x=${item.x.toFixed(1)}, y=${item.y.toFixed(1)}, fontSize=${item.fontSize.toFixed(1)}, w=${item.width.toFixed(1)}, h=${item.height.toFixed(1)}, font=${item.fontName}`);
  });
  
  console.log('\n=== Now testing PDF overlay on page 1 ===\n');
  
  // Load the PDF with pdf-lib
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);
  
  // Embed custom font for Vietnamese
  const fontBytes = fs.readFileSync(path.join(__dirname, 'converted_files', 'NotoSans.ttf'));
  let customFont;
  try {
    customFont = await pdfDoc.embedFont(fontBytes);
    console.log('✓ Custom font (NotoSans) embedded successfully');
    
    // Test Vietnamese characters
    const testText = 'Xin chào thế giới - Đây là tiếng Việt - ĐẶC BIỆT';
    const testWidth = customFont.widthOfTextAtSize(testText, 12);
    console.log(`✓ Vietnamese text width test: "${testText}" = ${testWidth.toFixed(1)}px`);
  } catch (err) {
    console.error('✗ Font embedding failed:', err.message);
    return;
  }
  
  // Get first page
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();
  console.log(`\npdf-lib page size: ${width} x ${height}`);
  
  // Test: Cover first 5 text items and replace with Vietnamese
  const translations = {
    'Version: Zurich': 'Phiên bản: Zurich',
    'SERVICENOW APPLICATION DEVELOPER': 'NHÀ PHÁT TRIỂN ỨNG DỤNG SERVICENOW',
    'Client-side Scripting': 'Lập Trình Phía Client',
    'ARTICLE (1 OF 21)': 'BÀI VIẾT (1 TRÊN 21)',
    'Client-side Scripting Objectives': 'Mục Tiêu Lập Trình Phía Client',
    'In this module you will learn to:': 'Trong module này bạn sẽ học:',
    'Describe the purpose of a client-side script and give examples of what client-side scripts can do': 'Mô tả mục đích của client-side script và đưa ra ví dụ về những gì client-side scripts có thể làm',
    'Create and test Client Scripts': 'Tạo và kiểm thử Client Scripts',
    'Create and test UI Policy scripts': 'Tạo và kiểm thử UI Policy scripts',
    'Use the GlideForm and GlideUser APIs in scripts': 'Sử dụng GlideForm và GlideUser APIs trong scripts',
    'Determine whether to use UI Policy scripts or Client Scripts': 'Xác định khi nào nên dùng UI Policy scripts hoặc Client Scripts',
  };
  
  let replacedCount = 0;
  
  for (const item of items) {
    const translated = translations[item.text];
    if (translated) {
      // Draw white rectangle to cover original text
      // Add padding around the text
      const padding = 2;
      firstPage.drawRectangle({
        x: item.x - padding,
        y: item.y - padding,
        width: item.width + padding * 2,
        height: item.height + padding * 2,
        color: rgb(1, 1, 1), // white
        opacity: 1,
      });
      
      // Draw translated text
      const fontSize = Math.max(item.fontSize * 0.85, 6); // slightly smaller to fit
      firstPage.drawText(translated, {
        x: item.x,
        y: item.y,
        size: fontSize,
        font: customFont,
        color: rgb(0, 0, 0),
      });
      
      replacedCount++;
      console.log(`✓ Replaced: "${item.text}" → "${translated}"`);
    }
  }
  
  console.log(`\nReplaced ${replacedCount} text items on page 1`);
  
  // Save the modified PDF
  const outputPath = path.join(__dirname, 'converted_files', 'POC_Client-side-Script_VN.pdf');
  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, modifiedPdfBytes);
  console.log(`\n✓ Saved POC to: ${outputPath}`);
  console.log(`  File size: ${(modifiedPdfBytes.length / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
