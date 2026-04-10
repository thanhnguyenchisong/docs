/**
 * Translation Engine for PDF files
 * 
 * Approach: "Cover and Overdraw"
 * - Extracts text items with positions from PDF using pdfjs-dist
 * - Groups text items into lines by y-coordinate
 * - Applies translation dictionary
 * - Uses pdf-lib to overlay white rectangles + Vietnamese text
 * 
 * Usage:
 *   node translate_engine.js extract <pdf_file>          → outputs lines to console
 *   node translate_engine.js translate <pdf_file> <dict>  → generates translated PDF
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

// ===== TEXT EXTRACTION =====

async function loadPdfjs() {
  return await import('pdfjs-dist/legacy/build/pdf.mjs');
}

async function extractPageLines(pdfjsLib, pdfPath, pageNum) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(pageNum);
  const textContent = await page.getTextContent();
  
  // Extract items with positions
  const items = textContent.items
    .filter(item => item.str !== undefined && item.str.length > 0)
    .map(item => ({
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
      fontSize: Math.abs(item.transform[3]),
      width: item.width,
      height: item.height,
      fontName: item.fontName || 'unknown'
    }));
  
  // Group items by y-coordinate (tolerance: 3px)
  const lineGroups = {};
  for (const item of items) {
    const yKey = Math.round(item.y / 3) * 3; // round to nearest 3
    if (!lineGroups[yKey]) {
      lineGroups[yKey] = [];
    }
    lineGroups[yKey].push(item);
  }
  
  // Sort lines top to bottom (highest y first), items left to right
  const lines = Object.entries(lineGroups)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([yKey, items]) => {
      items.sort((a, b) => a.x - b.x);
      const fullText = items.map(i => i.text).join('');
      const minX = Math.min(...items.map(i => i.x));
      const maxX = Math.max(...items.map(i => i.x + i.width));
      const minY = Math.min(...items.map(i => i.y));
      const maxY = Math.max(...items.map(i => i.y + i.height));
      const avgFontSize = items.reduce((s, i) => s + i.fontSize, 0) / items.length;
      
      return {
        text: fullText,
        items,
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        fontSize: avgFontSize,
        yKey: Number(yKey)
      };
    });
  
  const numPages = doc.numPages;
  return { lines, numPages };
}

async function extractAllLines(pdfPath) {
  const pdfjsLib = await loadPdfjs();
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const numPages = doc.numPages;
  
  const allPages = [];
  for (let i = 1; i <= numPages; i++) {
    const { lines } = await extractPageLines(pdfjsLib, pdfPath, i);
    allPages.push({ pageNum: i, lines });
  }
  
  return { pages: allPages, numPages };
}

// ===== TRANSLATION =====

function isNoiseLine(text) {
  // Skip URLs, timestamps, page indicators
  if (text.match(/^https?:\/\//)) return true;
  if (text.match(/^\d+\/\d+\/\d+,\s+\d+:\d+/)) return true;
  if (text.match(/^ServiceNow Developers$/)) return true;
  if (text.match(/^\d+\/\d+$/)) return true; // page numbers like 1/37
  return false;
}

function isCodeLine(text) {
  // Detect code lines
  if (text.match(/^\s*(function|var|if|else|for|while|return|\/\/|g_form\.|g_user\.|gs\.|current\.|previous\.)/)) return true;
  if (text.match(/^\s*[\{\};\(\)]\s*$/)) return true;
  if (text.match(/^\s*(alert|console\.log)\(/)) return true;
  if (text.match(/^\s*myObj\./)) return true;
  if (text.match(/^\s*\w+\.\w+\(/)) return true; // method calls
  return false;
}

async function translatePdf(pdfPath, translations, outputPath) {
  const pdfjsLib = await loadPdfjs();
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const numPages = doc.numPages;
  
  // Load PDF with pdf-lib
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);
  
  // Embed Vietnamese font
  const fontPath = path.join(__dirname, 'converted_files', 'NotoSans.ttf');
  const fontBytes = fs.readFileSync(fontPath);
  const vnFont = await pdfDoc.embedFont(fontBytes);
  
  // Also embed a bold-like version (we'll simulate with slightly larger size)
  const pages = pdfDoc.getPages();
  
  let totalReplaced = 0;
  let totalSkipped = 0;
  
  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    
    // Extract and group items
    const items = textContent.items
      .filter(item => item.str !== undefined && item.str.length > 0)
      .map(item => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        fontSize: Math.abs(item.transform[3]),
        width: item.width,
        height: item.height,
      }));
    
    const lineGroups = {};
    for (const item of items) {
      const yKey = Math.round(item.y / 3) * 3;
      if (!lineGroups[yKey]) lineGroups[yKey] = [];
      lineGroups[yKey].push(item);
    }
    
    const pdfPage = pages[i - 1];
    const { width: pageWidth } = pdfPage.getSize();
    
    for (const [yKey, lineItems] of Object.entries(lineGroups)) {
      lineItems.sort((a, b) => a.x - b.x);
      const fullText = lineItems.map(it => it.text).join('');
      
      // Skip noise lines
      if (isNoiseLine(fullText)) {
        totalSkipped++;
        continue;
      }
      
      // Look up translation
      const translated = translations[fullText];
      if (!translated) {
        totalSkipped++;
        continue;
      }
      
      // Calculate line bounding box
      const minX = Math.min(...lineItems.map(it => it.x));
      const maxXW = Math.max(...lineItems.map(it => it.x + it.width));
      const minY = Math.min(...lineItems.map(it => it.y));
      const maxYH = Math.max(...lineItems.map(it => it.y + it.height));
      const lineWidth = maxXW - minX;
      const lineHeight = maxYH - minY;
      const avgFontSize = lineItems.reduce((s, it) => s + it.fontSize, 0) / lineItems.length;
      
      // Cover original text with white rectangle
      const padding = 1;
      pdfPage.drawRectangle({
        x: minX - padding,
        y: minY - padding,
        width: lineWidth + padding * 2,
        height: lineHeight + padding * 2,
        color: rgb(1, 1, 1),
        opacity: 1,
      });
      
      // Calculate font size to fit translated text
      let fontSize = avgFontSize;
      const availableWidth = pageWidth - minX - 40; // leave 40px right margin
      let textWidth = vnFont.widthOfTextAtSize(translated, fontSize);
      
      // Scale down if text is too wide
      while (textWidth > availableWidth && fontSize > 4) {
        fontSize *= 0.95;
        textWidth = vnFont.widthOfTextAtSize(translated, fontSize);
      }
      
      // Draw translated text
      pdfPage.drawText(translated, {
        x: minX,
        y: minY,
        size: fontSize,
        font: vnFont,
        color: rgb(0, 0, 0),
      });
      
      totalReplaced++;
    }
    
    if (i % 5 === 0 || i === numPages) {
      console.log(`  Page ${i}/${numPages} processed...`);
    }
  }
  
  // Save
  const modifiedBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, modifiedBytes);
  
  console.log(`\n  Total lines replaced: ${totalReplaced}`);
  console.log(`  Total lines skipped: ${totalSkipped}`);
  console.log(`  Output: ${outputPath}`);
  console.log(`  Size: ${(modifiedBytes.length / 1024 / 1024).toFixed(2)} MB`);
}

// ===== MAIN =====

async function main() {
  const mode = process.argv[2];
  const pdfFile = process.argv[3];
  
  if (mode === 'extract' && pdfFile) {
    console.log(`Extracting lines from: ${pdfFile}\n`);
    const { pages, numPages } = await extractAllLines(pdfFile);
    
    // Output as JSON for translation dictionary creation
    const output = {};
    for (const page of pages) {
      for (const line of page.lines) {
        if (!isNoiseLine(line.text) && line.text.trim().length > 0) {
          output[line.text] = "";  // empty = needs translation
        }
      }
    }
    
    const outputFile = pdfFile.replace('.pdf', '_lines.json');
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
    console.log(`Extracted ${Object.keys(output).length} unique lines to: ${outputFile}`);
    console.log(`Total pages: ${numPages}`);
    
  } else if (mode === 'translate' && pdfFile) {
    const dictFile = process.argv[4];
    if (!dictFile) {
      console.error('Usage: node translate_engine.js translate <pdf> <dict.json>');
      process.exit(1);
    }
    
    console.log(`Translating: ${pdfFile}`);
    console.log(`Dictionary: ${dictFile}`);
    
    const translations = JSON.parse(fs.readFileSync(dictFile, 'utf8'));
    const nonEmpty = Object.entries(translations).filter(([k, v]) => v.length > 0);
    console.log(`  Translations loaded: ${nonEmpty.length}\n`);
    
    const baseName = path.basename(pdfFile, '.pdf').replace(/\s+/g, '-');
    const outputPath = path.join(__dirname, 'converted_files', `${baseName}_VN.pdf`);
    
    await translatePdf(pdfFile, translations, outputPath);
    
  } else {
    console.log('Usage:');
    console.log('  node translate_engine.js extract <pdf_file>');
    console.log('  node translate_engine.js translate <pdf_file> <dict.json>');
  }
}

module.exports = { extractAllLines, translatePdf, isNoiseLine, isCodeLine };

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
