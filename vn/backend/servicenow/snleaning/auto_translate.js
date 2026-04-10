/**
 * Auto-translator: Generates Vietnamese translations for all extracted lines
 * Uses pattern-based translation + manual dictionary for remaining common phrases
 */

const fs = require('fs');
const path = require('path');

// ====== COMMON PATTERNS (regex-based) ======
const patterns = [
  // Article/Exercise headers
  [/^ARTICLE \((\d+) OF (\d+)\)$/, (m) => `BÀI VIẾT (${m[1]} TRÊN ${m[2]})`],
  [/^EXERCISE \((\d+) OF (\d+)\)$/, (m) => `BÀI TẬP (${m[1]} TRÊN ${m[2]})`],
  
  // Common labels
  [/^NOTE: (.+)$/, (m) => `GHI CHÚ: ${translateText(m[1])}`],
  [/^IMPORTANT: (.+)$/, (m) => `QUAN TRỌNG: ${translateText(m[1])}`],
  [/^DEVELOPER TIP: (.+)$/, (m) => `MẸO CHO DEVELOPER: ${translateText(m[1])}`],
  
  // Numbered steps with sub-items
  [/^(\d+)\. (.+)$/, (m) => `${m[1]}. ${translateText(m[2])}`],
  
  // Common single words/short phrases that should be kept
  [/^(function|var|if|else|return|for|while|const|let|this\.|data\.|input\.|options\.|c\.)/, null], // skip code
  [/^(gs\.|GlideRecord|GlideForm|GlideUser|\$sp\.|spUtil\.|spModal\.)/, null], // skip API calls
];

