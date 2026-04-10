/**
 * Generate comprehensive Vietnamese .md file from all 4 PDF text extracts + translations
 */

const fs = require('fs');
const path = require('path');

function loadTranslations(dictFile) {
  if (!fs.existsSync(dictFile)) return {};
  const data = JSON.parse(fs.readFileSync(dictFile, 'utf8'));
  return Object.fromEntries(Object.entries(data).filter(([k, v]) => v && v.length > 0));
}

function translateLine(line, translations) {
  const trimmed = line.trim();
  if (!trimmed) return '';
  if (translations[trimmed]) return translations[trimmed];
  return trimmed;
}

function processLinesJson(jsonFile, translations) {
  const lines = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const mdLines = [];
  let inCodeBlock = false;
  
  for (const [key, value] of Object.entries(lines)) {
    const trimmed = key.trim();
    if (!trimmed) {
      if (!inCodeBlock) mdLines.push('');
      continue;
    }
    
    // Skip URLs and timestamps
    if (trimmed.match(/^https?:\/\//) || trimmed.match(/^\d+\/\d+\/\d+,\s+\d+:\d+/) || trimmed === 'ServiceNow Developers') continue;
    if (trimmed.match(/^\d+\/\d+$/)) continue;
    
    // Get translation 
    const translated = (value && value.length > 0) ? value : (translations[trimmed] || trimmed);
    
    // Detect headings
    if (trimmed.match(/^(ARTICLE|EXERCISE) \(\d+ OF \d+\)$/) || trimmed.match(/^(BÀI VIẾT|BÀI TẬP) \(\d+ TRÊN \d+\)$/)) {
      if (inCodeBlock) { mdLines.push('```\n'); inCodeBlock = false; }
      mdLines.push('');
      mdLines.push(`### ${translated}`);
      mdLines.push('');
      continue;
    }
    
    // Detect code
    const isCode = trimmed.match(/^\s*(function[\s(]|var |let |const |if\s*\(|else\s*{|else\s+if|return|for\s*\(|while\s*\(|\/\/|g_form\.|g_user\.|gs\.|\.query\(|\.next\(|\.get\(|\.setValue\(|\.getValue\()/) ||
                   trimmed.match(/^\s*(alert\(|console\.log|data\.|input\.|options\.|note\.|noteGR\.|noteObj\.|delNote\.)/) ||
                   trimmed.match(/^\s*<\/?[a-z]/) ||
                   trimmed.match(/^\s*[\{\};\)]+\s*$/) ||
                   trimmed.match(/^\s*\}\)\(\);$/) ||
                   trimmed.match(/^\s*(c\.|spUtil\.|spModal\.|this\.)/);
    
    // Handle code blocks
    if (isCode && !trimmed.match(/^[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+ [a-z]/i)) {
      if (!inCodeBlock) {
        mdLines.push('');
        mdLines.push('```javascript');
        inCodeBlock = true;
      }
      mdLines.push(trimmed);
    } else {
      if (inCodeBlock) {
        mdLines.push('```');
        mdLines.push('');
        inCodeBlock = false;
      }
      
      // Formatting for bolding step numbers (e.g., "1. " -> "**1.** ")
      let formattedText = translated;
      if (formattedText.match(/^\d+\.\s/)) {
        formattedText = formattedText.replace(/^(\d+\.)\s/, '**$1** ');
      }
      
      mdLines.push(formattedText);
    }
  }
  
  if (inCodeBlock) {
    mdLines.push('```');
  }
  
  return mdLines.join('\n');
}

// Build comprehensive MD file
const outputParts = [];

outputParts.push('# Tài Liệu Học ServiceNow Developer - Bản Tiếng Việt');
outputParts.push('');
outputParts.push('> Phiên bản: Zurich | Dịch từ: ServiceNow Developer Learning Modules');
outputParts.push('');
outputParts.push('## Mục Lục');
outputParts.push('');
outputParts.push('1. [Lập Trình Phía Client (Client-side Scripting)](#1-lập-trình-phía-client)');
outputParts.push('2. [Tạo Custom Widgets (Creating Custom Widgets)](#2-tạo-custom-widgets)');
outputParts.push('3. [Lập Trình Phía Server (Server-side Scripting)](#3-lập-trình-phía-server)');
outputParts.push('4. [Giới Thiệu Service Portal (Service Portal Introduction)](#4-giới-thiệu-service-portal)');
outputParts.push('');
outputParts.push('---');
outputParts.push('');

// File 1: Client-side Scripting
const clientTrans = loadTranslations('translations_client_side.json');
outputParts.push('## 1. Lập Trình Phía Client');
outputParts.push('');
outputParts.push(processLinesJson('Client-side Script_lines.json', clientTrans));
outputParts.push('');
outputParts.push('---');
outputParts.push('');

// File 2: Creating Custom Widgets
const widgetTrans = loadTranslations('translations_custom_widget.json');
outputParts.push('## 2. Tạo Custom Widgets');
outputParts.push('');
outputParts.push(processLinesJson('Creating Custom Widget_lines.json', widgetTrans));
outputParts.push('');
outputParts.push('---');
outputParts.push('');

// File 3: Server-side Scripting
const serverTrans = loadTranslations('translations_server_side.json');
outputParts.push('## 3. Lập Trình Phía Server');
outputParts.push('');
outputParts.push(processLinesJson('Server-side Scripting_lines.json', serverTrans));
outputParts.push('');
outputParts.push('---');
outputParts.push('');

// File 4: Service Portal Introduction
const portalTrans = loadTranslations('translations_service_portal.json');
outputParts.push('## 4. Giới Thiệu Service Portal');
outputParts.push('');
outputParts.push(processLinesJson('Service Portal Introduction_lines.json', portalTrans));

const finalContent = outputParts.join('\n');
const outputPath = path.join(__dirname, 'converted_files', 'ServiceNow-Learning-TongHop_VN.md');
fs.writeFileSync(outputPath, finalContent, 'utf8');

console.log(`\n✓ Comprehensive MD file created!`);
console.log(`  Output: ${outputPath}`);
console.log(`  Size: ${(Buffer.byteLength(finalContent) / 1024).toFixed(1)} KB`);
console.log(`  Lines: ${finalContent.split('\n').length}`);
