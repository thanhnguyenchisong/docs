const fs = require('fs');
const path = require('path');

async function loadPdfjs() {
  // pdfjs-dist 4.x needs dynamic import
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  return pdfjsLib;
}

const pdfFiles = [
  'Client-side Script.pdf',
  'Creating Custom Widget.pdf',
  'Server-side Scripting.pdf',
  'Service Portal Introduction.pdf'
];

async function extractPdf(pdfjsLib, filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  
  let fullText = '';
  const numPages = doc.numPages;
  
  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    
    // Group text items by their y-position to reconstruct lines
    const items = textContent.items;
    let lastY = null;
    let line = '';
    
    for (const item of items) {
      if (item.str === undefined) continue;
      
      const y = Math.round(item.transform[5]);
      
      if (lastY !== null && Math.abs(y - lastY) > 5) {
        fullText += line + '\n';
        line = '';
      }
      
      line += item.str;
      lastY = y;
    }
    
    if (line) {
      fullText += line + '\n';
    }
    
    fullText += '\n--- PAGE ' + i + ' ---\n\n';
  }
  
  return { text: fullText, numPages };
}

async function main() {
  const pdfjsLib = await loadPdfjs();
  
  for (const file of pdfFiles) {
    const filePath = path.join(__dirname, file);
    console.log(`Processing: ${file}...`);
    
    const { text, numPages } = await extractPdf(pdfjsLib, filePath);
    const outFile = file.replace('.pdf', '.txt');
    fs.writeFileSync(path.join(__dirname, outFile), text, 'utf8');
    console.log(`  -> ${outFile} (${numPages} pages, ${text.length} chars)`);
  }
  
  console.log('Done!');
}

main().catch(console.error);