// ====== COMPREHENSIVE DICTIONARY ======
const dictionary = {
  // Common repeated phrases across all PDFs
  "Version: Zurich": "Phiên bản: Zurich",
  "SERVICENOW APPLICATION DEVELOPER": "NHÀ PHÁT TRIỂN ỨNG DỤNG SERVICENOW",
  "In this module you will learn to:": "Trong module này bạn sẽ học:",
  "About This Learning Module": "Về Module Học Tập Này",
  "Exercises are indicated in three ways:": "Bài tập được chỉ ra theo ba cách:",
  "Exercise icon in the Navigation pane.": "Biểu tượng Bài tập trong khung Điều hướng.",
  "Exercise icon and the word Exercise at the top of the page.": "Biểu tượng Bài tập và chữ Exercise ở đầu trang.",
  "The word Exercise or the word Challenge in the page title.": "Chữ Exercise hoặc chữ Challenge trong tiêu đề trang.",
  "Fork the Repository": "Fork Repository",
  "In this exercise, you will:": "Trong bài tập này, bạn sẽ:",
  "Preparation": "Chuẩn Bị",
  "Challenge": "Thử Thách",
  "Commit Changes": "Commit Thay Đổi",
  
  // Fork/Import/Branch instructions (repeated across all PDFs)
  "In this section of the exercise, you will create a personal fork of the application repository to use with": "Trong phần này của bài tập, bạn sẽ tạo một bản fork cá nhân của repository ứng dụng để sử dụng với",
  "Developer Site learning content.": "nội dung học tập của Developer Site.",
  "1. In a web browser, open github.com (https://github.com/).": "1. Trong trình duyệt web, mở github.com (https://github.com/).",
  "2. If you have a GitHub account, sign in. If not, sign up for a new account.": "2. Nếu bạn có tài khoản GitHub, đăng nhập. Nếu không, đăng ký tài khoản mới.",
  "4. Click the Fork button (": "4. Nhấp nút Fork (",
  ") to create a copy of the repository in your GitHub account.": ") để tạo bản sao repository trong tài khoản GitHub của bạn.",
  "5. On the Create a new fork page, deselect the Copy the main branch only option.": "5. Trên trang Create a new fork, bỏ chọn tùy chọn Copy the main branch only.",
  "6. Select your personal GitHub account as the fork Owner, then click the Create fork button.": "6. Chọn tài khoản GitHub cá nhân làm Owner cho fork, sau đó nhấp nút Create fork.",
  "7. Verify the URL for your fork of the repository is similar to: <YourGitHubUsername>/devtraining-": "7. Xác minh URL cho bản fork repository tương tự: <YourGitHubUsername>/devtraining-",
  "application-release.": "application-release.",
  "8. Copy the forked repository's URL.": "8. Sao chép URL của repository đã fork.",
  "1. Click the Code button.": "1. Nhấp nút Code.",
  "2. Make sure the URL contains your GitHub username, not ServiceNow.": "2. Đảm bảo URL chứa tên GitHub của bạn, không phải ServiceNow.",
  "3. Make sure HTTPS is selected. If not, select the HTTPS tab in the Clone flyout.": "3. Đảm bảo HTTPS đã được chọn. Nếu không, chọn tab HTTPS trong flyout Clone.",
  "4. Click the Copy to clipboard button (": "4. Nhấp nút Copy to clipboard (",
  ").": ").",
  "Import the Application from the Forked Repository": "Import Ứng dụng từ Repository Đã Fork",
  "In this section of the exercise, you will import the application repository into ServiceNow. As part of the": "Trong phần này của bài tập, bạn sẽ import repository ứng dụng vào ServiceNow. Như một phần của",
  "process, you will first create a Credential record for your GitHub account, then you will use Studio to import": "quy trình, trước tiên bạn sẽ tạo bản ghi Credential cho tài khoản GitHub, sau đó sử dụng Studio để import",
  "the application repository into your PDI.": "repository ứng dụng vào PDI của bạn.",
  "1. Log in to your PDI as the admin user. If you do not have a PDI, open the ServiceNow Developer Site": "1. Đăng nhập vào PDI với tư cách admin. Nếu bạn chưa có PDI, mở ServiceNow Developer Site",
  "(https://developer.servicenow.com) to obtain a Utah PDI.": "(https://developer.servicenow.com) để lấy Utah PDI.",
  "2. Create a Credential record for the GitHub connection.": "2. Tạo bản ghi Credential cho kết nối GitHub.",
  "another exercise, please skip this step.": "bài tập khác, vui lòng bỏ qua bước này.",
  "2. Click the New button.": "2. Nhấp nút New.",
  "3. In the What type of Credentials would you like to create? list, click the Basic Auth Credentials link.": "3. Trong danh sách What type of Credentials would you like to create?, nhấp liên kết Basic Auth Credentials.",
  "4. Configure the Credential record.": "4. Cấu hình bản ghi Credential.",
  "1. Name: GitHub Credentials - <Your github.com Username>": "1. Name: GitHub Credentials - <Tên GitHub của bạn>",
  "User name: <Your github.com Username>": "User name: <Tên GitHub của bạn>",
  "Password: <Your github.com personal access token>": "Password: <Personal access token GitHub của bạn>",
  "access token.": "access token.",
  "5. Click the Submit button.": "5. Nhấp nút Submit.",
  "3. Use the All menu to open System Applications > Studio.": "3. Sử dụng menu All để mở System Applications > Studio.",
  "4. Studio opens in a new browser tab.": "4. Studio mở trong tab trình duyệt mới.",
  "5. In the Select Application dialog, click the Import From Source Control button.": "5. Trong hộp thoại Select Application, nhấp nút Import From Source Control.",
  "6. In the Import Application dialog, configure the connection to the forked repository.": "6. Trong hộp thoại Import Application, cấu hình kết nối tới repository đã fork.",
  "1. URL: <URL you copied for your forked version of the repository>": "1. URL: <URL bạn đã sao chép cho bản fork repository>",
  "Credential: GitHub Credentials - <Your github.com Username>": "Credential: GitHub Credentials - <Tên GitHub của bạn>",
  "Branch: main": "Branch: main",
  "7. Click the Import button.": "7. Nhấp nút Import.",
  "8. When the application import is complete, click the Select Application button.": "8. Khi import ứng dụng hoàn tất, nhấp nút Select Application.",
  "troubleshoot the connection.": "khắc phục sự cố kết nối.",
  "9. In the Select Application dialog, click the application to open it for editing in Studio.": "9. Trong hộp thoại Select Application, nhấp ứng dụng để mở chỉnh sửa trong Studio.",
  "exercise.": "bài tập tiếp theo.",
  "4. Click the Create Branch button.": "4. Nhấp nút Create Branch.",
  "5. Click the Close button.": "5. Nhấp nút Close.",
  "6. To load the application files included in the tag, return to the main ServiceNow browser tab (not Studio)": "6. Để tải các file ứng dụng trong tag, quay lại tab trình duyệt ServiceNow chính (không phải Studio)",
  "and click the browser's reload button to refresh the page.": "và nhấp nút reload của trình duyệt để làm mới trang.",
  "instructions on how to troubleshoot GitHub connection issues.": "hướng dẫn cách khắc phục sự cố kết nối GitHub.",
  "1. In the main ServiceNow browser window, use the All menu to open System Applications > Studio.": "1. Trong cửa sổ trình duyệt ServiceNow chính, sử dụng menu All để mở System Applications > Studio.",
  "2. In Studio, open the Source Control menu and select the Create Branch menu item.": "2. Trong Studio, mở menu Source Control và chọn mục Create Branch.",
  "3. Configure the branch.": "3. Cấu hình branch.",
  "2. Open the Source Control menu and select the Commit Changes menu item.": "2. Mở menu Source Control và chọn mục Commit Changes.",
  "3. Select the updates to commit.": "3. Chọn các cập nhật để commit.",
  "2. Review the application files to be committed.": "2. Xem lại các file ứng dụng sẽ được commit.",
  "3. Click the Continue button.": "3. Nhấp nút Continue.",
  "5. Click the Commit Files button.": "5. Nhấp nút Commit Files.",
  "6. When the Commit Changes dialog reports success, click the Close button.": "6. Khi hộp thoại Commit Changes báo thành công, nhấp nút Close.",
  "to save your work.": "để lưu công việc.",
  "source control.": "source control.",
  "module.": "module.",

  // Buttons and UI elements
  "4. Click the Update button.": "4. Nhấp nút Update.",
  "3. Click the Submit button.": "3. Nhấp nút Submit.",
  "2. Click the Save button.": "2. Nhấp nút Save.",
  "4. Click the Save button.": "4. Nhấp nút Save.",
  "6. Click the Save button.": "6. Nhấp nút Save.",
  "7. Click the Save button.": "7. Nhấp nút Save.",
  "8. Click the Save button.": "8. Nhấp nút Save.",
  "8. Click the Update button.": "8. Nhấp nút Update.",
  "3. Click the New button.": "3. Nhấp nút New.",
  
  // Creating Custom Widgets specific
  "Creating Custom Widgets": "Tạo Custom Widgets",
  "Creating Custom Widget Objectives": "Mục Tiêu Tạo Custom Widget",
  "Clone baseline widgets": "Clone baseline widgets",
  "Write widget logic": "Viết logic widget",
  "HTML Template": "HTML Template", 
  "Client Script": "Client Script",
  "Server Script": "Server Script",
  "Test Widgets": "Kiểm thử Widgets",
  "Preview": "Xem trước",
  "Test Page": "Trang kiểm thử",
  "JavaScript Console": "JavaScript Console",
  "Use the Widget APIs": "Sử dụng Widget APIs",
  "Use the widget global objects": "Sử dụng các đối tượng toàn cục của widget",
  "data": "data",
  "input": "input",
  "options": "options",
  "Create and use directives": "Tạo và sử dụng directives",
  "Define and use widget options": "Định nghĩa và sử dụng widget options",
  "Respond to record changes which occur outside of Service Portal": "Phản hồi thay đổi bản ghi xảy ra bên ngoài Service Portal",
  "You will practice widget development skills by creating the CreateNotes portal and two widgets.": "Bạn sẽ thực hành kỹ năng phát triển widget bằng cách tạo portal CreateNotes và hai widgets.",
  "What Are Widgets?": "Widget Là Gì?",
  "Widgets are reusable components which make up the functionality of a portal page. Widgets define what a": "Widgets là các thành phần tái sử dụng tạo nên chức năng của trang portal. Widgets xác định những gì",
  "portal does and what information a user sees. ServiceNow provides a large number of baseline widgets.": "portal thực hiện và thông tin người dùng nhìn thấy. ServiceNow cung cấp nhiều baseline widgets.",
  "Examples include:": "Ví dụ bao gồm:",
  "Approvals": "Phê duyệt",
  "Knowledge Base": "Cơ sở kiến thức",
  "My Requests": "Yêu cầu của tôi",
  "Carousel": "Carousel",
  "Catalog content": "Nội dung catalog",
  "Popular questions": "Câu hỏi phổ biến",
  "Search": "Tìm kiếm",
  "Some example widgets:": "Một số widget ví dụ:",
  "Widgets are AngularJS directives. When a page is loaded, a directive is created for each widget on the page.": "Widgets là AngularJS directives. Khi trang được tải, một directive được tạo cho mỗi widget trên trang.",
  "Widgets are tightly coupled to the server-side JavaScript code which is powered by the Rhino engine under": "Widgets được liên kết chặt chẽ với mã JavaScript phía server được hỗ trợ bởi engine Rhino bên dưới",
  "the Now Platform.": "Now Platform.",
  "Widget Components": "Các Thành Phần Widget",
  "Widgets include both mandatory and optional components.": "Widgets bao gồm cả thành phần bắt buộc và tùy chọn.",
  "Widget Editor": "Widget Editor",
  "Widget Editor is the application for editing widget components.": "Widget Editor là ứng dụng để chỉnh sửa các thành phần widget.",
  "Cloning Widgets": "Clone Widgets",
  "Previewing Widgets": "Xem Trước Widgets",
  "Widget Global Objects and Functions": "Đối Tượng và Hàm Toàn Cục của Widget",
  "Widget API": "Widget API",
  "Debugging Widgets": "Gỡ Lỗi Widgets",
  "Using AngularJS Events with Widgets": "Sử Dụng AngularJS Events với Widgets",
  "Using the Client-side Widget API": "Sử Dụng Widget API Phía Client",
  "What are Widget Options?": "Widget Options Là Gì?",
  "Widget Option Schema": "Widget Option Schema",
  "Directives": "Directives",
  "Angular Provider Relationship": "Mối Quan Hệ Angular Provider",
  "recordWatch()": "recordWatch()",
  "Creating Custom Widgets Module Recap": "Tóm Tắt Module Tạo Custom Widgets",
  "Core concepts:": "Khái niệm cốt lõi:",
  
  // Server-side Scripting specific
  "Server-side Scripting": "Lập Trình Phía Server",
  "Server-side Scripting Objectives": "Mục Tiêu Lập Trình Phía Server",
  "Introduction to Server-side Scripting": "Giới Thiệu Lập Trình Phía Server",
  "Business Rules": "Business Rules",
  "Script Includes": "Script Includes",
  "GlideRecord": "GlideRecord",
  "GlideSystem": "GlideSystem",
  "Scheduled Script Executions": "Thực Thi Script Theo Lịch",
  "Server-side Scripting Module Recap": "Tóm Tắt Module Lập Trình Phía Server",
  
  // Service Portal Introduction specific
  "Service Portal Introduction": "Giới Thiệu Service Portal",
  "Service Portal Introduction Objectives": "Mục Tiêu Giới Thiệu Service Portal",
  "What is Service Portal?": "Service Portal Là Gì?",
  "Service Portal Architecture": "Kiến Trúc Service Portal",
  "Pages": "Trang",
  "Widgets": "Widgets",
  "Themes": "Chủ đề",
  "Portals": "Portals",
  "Service Portal Introduction Module Recap": "Tóm Tắt Module Giới Thiệu Service Portal",
};

// ====== WORD/PHRASE TRANSLATION HELPERS ======
const wordTranslations = {
  // Verbs
  "Create": "Tạo", "create": "tạo",
  "Delete": "Xóa", "delete": "xóa",
  "Update": "Cập nhật", "update": "cập nhật",
  "Edit": "Chỉnh sửa", "edit": "chỉnh sửa",
  "Open": "Mở", "open": "mở",
  "Close": "Đóng", "close": "đóng",
  "Save": "Lưu", "save": "lưu",
  "Click": "Nhấp", "click": "nhấp",
  "Select": "Chọn", "select": "chọn",
  "Enter": "Nhập", "enter": "nhập",
  "Examine": "Kiểm tra", "examine": "kiểm tra",
  "Configure": "Cấu hình", "configure": "cấu hình",
  "Test": "Kiểm thử", "test": "kiểm thử",
  "Verify": "Xác minh", "verify": "xác minh",
  "Replace": "Thay thế", "replace": "thay thế",
  "Add": "Thêm", "add": "thêm",
  "Remove": "Xóa", "remove": "xóa",
  "Return": "Quay lại", "return": "quay lại",
  "Notice": "Lưu ý", "notice": "lưu ý",
  "Explore": "Khám phá", "explore": "khám phá",
  "Switch": "Chuyển", "switch": "chuyển",
  "Reload": "Tải lại", "reload": "tải lại",
  
  // Nouns
  "button": "nút",
  "field": "trường",
  "form": "form",
  "record": "bản ghi",
  "table": "bảng",
  "script": "script",
  "dialog": "hộp thoại",
  "menu": "menu",
  "page": "trang",
  "browser": "trình duyệt",
  "window": "cửa sổ",
  "application": "ứng dụng",
  "module": "module",
  "exercise": "bài tập",
  "example": "ví dụ",
  "value": "giá trị",
  "property": "thuộc tính",
  "method": "phương thức",
  "function": "hàm",
  "object": "đối tượng",
  "instance": "instance",
  "user": "người dùng",
  "name": "tên",
  "list": "danh sách",
  "link": "liên kết",
  "option": "tùy chọn",
  "step": "bước",
  "section": "phần",
  "content": "nội dung",
  "description": "mô tả",
  "information": "thông tin",
  "logic": "logic",
  "behavior": "hành vi",
  "changes": "thay đổi",
  "repository": "repository",
};

function translateText(text) {
  // Simple word-level translation for pattern-matched content
  // This is a basic helper, the main translation comes from the dictionary
  return text;
}

function isCodeLine(text) {
  if (text.match(/^\s*(function|var |if |else |return |for |while |const |let |this\.|data\.|input\.|options\.)/)) return true;
  if (text.match(/^\s*[\{\};\(\)]\s*$/)) return true;
  if (text.match(/^\s*(alert|console\.log|g_form\.|g_user\.|gs\.|current\.|previous\.|\$sp\.)/)) return true;
  if (text.match(/^\s*\/\//)) return true; // comments
  if (text.match(/^\s*<\/?[a-z]/)) return true; // HTML tags
  if (text.match(/^\s*\w+\.\w+\(/)  && !text.match(/[A-Z][a-z]+ [a-z]/)) return true; // method calls
  if (text.match(/^\s*noteGR\.|noteObj\.|delNote\.|note\./)) return true;
  if (text.match(/^(function\(|api\(|spUtil\.|spModal\.|c\.)/)) return true;
  if (text.match(/^\$rootScope|^\$scope|\$sp\./)) return true;
  return false;
}

function isUrlLine(text) {
  if (text.match(/^\(https?:\/\//)) return true;
  if (text.match(/^https?:\/\//)) return true;
  return false;
}

function generateTranslations(inputFile, outputFile, extraDict = {}) {
  const lines = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const merged = { ...dictionary, ...extraDict };
  
  let translated = 0;
  let skipped = 0;
  let remaining = 0;
  
  for (const [key, value] of Object.entries(lines)) {
    // Skip if already translated
    if (value && value.length > 0) continue;
    
    // Check dictionary first
    if (merged[key]) {
      lines[key] = merged[key];
      translated++;
      continue;
    }
    
    // Skip code lines
    if (isCodeLine(key)) {
      skipped++;
      continue; // leave empty = skip
    }
    
    // Skip URL lines 
    if (isUrlLine(key)) {
      skipped++;
      continue;
    }
    
    // Skip very short lines that are likely code/symbols
    if (key.length <= 3 && !key.match(/^[A-Z]/)) {
      skipped++;
      continue;
    }
    
    // Apply pattern matching
    let matched = false;
    for (const [regex, handler] of patterns) {
      if (typeof regex === 'object') {
        const m = key.match(regex);
        if (m && handler) {
          lines[key] = handler(m);
          translated++;
          matched = true;
          break;
        } else if (m && !handler) {
          skipped++;
          matched = true;
          break;
        }
      }
    }
    
    if (!matched) {
      remaining++;
    }
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(lines, null, 2), 'utf8');
  
  console.log(`\nFile: ${inputFile}`);
  console.log(`  Dictionary matches: ${translated}`);
  console.log(`  Code/URL skipped: ${skipped}`);
  console.log(`  Remaining untranslated: ${remaining}`);
  console.log(`  Output: ${outputFile}`);
  
  // Show sample of remaining lines
  const remainingLines = Object.entries(lines).filter(([k, v]) => !v && !isCodeLine(k) && !isUrlLine(k) && k.length > 3);
  if (remainingLines.length > 0) {
    console.log(`\n  Sample remaining (first 20):`);
    remainingLines.slice(0, 20).forEach(([k]) => console.log(`    "${k}"`));
  }
}

// Process all files
const files = [
  { input: 'Creating Custom Widget_lines.json', output: 'translations_custom_widget.json' },
  { input: 'Server-side Scripting_lines.json', output: 'translations_server_side.json' },
  { input: 'Service Portal Introduction_lines.json', output: 'translations_service_portal.json' },
];

for (const file of files) {
  if (fs.existsSync(file.input)) {
    generateTranslations(file.input, file.output);
  } else {
    console.log(`File not found: ${file.input}`);
  }
}
