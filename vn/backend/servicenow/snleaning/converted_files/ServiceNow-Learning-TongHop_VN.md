# Tài Liệu Học ServiceNow Developer - Bản Tiếng Việt

> Phiên bản: Zurich | Dịch từ: ServiceNow Developer Learning Modules

## Mục Lục

1. [Lập Trình Phía Client (Client-side Scripting)](#1-lập-trình-phía-client)
2. [Tạo Custom Widgets (Creating Custom Widgets)](#2-tạo-custom-widgets)
3. [Lập Trình Phía Server (Server-side Scripting)](#3-lập-trình-phía-server)
4. [Giới Thiệu Service Portal (Service Portal Introduction)](#4-giới-thiệu-service-portal)

---

## 1. Lập Trình Phía Client

Phiên bản: Zurich
NHÀ PHÁT TRIỂN ỨNG DỤNG SERVICENOW
Lập Trình Phía Client

### BÀI VIẾT (1 TRÊN 21)

Mục Tiêu Lập Trình Phía Client
Trong module này bạn sẽ học:
Mô tả mục đích của client-side script và đưa ví dụ về những gì client-side scripts có thể làm
Tạo và kiểm thử Client Scripts
Tạo và kiểm thử UI Policy scripts
Sử dụng GlideForm và GlideUser APIs trong scripts
Xác định nên dùng UI Policy scripts hay Client Scripts

### BÀI VIẾT (2 TRÊN 21)

Về Module Học Tập Này
QUAN TRỌNG: Nội dung trong module học tập này được cập nhật lần cuối cho phiên bản San Diego ServiceNow và không được
cập nhật cho phiên bản Utah. Bạn có thể thấy sự khác biệt giữa phiên bản Utah và nội dung trong module học tập này.
Nhiều ví dụ được sử dụng trên các trang khái niệm trong module học tập này. Bạn không cần cố gắng
tái tạo các ví dụ. Bạn sẽ phát triển ứng dụng NeedIt trong các bài tập thực hành.
Bài tập được chỉ ra theo ba cách:
Biểu tượng Bài tập trong khung Điều hướng.
Biểu tượng Bài tập và chữ Exercise ở đầu trang.
Chữ Exercise hoặc chữ Challenge trong tiêu đề trang.
Ứng dụng NeedIt cho phép người dùng yêu cầu dịch vụ từ nhiều phòng ban. Bạn sẽ sử dụng
source control để bắt đầu với tất cả các file ứng dụng NeedIt cần thiết cho module học tập này.

### BÀI TẬP (3 TRÊN 21)

Bài tập: Fork Repository và Import Ứng dụng
cho Module Lập Trình Phía Client
ServiceNow sử dụng GitHub để cung cấp các repository ứng dụng để sao chép và sử dụng với nội dung học tập
của Developer Site. Các repository chứa tags, là các tập hợp cố định của file ứng dụng, để bắt đầu với một
ứng dụng đã xây dựng một phần. Bằng cách sao chép và import repository do ServiceNow cung cấp vào
Personal Developer Instance (PDI) của bạn, bạn sẽ có tất cả các file cần thiết cho các bài tập thực hành.
GHI CHÚ: Xem Hướng dẫn GitHub (/dev.do#!/guide/utah/now-platform/github-guide/github-and-the-developer-site-training-guide-introduction)
để biết thêm thông tin về cách ServiceNow sử dụng GitHub với nội dung học tập Developer Program và xem video về cách
fork một repository và import ứng dụng.
Trong bài tập này, bạn sẽ:
**1.** Fork repository ServiceNow vào tài khoản GitHub của bạn.
**2.** Import ứng dụng vào PDI của bạn từ bản fork repository.
QUAN TRỌNG: Nếu bạn đã fork và import repository, bạn có thể tiến hành bài tập tiếp theo, nơi bạn sẽ
tạo branch từ tag để tải các file ứng dụng vào PDI. Các file ứng dụng NeedIt cần thiết để hoàn thành
module.
Fork Repository
Trong phần này của bài tập, bạn sẽ tạo một bản fork cá nhân của repository ứng dụng để sử dụng với
nội dung học tập của Developer Site.
**1.** Trong trình duyệt web, mở github.com (https://github.com/).
**2.** Nếu bạn có tài khoản GitHub, đăng nhập. Nếu không, đăng ký tài khoản mới.
**3.** Sau khi đăng nhập, mở repository NeedIt (https://github.com/ServiceNow/devtraining-needit-utah).
**4.** Nhấp nút Fork (
) để tạo bản sao repository trong tài khoản GitHub của bạn.
**5.** Trên trang Create a new fork, bỏ chọn tùy chọn Copy the main branch only.
**6.** Chọn tài khoản GitHub cá nhân làm Owner cho fork, sau đó nhấp nút Create fork.
**7.** Xác minh URL cho bản fork repository tương tự: <YourGitHubUsername>/devtraining-
application-release.
**8.** Sao chép URL của repository đã fork.
**1.** Nhấp nút Code.
**2.** Đảm bảo URL chứa tên GitHub của bạn, không phải ServiceNow.
**3.** Đảm bảo HTTPS đã được chọn. Nếu không, chọn tab HTTPS trong flyout Clone.
**4.** Nhấp nút Copy to clipboard (
).
GHI CHÚ: Bạn sẽ sử dụng URL đã sao chép để cấu hình kết nối tới repository đã fork trong phần tiếp theo.
Import Ứng dụng từ Repository Đã Fork
Trong phần này của bài tập, bạn sẽ import repository ứng dụng vào ServiceNow. Như một phần của
quy trình, trước tiên bạn sẽ tạo bản ghi Credential cho tài khoản GitHub, sau đó sử dụng Studio để import
repository ứng dụng vào PDI của bạn.
**1.** Đăng nhập vào PDI với tư cách admin. Nếu bạn chưa có PDI, mở ServiceNow Developer Site
(https://developer.servicenow.com) để lấy Utah PDI.
GHI CHÚ: Xem Hướng dẫn Personal Developer Instance (PDI) (/dev.do#!/guide/utah/now-platform/pdi-guide/personal-developer-
instance-guide-introduction) để biết hướng dẫn cách lấy PDI.
**2.** Tạo bản ghi Credential cho kết nối GitHub.
QUAN TRỌNG: Bản ghi Credential chỉ cần tạo một lần. Nếu bạn đã tạo bản ghi credential trong
bài tập khác, vui lòng bỏ qua bước này.
**1.** Sử dụng menu All để mở Connections & Credentials > Credentials.
**2.** Nhấp nút New.
**3.** Trong danh sách What type of Credentials would you like to create?, nhấp liên kết Basic Auth Credentials.
**4.** Cấu hình bản ghi Credential.
**1.** Name: GitHub Credentials - <Tên GitHub của bạn>
User name: <Tên GitHub của bạn>
Password: <Personal access token GitHub của bạn>
QUAN TRỌNG: GitHub yêu cầu personal access tokens để truy cập repositories từ các nền tảng khác, như
ServiceNow. Personal access token được sử dụng thay cho mật khẩu khi xác thực. Xem phần
Authenticating to GitHub (/dev.do#!/guides/utah/developer-program/github-guide/using-servicenow-provided-application-
repositories#authenticating-to-github) trong Hướng dẫn GitHub để biết cách tạo GitHub personal
access token.
**5.** Nhấp nút Submit.
**3.** Sử dụng menu All để mở System Applications > Studio.
**4.** Studio mở trong tab trình duyệt mới.
**5.** Trong hộp thoại Select Application, nhấp nút Import From Source Control.
**6.** Trong hộp thoại Import Application, cấu hình kết nối tới repository đã fork.
**1.** URL: <URL bạn đã sao chép cho bản fork repository>
Credential: GitHub Credentials - <Tên GitHub của bạn>
Branch: main
GHI CHÚ: Khi bạn thay đổi giá trị Branch thành main, một thông báo cho biết việc sử dụng quy ước đặt tên mặc định
được khuyến khích mạnh mẽ. Giá trị trong trường Branch phải tồn tại trong repository. Các repository đào tạo của Developer Site
đều có branch main, nên được sử dụng thay cho giá trị mặc định.
**7.** Nhấp nút Import.
**8.** Khi import ứng dụng hoàn tất, nhấp nút Select Application.
GHI CHÚ: Nếu kết nối thất bại, có thể bạn đã nhập URL repository ServiceNow trong trường URL thay vì
URL repository đã fork, hoặc bạn đã bật xác thực hai yếu tố trên tài khoản GitHub. Xem Troubleshooting
GitHub Issues (/dev.do#!/guide/utah/now-platform/github-guide/troubleshooting-github-issues) để biết hướng dẫn cách
khắc phục sự cố kết nối.
**9.** Trong hộp thoại Select Application, nhấp ứng dụng để mở chỉnh sửa trong Studio.
QUAN TRỌNG: Bạn sẽ không thấy bất kỳ file ứng dụng nào trong Studio cho đến khi tạo thành công branch từ tag trong
bài tập tiếp theo.

### BÀI TẬP (4 TRÊN 21)

Bài tập: Tạo Branch cho Module
Lập Trình Phía Client
Trong bài tập này, bạn sẽ tạo branch của ứng dụng NeedIt cho module Lập Trình Phía Client
bao gồm các file ứng dụng được sử dụng trong module.
GHI CHÚ: Trước khi bắt đầu bài tập này, bạn cần đã fork và import repository NeedIt như mô tả trong Bài tập:
Fork Repository và Import Ứng dụng cho Module Lập Trình Phía Client.
**1.** Nếu ứng dụng NeedIt chưa mở trong Studio từ bài tập trước, hãy mở ngay.
**1.** Trong cửa sổ trình duyệt ServiceNow chính, sử dụng menu All để mở System Applications > Studio.
**2.** Trong hộp thoại Select Application, nhấp ứng dụng NeedIt.
**2.** Trong Studio, mở menu Source Control và chọn mục Create Branch.
**3.** Cấu hình branch.
**1.** Branch Name: ClientScriptsModule
Create from Tag: LoadForClientScriptsModule
**4.** Nhấp nút Create Branch.
**5.** Nhấp nút Close.
**6.** Để tải các file ứng dụng trong tag, quay lại tab trình duyệt ServiceNow chính (không phải Studio)
và nhấp nút reload của trình duyệt để làm mới trang.
GHI CHÚ: Nếu tạo branch thất bại, có thể bạn đã nhập URL repository ServiceNow trong trường URL thay vì
URL repository đã fork hoặc đã bật xác thực hai yếu tố trên tài khoản GitHub. Xem Troubleshooting GitHub
Issues (/dev.do#!/guide/utah/now-platform/github-guide/troubleshooting-github-issues) trong Hướng dẫn GitHub để biết
hướng dẫn cách khắc phục sự cố kết nối GitHub.

### BÀI VIẾT (5 TRÊN 21)

Giới Thiệu Lập Trình Phía Client
Scripts trong ServiceNow được chia thành hai loại:
Phía Client
Phía Server
Module học tập này về lập trình phía client. Client-side scripts thực thi trong trình duyệt của người dùng và
được sử dụng để quản lý forms và các trường form. Ví dụ những gì client-side scripts có thể làm bao gồm:
Đặt con trỏ vào trường form khi form được tải
Tạo cảnh báo, xác nhận và thông báo
Điền giá trị vào trường form phản hồi theo giá trị của trường khác
Làm nổi bật trường form
Xác thực dữ liệu form
Sửa đổi các tùy chọn danh sách
Ẩn/Hiện trường hoặc phần
Trong module này bạn sẽ học viết, kiểm thử và gỡ lỗi hai loại client-side scripts:
Client Scripts
UI Policy Scripts

### BÀI VIẾT (6 TRÊN 21)

Các Loại Client Script
Client Script thực thi logic script phía client khi forms được:
Tải (Loaded)
Thay đổi (Changed)
Gửi (Submitted)
onLoad
onLoad Client Scripts thực thi logic script khi forms được tải. Sử dụng onLoad Client Scripts để thao tác
giao diện hoặc nội dung form. Ví dụ, thiết lập thông báo ở mức trường hoặc form dựa trên sự hiện diện của
giá trị. Sử dụng onLoad Client Scripts một cách tiết kiệm vì chúng ảnh hưởng đến thời gian tải form.
onChange
onChange Client Scripts thực thi logic script khi giá trị của một trường cụ thể thay đổi. Sử dụng onChange
Client Scripts để phản hồi giá trị trường quan tâm và sửa đổi giá trị hoặc thuộc tính của trường khác. Ví dụ,
nếu giá trị trường State thay đổi thành Closed Complete, tạo cảnh báo và đặt trường Description thành
bắt buộc.
onSubmit
onSubmit Client Scripts thực thi logic script khi form được gửi. Sử dụng onSubmit Client Scripts để xác thực
giá trị trường. Ví dụ, nếu người dùng gửi bản ghi Priority 1, script có thể tạo hộp thoại xác nhận
thông báo cho người dùng rằng ban lãnh đạo được sao chép trên tất cả yêu cầu Priority 1.
GHI CHÚ: Trường Type có tùy chọn thứ tư: onCellEdit. Loại onCellEdit Client Script dành cho danh sách thay vì forms. onCellEdit
Client Scripts không được đề cập trong module học tập này.

### BÀI VIẾT (7 TRÊN 21)

Tạo Client Scripts
Quy trình thêm file vào ứng dụng trong Studio không đổi bất kể loại file:
**1.** Nhấp liên kết Create Application File.
**2.** Chọn loại file mới, trong trường hợp này là Client Script.
**3.** Cấu hình file mới.
Cấu Hình Client Script
Như với bất kỳ script nào, cấu hình cho script biết khi nào thực thi. Các tùy chọn cấu hình Client Script
là:
Name: Tên của Client Script. Sử dụng quy ước đặt tên chuẩn để nhận diện custom scripts.
Table: Bảng mà script áp dụng.
UI Type: Chọn script thực thi cho Desktop và Tablet hoặc Mobile/Service Portal hoặc Tất cả.
Type: Chọn khi nào script chạy: onChange, onLoad, hoặc onSubmit.
Field Name: Chỉ dùng khi script phản hồi thay đổi giá trị trường (onChange); tên trường
mà script áp dụng.
Active: Kiểm soát script có được bật hay không. Scripts không active sẽ không thực thi.
Inherited: Nếu được chọn, script áp dụng cho bảng được chỉ định và tất cả bảng kế thừa từ nó. Ví dụ,
client script trên bảng Task cũng sẽ áp dụng cho Change, Incident, Problem và tất cả các bảng khác
mở rộng từ Task.
Global: Nếu Global được chọn, script áp dụng cho tất cả Views. Nếu trường Global không được chọn, bạn phải
chỉ định View.
View: Chỉ định View mà script áp dụng. Trường View hiển thị khi Global không được chọn.
Script chỉ có thể tác động lên các trường thuộc View form đã chọn. Nếu trường View để trống, script
áp dụng cho view Default.
Trường Field name có sẵn cho onChange Client Scripts. Trường View có sẵn khi tùy chọn
Global không được chọn.
MẸO CHO DEVELOPER: Khi logic phía client được sửa đổi, hãy tải lại cửa sổ trình duyệt ServiceNow chính để đảm bảo logic mới nhất
được tải lên.

### BÀI VIẾT (8 TRÊN 21)

Trường Script
Khi giá trị type được thiết lập, một template script tự động được chèn vào trường Script.
Template Script onLoad
Template script onLoad:
Hàm onLoad không có tham số được truyền vào. Như chỉ dẫn trong comment, thêm logic script của bạn trong
hàm onLoad. Đó là thực hành tốt nhất để ghi chú code, vì vậy hãy thêm comments để giải thích script
làm gì. Bạn trong tương lai sẽ cảm ơn bạn vì script được ghi chú rõ ràng.
Script ví dụ này tạo cảnh báo khi người dùng yêu cầu tải form cho một bản ghi. Người dùng không thể
tương tác với form cho đến khi onLoad Client Scripts hoàn tất thực thi.
Template Script onSubmit
Template script onSubmit:
Hàm onSubmit không có tham số được truyền vào. Như chỉ dẫn trong comment, thêm logic script của bạn
trong hàm onSubmit.
Script ví dụ này tạo cảnh báo khi người dùng lưu bản ghi NeedIt. Bản ghi không được gửi đến
server cho đến khi onSubmit Client Scripts hoàn tất thực thi và trả về true.
Template Script onChange
Template Script onChange:
Hàm onChange được ServiceNow tự động truyền năm tham số. Mặc dù bạn không cần
làm gì để truyền các tham số, bạn có thể sử dụng chúng trong script của bạn.
control: trường mà Client Script được cấu hình.
oldValue: giá trị của trường khi form được tải và trước khi thay đổi.
newValue: giá trị của trường sau khi thay đổi.
isLoading: giá trị boolean cho biết thay đổi có đang xảy ra như một phần của việc tải form không. Giá trị là true
nếu thay đổi do tải form. Khi forms tải, tất cả giá trị trường trên form thay đổi khi bản ghi được
tải vào form.
isTemplate: giá trị boolean cho biết thay đổi có xảy ra do điền giá trị trường bởi
template hay không. Giá trị là true nếu thay đổi do điền từ template.
Khi người dùng chọn bản ghi để tải, form và layout form được render trước, sau đó các trường được
điền giá trị từ cơ sở dữ liệu. Từ góc nhìn kỹ thuật, tất cả giá trị trường bị thay đổi, từ
không có gì sang giá trị của bản ghi, khi form tải. Câu lệnh if trong template giả định rằng onChange
Client scripts không nên thực thi logic script khi form tải. onChange Client Script cũng dừng
thực thi nếu newValue của trường không có giá trị. Tùy vào trường hợp sử dụng, bạn có thể sửa đổi hoặc
xóa câu lệnh if. Ví dụ:

```javascript
//Stop script execution if the field value change was caused by a Template
if(isLoading || newValue === '' || isTemplate) {
return;
}
```

Trong ví dụ này, onChange Client Script thực thi vì thay đổi của trường Short description
giá trị:
Khi người dùng thay đổi giá trị trường Short description trên form, logic script onChange thực thi.
Ví dụ tạo cảnh báo cho biết giá trị trường Short description đã thay đổi từ
giá trị trường có khi form được tải sang giá trị mới trên form.
Giá trị trường Short description chỉ thay đổi trên form. Các thay đổi không được gửi đến cơ sở dữ liệu
cho đến khi người dùng lưu, cập nhật hoặc gửi bản ghi.
Điều quan trọng cần biết là giá trị của oldValue được thiết lập khi form tải. Bất kể trường Short description
thay đổi bao nhiêu lần, oldValue vẫn giữ nguyên cho đến khi form được tải lại từ
cơ sở dữ liệu.
**1.** Form tải:
**1.** oldValue = hello
**2.** newValue không có giá trị
**2.** Người dùng thay đổi giá trị trong trường Short description thành bye:
**2.** newValue = bye
**3.** Người dùng thay đổi giá trị trong trường Short description thành greetings:
**2.** newValue = greetings
**4.** Người dùng lưu form và tải lại trang form:
**1.** oldValue = greetings

### BÀI TẬP (9 TRÊN 21)

Bài tập: Kiểm Thử Các Loại Client Script
Trong bài tập này bạn sẽ kiểm thử các loại Client Script onLoad, onChange và onSubmit sử dụng Client
Scripts từ repository GitHub bạn đã fork.
Chuẩn Bị
**1.** Nếu ứng dụng NeedIt chưa mở trong Studio từ bài tập trước, hãy mở ngay.
**1.** Trong cửa sổ trình duyệt ServiceNow chính, mở menu All.
**2.** Trong trường Filter, nhập Studio.
**3.** Mở System Applications > Studio.
**4.** Trong hộp thoại Select Application, nhấp ứng dụng NeedIt.
**2.** Kích hoạt NeedIt onLoad Example Client Script.
**1.** Trong Studio, dùng Application Explorer để mở Client Development > Client Scripts > NeedIt
onLoad Example.
**2.** Chọn tùy chọn Active.
**3.** Kiểm tra cấu hình để xem script dùng cho bảng nào.
**3.** Kiểm tra trường Script để xác định script làm gì.
**4.** Nhấp nút Update.
**5.** Sử dụng cùng chiến lược, kích hoạt NeedIt onSubmit Example và NeedIt onChange Example
Client Scripts. Với onChange Client Script, ghi chú giá trị trong trường Field name.
Kiểm Thử Client Scripts
**1.** Trong cửa sổ trình duyệt ServiceNow chính (không phải Studio), dùng menu All để mở NeedIt > All.
**2.** Kiểm thử NeedIt onLoad Example Client Script.
**1.** Mở bản ghi NeedIt bạn chọn để chỉnh sửa.
**2.** Cảnh báo có xuất hiện không? Nếu không, đảm bảo bạn đã kích hoạt NeedIt onLoad Example Client Script
và lưu thay đổi.
**3.** Với cảnh báo vẫn mở, thử sửa đổi giá trị trường trên form. Bạn không thể sửa đổi
form cho đến khi script NeedIt onLoad Example hoàn tất thực thi. onLoad Client scripts với cảnh báo
ngăn quyền kiểm soát form được trao cho người dùng cho đến khi cảnh báo được đóng.
**4.** Nhấp nút OK để đóng cảnh báo.
**3.** Kiểm thử NeedIt onChange Example Client Script.
**1.** Chỉnh sửa bất kỳ trường nào trên form trừ trường Short description.
**2.** Không có cảnh báo nào xuất hiện.
**3.** Chỉnh sửa giá trị trong trường Short description rồi nhấp vào form bên ngoài trường.
**4.** Cảnh báo sẽ xuất hiện hiển thị oldValue và newValue. Nếu không có cảnh báo, đảm bảo bạn
đã kích hoạt NeedIt onChange Example Client Script và lưu thay đổi.
**5.** Nhấp nút OK để đóng cảnh báo.
**6.** Chỉnh sửa trường Short description lần nữa rồi nhấp bên ngoài trường.
**7.** Trong cảnh báo, lưu ý oldValue không thay đổi.
**8.** Nhấp nút OK để đóng cảnh báo.
**4.** Kiểm thử NeedIt onSubmit Example Client Script.
**1.** Nhấp nút Update trên header form.
**2.** Cảnh báo có xuất hiện không? Nếu không, đảm bảo bạn đã kích hoạt NeedIt onSubmit Example Client Script
và lưu thay đổi.
**3.** Nhấp nút OK để đóng cảnh báo.
**5.** Quay lại Studio và vô hiệu hóa Client Scripts:
NeedIt onLoad Example
NeedIt onChange Example
NeedIt onSubmit Example

### BÀI VIẾT (10 TRÊN 21)

Lớp GlideForm (g_form)
GlideForm (https://developer.servicenow.com/dev.do#!/reference/api/utah/client/c_GlideFormAPI) API phía client
cung cấp các phương thức để quản lý form và trường form bao gồm các phương thức để:
Lấy giá trị trường trên form
Ẩn trường
Đặt trường chỉ đọc
Viết thông báo trên form hoặc trường
Thêm trường vào danh sách lựa chọn
Xóa trường khỏi danh sách lựa chọn
Các phương thức GlideForm được truy cập qua đối tượng toàn cục g_form chỉ có sẵn trong
scripts phía client. Để sử dụng các phương thức từ lớp GlideForm, dùng cú pháp:

```javascript
g_form.<method name>
```

Ví dụ, GlideForm API có phương thức gọi là getValue(). Phương thức getValue lấy giá trị của
trường trên form (không phải giá trị trong cơ sở dữ liệu). Script ví dụ lấy giá trị trường Short description
từ form và hiển thị giá trị trường Short description trong cảnh báo.

```javascript
alert(g_form.getValue('short_description'));
```

Lưu ý trên form, tên trường là Short description nhưng script tham chiếu cùng trường là
short_description. Tại sao hai giá trị này khác nhau? Tất cả trường bảng đều có Label và Name.
Label là phiên bản thân thiện với người dùng của tên trường hiển thị trên forms. Name là giá trị dùng để
tham chiếu trường trong script. Names luôn viết thường và không chứa khoảng trắng.
Có nhiều cách để tìm giá trị Name và Label cho trường như xem định nghĩa bảng,
xem thuộc tính trong Form Designer, hoặc xem trong Dictionary. Cách nhanh nhất để tìm
giá trị Name và Label khi form đang mở là nhấp chuột phải vào Label của trường trên form. Label xuất hiện
trên form và Name xuất hiện trong menu nhấp chuột phải.
Ngoài phương thức getValue(), các phương thức GlideForm thường dùng khác bao gồm:
addOption()
clearOptions()
addInfoMessage()
addErrorMessage()
showFieldMsg()
clearMessages()
getSections()
getSectionName()
Để xem danh sách đầy đủ API phía client, truy cập Developer Site API Reference (https://developer.service-
now.com/dev.do#!/reference/api/utah/client/).

### BÀI VIẾT (11 TRÊN 21)

Lớp GlideUser (g_user)
GlideUser (https://developer.servicenow.com/dev.do#!/reference/api/utah/client/c_GlideUserAPI) API cung cấp
các phương thức và thuộc tính để tìm thông tin về người dùng đang đăng nhập và vai trò của họ.
Các trường hợp sử dụng điển hình là cá nhân hóa phản hồi cho người dùng và kiểm tra vai trò. Lưu ý rằng
xác thực phía client trong bất kỳ ứng dụng web nào đều dễ bị bỏ qua.
GlideUser API có các thuộc tính và phương thức để:
Lấy thông tin người dùng:
Tên
Họ tên đầy đủ
Họ
User ID
Tên đăng nhập
Xác định người dùng có được gán vai trò cụ thể hay không
Các phương thức và thuộc tính GlideUser được truy cập qua đối tượng toàn cục g_user
chỉ có sẵn trong scripts phía client. Để sử dụng phương thức và thuộc tính từ lớp GlideUser, dùng cú pháp:

```javascript
g_user.<method or property name>
```

Ví dụ, GlideUser API có thuộc tính gọi là userName. Giá trị thuộc tính userName là
tên đăng nhập của người dùng hiện tại. Script ví dụ cho thấy sự khác biệt giữa các thuộc tính firstName,
lastName, userName và userID.

```javascript
alert("g_user.firstName = " + g_user.firstName
```

+ ", \n g_user.lastName = " + g_user.lastName
+ ", \n g_user.userName = " + g_user.userName
+ ", \n g_user.userID = " + g_user.userID);
Cảnh báo được tạo bởi script là:
Thuộc tính g_user.userID chứa sys_id của bản ghi. Mỗi bản ghi có sys_id duy nhất 32 ký tự.
Mặc dù bạn có thể nối đầu ra g_user.firstName với g_user.lastName, phương thức tiện lợi
g_user.getFullName() nối hai giá trị đó.
GlideUser API cũng có phương thức để xác định người dùng có vai trò cụ thể không. Ví dụ:

```javascript
g_user.hasRole('client_script_admin');
```

Script ví dụ kiểm tra xem người dùng đang đăng nhập có khả năng tạo và chỉnh sửa Client
Scripts (vai trò client_script_admin) hay không. Lưu ý script trả về true không chỉ khi người dùng hiện tại
được gán vai trò mà còn khi người dùng có vai trò admin. Người dùng admin có tất cả vai trò
được gán ngầm. Để kiểm tra người dùng hiện tại có vai trò được gán tường minh hay không, dùng
phương thức hasRoleExactly():

```javascript
g_user.hasRoleExactly('client_script_admin');
```


### BÀI TẬP (12 TRÊN 21)

Bài tập: Tạo Client Scripts
Trong bài tập này bạn sẽ viết và kiểm thử hai Client Scripts:
Script để thiết lập giá trị danh sách lựa chọn What needed dựa trên giá trị trong trường Request type
Đặt giá trị Requested for thành người dùng đang đăng nhập
Tạo NeedIt Request Type Options Client Script
**1.** Kiểm tra các trường Request type và What needed trên form NeedIt.
**1.** Trong cửa sổ trình duyệt ServiceNow chính (không phải Studio), dùng menu All để mở NeedIt > All.
**2.** Mở bản ghi NeedIt bạn chọn để chỉnh sửa.
**3.** Nhấp trường Request type để xem các lựa chọn. Bạn sẽ thấy: Facilities, Human Resources và
Legal.
**4.** Nhấp trường What needed để xem các lựa chọn. Lưu ý các lựa chọn bao gồm phòng ban khác ngoài
phòng ban được chọn trong trường Request type.
**5.** Dùng menu All để mở NeedIt > Create New.
**6.** Lưu ý giá trị mặc định cho trường Request type.
**2.** Quay lại Studio và tạo Client Script.
**1.** Trong Studio, nhấp liên kết Create Application File.
**2.** Trong trường Filter... nhập text Client HOẶC chọn Client Development từ danh mục trong
khung bên trái.
**3.** Chọn Client Script ở khung giữa làm loại file, sau đó nhấp nút Create.
GHI CHÚ: Nếu bạn bật annotations, bạn sẽ thấy annotation:
Client-scripts mới chạy ở chế độ strict, với truy cập DOM trực tiếp bị vô hiệu hóa. Truy cập jQuery, prototype và đối tượng
window cũng bị vô hiệu hóa. Để vô hiệu hóa trên cơ sở từng script, cấu hình form và thêm trường "Isolate script". Để
vô hiệu hóa tính năng này cho tất cả client-side scripts phạm vi toàn cục mới, thiết lập thuộc tính hệ thống "glide.script.block.client.globals"
thành false.
Client Scripts sử dụng trong module này không truy cập các đối tượng mô tả trong annotation. Bạn có thể bỏ qua
thông báo.
**3.** Cấu hình Client Script:
**1.** Name: NeedIt Request Type Options
Table: NeedIt [x_<mã_công_ty_của_bạn>_needit_needit]
UI Type: All
Type: onChange
Field name: Request type
Description: Chỉ hiển thị lựa chọn What needed khớp với giá trị Request type.
**4.** Thay thế nội dung trường Script bằng script này:
function onChange(control, oldValue, newValue, isLoading, isTemplate) {

```javascript
if ( newValue == '') {
```

var whatneeded = g_form.getValue('u_what_needed');

```javascript
// Clear all of the choices from the What needed field choice list
g_form.clearOptions('u_what_needed');
// If the value of the Request type field is hr, add
// two hr choices and other to the What needed field choice list
if(newValue == 'hr'){
g_form.addOption('u_what_needed','hr1','Human Resources 1');
g_form.addOption('u_what_needed','hr2','Human Resources 2');
g_form.addOption('u_what_needed','other','Other');
// If the value of the Request type field is facilities, add
// two facilities choices and other to the What needed field
// choice list
if(newValue == 'facilities'){
g_form.addOption('u_what_needed','facilities1','Facilities 1');
g_form.addOption('u_what_needed','facilities2','Facilities 2');
// If the value of the Request type field is legal, add
// two legal choices and other to the What needed field
if(newValue == 'legal'){
g_form.addOption('u_what_needed','legal1','Legal 1');
g_form.addOption('u_what_needed','legal2','Legal 2');
// If the form is loading and it is not a new record, set the u_what_needed value to the
// value from the record before it was loaded
if(isLoading && !g_form.isNewRecord()){
g_form.setValue('u_what_needed', whatneeded);
```

Kiểm thử NeedIt Request Type Options Client Script
**2.** Mở bản ghi bạn chọn để chỉnh sửa. Nếu bạn đã mở bản ghi NeedIt, tải lại form để
các thay đổi có hiệu lực.
**3.** Lưu ý giá trị trong trường Request type.
**4.** Nhấp vào trường What needed để mở danh sách lựa chọn. Các lựa chọn phải khớp với giá trị trong
trường Request type cộng thêm Other. Ví dụ:
**5.** Chọn lựa chọn khác trong trường Request type và xác nhận lựa chọn What needed cũng thay đổi.
Tạo NeedIt Set Requested for Client Script
**1.** Quay lại Studio và tạo Client Script.
**2.** Cấu hình Client Script:
**1.** Name: NeedIt Set Requested for
Type: onLoad
Description: Đặt Requested for thành người dùng đang đăng nhập cho bản ghi mới. Người dùng có thể
thay đổi giá trị trường
**3.** Thay thế nội dung trường Script bằng script này:
function onLoad() {

```javascript
//Check to see if the form is for a new record. If it is a new record,
//set the Requested for value to the currently logged in user.
if(g_form.isNewRecord()){
g_form.setValue('u_requested_for',g_user.userID);
```

**4.** Nhấp nút Submit.
Kiểm thử NeedIt Set Requested for Client Script
**1.** Trong cửa sổ trình duyệt ServiceNow chính (không phải Studio), dùng menu All để mở NeedIt > Create New.
**2.** Kiểm tra trường Requested for. Giá trị sẽ tự động được đặt thành System Administrator.
**3.** Thay đổi giá trị Requested for thành Beth Anglin.
**4.** Thêm giá trị bạn chọn vào các trường bắt buộc (được chỉ bằng dấu * trên form).
**6.** Từ danh sách bản ghi, mở bản ghi bạn vừa tạo.
**7.** Kiểm tra giá trị trường Requested for.

### BÀI VIẾT (13 TRÊN 21)

UI Policies
Giống Client Scripts, UI Policies là logic phía client quản lý hành vi form và trường form. Không giống Client
Scripts, UI Policies không phải lúc nào cũng yêu cầu viết script.
Tạo UI Policies
**2.** Chọn loại file, trong trường hợp này là UI Policy.
Cấu Hình UI Policy
UI Policies có hai views: Default và Advanced. Các trường trong cấu hình UI Policy khác nhau
tùy thuộc vào View được chọn. View Advanced hiển thị tất cả các trường cấu hình. View Default
hiển thị một tập con các trường.
Table: Form (bảng) mà UI Policy áp dụng.
Application: Xác định phạm vi của UI Policy.
Active: Kiểm soát UI Policy có được bật hay không.
Short description: Giải thích ngắn gọn UI Policy làm gì.
Order: Nếu nhiều UI Policies tồn tại cho cùng bảng, dùng trường Order để đặt thứ tự đánh giá của
các điều kiện UI Policy.
Condition: Điều kiện phải đáp ứng để kích hoạt logic UI Policy.
Global: Nếu Global được chọn, script áp dụng cho tất cả views của bảng. Nếu trường Global không được chọn,
bạn phải chỉ định view.
View: Chỉ định view mà script áp dụng. Trường View chỉ hiển thị khi Global
không được chọn. Script chỉ có thể tác động lên trường thuộc view form đã chọn. Nếu trường View để trống,
script áp dụng cho view Default.
On load: Khi được chọn, trường điều kiện UI Policy được đánh giá khi form tải ngoài khi
giá trị trường thay đổi. Khi không được chọn, Điều kiện UI Policy chỉ được đánh giá khi giá trị trường
thay đổi.
Reverse if false: Thực hiện hành động ngược lại khi trường Condition đánh giá false.
Inherit: Khi được chọn, thực thi script cho forms có bảng mở rộng từ bảng của UI Policy.
MẸO CHO DEVELOPER: Nhập giá trị mô tả trong trường Short description vì UI Policies không có trường Name. Khi
gỡ lỗi, nhận diện UI Policies bằng giá trị trường Short description.
Nếu trường Condition không có giá trị, điều kiện trả về true và logic UI Policy sẽ thực thi
mỗi lần có thay đổi giá trị trường trên form.
Trường Order đặt thứ tự đánh giá điều kiện UI Policy cho các UI Policies cùng bảng.
Thứ tự đánh giá từ số thấp nhất đến cao nhất (thứ tự tăng dần). Theo quy ước, giá trị trường Order
là số tròn hàng trăm: 100, 200, 300 v.v. Điều này không bắt buộc.
MẸO CHO DEVELOPER: Tránh đặt thứ tự UI Policies là 1, 2, 3, v.v. Để khoảng cách giữa giá trị trường Order để có thể
chèn UI Policy mới vào danh sách hiện có mà không cần sắp xếp lại UI Policies hiện có.

### BÀI VIẾT (14 TRÊN 21)

UI Policy Actions
UI Policy Actions là logic phía client trong UI Policy dùng để thiết lập ba thuộc tính trường:
Bắt buộc (Mandatory)
Hiển thị (Visible)
Chỉ đọc (Read only)
Mặc dù bạn có thể dùng scripts để thiết lập thuộc tính này sử dụng GlideForm (g_form) API, UI Policy Actions
KHÔNG yêu cầu viết script để thiết lập thuộc tính trường.
Tạo UI Policy Actions
**1.** Trong Studio, tạo UI Policy hoặc mở UI Policy hiện có để chỉnh sửa.
**2.** Cuộn xuống danh sách liên quan UI Policy Actions. Nếu tạo UI Policy mới, UI Policy phải được lưu trước khi
danh sách liên quan UI Policy Actions hiển thị.
**3.** Nhấp nút New.
**4.** Cấu hình UI Policy Action.
**1.** Chọn Field name.
**2.** Thiết lập giá trị trường Mandatory, Visible hoặc Read-only.
**3.** True: Áp dụng thuộc tính cho trường.
False: Không áp dụng thuộc tính cho trường.
Leave alone: Thuộc tính không áp dụng cho trường.
**5.** Để xóa giá trị hiện có khỏi trường, chọn tùy chọn Clear the field value.
**6.** Nhấp nút Submit.
Khi điều kiện UI Policy kiểm tra true, UI Policy Actions được áp dụng. Trong ví dụ, trường State là
Read only. Giá trị thuộc tính Mandatory và Visible không bị thay đổi bởi UI Policy Action.
Điều gì xảy ra khi điều kiện UI Policy kiểm tra false? Có hai kết quả có thể:
Không thực hiện hành động
Thực hiện hành động ngược lại
Làm thế nào ServiceNow biết phải làm gì? Quyết định được đưa ra bởi tùy chọn Reverse if false trong
trigger UI Policy.
Nếu Reverse if false được chọn (mặc định), hành động ngược lại được thực hiện trong UI Policy Actions. Nếu trường là
bắt buộc (true), trường sẽ không còn bắt buộc (false). Nghĩa là, thuộc tính true
thành false, và false thành true. Không có thay đổi cho thuộc tính được đặt Leave alone.
Nếu Reverse if false không được chọn, không có logic UI Policy Action nào được áp dụng.
Tạo UI Policy Related List Actions
Sử dụng UI Policy Related List Actions để hiển thị hoặc ẩn danh sách liên quan. Form Problem có nhiều danh sách liên quan:
Incidents
Affected CIs
Problem Tasks
Change Requests
Outages
Attached Knowledge
**2.** Cuộn xuống danh sách liên quan UI Policy Related List Actions. Nếu tạo UI Policy mới, UI Policy phải được
lưu trước khi danh sách liên quan UI Policy Related List Actions hiển thị.
**4.** Cấu hình UI Policy Related List Action.
**1.** Chọn List name.
**2.** Thiết lập giá trị trường Visible.
**3.** True: Áp dụng thuộc tính cho danh sách liên quan.
False: Không áp dụng thuộc tính cho danh sách liên quan.
Leave alone: Thuộc tính không áp dụng cho danh sách liên quan.
Danh sách liên quan Incidents bị ẩn:

### BÀI VIẾT (15 TRÊN 21)

UI Policy scripts sử dụng API phía client để thực thi logic script dựa trên điều kiện UI Policy kiểm tra
true hay false. Sử dụng UI Policy scripts để tạo kiểm tra điều kiện phức tạp hoặc thực hiện hành động khác ngoài thiết lập
thuộc tính trường (bắt buộc, chỉ đọc, hoặc hiển thị).
Các trường scripting cho UI Policies chỉ hiển thị trong view Advanced. Để bật các trường scripting, chọn
tùy chọn Run scripts.
Script Execute if true thực thi khi điều kiện UI Policy kiểm tra true.
Script Execute if false thực thi khi điều kiện UI Policy kiểm tra false.
Developers có thể viết scripts trong một hoặc cả hai trường script tùy theo yêu cầu ứng dụng.
Viết logic script bên trong hàm onCondition được tự động chèn vào các trường scripting. Hàm
onCondition() được gọi bởi UI Policy khi chạy.
QUAN TRỌNG: Tùy chọn Reverse if false phải được chọn để script Execute if false chạy.
Mặc dù UI Policy Actions thực thi trên tất cả nền tảng, UI Policy Scripts chỉ thực thi trên Desktop/tablet trong
trường hợp mặc định. Dùng trường Run scripts in UI type để chọn nền tảng cho UI Policy scripts.

### BÀI TẬP (16 TRÊN 21)

Bài tập: Tạo UI Policies
Trong bài tập này, bạn sẽ viết, kiểm thử và gỡ lỗi UI Policy.
Tạo UI Policy Action để làm trường Other hiển thị và bắt buộc
Viết script hướng dẫn người dùng nhập gì vào trường Other
Danh sách lựa chọn What needed có giá trị Other. Khi Other được chọn, người dùng nên cung cấp thêm thông tin
về những gì họ cần bằng cách giải thích yêu cầu trong trường mới gọi là Other.
**1.** Thêm trường vào bảng NeedIt.
**1.** Trong Studio, dùng Application Explorer để mở Forms & UI > Forms > NeedIt [Default view].
**2.** Trong Field Navigator, chọn tab Field Types.
**3.** Kéo loại trường String và thả vào form NeedIt giữa trường What needed và When
needed.
**4.** Di chuột qua trường New String và nhấp nút Edit Properties (
**5.** Cấu hình Field Properties cho trường mới:
**1.** Label: Other
Name: u_other
**6.** Đóng hộp thoại Properties bằng cách nhấp nút Close (
**2.** Nhấp nút Save.
Tạo UI Policy
**1.** Tạo UI Policy.
**2.** Trong trường Filter... nhập text UI Policy HOẶC chọn Client Development từ danh mục trong
**3.** Chọn UI Policy ở khung giữa làm loại file, sau đó nhấp nút Create.
**2.** Cấu hình UI Policy:
**1.** Table: NeedIt [x_<mã_công_ty_của_bạn>_needit_needit]
Active: Đã chọn (checked)
Short Description: NeedIt hiển thị hoặc ẩn trường Other
**3.** Chuyển sang phần When to Apply và tiếp tục cấu hình UI Policy:
**1.** Condition: [What needed] [is] [Other]
Global: Đã chọn (checked)
Reverse if false: Đã chọn (checked)
On load: Đã chọn (checked)
Inherit: Không chọn (not checked)
Tạo UI Policy Action
**1.** Trong UI Policy NeedIt show or hide Other field, cuộn xuống phần UI Policy Action.
**3.** Cấu hình UI Policy Action.
**1.** Field name: Other
Mandatory: True
Visible: True
Kiểm thử UI Policy và UI Policy Action
**1.** Trong cửa sổ trình duyệt ServiceNow chính (không phải Studio), dùng nút reload của trình duyệt để tải
logic phía client mới nhất vào trình duyệt.
**2.** Dùng menu All để mở NeedIt > Create New.
**3.** Đặt giá trị trường What needed thành Other.
**4.** Trường Other có xuất hiện không? Có bắt buộc không? Nếu không, gỡ lỗi và kiểm thử lại.
**5.** Thay đổi giá trị trường What needed thành bất cứ gì trừ Other.
**6.** Trường Other có biến mất không? Nếu không, gỡ lỗi và kiểm thử lại.
Tạo Script Execute if True của UI Policy
**1.** Quay lại tab Studio.
**2.** Nếu chưa mở, mở UI Policy NeedIt show or hide Other field để chỉnh sửa.
**3.** Nhìn header form để xem view có phải Advanced hay không. Nếu không, nhấp liên kết Related
Advanced view.
**4.** Chuyển sang phần Script (tab).
**5.** Chọn tùy chọn Run scripts (checked).
**6.** Đặt giá trị Run scripts in UI type thành All.
**7.** Thay thế nội dung trường script Execute if true bằng script này:
function onCondition() {

```javascript
// Display a message under the Other field to explain what to put in the
// Other field.
g_form.showFieldMsg('u_other','Briefly explain what you need.','info');
```

**8.** Nhấp nút Update.
Kiểm thử Script Execute if True
**2.** Đặt giá trị trường What needed thành Other.
**3.** Thông báo có xuất hiện dưới trường Other không? Nếu không, gỡ lỗi và kiểm thử lại.
**4.** Thay đổi giá trị trường What needed thành bất cứ gì trừ Other.
**5.** Thay đổi giá trị trường What needed trở lại Other.
Thử thách: Tạo Script Execute if False của UI Policy
Viết script trong trường Execute if false để xóa thông báo viết bởi script Execute if true. Sử dụng
phương thức GlideForm hideFieldMsg(). Mô tả phương thức hideFieldMsg() có sẵn trong tài liệu
API: GlideForm hideFieldMsg() documentation (https://developer.servicenow.com/app.do#!/api_doc?
v=utah&id=r_GlideFormHideFieldMsg_String_Boolean). Thêm comment trong script để giải thích script
làm gì.
Kiểm thử script để đảm bảo thông báo Briefly explain what you need. đã được xóa.

### BÀI VIẾT (17 TRÊN 21)

Client Scripts vs. UI Policies
Client Scripts và UI Policies đều thực thi logic phía client và sử dụng cùng API. Cả hai đều dùng để quản lý
forms và các trường. Khi phát triển ứng dụng, làm thế nào để quyết định loại script phía client nào
sử dụng? Dùng bảng này để xác định loại nào phù hợp nhất với nhu cầu ứng dụng:
Tiêu chí Client Script UI Policy
Thực thi khi form tải Có Có
Thực thi khi lưu/gửi/cập nhật form Có Không
Thực thi khi giá trị trường thay đổi Có Có
Truy cập giá trị cũ của trường Có Không
Thực thi sau Client Scripts Không Có
Thiết lập thuộc tính trường không cần script Không Có
Yêu cầu kiểm soát thứ tự thực thi *Có Có
*Mặc dù trường Order không có trên Client Script form baseline, bạn có thể tùy chỉnh form để thêm.
UI Policies thực thi sau Client Scripts. Nếu có logic xung đột giữa Client Script và UI Policy,
logic UI Policy được áp dụng.

### BÀI TẬP (18 TRÊN 21)

Bài tập: Lưu Công Việc Lập Trình Phía Client
(Tùy chọn)
Ứng dụng source control, như GitHub, cho phép developers commit thay đổi (lưu công việc hoàn thành) ngoài
Personal Developer Instance (PDI). Commit thay đổi cho ứng dụng để lưu công việc trong
source control.
Trong bài tập này, bạn sẽ lưu công việc hoàn thành trong module này vào repository GitHub.
để lưu công việc.
Commit Thay Đổi
**1.** Nếu ứng dụng NeedIt chưa mở trong Studio, hãy mở ngay.
**2.** Trong hộp thoại Select Application, nhấp ứng dụng.
**2.** Mở menu Source Control và chọn mục Commit Changes.
**3.** Chọn các cập nhật để commit.
**1.** Trong hộp thoại Select files to commit to source control cho <Application>, chọn All Update Sets.
**2.** Xem lại các file ứng dụng sẽ được commit.
**3.** Nhấp nút Continue.
**4.** Trong hộp thoại Confirm files to commit to source control cho NeedIt, nhập Commit comment, ví dụ
Client-side Scripting Module Completed.
**5.** Nhấp nút Commit Files.
**6.** Khi hộp thoại Commit Changes báo thành công, nhấp nút Close.
GHI CHÚ: Nếu commit thay đổi thất bại, có thể bạn đã nhập URL repository ServiceNow thay vì URL repository đã fork
trong trường URL. Xem Troubleshooting GitHub Issues (/dev.do#!/guide/utah/now-platform/github-guide/troubleshooting-
github-issues) trong Hướng dẫn GitHub để biết hướng dẫn khắc phục sự cố kết nối GitHub.

### BÀI VIẾT (19 TRÊN 21)

Kiểm Tra Kiến Thức Lập Trình Phía Client
Muốn xác minh sự hiểu biết của bạn về lập trình phía client? Những câu hỏi này sẽ giúp bạn đánh giá
tiến trình. Với mỗi câu hỏi, xác định câu trả lời rồi nhấp vào bất kỳ đâu trong câu hỏi để xem đáp án.

### BÀI VIẾT (20 TRÊN 21)

Tóm Tắt Module Lập Trình Phía Client
Khái Niệm Cốt Lõi:
Client-side scripts thực thi logic script trong trình duyệt web
Client-side scripts quản lý forms và trường form
Client Scripts thực thi logic script khi forms được:
Gửi/Lưu/Cập nhật
UI Policies có điều kiện là một phần của trigger
UI Policies có thể thực hiện hành động khác nhau khi điều kiện trả về true hoặc false
UI Policy Actions không yêu cầu viết script để thiết lập thuộc tính trường:
UI Policy Related List Actions không yêu cầu viết script để hiển thị hoặc ẩn danh sách liên quan
GlideForm API cung cấp phương thức để tương tác với forms và trường form
GlideUser API cung cấp phương thức và thuộc tính để truy cập thông tin về người dùng đang đăng nhập
và vai trò của họ

### BÀI VIẾT (21 TRÊN 21)

Sau Khi Hoàn Thành Lập Trình Phía Client, Bạn Có Thể
Quan Tâm Đến...
Chúc mừng bạn đã hoàn thành module Lập Trình Phía Client. Dựa trên sở thích về scripting, bạn có thể
cũng thích:
Server-Side Scripting (https://developer.servicenow.com/to.do?u=CSS-U-MOD-SSS): Trong module học tập
Developer Site này, bạn sẽ học viết, kiểm thử và gỡ lỗi server-side scripts sử dụng Now Platform
server-side scoped API.
Data Policies (https://developer.servicenow.com/to.do?u=CSS-U-MOD-DAP): Trong module học tập Developer
Site này, bạn sẽ học viết, kiểm thử và gỡ lỗi Data Policies.
Client-side Scripting Technical Best Practices (https://developer.servicenow.com/to.do?u=CSS-U-TBP-
ClientSideTBP): Trong Hướng dẫn Technical Best Practices của Developer Site này, bạn sẽ học các thực hành tốt nhất cho
lập trình phía client trên Now Platform.
Client-side Scripting Documentation (https://developer.servicenow.com/to.do?u=CSS-U-DOC-
ClientSideScripting): Trên trang tài liệu ServiceNow, bạn sẽ tìm thấy bộ tài liệu tham khảo đầy đủ cho
lập trình phía client.

---

## 2. Tạo Custom Widgets

Phiên bản: Zurich
NHÀ PHÁT TRIỂN ỨNG DỤNG SERVICENOW
Tạo Custom Widgets

### BÀI VIẾT (1 TRÊN 35)

Mục Tiêu Tạo Custom Widget
Trong module này bạn sẽ học:
Clone baseline widgets
Viết logic widget
HTML Template
Client Script
Server Script
Kiểm thử Widgets
Xem trước
Trang kiểm thử
JavaScript Console
Sử dụng Widget APIs
Sử dụng các đối tượng toàn cục của widget
data
input
options
Tạo và sử dụng directives
Định nghĩa và sử dụng widget options
Phản hồi thay đổi bản ghi xảy ra bên ngoài Service Portal
Bạn sẽ thực hành kỹ năng phát triển widget bằng cách tạo portal CreateNotes và hai widgets.
GHI CHÚ: This module assumes familiarity with the technologies that are part of AngularJS and with the ServiceNow client-side
và server-side APIs. Học viên nên:
có khả năng điều hướng trong Service Portal
có khả năng viết scripts sử dụng ServiceNow APIs cho cả client-side và server-side scripts
có khả năng đọc và viết HTML, CSS, và AngularJS
hiểu cách sử dụng Bootstrap
có khả năng sử dụng công cụ gỡ lỗi trên trình duyệt
Để biết thêm chi tiết về điều hướng trong Service Portal, xem Giới thiệu Service Portal
(https://developer.servicenow.com/dev.do#!/learn/courses/utah/app_store_learnv2_serviceportal_utah_service_portal/app_store_learnv2_servicepo
module.

### BÀI VIẾT (2 TRÊN 35)

Về Module Học Tập Này
QUAN TRỌNG: The content in this learning module was last updated for the San Diego ServiceNow release and was not
updated for the Utah release. You may see differences between the Utah release and the content in this learning module.
Ứng dụng Global, widget Hello World 1, và widget My Currency Widget được sử dụng xuyên suốt
module học tập này để giới thiệu và minh họa các khái niệm và quy trình tạo widget. Bạn không
xây dựng ứng dụng Global hay widget Hello World 1 và My Currency Widget.
Bạn sẽ phát triển ứng dụng và portal CreateNotes trong các bài tập thực hành.
Bài tập được chỉ ra theo ba cách:
Biểu tượng Bài tập trong khung Điều hướng.
Biểu tượng Bài tập và chữ Exercise ở đầu trang.
Chữ Exercise hoặc chữ Challenge trong tiêu đề trang.
Ứng dụng và portal CreateNotes cho phép người dùng tạo bản ghi note. Bạn sẽ sử dụng source control để
bắt đầu với tất cả file ứng dụng CreateNotes cần thiết cho module học tập này.

### BÀI VIẾT (3 TRÊN 35)

Widget Là Gì?
Widgets là các thành phần tái sử dụng tạo nên chức năng của trang portal. Widgets xác định những gì
portal thực hiện và thông tin người dùng nhìn thấy. ServiceNow cung cấp nhiều baseline widgets.
Ví dụ bao gồm:
Phê duyệt
Cơ sở kiến thức
Yêu cầu của tôi
Carousel
Nội dung catalog
Câu hỏi phổ biến
Tìm kiếm
Một số widget ví dụ:
Widgets là AngularJS directives. Khi trang được tải, một directive được tạo cho mỗi widget trên trang.
Widgets được liên kết chặt chẽ với mã JavaScript phía server được hỗ trợ bởi engine Rhino bên dưới
Now Platform.

### BÀI VIẾT (4 TRÊN 35)

Các Thành Phần Widget
Widgets bao gồm cả thành phần bắt buộc và tùy chọn.
HTML của widget nhận và hiển thị dữ liệu.
Render view động mà người dùng thấy trên trình duyệt sử dụng thông tin từ model và controller
Liên kết biến client script với markup
Thu thập dữ liệu từ đầu vào người dùng như text input, radio buttons, và check boxes
HTML là bắt buộc.
Client Script của widget định nghĩa AngularJS controller.
Service Portal ánh xạ dữ liệu server từ đối tượng JavaScript và JSON sang đối tượng client
Xử lý dữ liệu để render
Truyền dữ liệu đến HTML template
Truyền đầu vào người dùng và dữ liệu đến server để xử lý
Client Script là bắt buộc.
Server Script của widget làm việc với dữ liệu bản ghi, web services, và bất kỳ dữ liệu nào có sẵn trong ServiceNow
server-side scripts.
Thiết lập trạng thái ban đầu của widget
Gửi dữ liệu đến Client Script của widget sử dụng đối tượng data
Chạy các truy vấn phía server
Server Script là bắt buộc.
Link Function
Link Function sử dụng AngularJS để thao tác trực tiếp DOM.
Link Function là tùy chọn.
Option Schema
Option Schema cho phép Service Portal Admin (vai trò sp_admin) cấu hình widget.
Chỉ định tham số widget
Cho phép admin định nghĩa instance options cho một instance widget
Làm widgets linh hoạt và tái sử dụng
Option Schema là tùy chọn.
Angular Providers
Một Angular Provider:
Giữ widgets đồng bộ khi thay đổi bản ghi hoặc bộ lọc
Chia sẻ ngữ cảnh giữa các widgets
Duy trì và lưu trữ trạng thái
Tạo hành vi tái sử dụng và UI components rồi inject vào nhiều widgets
Angular Providers là tùy chọn.

### BÀI VIẾT (5 TRÊN 35)

Widget Editor
Widget Editor là ứng dụng để chỉnh sửa các thành phần widget.
Dùng menu All để mở Service Portal > Service Portal Configuration. Nhấp tile Widget Editor trên
trang Service Portal Configuration.
Dùng các check boxes Hiện/Ẩn thành phần widget để chọn thành phần widget nào cần xem và chỉnh sửa.
Text màu xanh, như tùy chọn Demo Data (JSON) trong ví dụ, chỉ ra có text trong thành phần
widget.
Text màu đen, như tùy chọn Server Script trong ví dụ, chỉ ra không có text trong

### BÀI VIẾT (6 TRÊN 35)

Clone Widgets
Khi tạo widgets, việc bắt đầu từ widget hiện có có thể tiết kiệm thời gian thay vì tạo widget từ
đầu. Để bảo vệ widgets hiện có khỏi sửa đổi vô tình, tất cả baseline widgets là chỉ đọc.
Quy trình tạo bản sao có thể chỉnh sửa của widget gọi là cloning.
Trong Widget Editor, chọn widget cần clone từ menu Edit an existing widget.
Thông báo read-only trong Widget Editor nghĩa là widget không thể chỉnh sửa.
Để clone widget, nhấp nút menu Widget Editor (
) trong header Widget Editor và chọn mục Clone "<Tên Widget>".
Nhập tên Widget. Trường Widget ID tự động được điền. Trường Widget ID có thể chỉnh sửa. Chỉ dùng
chữ thường, số, dấu gạch dưới và dấu gạch ngang.
Chọn tùy chọn Create test page để kiểm thử widget trên trang portal mà không cần thêm widget vào
trang portal thủ công. Trường Page ID tự động được điền dựa trên tên Widget. Page ID
có thể chỉnh sửa.
Dùng danh sách Widget để tải widget đã clone vào Widget Editor.

### BÀI VIẾT (7 TRÊN 35)

Xem Trước Widgets
Để kiểm thử hành vi widget mà không cần thêm thủ công vào trang Service Portal:
Dùng trang kiểm thử được tạo khi clone widget (tạo trang kiểm thử là tùy chọn)
Dùng tính năng Preview trong Widget Editor
Xem Trang Kiểm Thử
Để xem trang kiểm thử:
**1.** In the main ServiceNow browser window, use the All menu to open Service Portal > Pages.
**2.** To see a list of all test pages, search the Title column for the string test.
**3.** Open the record for the test page created when cloning the widget.
**4.** In the test page record, click the Try It button in the record header.
**5.** When prompted to select a portal, select the portal of your choice. The selected portal applies a header,
footer và chủ đề cho trang kiểm thử.
**6.** Test the widget behavior.
Lưu ý header trên trang kiểm thử. Màu header là phần của chủ đề portal. Chủ đề được áp dụng cho
trang khi portal được chọn để kiểm thử.
Bật Xem Trước
Tính năng Preview không được bật mặc định. Để bật Preview, nhấp nút menu Widget Editor (
) trong header Widget Editor và chọn check box mục Enable Preview.
Sau khi bật Preview, dùng nút Preview (
) để kiểm thử widget. Pane Preview widget mở trong Widget Editor.
MẸO CHO DEVELOPER: When developing a widget, it is convenient to use the Preview pane to quickly test the widget's behavior.
Luôn kiểm thử widget trên trang portal trước khi phát hành widget ra production.

### BÀI TẬP (8 TRÊN 35)

Bài Tập: Cơ Bản Widget Editor
Trong bài tập này, bạn sẽ thực hành sử dụng Widget Editor bằng cách clone, sửa đổi và xem trước baseline widget.
GHI CHÚ: If your PDI automatically opens App Engine Studio, you need to change the user role used to access the PDI. To
complete the exercises, switch to the Admin user role (https://developer.servicenow.com/dev.do#!/guides/utah/developer-program/pdi-
guide/managing-your-pdi#changing-your-instance-user-role).
Chuẩn Bị
Trong phần này của bài tập, bạn sẽ chuẩn bị clone widget trong phạm vi Global.
**1.** In the main ServiceNow browser window, examine the Application Scope icon (
) trên banner. Nếu có vòng tròn đỏ quanh biểu tượng, phạm vi không phải Global.
**2.** Click the Application Scope icon.
**3.** If the Application scope: is Global, skip to the next section of this exercise.
**4.** IF the Application scope is not Global, click the Application scope field.
**5.** In the Application scope flyout, select Global.
Clone Widget Hello World 1
**1.** In the main ServiceNow browser window, use the All menu to open Service Portal > Service Portal
Configuration.
**2.** Click the Widget Editor tile on the Service Portal Configuration page.
**3.** Use the Select a widget field in the Edit an existing widget option to open the Hello World 1 widget for
chỉnh sửa.
**4.** Examine the Widget Editor header and notice the Hello World 1 widget is read-only.
**5.** Clone the Hello World 1 widget.
**1.** Click the Widget Editor menu button (
) trong header Widget Editor và chọn mục Clone "Hello World 1".
**2.** Configure the clone:
**1.** Widget name: My Hello World 1
Widget ID: my_hello_world_1 (giá trị này tự động được điền)
Create test page: Đã chọn (checked)
Page ID: my_hello_world_1 (giá trị này tự động được điền)
**3.** Nhấp nút Submit.
**6.** Use the Widget field to select the My Hello World 1 widget.
Bật Xem Trước
**1.** Examine the Preview button in the Widget Editor header. If it looks like this, Preview is disabled:
**2.** To enable Preview, click the Widget Editor menu button (
**3.** Examine the Preview button again. It should be enabled:
**4.** Click the Preview button to open the Preview pane.
**5.** Test the widget by entering <your name> in the input box. Notice that the widget is updated with every
phím bạn gõ.
Sửa Đổi Widget CSS
**1.** If it is not already selected, select the CSS - SCSS component in the Widget Editor header.
**2.** Examine the CSS - SCSS pane and note the color for h1.
**3.** Change the color to #8bdb2e.
**4.** Nhấp nút Save.
**5.** Examine the Preview pane again. Notice the text color changed in the widget.
**6.** Change the h1 color a second time. Specify a color you like.

### BÀI VIẾT (9 TRÊN 35)

Đối Tượng và Hàm Toàn Cục của Widget
Các thành phần widget bao gồm:
Khi widget được khởi tạo, các đối tượng toàn cục được tạo.
Đối Tượng Toàn Cục Server Script
Các đối tượng toàn cục Server Script là:
Tên Đối Tượng Mô Tả
data Đối tượng chứa JSON object để gửi đến Client Script.
input Đối tượng dữ liệu nhận từ controller của Client Script.
options Các tùy chọn dùng để gọi widget trên server.
Khi instance widget được khởi tạo, đối tượng data và input được khởi tạo.
Server script điền dữ liệu vào đối tượng data.
Sau khi Server Script thực thi, đối tượng data được JSON serialize và gửi đến client controller.
Dùng đối tượng options để xem giá trị nào được dùng để gọi widget.
Đối Tượng Toàn Cục Client Script
Các đối tượng toàn cục Client Script là:
data Đối tượng data đã serialize từ Server Script.
Khi controller được tạo, đối tượng data client được điền bởi JSON object đã serialize gửi từ
server (bản sao của đối tượng data server)
Đối tượng options là chỉ đọc.
Hàm Toàn Cục Client Script
Tất cả hàm toàn cục Client Script trả về JavaScript promise. Các hàm toàn cục Client Script là:
Tên Hàm Mô Tả

```javascript
this.server.get() Calls the Server Script and passes custom input.
this.server.update() Calls the server and posts this.data to the Server Script.
this.server.refresh() Calls the server and automatically replaces the current options and data from the server response.
```

ServiceNow Client Scripting APIs
Ngoài Widget API, Service Portal hỗ trợ một số ServiceNow client-side APIs và phương thức
(https://docs.servicenow.com/bundle/utah-servicenow-platform/page/build/service-portal/reference/widget-api-
reference.html).

### BÀI TẬP (10 TRÊN 35)

Bài Tập: Scripts Widget My Hello World
Trong bài tập này, bạn sẽ kiểm tra và chỉnh sửa Client và Server Scripts cho widget My Hello World 1. Bạn
sẽ ghi log các thuộc tính của đối tượng data để hiểu cách HTML template, Client Script và Server
Script hoạt động khi đối tượng data được cập nhật.
**1.** If not still open in Widget Editor, open the My Hello World 1 widget for editing.
**3.** Use the Select a widget field in the Edit an existing widget option to open the My Hello World 1
widget để chỉnh sửa.
**2.** Click the Preview button (
) để nhắc bạn về hành vi widget.
**1.** Notice the placeholder text in the Enter your name field.
**2.** Type a new value in the Enter your name field. Do you have to press the <enter>/<return> key for
text widget cập nhật khi bạn gõ trong trường không?
**3.** Delete the text in the Enter your name field. Does the placeholder text reappear?
Server Script My Hello World 1
**1.** If not already visible in Widget Editor, open the Server Script pane.
**2.** Is there a Server Script?
Client Script My Hello World 1
**1.** If not already visible in Widget Editor, open the Client Script pane.
**2.** Add the property variable to the Client Script. The new script statement is in bold.
**3.** Copy the for loop script and paste it into the Client Script at the location shown.

```javascript
for(property in c.data){
console.log('c.data.' + property + ": " + c.data[property]);
}
```

MẸO CHO DEVELOPER: To automatically apply indentation to code, click and drag to highlight the code, then press <Shift> +

```javascript
<tab> on the keyboard.
```

**5.** In Widget Editor, open the HTML Template pane.
**6.** Examine the HTML to make sure you understand how the HTML works.
Giá trị c.data.sometext được cập nhật khi người dùng gõ trong trường text input.
Khi giá trị trong trường input thay đổi, hàm c.display trong Client Script được gọi.
Client Script cập nhật giá trị c.data.message được hiển thị trong phần <h1> của HTML
Template.
Kiểm Thử Widget My Hello World 1
**1.** Enable the Developer/JavaScript console in your browser using whatever strategy is appropriate for your
trình duyệt của bạn. Ví dụ, trong một số phiên bản Chrome, mở View > Developer > JavaScript Console.
**2.** Disable the Preview pane in Widget Editor then re-enable it to force the widget to reload.
**3.** Examine the console. You should see two log messages for properties on the c.data object.
**4.** Type <your name> in the input box in the Preview pane. Watch the console to see the c.data object
c.data cập nhật theo thời gian thực.
**5.** Open the My Hello World 1 test page.
**2.** Open the my_hello_world_1 page for editing.
**3.** Click the Try It button.
**4.** Select the /sp/?id=my_hello_world_1 portal.
**6.** Enable the Developer/JavaScript console for the test page browser tab.
**7.** Reload the test page.
**8.** Examine the console and locate c.data.message. Does the message property have a value?
**9.** Type a value in input box. Watch the console as you type to see the values of c.data.message and

```javascript
c.data.sometext.
```

Thử Thách
Thử thách của bạn là sửa đổi logic widget để đặt giá trị ban đầu data.sometext trong Server Script.
Kiểm thử trường hợp cả Server Script VÀ Demo Data đặt giá trị data.sometext để bạn
có thể xác định cái nào được ưu tiên.
Giá trị ban đầu demo.sometext có giống nhau trong pane Preview và trang kiểm thử không?

### BÀI TẬP (11 TRÊN 35)

Bài tập: Fork Repository và Import Ứng dụng
cho Module Tạo Custom Widgets
ServiceNow uses GitHub to provide application repositories to copy and use with the Developer Site learning
content. The repositories contain tags, which are fixed sets of application files, to start you with a partially built
application. By copying and importing a ServiceNow-provided repository into your Personal Developer
Instance (PDI), you get all the files needed for the hands-on exercises in the modules.
GHI CHÚ: See the GitHub Guide (/dev.do#!/guide/utah/now-platform/github-guide/github-and-the-developer-site-training-guide-introduction)
for more information on how ServiceNow uses GitHub with the Developer Program learning content and to see a video on how
to fork a repository and import an application.
Trong bài tập này, bạn sẽ:
**1.** Fork the ServiceNow repository to your GitHub account.
**2.** Import the application into your PDI from your fork of the repository.
QUAN TRỌNG: If you have already forked and imported the repository, you can proceed to the next exercise, where you will
create a branch from a tag to load the application files to your PDI. The CreateNotes application files are needed to complete
the module.
Fork Repository
Trong phần này của bài tập, bạn sẽ tạo một bản fork cá nhân của repository ứng dụng để sử dụng với
nội dung học tập của Developer Site.
**1.** Trong trình duyệt web, mở github.com (https://github.com/).
**2.** Nếu bạn có tài khoản GitHub, đăng nhập. Nếu không, đăng ký tài khoản mới.
**3.** Once signed in, open the CreateNotes repository (https://github.com/ServiceNow/devtraining-createnotes-
utah).
**4.** Nhấp nút Fork (
) để tạo bản sao repository trong tài khoản GitHub của bạn.
**5.** Trên trang Create a new fork, bỏ chọn tùy chọn Copy the main branch only.
**6.** Chọn tài khoản GitHub cá nhân làm Owner cho fork, sau đó nhấp nút Create fork.
**7.** Xác minh URL cho bản fork repository tương tự: <YourGitHubUsername>/devtraining-
application-release.
**8.** Sao chép URL của repository đã fork.
**1.** Nhấp nút Code.
**2.** Đảm bảo URL chứa tên GitHub của bạn, không phải ServiceNow.
**3.** Đảm bảo HTTPS đã được chọn. Nếu không, chọn tab HTTPS trong flyout Clone.
**4.** Nhấp nút Copy to clipboard (
).
GHI CHÚ: You will use the copied URL to configure the connection to your forked repository in the next section.
Import Ứng dụng từ Repository Đã Fork
Trong phần này của bài tập, bạn sẽ import repository ứng dụng vào ServiceNow. Như một phần của
quy trình, trước tiên bạn sẽ tạo bản ghi Credential cho tài khoản GitHub, sau đó sử dụng Studio để import
repository ứng dụng vào PDI của bạn.
**1.** Đăng nhập vào PDI với tư cách admin. Nếu bạn chưa có PDI, mở ServiceNow Developer Site
(https://developer.servicenow.com) để lấy Utah PDI.
GHI CHÚ: See the Personal Developer Instance (PDI) Guide (/dev.do#!/guide/utah/now-platform/pdi-guide/personal-developer-
instance-guide-introduction) for instructions on how to obtain a PDI.
**2.** Tạo bản ghi Credential cho kết nối GitHub.
QUAN TRỌNG: Credential records only need to be created once. If you have already created a credential record in
bài tập khác, vui lòng bỏ qua bước này.
**1.** Use the All menu to open Connections & Credentials > Credential.
**2.** Nhấp nút New.
**3.** Trong danh sách What type of Credentials would you like to create?, nhấp liên kết Basic Auth Credentials.
**4.** Cấu hình bản ghi Credential.
**1.** Name: GitHub Credentials - <Tên GitHub của bạn>
User name: <Tên GitHub của bạn>
Password: <Personal access token GitHub của bạn>
QUAN TRỌNG: GitHub requires personal access tokens to access repositories from other platforms, like
ServiceNow. A personal access token is used in place of a password when authenticating. See the
Authenticating to GitHub (/dev.do#!/guides/utah/developer-program/github-guide/using-servicenow-provided-application-
repositories#authenticating-to-github) section of the GitHub Guide for instructions on how to create a GitHub personal
access token.
**5.** Nhấp nút Submit.
**3.** Sử dụng menu All để mở System Applications > Studio.
**4.** Studio mở trong tab trình duyệt mới.
**5.** Trong hộp thoại Select Application, nhấp nút Import From Source Control.
**6.** Trong hộp thoại Import Application, cấu hình kết nối tới repository đã fork.
**1.** URL: <URL bạn đã sao chép cho bản fork repository>
Credential: GitHub Credentials - <Tên GitHub của bạn>
Branch: main
GHI CHÚ: When you change the Branch value to main, an information message informs you that Use of the default naming
convention is strongly encouraged. The value in the Branch field must exist in the repository. The Developer Site training
repositories all have a main branch, which should be used in place of the default value.
**7.** Nhấp nút Import.
**8.** Khi import ứng dụng hoàn tất, nhấp nút Select Application.
GHI CHÚ: If the connection fails, you may have entered the ServiceNow repository URL in the URL field instead of the
forked repository URL, or you may have enabled two-factor authentication on your GitHub account. See Troubleshooting
GitHub Issues (/dev.do#!/guide/utah/now-platform/github-guide/troubleshooting-github-issues) for instructions on how to
khắc phục sự cố kết nối.
**9.** Trong hộp thoại Select Application, nhấp ứng dụng để mở chỉnh sửa trong Studio.
QUAN TRỌNG: You will not see any application files in Studio until you successfully create a branch from a tag in the next
bài tập tiếp theo.

### BÀI TẬP (12 TRÊN 35)

Exercise: Create a Branch for Creating Custom
Widgets
In this exercise, you will create a branch of the CreateNotes application for the Creating Custom Widgets
module that includes the application files used in the module.
GHI CHÚ: Before you begin this exercise, you need to have forked and imported the CreateNotes repository as described in
Exercise: Fork Repository and Import Application for the Creating Custom Widgets Module.
**1.** If the CreateNotes application is not already open from the previous exercise, open it now.
**1.** Trong cửa sổ trình duyệt ServiceNow chính, sử dụng menu All để mở System Applications > Studio.
**2.** In the Select Application dialog, click the CreateNotes application.
**2.** Trong Studio, mở menu Source Control và chọn mục Create Branch.
**3.** Cấu hình branch.
**1.** Branch Name: CreateWidgetsModule
Create from Tag: LoadForCreateWidgetsModule
**4.** Nhấp nút Create Branch.
**5.** Nhấp nút Close.
**6.** Để tải các file ứng dụng trong tag, quay lại tab trình duyệt ServiceNow chính (không phải Studio)
và nhấp nút reload của trình duyệt để làm mới trang.
GHI CHÚ: If branch creation fails, you may have entered the ServiceNow repository URL in the URL field instead of the
forked repository URL, or you may have enabled two-factor authentication on your GitHub account. See the
Troubleshooting GitHub Issues (/dev.do#!/guide/utah/now-platform/github-guide/troubleshooting-github-issues) section of the
GitHub Guide for instructions on how to troubleshoot GitHub connection issues.

### BÀI VIẾT (13 TRÊN 35)

Studio và Service Portal
Cho ứng dụng scoped, dùng Studio để tạo file ứng dụng cho Service Portal:
Service Portal
Service Portal Page
Widget
Chủ đề
Style Sheet
JS Include
Widget Dependency
Quy trình thêm file vào ứng dụng trong Studio không đổi bất kể loại file ứng dụng:
**1.** Click the Create Application File button.
**2.** Choose the file type, such as Widget OR click the Service Portal category, then click a file type.
**3.** Configure the new file.
Tùy loại file, tab mới có thể mở trong Studio hoặc cửa sổ trình duyệt mới có thể mở.

### BÀI TẬP (14 TRÊN 35)

Bài tập: Khám Phá Ứng Dụng CreateNotes
Trong bài tập này, bạn sẽ khám phá ứng dụng CreateNotes bạn đã import từ source control. Bạn sẽ tạo
bốn bản ghi Notes.
**1.** If the CreateNotes application is not still open in Studio, open it now.
**2.** In the Select Application dialog, click CreateNotes.
**2.** If the CreateWidgetsModule branch is not open, use the Source Control > Switch Branch menu item to
chuyển sang branch CreateWidgetsModule.
**3.** Examine the Studio status bar to make sure the CreateWidgetsModule branch is loaded (bottom of the
màn hình, phía bên phải).
Khám Phá Các File Ứng Dụng CreateNotes
**1.** In Studio, use the Application Explorer to open Data Model > Tables > Note.
**2.** Examine the Note table's columns and notice the field data types. In particular, look for:
Số
Người dùng
Tiêu đề
Ghi chú
**3.** Use the Application Explorer to open Forms & UI > Forms > Note [Default view] to see the form layout.
**4.** Use the Application Explorer to open Forms & UI > List Layouts > Note [Default view] to see the
các cột trong layout danh sách.
**5.** In the Navigation category in the Application Explorer, locate the CreateNotes application menu:
Navigation > Application Menus > CreateNotes. Cũng tìm module Notes: Navigation > Modules
> Notes.
Tạo Bản Ghi CreateNotes
**1.** Switch to the main ServiceNow browser window, not Studio. Reload the page, then use the All menu to
mở CreateNotes > Notes.
**3.** Configure the record fields:
**1.** Number: (this value is automatically set)
User: System Administrator
Title: Note 1
Note: note 1
**4.** Click the Submit button.
**5.** Create two more Notes records. Set the User field value to System Administrator for both records. Use
giá trị bạn chọn cho các trường còn lại.
**6.** Create one more Notes record. Set the User field value to Beth Anglin. Use the values of your choice for
các trường còn lại.
Khám Phá Service Portal CreateNotes
**1.** In Studio, examine the Service Portal category in the Application Explorer. Notice a Service Portal and a
Service Portal Page đã được tạo.
**2.** In the Application Explorer, open Service Portal > Service Portals > CreateNotes. Page Editor opens
trong cửa sổ trình duyệt mới.
**3.** If not already selected, select CreateNotes from the Portal list.
**4.** If not already selected, click the CreateNotes node in the tree.
**5.** Notice the values in these fields:
Trang chủ
Logo
Hậu tố URL
**6.** Close the Page Editor window and return to Studio.
Khám Phá Trang Service Portal CreateNotes Home
**1.** In Studio, use the Application Explorer to open Service Portal > Service Portal Pages > CreateNotes
Home. Page Editor mở trong cửa sổ trình duyệt mới.
**2.** Click the notes_home box in the tree.
**3.** Examine the value in the ID field. Was this value referenced in the portal definition?
**4.** Close the Page Editor window and return to Studio.

### BÀI TẬP (15 TRÊN 35)

Bài tập: Tạo Hai Widgets
Trong bài tập này, bạn sẽ tạo hai widgets rồi thêm widgets vào trang portal Home của ứng dụng
CreateNotes.
Tạo Widget Notes List
**1.** If the CreateNotes application is not open in Studio from the last exercise, open it now.
**1.** In the main ServiceNow browser window use the All menu to open System Applications > Studio.
**2.** Create a widget.
**1.** In Studio, click the Create Application File button.
**2.** In the Filter... field enter the text widget OR select Service Portal from the categories in the left
bên trái.
**3.** Select Widget in the middle pane as the file type, then click the Create button. Widget Editor opens
trong cửa sổ mới.
**3.** Click the Create a new widget link.
**4.** Configure the widget:
**1.** Widget Name: Notes List
Widget ID: notes_list (giá trị này tự động được điền)
Create test page: Không chọn (unchecked)
**6.** If the HTML Template pane is not visible, select HTML Template in the Widget Editor header.
**7.** Replace the contents of the HTML Template pane with this HTML:

```javascript
<div class="panel panel-default">
<div class="panel-heading clearfix">
<h3 class="panel-title pull-left">
```

${Notes}

```javascript
</h3>
</div>
<div class="panel-body">
<p>
```

Widget danh sách Notes

```javascript
</p>
```

**8.** Nhấp nút Save.
**9.** Preview the Notes List widget using the Preview pane in Widget Editor. If Preview is not enabled, enable
sử dụng cùng quy trình như trong các bài tập trước.
Tạo Widget Notes Body
**1.** Create a widget in Widget Editor by clicking the Widget Editor menu and selecting the Create New
Widget.
**2.** Configure the widget:
**1.** Widget Name: Notes Body
Widget ID: notes_body (giá trị này tự động được điền)
**4.** Do not add any logic to the Notes Body widget.
**5.** Click the Save button, then close Widget Editor.
Thêm Widgets Mới vào Trang Service Portal CreateNotes Home
**1.** Return to Studio and examine the Service Portal > Widgets category in the Application Explorer. Look
hai widgets mới. Bạn có thể cần tải lại Studio để thấy Widgets trong Application Explorer.
**2.** In the Application Explorer, open Service Portal > Service Portal Pages > CreateNotes Home.
**3.** Click the Edit CreateNotes Home (notes_home) page in Designer link.
**4.** In Designer, use the Filter Widget field to locate the Notes List and Notes Body widgets.
**5.** Add the Notes widgets to the container.
**6.** Drag the Notes List widget to the container column on the left.
**7.** Drag the Notes Body widget to the container column on the right.
Kiểm Thử Trang Service Portal CreateNotes Home
**1.** Examine the Designer header to determine the active portal. If the CreateNotes portal is the active
hoạt động, bạn sẽ thấy notes trong header:
**2.** If the CreateNotes portal is not the active portal, make it the active portal.
**1.** Click the active portal name in Designer.
**2.** When prompted to select a portal, select the CreateNotes tile.
**3.** Preview the CreateNotes Home portal page by switching to the Preview tab in Designer.
**4.** Notice the logo and header.
**5.** Click the Edit tab to return to editing the portal widgets.

### BÀI VIẾT (16 TRÊN 35)

Widget API
Service Portal có API gọi là Widget API. Widget API chứa các class cho cả client-side và
server-side scripting.
API Phía Client
Các class Widget API phía client là:
spUtil (https://developer.servicenow.com/app.do#!/api_doc?v=utah&id=spUtilAPI): Contains utility methods to
perform common functions in a Service Portal widget client script. Access the methods from this class
using spUtil. For example, spUtil.addErrorMessage().
addErrorMessage(): display an error message
addInfoMessage(): display an informational message
addTrivialMessage(): display a message which automatically disappears after a short period of
time
createUid(): create a unique ID
format(): used to build strings from variables (alternative to concatenation)
get(): gets a widget model by ID or sys_id
getHost(): gets complete host domain
getHeaders(): retrieves all headers to be used for API calls
getPreference(): executes callback with user preference response
getURL(): gets current service portal URL
isMobile(): returns true if current client is a mobile device
parseAttributes(): returns the attributes for a field in csv format
recordWatch(): watches for updates to a table or filter and returns the value from a callback function
scrollTo(): scrolls to element with specified selector, over specified period of time.
setBreadCrumb(): updates the header breadcrumbs
setPreference(): sets a user preference
setSearchPage(): sets the search page
refresh(): calls the server and replaces the current options and data objects with the server
response
update(): updates the data object on the server within a given scope
spModal (https://developer.servicenow.com/app.do#!/api_doc?v=utah&id=SPModal-API): Methods provide an
alternative way to show alerts, prompts, and confirmation dialogs. Access the methods from this class
using spModal. For example, spModal.alert().

```javascript
alert(): displays an alert
```

confirm(): displays a confirmation message
open(): opens a modal using the specified options
prompt(): displays a prompt for user input
spAriaUtil (https://developer.servicenow.com/app.do#!/api_doc?v=utah&id=spAriaUtil-API): Uses an AngularJS
service to show messages on a screen reader. Access the method from this class using spAriaUtil. For
example, spAriaUtil.sendLiveMessage().
sendLiveMessage(): announce a message to a screen reader
spContextManager (https://developer.servicenow.com/dev.do#!/reference/api/utah/client/spContextManagerAPI):
Makes data from a Service Portal widget available to other applications and services in a Service Portal
page. For example, pass widget data to Agent Chat when it opens in a Service Portal page. Access the
methods from this class using spContextManager. For example, spContextManager.getContext().
addContext(): initializes a key and adds widget data as the value
getContext(): returns each key and associated data object defined by any widget on a page
getContextForKey(): returns the widget data associated with a key
updateContextForKey(): sends data to an existing key
Để xem tài liệu API đầy đủ, bao gồm tham số phương thức và giá trị trả về, theo các liên kết đến
các class API.
API Phía Server
Các class Widget API phía server bao gồm:
GlideSPScriptable (https://developer.servicenow.com/dev.do#!/reference/api/utah/server/no-
namespace/c_GlideSPScriptableScopedAPI): Methods for use in Service Portal widget Server Scripts.
Access the GlideSPScriptable methods using the global $sp object. For example, $sp.canRead().
canReadRecord(): returns true if the user can read the specified GlideRecord
canSeePage(): returns true if the user can view the specified page
getCatalogItem(): returns a model and view model for a sc_cat_item or sc_cat_item_guide
getDisplayValue(): returns the display value of the specified field from either the widget's
sp_instance or sp_portal record
getField(): returns information about the specified field in a GlideRecord
getFields(): checks the specified list of field names, and returns an array of valid field names
getFieldsObject(): checks the specified list of field names and returns an object of valid field names
getForm(): returns the form
getKBCategoryArticles(): returns Knowledge Base articles in the specified category and its
subcategories
getKBCount(): returns the number of articles in the specified Knowledge Base
getListColumns(): returns a list of the specified table's columns in the specified view
getMenuHREF(): returns the ?id= portion of the URL based on the sp_menu type
getMenuItems(): returns an array of menu items for the specified instance
getParameter(): returns the value of the specified parameter
getPortalRecord(): returns the portal's GlideRecord
getRecord(): returns the current portal context
getRecordDisplayValues(): copies display values for the specified fields into the data parameter
getRecordElements(): for the specified fields, copies the element's name, display value, and value
into the data parameter
getRecordValues(): copies values for the specified field names from the GlideRecord into the data
parameter
getRecordVariables(): returns Service Catalog variables associated with a record
getRecordVariablesArray(): returns an array of Service Catalog variables associated with a record
getStream(): gets the activity stream for the specified record. This method works on tables which
extend the Task table
getUserInitials(): returns the user's initials
getValue(): returns the named value of the JSON request, instance, or portal
getValues(): copies values from the request or instance to the data parameter
getWidget(): gets a widget by id or sys_id, executes that widget's server script using the provided
options, then returns the widget model
mapUrlToSPUrl(): transforms a URL requesting a list or form in the platform UI into the URL of the
corresponding id=list or id=form Service Portal page
For the complete API documentation, including additional classes, method arguments and return values,
follow the links to the API class or go to the Widget API page on the ServiceNow docs site

### BÀI VIẾT (17 TRÊN 35)

Gỡ Lỗi Widgets
Trong module này bạn đã sử dụng phương thức console.log() để xem thông tin gỡ lỗi cho widget.

```javascript
for(var property in c.data){
```

Thay vì thêm console.log() hoặc alert() vào scripts, dùng Log to console: $scope.data hoặc Log to
console: $scope Widget Context menu items để ghi thuộc tính và giá trị đối tượng vào console. Để truy cập
menu ˆ, <ctrl> + <nhấp chuột phải> widget trong pane Preview hoặc trang portal.
Công Cụ Gỡ Lỗi Bên Thứ Ba
Nhiều developer sử dụng công cụ gỡ lỗi bên thứ ba khi gỡ lỗi ứng dụng trên trình duyệt. Ví dụ,
ng-inspector Chrome extension (https://chrome.google.com/webstore/detail/ng-inspector-for-
angularj/aadgmnobpdmgmigaicncghmmoeflnamj?hl=en)
Gỡ Lỗi Phía Client
Widget API phía client bao gồm các phương thức có thể dùng cho logging/debugging:

```javascript
spUtil.addErrorMessage()
spUtil.addInfoMessage()
spUtil.addTrivialMessage()
spModal.alert()
```

Xuất đối tượng ra trang portal bằng cách sửa đổi HTML Template:
Công cụ trình duyệt để gỡ lỗi:
Gỡ Lỗi Phía Server
The server-side GlideSystem (https://developer.servicenow.com/app.do#!/api_doc?
v=utah&id=c_GlideSystemScopedAPI) class includes methods that can be used for logging/debugging:
Global API

```javascript
gs.log()
gs.logError()
gs.logWarning()
```

Scoped API

```javascript
gs.warn()
gs.info()
gs.debug()
gs.error()
```

Global API và Scoped API

```javascript
gs.addInfoMessage()
gs.addErrorMessage()
```


### BÀI TẬP (18 TRÊN 35)

Bài tập: Điền Dữ Liệu Widget Notes List
Trong bài tập này, bạn sẽ điền dữ liệu widget Notes List với các bản ghi Note thuộc về người dùng đang
đăng nhập. Bạn sẽ hiển thị tiêu đề Note và 20 ký tự đầu tiên của mô tả.
**1.** Open the Notes List widget in Widget Editor .
**1.** If not still open, open the CreateNotes application in Studio for editing.
**2.** Use the Application Explorer to open Service Portal > Widgets > Notes List.
**2.** Use the developer site API documentation to learn about the getRecordDisplayValues() method in the
scoped GlideSPScriptable (https://developer.servicenow.com/app.do#!/api_doc?
v=utah&id=c_GlideSPScriptableScopedAPI) API.
Viết Server Script
**1.** If the Server Script pane is not open in Widget Editor, enable it by selecting Server Script in the Widget
Editor header.
**2.** Examine the pseudo-code for the script you will write:
**1.** Create the notes property on the data object which will contain an array of objects
Query the database to find all Note table records for the currently logged in user
Sort the records by descending order based on the sys_created_on date field value
For each of the Note records returned
Create an empty object, noteObj
Get the display values for the number, title, and sys_id fields and put those values into the noteObj
object
Get the first 20 characters of the description field and add that value to the noteObj object
Push the noteObj into the notes array
**3.** Replace the contents of the Server Script pane with this script:
(function() {

```javascript
//create an array to populate with notes
data.notes = [];
```

var noteGR = new GlideRecord('x_snc_createnotes_note');

```javascript
noteGR.addQuery('user', gs.getUser().getID());
noteGR.orderByDesc('sys_created_on');
noteGR.query();
while (noteGR.next()) {
```

var noteObj = {};

```javascript
//use service portal helper method to get some display values
```

$sp.getRecordDisplayValues(noteObj, noteGR, 'number,title,sys_id');

```javascript
//get the first 20 characters of the description
noteObj.note = noteGR.getValue('note').slice(0,20);
//push the populated obj into the array
data.notes.push(noteObj);
})();
```

**4.** Apply formatting to the script.
**1.** Highlight the contents of the Server Script pane.
**2.** Press <Shift> + <tab> on your keyboard.
**5.** Read through the script and compare it against the psudeo-code to make sure you understand what the
script does.
**6.** Nhấp nút Save.
Xem Trước Widget Notes List
**1.** Click the Preview button in Widget Editor.
**2.** Notice the Notes widget appearance is unchanged.
**3.** In the Preview pane, <ctrl> + click on the Notes List widget (on some operating systems <ctrl> + right-
click) and select the Log to console: $scope.data menu item.
**4.** Using the appropriate strategy for your browser, open the JavaScript console.
**5.** Look for the notes array of objects in $scope.data. The example was captured in Chrome. The
appearance of your console window may be different depending on which browser you are using.
**6.** Close the Preview pane.
Cập Nhật HTML Template để Hiển Thị Danh Sách Bản Ghi Note
**1.** If the HTML Template pane is not open in Widget Editor, enable it by clicking HTML Template in the
Widget Editor header.
**2.** Replace the contents of the HTML Template pane with this logic:

```javascript
<div class="list-group">
<a class="list-group-item" ng-repeat="note in data.notes">
<h4 class="list-group-item-heading">
```

{{note.title}}

```javascript
</h4>
<p class="list-group-item-text">
```

{{note.note}}

```javascript
</a>
```

**3.** Apply formatting to the HTML Template.
**1.** Highlight the contents of the HTML Template pane.
**4.** In the HTML, notice the use of ng-repeat to iterate through the objects in the data.notes array.
**5.** Click the Save button.
Xem Trước Widget Notes List Lần Nữa
**2.** The Notes records returned by Server Script's GlideRecord query should be displayed in the Notes List
widget. Only the title and the first 20 characters of the description are displayed. Your records may be
different than the example.
**3.** Close the Preview pane.

### BÀI VIẾT (19 TRÊN 35)

Sử Dụng AngularJS Events với Widgets
AngularJS uses a publish and subscribe strategy for handling events. Events are useful for notifying widgets
about important things happening in other widgets. For example:
Bản ghi được chọn
Giá trị thay đổi
Dữ liệu bị xóa
Dữ liệu được thêm
Và nhiều hơn...
Work with events in AngularJS using these functions:
$emit() (https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$emit): Send an event up the scope hierarchy
$on() (https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$on): Listen for events of a given type
MẸO CHO DEVELOPER: Avoid the use of $rootScope.$broadcast() (https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$broadcast)
because it can cause performance issues.
Widget Client Scripts create the widget's controller, c.
When working with multiple widgets on a page, widget controllers are siblings; they do not have a parent-child
relationship. To emit and listen for events, use the parent of all scopes, $rootScope.
Widgets Nhúng
Although not covered in this module, it is possible to embed a widget (https://docs.servicenow.com/bundle/utah-
servicenow-platform/page/build/service-portal/concept/c_NestedWidgets.html) in another widget. When widgets are
embedded, a parent-child relationship does exist.

### BÀI TẬP (20 TRÊN 35)

Bài Tập: Phát và Phản Hồi Sự Kiện
Trong bài tập này, bạn sẽ phát sự kiện từ widget Notes List đến widget Notes Body khi người dùng
chọn bản ghi. Widget Notes Body sẽ phản hồi sự kiện bằng cách hiển thị thông tin bản ghi.
Chỉnh Sửa HTML Template Notes List để Phản Hồi Nhấp Chuột
**1.** In the HTML Template, locate this line:
**2.** Edit the line by adding an ng-click for when a user clicks a Note record in the list:
**3.** Click the Save button.
Chỉnh Sửa Client Script Notes List để Phát Sự Kiện
**1.** If the Client Script pane is not open in Widget Editor, enable it by clicking Client Script in the Widget
**2.** Replace the Client Script with this script:

```javascript
function($rootScope,$scope) {
```

/* widget controller */
var c = this;

```javascript
c.selectItem = function(idx) {
```

var id = c.data.notes[idx].sys_id;

```javascript
console.log('Note ID: ' + id);
```

$rootScope.noteID = id;
$rootScope.$emit('selectNote', id);
**3.** If needed, apply indentation using <Shift> + <tab>.
**4.** Examine the script to see what it does.
Kiểm Thử Widget Notes List
**1.** You will soon be working with two widgets so instead of testing with the Preview pane, open a new
browser tab or window and navigate to:
**2.** Using the appropriate strategy for your browser, open the JavaScript console.
**3.** Click a record in the Notes List widget.
**4.** Examine the JavaScript console for a log message. The message is written when the event is emitted.
**5.** Leave the testing tab/window open and return to Widget Editor.
Chỉnh Sửa Client Script Widget Notes Body
**1.** In Widget Editor, use the Widget list to switch to editing the Notes Body Widget.

```javascript
function($scope,$rootScope) {
```

$rootScope.$on('selectNote', function(event,data) {

```javascript
console.log('Listener caught NoteID: ' + $rootScope.noteID);
});
```

**3.** Examine the Client Script to make sure you understand what it does. Notice, in particular, that the script
responds when the selectNote event is emitted.
Kiểm Thử Nhận Sự Kiện
**1.** Switch back to the testing tab/window you have open and reload the page.
**2.** If you closed the JavaScript console, open it now.
**3.** Click a Note record in the Notes List widget. You should see log messages for when the event is emitted
and when it is received.
**4.** Leave the testing tab/window open and return to Widget Editor.
Chỉnh Sửa Client Script Notes Body Lần Nữa
Instead of logging a sys_id to the JavaScript console when an event is received, the Client Script should get
the selected record's field values from the server to display in the Notes Body Widget.
**1.** Replace the Client Script with this script:

```javascript
c.server.get({
```

action: 'getNote',
noteID: $rootScope.noteID
}).then(function(r) {

```javascript
c.data.title = r.data.note.title;
c.data.note = r.data.note.note;
c.data.noteID = r.data.note.sys_id;
```

**2.** Examine the script to make sure you understand what it does.

```javascript
this.server.get() calls the Server script and passes custom input
this.server.get() returns a promise. When the response is received from the server, the .then()
```

function logic executes.
Chỉnh Sửa Server Script Widget Notes Body
In the Notes Body widget Server Script, write the logic to respond to the getNote action called from the Client
Script.
**1.** In the Script Editor pane, replace the existing Server Script with this script:
/* populate the 'data' object */

```javascript
if (input && input.noteID) {
```

var note = new GlideRecord('x_snc_createnotes_note');

```javascript
if (note.get(input.noteID)) {
if (input.action == 'getNote') {
data.note = {};
```

$sp.getRecordValues(data.note, note, "title, note, sys_id
**2.** Examine the script to make sure you understand what it does:
Recall that the input object is the data object received from the Client Script's controller.
What does the GlideSPScriptable getRecordValues()
(https://developer.servicenow.com/app.do#!/api_doc?v=utah&id=r_GSPS-getRecordValues_O_GR_S) method
làm gì?
Chỉnh Sửa HTML Template Widget Notes Body
**1.** In the HTML Template pane, replace the existing HTML with this HTML:

```javascript
<div class="panel panel-default" ng-show="c.data.noteID">
<div class="row">
<div class="col-md-12">
<input class="form-control" id="note-title" ng-model="c.data.title" />
<textarea class="form-control" id="note-body" ng-model="c.data.note" ></textarea>
```

**2.** Examine the HTML to make sure you understand what it does.
Kiểm Thử Logic Widget Notes Body
**2.** Click a Note record in the Notes List widget. You should see the record's Title and Description in the
Notes Body widget.

### BÀI TẬP (21 TRÊN 35)

Bài Tập: Cập Nhật Notes
In this exercise, you will update the Notes List and Notes Body widgets to allow users to update Note records
from the Notes Body widget.
**1.** Return to the tab/window you have been using to test the Notes List and Notes Body widgets and reload
the page. If you closed the tab/window, open a new one:
**2.** Click a Note record in the Notes List widget.
**3.** In the Notes Body widget, edit the Note record Title and Description.
**4.** Examine the Notes List widget. Do you see the record updates you made in the Notes Body widget in the
Notes List widget?
**5.** In the Notes List widget, click a different Note record, then click the Note record you edited in the last
step.
Attempting to update a Note record through the widgets has a couple of issues:
Thay đổi không được lưu
The Notes List widget is not notified of changes in the Notes Body widget
Cập Nhật HTML Template Widget Notes Body
Add the ng-change directive to both the note-title and note-body HTML elements so the widget can respond
to changes.
**1.** Open the Notes Body widget for editing in Widget Editor.
**2.** Replace the contents of the HTML template with this HTML. The ng-change and ng-model-options
directives were added to the note-title input and the note-body textarea (lines 5 and 10).

```javascript
<input class="form-control" id="note-title" ng-model="c.data.title" ng-change="c.updateNote('title')"
<textarea class="form-control" id="note-body" ng-model="c.data.note" ng-change="c.updateNote('body')" ng-
```

**3.** Examine the use of the ng-change directive. What function is it calling on the Client Script?
Cập Nhật Client Script Widget Notes Body
The ng-change directives in the HTML Template call updateNote(). You must add a function to the widget's
Client Script to handle the updates. The function must specify the action name, pass necessary properties
and values to the server so the updates can be written to the database, and supply a callback function for the
server.get().
**1.** Add this new function to the Notes Body widget Client Script. Do not replace the entire Client Script. It is
up to you to determine where to place the new function in the Client Script.

```javascript
c.updateNote = function(updateType) {
```

action: 'updateNote',
noteID: c.data.noteID,
noteBody: c.data.note,
noteTitle: c.data.title
**2.** Examine the Client Script to make sure you understand what it does. The script is currently not doing
anything with the updateType value passed in from ng-change.
Cập Nhật Server Script Widget Notes Body
The Server Script must update the Notes record in the database using the new values received from the
Client Script.
**1.** Add this else if to the Server Script. Do not replace the entire Server Script. It is up to you to determine
where to place the else if in the Server Script.
else if (input.action == 'updateNote') {

```javascript
note.title = input.noteTitle;
note.note = input.noteBody;
note.update();
```

**2.** Examine the logic to make sure you understand what it does. Recall that:
The input object is received from the Client Script
The GlideRecord update() method writes new values for an existing record to the database
Kiểm Thử Tính Năng Cập Nhật Bản Ghi
**1.** Return to the tab/window you have been using to test and do a hard reload of the page to make sure the
widgets are not running using cached logic.
**3.** In the Notes Body widget, edit the Title and Description. You may see a message about cross-scope
privilege which you can ignore.
**4.** Click a different Note in the Notes List widget.
**5.** In the Notes List widget, examine the record you edited. Do you see the changes in the Note record?
**6.** In the main ServiceNow browser window (not Studio), use the All menu to open CreateNotes > Notes.
Do you see the changes to the record you edited?
**7.** Return to the test tab/window and reload the page. Do you see the changes now?
As you have seen, the Notes List widget does not know about changes made to Note records in the Notes
Body widget. Your Challenge is to emit the update for the Note record Title and Description from the Notes
Body widget. The Notes List widget will listen for the event and will update the appropriate record in the list in
response to the event.

### BÀI VIẾT (22 TRÊN 35)

Sử Dụng Widget API Phía Client
In an earlier part of this module, you learned there are four client-side Widget APIs:
spUtil (https://developer.servicenow.com/dev.do#!/reference/api/utah/client/spUtilAPI): Contains utility methods to
perform common functions in a Service Portal widget client script.
spModal (https://developer.servicenow.com/dev.do#!/reference/api/utah/client/SPModal-API): Methods provide an
alternative way to show alerts, prompts, and confirmation dialogs.
spAriaUtil (https://developer.servicenow.com/dev.do#!/reference/api/utah/client/spAriaUtil-API): Uses an
AngularJS service to show messages on a screen reader.
page.
In order to use classes from the client-side Widget API, the global object for the API must be passed as a
dependency to the Client Script. The Client Script creates the AngularJS controller using the passed-in
dependencies.
If a Client Script attempts to use a client-side Widget API without passing the dependency, a ReferenceError
occurs at runtime.
Pass dependencies in the Client Script function.

### BÀI TẬP (23 TRÊN 35)

Bài Tập: Modal Xác Nhận Xóa
Trong bài tập này, bạn sẽ tải phiên bản mới ứng dụng CreateNotes từ repository GitHub. Phiên bản
mới có logic lọc, thêm bản ghi Note mới và xóa bản ghi Note. Bạn sẽ thêm hộp thoại xác nhận
vào logic xóa bản ghi Note.
**1.** Save your work to the GitHub repository.
**1.** In Studio, open the Source Control menu and select the Commit Changes menu item.
**2.** Make sure all changes are selected, then click the Continue button.
**3.** Add a Commit comment of your choice.
**4.** Click the Commit Files (<number of changes>) button.
**5.** When the commit has completed successfully, click the Close button in the Commit Changes dialog.
**2.** Load a new version of the CreateNotes application. Loading the new version may take some time. Be
patient while the version loads.
**1.** In Studio, open the Source Control menu and click the Create Branch option.
**2.** Configure the branch.
**1.** Branch Name: ConfirmationModal
Create from Tag: LoadForConfirmDeleteModal
**3.** Click the Create Branch button.
**4.** In the Create Branch dialog, click the Close button.
Explore the CreateNotes Application
**1.** Return to the main ServiceNow browser window, not Studio, and reload the browser page.
**2.** Examine the list of Notes records.
**1.** Use the All menu to open CreateNotes > Notes.
**2.** Examine the list of Notes records to see which records have your user in the User field.
**3.** Return to the tab/window you have been using to test the Notes List and Notes Body widgets and do a
hard reload of the page. If you closed the tab/window, open a new tab or window:
**4.** Create a Note record.
**1.** Click the Add Note button (
) in the Notes List widget header.
**2.** Add the Title and Description of your choice.
**5.** Delete one of the Notes records.
**1.** Select a Notes record in the Notes List widget.
**2.** In the Notes Body widget, click the Delete button (
**3.** Examine the Notes List widget. Is the record deleted? To be sure, switch to the main ServiceNow
browser window and use the All menu to open CreateNotes > Notes.
Thêm Logic Xác Nhận Trước Khi Xóa
You may have noticed that Notes records are deleted immediately when the Delete button is clicked. What
happens if a user accidentally clicks the Delete button? Whoops. Records are not recoverable (no undo
option) and must be created again if mistakenly deleted. To prevent accidental loss of data you will add a
confirmation modal to the CreateNotes application logic.
**1.** Edit the Notes Body widget HTML Template.
**1.** Open the Notes Body widget for editing.
**2.** If not already open, open the HTML Template pane in Widget Editor.
**3.** Locate the HTML which renders the Delete button and change the ng-click value to

```javascript
c.confirmDelete().
```

**2.** If not already open, open the Client Script pane in Widget Editor.
**1.** Add the spModal global object as a dependency.
**2.** Add the c.confirmDelete logic to the Client Script.

```javascript
c.confirmDelete = function(){
spModal.confirm("Are you sure you want to delete this Note record?").then(function(confirmed){
if(confirmed){
c.deleteNote();
```

Kiểm Thử Modal Xác Nhận
**1.** Return to the tab/window you have been using to test the Notes List and Notes Body widgets and do a
hard reload of the page.
**2.** Select a Note record in the Notes List widget.
**3.** In the Notes Body widget, click the Delete button.
**4.** When asked to confirm deletion, click the Cancel button. The Note record should not have been deleted.
**5.** Click the Delete button again.
**6.** When asked to confirm deletion, click the OK button. The Note record should be deleted.
After a record is deleted, use the addTrivialMessage() method from the spUtil API to inform the user the
record has been deleted. The message should be something like:
The <note title here> record has been deleted.
The message should appear only after the record is gone from the database.

### BÀI VIẾT (24 TRÊN 35)

Widget Options Là Gì?
Widgets options are developer-settable parameters which allow each widget instance to be uniquely
configured. The example shows the baseline Homepage Search widget and two uniquely configured
instances of the Homepage Search widget.
When a widget is added to a page, a unique instance of the widget is created. When setting widget options,
only that unique instance's options are changed. For example, setting the widget options for a Homepage
Search widget instance sets the options for that unique instance of the Homepage Search widget and NOT all
The default Homepage Search widget configuration:
Customized Homepage Search widget configuration:
The default and customized Homepage Search widgets have different appearances but the same behavior.
Changing one widget instance's options does not affect any other instances of the same widget.
MẸO CHO DEVELOPER: Different widgets have different options.

### BÀI VIẾT (25 TRÊN 35)

Widget Option Schema
Using widgets options makes widgets more easily reusable. The widget option schema defines the user-
configurable fields. To add, edit, or delete option fields, select the Edit Options Schema menu item in the
Widget Editor menu.
On a portal page, <ctrl> + click on a widget (on some operating systems <ctrl> + right-click) and select the
Widget Options Schema menu item.
Thêm Widget Options
In the widget option schema, click the Add button (
) then configure the widget options.
An asterisk indicates mandatory fields.
*Label: Human readable form of the field name
*Name: Name of the field used in scripts
*Type: Data type of the field
Hint: Provide a brief explanation of the widget for the users
Default Value: Value to use if the user does not provide a value
Widget options types are:
String
Boolean
Integer
Reference
Choice
Field_list
Field_name
Glide_list
For field types not supported in the option schema, create an extension table to store a custom widget option
schema (https://docs.servicenow.com/bundle/utah-servicenow-platform/page/build/service-
portal/concept/c_WidgetInstanceOptions.html).
Thiết Lập Widget Options
Service Portal uses the widget option schema to create a modal for setting widget options.
Widget options and their values are part of the Widget Instance record (Service Portal > Widget Instances).
The options are stored in JSON format.
Sử Dụng Widget Options
The widget options are accessible in both Client and Server Scripts using the options global object.

```javascript
// Snippet from a Server Script
if(!options.title){
options.title = "Hello World";
//Snippet from a Client Script
if(!c.options.title){
c.options.title = "Hello World";
```

Widget options are also accessible in the HTML Template using the options global object.

```javascript
<h1>{{::c.options.title}}</h1>
```


### BÀI TẬP (26 TRÊN 35)

Bài Tập: Tạo Widget Option Schema
Trong bài tập này, bạn sẽ tạo và kiểm thử widget option schema cho widget Notes List.
**1.** Return to the tab/window you have been using to test the Notes List and Notes Body widgets. If you
closed the tab/window, open a new one:
**2.** Examine the Notes List widget header.
**1.** What is the title of the widget?
**2.** How many records are in the Notes List widget? If you do not have at least three Notes records,
create more Notes records.
Tạo Widget Option Schema - Widget Notes List
**1.** Open the Notes List widget for editing in Widget Editor.
**2.** Open the Widget Editor menu (
) and select the Edit option schema menu item.
**3.** Add an option to the schema.
**1.** Click the Add button (
**2.** Configure the new option.
**1.** Label: Title
Name: title
Type: string
Hint: Specify a title for the Notes List widget
Default value: Notes
**4.** Add a second option to the schema.
**1.** Label: Maximum records to display
Name: maximum_records_to_display
Type: choice
Choices:
Hint: Select the maximum number of records to display
Default value: 5
**5.** Click the Save button. The Widget Options Schema modal closes.
Đặt Tiêu Đề Panel Notes List
**1.** Make this change to the Notes List widget's HTML Template:
**2.** Nhấp nút Save.
Lấy Số Lượng Bản Ghi Notes Cố Định
**1.** If you are unfamiliar with the GlideRecord setLimit() method, read about it in the API docs
(https://developer.servicenow.com/app.do#!/api_doc?v=utah&id=r_ScopedGlideRecordSetLimit_Number).
**2.** Make this change to the Notes List widget's Server Script:
Cấu Hình Widget Options Notes List
**2.** Click the Designer tile.
**3.** Locate the CreateNotes Home (notes_home) page and open it for editing.
**4.** Open the options for the Notes List Widget.
**5.** Configure the options:
**1.** Title: Important Stuff
Maximum records to display: 2
**7.** The Notes List widget in the Designer should be updated to show the new options settings.
**8.** Modify the options again.
**1.** Return to the tab/window you have been using to test the Notes List and Notes Body widgets.
**2.** <ctrl> + click the Notes List widget (on some operating systems <ctrl> + right-click) and select the
Instance Options menu item.
**3.** Set the Title and Maximum records to display values to the values of your choice.

### BÀI VIẾT (27 TRÊN 35)

Directives
Directives in AngularJS are extended HTML attributes. AngularJS has a number of built-in directives, all
starting with ng, such as:
ngApp
ngRepeat
ngShow
ngModel
ngClick
AngularJS allows user-defined directives to extend the functionality of HTML in applications. The directives
can attach a specified behavior to:
Element (<macro-name></macro-name>)
Attribute (<div macro-name><div>)
CSS Class (<div class="macro-name">)
Comments (<!-- macro-name -->)
Tạo Angular Provider
Directives are defined as Angular Providers.
In the main ServiceNow browser window, use the All menu to open Service Portal > Angular Providers.
Directive names use camelCase which must be referenced using kebab-case in HTML. For example, a
directive named myDirective is <my-directive> in HTML. In kebab-case:
All letters are lowercase
Spaces are replaced by hyphens
Hyphens are inserted before letters which were uppercase
The Client Script field defines what the directive does.
In the example, the directive has several properties:
template: The HTML to render.
restrict: Specifies which methods can invoke the directive: Element, Attribute, Class, or Comment.
replace: Tells AngularJS to replace the element the directive is declared on.
scope: An object that contains a property for each isolate scope binding. This is typically used when
making components reusable.
link: The link function is executed while attaching the template to the DOM.
Any valid directive syntax (https://docs.angularjs.org/guide/directive) can be used in an Angular Provider.

### BÀI VIẾT (28 TRÊN 35)

Mối Quan Hệ Angular Provider
For performance reasons, widgets load only the angular providers they use.
To add angular provider relationships, open Service Portal > Widgets in the main ServiceNow browser
window. Open a widget record for editing. Scroll to the bottom of the form and switch to the Angular Providers
related list. Click the Edit... button.
Locate the Angular Provider to add in the Collection slushbucket and add it to the Angular Providers List
slushbucket.
The Angular Provider appears on the Widget Editor header in the Dependencies list.

### BÀI TẬP (29 TRÊN 35)

Bài Tập: Tạo Directive
Trong bài tập này, bạn sẽ tạo directive và thêm nó như dependency vào widget Notes Body.
Directive sẽ render nút Delete trong widget.
Tạo Directive
**1.** In the main ServiceNow browser window, use the All menu to open Service Portal > Angular
Providers.
**3.** Configure the new Angular Provider.
**1.** Type: Directive
Name: deleteButtonConfirm
**4.** Add the Client Script to the directive.

```javascript
function(){
return{
```

template: '<div class="col-md-1"><button class="btn btn-danger pull-right" n
restrict: 'E'

```javascript
};
```

**5.** If you see an error about the function having an unexpected token, ignore the error. Click the Submit
button.
Thêm Angular Provider vào Widget Notes Body
**1.** In the main ServiceNow browser window, use the All menu to open Service Portal > Widgets.
**2.** Open the Notes Body widget for editing.
**3.** Scroll down and open the Angular Providers related list.
**4.** Click the Edit... button.
**5.** Locate the deleteButtonConfirm directive in the Collection slushbucket.
**6.** Click the Add button
to move the directive to the Angular Providers List slushbucket.
**7.** Nhấp nút Save.
**2.** Click the Dependencies list in the Widget Editor header to see the list of dependencies.
**3.** Edit the HTML. Replace the HTML for the Delete button with the directive.
MẸO CHO DEVELOPER: The directive could also be written as <delete-button-confirm/> since it is an empty element.
Kiểm Thử Widget
**1.** Depending on the Notes Body widget options set in the previous exercise, you may want to set the
Maximum records to return value to a high number such as 11 or 17.
**2.** Return to the tab/window you have been using to test the Notes List and Notes Body widgets and reload
**3.** Click a Note record in the Notes List widget.
**4.** In the Notes Body widget, click the Delete button. When prompted to confirm, click the OK button. The
record should be deleted.

### BÀI VIẾT (30 TRÊN 35)

recordWatch()
In the CreateNotes application's widgets, you are able create, update, and delete Notes records. What
happens in the widgets if a user creates a record using the standard ServiceNow UI?
Although the Notes List and Notes Body widgets have been developed to communicate with each other, they
are not notified of changes made to the Notes table records when the interaction happens through the
standard ServiceNow UI.
Use the Client API method spUtil.recordWatch() to register a listener in a widget. The listener is notified when
table records are inserted, deleted, or updated.

```javascript
spUtil.recordWatch($scope, "table_name", "filter", function(name) {
console.log(name); //Returns information about the event that has occurred
console.log(name.data); //Returns the data inserted or updated on the table
```

To use a Record Watch, pass spUtil as a dependency to the Client Script.
The recordWatch method is passed $scope, the name of the table to watch, and any filter condition.

```javascript
spUtil.recordWatch($scope,"incident","active=true",function(name){
// listen for changes to incident table records where the record is active i
```

If you are not sure of the syntax for the filter, use a ServiceNow list to build the filter for you.
**1.** Construct the query using the Filter Builder.
**2.** Click the Run button to execute the query.
**3.** Right-click the rightmost part of the breadcrumbs.
**4.** Select the Copy query menu item.
**5.** Paste the query into the recordWatch parameters.

```javascript
spUtil.recordWatch($scope,"incident","caller_idDYNAMIC90d1921e5f510100a9ad2572f2b477fe^active=true",function(name)
console.log(name.data.operation);
console.log(name);
```

When changes meeting the filter condition are made to the table records, the callback function executes.
Xem Các Thay Đổi Bản Ghi
Use the browser's JavaScript console to view information from the recordWatch objects. The data object,
which is a property of the name object, contains information about the record which changed.
Phản Hồi Thay Đổi Bản Ghi
Client Script logic responds to the Record Watch event including the Widget API, Widget Script global objects,
and Client Script global functions
(https://developer.servicenow.com/dev.do#!/learn/courses/utah/app_store_learnv2_serviceportal_utah_service_portal/app_

### BÀI TẬP (31 TRÊN 35)

Bài Tập: Dùng Record Watch để Phát Hiện Thay Đổi
Thay Đổi Bản Ghi
Trong bài tập này, bạn sẽ dùng Record Watch để phát hiện thay đổi bản ghi bảng Notes và phản hồi:
Xóa
Cập nhật
Tạo
**2.** Return to the main ServiceNow browser window and use the All menu to open CreateNotes > Notes.
**3.** Make modifications to the Notes table records:
**1.** Edit one record's Title or Description field.
**2.** Create a new record.
**3.** Delete a record.
**4.** Return to the tab/window you have been using to test the Notes List and Notes Body widgets. Do not
reload the page. Are the records you modified (update, insert, delete) and their field values in the Notes
List widget? Are the values correct?
Thêm Record Watcher vào Client Script Widget Notes List
**2.** Add spUtil to the Client Script dependencies.
**3.** Add the Record Watch logic to the Client Script.
**4.** Configure the Record Watch parameters.
**1.** table_name: Name of the Create Notes table
filter: Records with any value in the Number field (Hint: Use the Filter Builder in the CreateNotes
> Notes list to determine the query syntax.)
Kiểm Tra Sự Kiện Thay Đổi Bản Ghi Bảng
**1.** Return to the tab/window you have been using to test the widgets and do a hard reload of the page to
make sure the widgets are not running using cached logic.
**2.** Enable the browser's JavaScript console using the strategy appropriate to your browser.
**3.** Return to the main ServiceNow browser window and create a Notes record. Use the Title and Description
values of your choice.
**4.** Save the new Notes record.
**5.** Return to the tab/window you have been using to test the widgets and examine the JavaScript console.
Look for the insert.
**6.** Open name.data and name.data.record to see the structure of the data sent to the Record Watch.
Notice the value in name.data.operation.
Phản Hồi Chèn Bản Ghi
**1.** Return to editing the Notes List widget in Widget Editor.
**2.** Add logic to the spUtil.RecordWatch callback function to respond to the insert event received by the
Record Watch. Add the logic after the two console.log statements.

```javascript
// Fast and easy... replace the client data object with the server data object
if(name.data.operation == "insert"){
c.server.refresh();
```

Kiểm Thử Logic Chèn Bản Ghi
**2.** If you closed the JavaScript console, open it again.
**3.** Switch to the main ServiceNow browser window and open CreateNotes > Notes.
**4.** Add a new Note record.
**1.** Click the New button.
**2.** Enter the Title and Description values of your choice.
**5.** Return to the test tab/window.
**6.** The new record should appear in the Notes List widget.
**7.** Examine the JavaScript console to see the structure of the name.data object and the values in the
name.data.record object.
Phản Hồi Cập Nhật và Xóa Bản Ghi - Client Script
In this section you will add logic to the spUtil.recordWatch callback function to respond when Notes records
are updated or deleted. Although in all cases the logic could be to call this.server.refresh(), two different
strategies will be used for the purpose of demonstration.
**2.** Add logic to the spUtil.RecordWatch callback function to respond to the update and delete event
received by the Record Watch. Add the logic after the two console.log statements and before the record
insert logic.

```javascript
// Calls a Client Script function to do the update and pass the updated data object
// to the server.
if(name.data.operation == "update"){
c.snNoteUpdate(name, name.data.sys_id);
// Calls a Client Script function which deletes a record on the server and passes
// the updated data object back to the client.
if(name.data.operation == "delete"){
c.snNoteDelete(name.data.sys_id);
```

**3.** Examine the update and delete callback function logic. Notice the calls to c.snNoteUpdate() and

```javascript
c.snNoteDelete().
```

**4.** Add the c.snNoteUpdate() and c.snNoteDelete() functions to the Client Script.

```javascript
// Record removed from data object on the client and passed to server
c.snNoteUpdate = function(name,sysID){
for (var i=0;i<c.data.notes.length;i++){
if(c.data.notes[i].sys_id == name.data.sys_id){
if(name.data.record.note){
c.data.notes[i].note = name.data.record.note.display_valu
if(name.data.record.title){
c.data.notes[i].title = name.data.record.title.display_v
c.server.update();
// Record removed from data object on the server and passed back to client
c.snNoteDelete = function(sysID){
```

action: 'snDeleteNote',
noteID: sysID
}).then(function(r){

```javascript
c.data.notes = r.data.notes;
```

Phản Hồi Xóa Bản Ghi - Server Script
The Client Script logic for the c.snNoteDelete() function does a c.server.get. In this section of the exercise,
you will add the Server Script logic for the record deletion event.
**1.** If not already open in Widget Editor, open the Server Script pane.
**2.** Add the snDeleteNote action logic.

```javascript
if (input.action == 'snDeleteNote') {
```

var delNote = new GlideRecord('x_snc_createnotes_note');

```javascript
// The notes record should already be gone. Just
// making sure it no longer exists.
if(delNote.get(input.noteID)){
delNote.deleteRecord();
```

Kiểm Thử Logic Chèn, Xóa và Cập Nhật
**4.** Test the insert record logic to make sure it still works. Add a new Note record.
**8.** Test the record update feature.
**1.** Return to the main ServiceNow browser window and open an existing Note record for editing.
**2.** Change the Description, Title, or both values on an existing record.
**3.** Click the Update button.
**4.** Return to the test tab/window. The record should also have been updated in the Notes List widget.
**5.** Examine the JavaScript console to see the structure of the event object.
**9.** Test the record delete feature from a form.
**2.** Click the Delete button.
**3.** When prompted to confirm the delete operation, click the Delete button.
**4.** Return to the test tab/window. The record should not appear in the Notes List widget.
**10.** Test the record delete feature from a list.
**1.** In the main ServiceNow browser window, use the All menu to open CreateNotes > Notes.
**2.** Click the check box next to a record to select it.
**3.** Click the Actions on selected rows... button and select the Delete item.
**4.** When prompted to confirm the delete operation, click the Delete button.
**5.** Return to the test tab/window. Is the record deleted from the Notes List Widget?
**6.** Examine the JavaScript console. Did the Record Watch receive a delete event from the List?

### BÀI TẬP (32 TRÊN 35)

Bài Tập: Lưu Công Việc Tạo Custom Widgets
Công Việc (Tùy chọn)
Source control applications, like GitHub, allow developers to commit changes (save completed work) outside
of the Personal Developer Instance (PDI). Commit changes made to the application to save your work in
source control.
In this exercise, you will save the work completed in this module to your GitHub repository.
để lưu công việc.
Commit Thay Đổi
**1.** If the CreateNotes application is not open in Studio, open it now.
a. Trong cửa sổ trình duyệt ServiceNow chính, dùng menu All để mở System Applications > Studio.
b. Trong hộp thoại Select Application, nhấp ứng dụng CreateNotes.
**2.** Mở menu Source Control và chọn mục Commit Changes.
**3.** Chọn các cập nhật để commit.
**1.** In the Select files to commit to source control for <Application> dialog, select All Update Sets.
**2.** Review the application files to be committed. Your files will differ from those pictured.
**3.** Nhấp nút Continue.
**4.** In the Confirm files to commit to source control for <Application> dialog, enter a Commit comment, such
ví dụ Creating Custom Widgets Module Completed.
**5.** Nhấp nút Commit Files.
**6.** Khi hộp thoại Commit Changes báo thành công, nhấp nút Close.
GHI CHÚ: If the commit changes fail, you may have entered the ServiceNow repository URL in the URL field instead of the
forked repository URL. See the Troubleshooting GitHub Issues (/dev.do#!/guide/utah/now-platform/github-
guide/troubleshooting-github-issues) section of the GitHub Guide for instructions on how to troubleshoot GitHub connection
sự cố.

### BÀI VIẾT (33 TRÊN 35)

Kiểm Tra Kiến Thức Custom Widgets
Muốn xác minh sự hiểu biết về custom widgets? Những câu hỏi này sẽ giúp bạn đánh giá tiến trình.
Với mỗi câu hỏi, xác định câu trả lời rồi nhấp vào bất kỳ đâu trong câu hỏi để xem đáp án.

### BÀI VIẾT (34 TRÊN 35)

Tóm Tắt Module Tạo Custom Widgets
Khái niệm cốt lõi:
Baseline widgets là chỉ đọc; để chỉnh sửa baseline widget, tạo bản sao gọi là clone
Các pane Widget Editor có thể hiện/ẩn
CSS - SCSS
Demo Data (JSON)
Các đối tượng toàn cục Server là:
data: đối tượng chứa cặp property/value để gửi đến Client Script
input: Đối tượng dữ liệu nhận từ controller của Client Script
options: Các tùy chọn dùng để gọi widget trên server
Các đối tượng toàn cục Client là:
data: Đối tượng data đã serialize từ Server Script
Các Hàm Toàn Cục Client Script là:

```javascript
this.server.get(): Calls the Server Script and passes custom input
this.server.update(): Calls the server and posts this.data to the Server Script
this.server.refresh(): Calls the server and automatically replaces the current options and data from
```

phản hồi server
Widget API bao gồm:
spUtil (client)
spModal (client)
spAriaUtil (client)
GlideSPScriptable (server)
JavaScript console
Directives là thuộc tính HTML mở rộng, có thể tái sử dụng
Được định nghĩa là Angular Providers
Phải được gắn vào widget như một dependency
Widget Option Schema định nghĩa các tùy chọn người dùng có thể thiết lập cho widget
Options được thiết lập trên cơ sở từng widget instance
Options được tải vào đối tượng options
Record Watch giám sát bảng cho các thay đổi bản ghi xảy ra bên ngoài Service Portal

### BÀI VIẾT (35 TRÊN 35)

Sau Khi Hoàn Thành Tạo Custom Widgets, Bạn
Có Thể Quan Tâm Đến...
Chúc mừng bạn đã hoàn thành module Tạo Custom Widgets. Dựa trên sở thích tạo
widgets, bạn có thể cũng thích:
Developing Virtual Agent Topics (https://developer.servicenow.com/to.do?u=CCW-U-MOD-VIA): In this
Developer Site learning module, you will learn how to use Virtual Agent to automate user interactions.
Virtual Agents can be included in service portals..
Service Portal Documentation (https://developer.servicenow.com/to.do?u=CCW-U-MOD-DOC-SPLanding): On
the ServiceNow docs site, you will find the complete set of reference material for Service Portal.

---

## 3. Lập Trình Phía Server

Phiên bản: Zurich
NHÀ PHÁT TRIỂN ỨNG DỤNG SERVICENOW
Lập Trình Phía Server

### BÀI VIẾT (1 TRÊN 36)

Mục Tiêu Lập Trình Phía Server
Trong module này bạn sẽ học:
Viết, kiểm thử và gỡ lỗi Business Rules
Viết, kiểm thử và gỡ lỗi Script Includes
Theo yêu cầu/không dùng class
Mở rộng GlideAjax
Tạo class mới
Sử dụng server-side API bao gồm:
GlideSystem
GlideRecord
GlideDateTime
Sử dụng JavaScript Debugger để gỡ lỗi server-side scripts
Sử dụng Script Tracer để xác định server-side scripts nào thực thi như một phần của tương tác UI
Đặt và xóa Breakpoints
Đặt, xóa và sửa đổi logpoints
Sử dụng Console Debugger
Sử dụng Session Log
Step into, out of, over
Kiểm tra giá trị biến

### BÀI VIẾT (2 TRÊN 36)

Về Module Học Tập Này
QUAN TRỌNG: The content in this learning module was last updated for the San Diego ServiceNow release and was not
updated for the Utah release. You may see differences between the Utah release and the content in this learning module.
Nhiều ví dụ được sử dụng trên các trang khái niệm trong module học tập này. Bạn không cần cố gắng
tái tạo các ví dụ. Bạn sẽ phát triển ứng dụng NeedIt trong các bài tập thực hành.
Bài tập được chỉ ra theo ba cách:
Biểu tượng Bài tập trong khung Điều hướng.
Biểu tượng Bài tập và chữ Exercise ở đầu trang.
Chữ Exercise hoặc chữ Challenge trong tiêu đề trang.
Ứng dụng NeedIt cho phép người dùng yêu cầu dịch vụ từ nhiều phòng ban. Bạn sẽ sử dụng
source control để bắt đầu với tất cả file ứng dụng NeedIt cần thiết cho module học tập này.

### BÀI TẬP (3 TRÊN 36)

Exercise: Fork Repository and Import Application
cho Module Lập Trình Phía Server
ServiceNow uses GitHub to provide application repositories to copy and use with the Developer Site learning
content. The repositories contain tags, which are fixed sets of application files, to start you with a partially built
application. By copying and importing a ServiceNow-provided repository into your Personal Developer
Instance (PDI), you get all the files needed for the hands-on exercises in the modules.
GHI CHÚ: See the GitHub Guide (/dev.do#!/guide/utah/now-platform/github-guide/github-and-the-developer-site-training-guide-introduction)
for more information on how ServiceNow uses GitHub with the Developer Program learning content and to see a video on how
to fork a repository and import an application.
Trong bài tập này, bạn sẽ:
**1.** Fork the ServiceNow repository to your GitHub account.
**2.** Import the application into your PDI from your fork of the repository.
QUAN TRỌNG: If you have already forked and imported the repository, you can proceed to the next exercise, where you will
create a branch from a tag to load the application files to your PDI. The NeedIt application files are needed to complete the
module.
Fork Repository
Trong phần này của bài tập, bạn sẽ tạo một bản fork cá nhân của repository ứng dụng để sử dụng với
nội dung học tập của Developer Site.
**1.** Trong trình duyệt web, mở github.com (https://github.com/).
**2.** Nếu bạn có tài khoản GitHub, đăng nhập. Nếu không, đăng ký tài khoản mới.
**3.** Once signed in, open the NeedIt repository (https://github.com/ServiceNow/devtraining-needit-utah).
**4.** Nhấp nút Fork (
) để tạo bản sao repository trong tài khoản GitHub của bạn.
**5.** Trên trang Create a new fork, bỏ chọn tùy chọn Copy the main branch only.
**6.** Chọn tài khoản GitHub cá nhân làm Owner cho fork, sau đó nhấp nút Create fork.
**7.** Xác minh URL cho bản fork repository tương tự: <YourGitHubUsername>/devtraining-
application-release.
**8.** Sao chép URL của repository đã fork.
**1.** Nhấp nút Code.
**2.** Đảm bảo URL chứa tên GitHub của bạn, không phải ServiceNow.
**3.** Đảm bảo HTTPS đã được chọn. Nếu không, chọn tab HTTPS trong flyout Clone.
**4.** Nhấp nút Copy to clipboard (
).
GHI CHÚ: You will use the copied URL to configure the connection to your forked repository in the next section.
Import Ứng dụng từ Repository Đã Fork
Trong phần này của bài tập, bạn sẽ import repository ứng dụng vào ServiceNow. Như một phần của
quy trình, trước tiên bạn sẽ tạo bản ghi Credential cho tài khoản GitHub, sau đó sử dụng Studio để import
repository ứng dụng vào PDI của bạn.
**1.** Đăng nhập vào PDI với tư cách admin. Nếu bạn chưa có PDI, mở ServiceNow Developer Site
(https://developer.servicenow.com) để lấy Utah PDI.
GHI CHÚ: See the Personal Developer Instance (PDI) Guide (/dev.do#!/guide/utah/now-platform/pdi-guide/personal-developer-
instance-guide-introduction) for instructions on how to obtain a PDI.
**2.** Tạo bản ghi Credential cho kết nối GitHub.
QUAN TRỌNG: Credential records only need to be created once. If you have already created a credential record in
bài tập khác, vui lòng bỏ qua bước này.
**1.** Use the All menu to open Connections & Credentials > Credential.
**2.** Nhấp nút New.
**3.** Trong danh sách What type of Credentials would you like to create?, nhấp liên kết Basic Auth Credentials.
**4.** Cấu hình bản ghi Credential.
**1.** Name: GitHub Credentials - <Tên GitHub của bạn>
User name: <Tên GitHub của bạn>
Password: <Personal access token GitHub của bạn>
QUAN TRỌNG: GitHub requires personal access tokens to access repositories from other platforms, like
ServiceNow. A personal access token is used in place of a password when authenticating. See the
Authenticating to GitHub (/dev.do#!/guides/utah/developer-program/github-guide/using-servicenow-provided-application-
repositories#authenticating-to-github) section of the GitHub Guide for instructions on creating a GitHub personal
access token.
**5.** Nhấp nút Submit.
**3.** Sử dụng menu All để mở System Applications > Studio.
**4.** Studio mở trong tab trình duyệt mới.
**5.** Trong hộp thoại Select Application, nhấp nút Import From Source Control.
**6.** Trong hộp thoại Import Application, cấu hình kết nối tới repository đã fork.
**1.** URL: <URL bạn đã sao chép cho bản fork repository>
Credential: GitHub Credentials - <Tên GitHub của bạn>
Branch: main
GHI CHÚ: When you change the Branch value to main, an information message informs you that Use of the default naming
convention is strongly encouraged. The value in the Branch field must exist in the repository. The Developer Site training
repositories all have a main branch, which should be used in place of the default value.
**7.** Nhấp nút Import.
**8.** Khi import ứng dụng hoàn tất, nhấp nút Select Application.
GHI CHÚ: If the connection fails, you may have entered the ServiceNow repository URL in the URL field instead of the
forked repository URL or enabled two-factor authentication on your GitHub account. See Troubleshooting GitHub Issues
(/dev.do#!/guide/utah/now-platform/github-guide/troubleshooting-github-issues) for instructions on how to troubleshoot the
connection.
**9.** Trong hộp thoại Select Application, nhấp ứng dụng để mở chỉnh sửa trong Studio.
QUAN TRỌNG: You will not see any application files in Studio until you successfully create a branch from a tag in the next
bài tập tiếp theo.

### BÀI TẬP (4 TRÊN 36)

Exercise: Create a Branch for the Server-side
Scripting Module
In this exercise, you will create a branch of the NeedIt application for the Server-side Scripting module that
includes the application files used in the module.
GHI CHÚ: Before you begin this exercise, you need to have forked and imported the NeedIt repository as described in Exercise:
Fork Repository and Import Application for the Server-side Scripting Module.
**1.** If the NeedIt application is not open in Studio from the previous exercise, open it now.
**1.** Trong cửa sổ trình duyệt ServiceNow chính, sử dụng menu All để mở System Applications > Studio.
**2.** In the Select Application dialog, click the NeedIt application.
**2.** Trong Studio, mở menu Source Control và chọn mục Create Branch.
**3.** Cấu hình branch.
**1.** Branch Name: ServerScriptsModule
Create from Tag: LoadForServerScriptsModule
**4.** Nhấp nút Create Branch.
**5.** Nhấp nút Close.
**6.** Để tải các file ứng dụng trong tag, quay lại tab trình duyệt ServiceNow chính (không phải Studio)
và nhấp nút reload của trình duyệt để làm mới trang.
GHI CHÚ: If branch creation fails, you may have entered the ServiceNow repository URL in the URL field instead of the
forked repository URL or enabled two-factor authentication on your GitHub account. See the Troubleshooting GitHub
Issues (/dev.do#!/guide/utah/now-platform/github-guide/troubleshooting-github-issues) section of the GitHub Guide for
hướng dẫn cách khắc phục sự cố kết nối GitHub.

### BÀI VIẾT (5 TRÊN 36)

Giới Thiệu Lập Trình Phía Server
Scripts in ServiceNow fall into two categories:
Client-side
Server-side
This module is about server-side scripting. Server-side scripts execute on the ServiceNow server or
database. Scripts in ServiceNow can do many, many things. Examples of things server-side scripts can do
include:
Update record fields when a database query runs
Set field values on related records when a record is saved
Manage failed log in attempts
Determine if a user has a specific role
Send email
Generate and respond to events
Compare two dates to determine which comes first chronologically
Determine if today is a weekend or weekday
Calculate the date when the next quarter starts
Log messages
Initiate integration and API calls to other systems
Send REST messages and retrieve results
In this module you will learn to write, test and debug two types of server-side scripts:
Business Rules
Script Includes

### BÀI VIẾT (6 TRÊN 36)

Business Rules are server-side logic that execute when database records are queried, updated, inserted, or
deleted. Business Rules respond to database interactions regardless of access method: for example, users
interacting with records through forms or lists, web services, or data imports (configurable). Business Rules
do not monitor forms or form fields but do execute their logic when forms interact with the database such as
when a record is saved, updated, or submitted.
Cấu Hình Business Rule
To see all Business Rule configuration options, select the Advanced option.
Name: Name of the Business Rule.
Table: Specifies the database table containing the records this logic will run against.
Application: Name of the application the Business Rule is part of.
Active: Enables/disables
Advanced: Select to display all Business Rule configuration options.
When to run Section
When: Select when the Business Rule logic executes relative to the database access.
Order: Order of execution for Business Rules for the same table. Execute in ascending order. By
convention, but not required, use Order values in round values of one hundred: 100, 200, 300, etc.
Insert: Select to execute the Business Rule logic when new records are inserted into the database.
Update: Select to execute the Business Rule logic when records are modified.
Delete: Select to execute the Business Rule logic when records are deleted.
Query: Select to execute the Business Rule logic when the database table is queried.
Filter Conditions: Add a condition to the configuration such as State is 14. The Filter Conditions must
return true for the Business Rule logic to execute.
Role conditions: Select the roles that users who are modifying records in the table must have for this
business rule to run.

### BÀI VIẾT (7 TRÊN 36)

Controlling When Business Rules Run
The When option determines when, relative to database access, Business Rule logic executes:
before
after
async
display
QUAN TRỌNG: Business Rules do NOT monitor forms. The forms shown in the graphics on this page represent a user
interacting with the database by loading (reading) and saving (updating) records using a form.
Before
Before Business Rules execute their logic before a database operation occurs. Use before Business Rules
when field values on a record need to be modified before the database access occurs. Before Business Rules
run before the database operation so no extra operations are required. For example, concatenate two fields
values and write the concatenated values to the Description field.
After
After Business Rules execute their logic immediately after a database operation occurs and before the
resulting form is rendered for the user. Use after Business Rules when no changes are needed to the record
being accessed in the database. For example, use an after Business Rule when updates need to be made to
a record related to the record accessed. If a record has child records use an after Business Rules to
propagate a change from the parent record to the children.
Async
Like after Business Rules, async Business Rules execute their logic after a database operation occurs. Unlike
after Business Rules, async Business Rules execute asynchronously. Async Business Rules execute on a
different processing thread than before or after Business Rules. They are queued by a scheduler to be run as
soon as possible. This allows the current transaction to complete without waiting for the Business Rules
execution to finish and prevents freezing a user's screen. Use Async Business Rules when the logic can be
executed in near real-time as opposed to real-time (after Business Rules). For example use async Business
Rules to invoke web services through the REST API. Service level agreement (SLA) calculations are also
typically done as async Business Rules.
To see async Business Rules queued up for execution, use the All menu in the main ServiceNow window (not
Studio) to open System Scheduler > Scheduled Jobs > Scheduled Jobs. Look for Scheduled Job names
starting with ASYNC. They go in and out of the queue very quickly and can be hard to catch on the schedule.
MẸO CHO DEVELOPER: Use async Business Rules instead of after Business Rules whenever possible to benefit from executing on
the scheduler thread.
Display
Display Business Rules execute their logic when a form loads and a record is loaded from the database. They
must complete execution before control of the form is given to a user. The purpose of a display Business Rule
is to populate an automatically instantiated object, g_scratchpad. The g_scratchpad object is passed from the
display Business Rule to the client-side for use by client-side scripts. Recall that when scripting on the client-
side, scripts only have access to fields and field values for fields on the form and not all of the fields from the
database. Use the g_scratchpad object to pass data to the client-side without modifying the form. The
g_scratchpad object has no default properties.
Business Rule Process Flow
A table can have multiple Business Rules of different When types. The order in which the Business Rules
execute is:

### BÀI VIẾT (8 TRÊN 36)

Business Rule Actions
Business Rule Actions are a configurable way to:
Set field values
Add a message to a form
Abort the Business Rule execution
Set Field Values
The Set field values option allows setting field value without scripting. Values can be:
Dynamically determined - To (dynamic)
The same value as the value of another field - Same as
Hard coded - To
The dynamic option is available only for reference fields.
In the example, the Requested for value is dynamically set to the currently logged in user as determined at
runtime. The Description field has the same value as the Short description field. The State field is hard coded
to the value Awaiting Approval.
Add Message
Use the Add message field to add a message to the top of a page. Although the message editor allows
movies and images, only text renders on the pages. Use color, fonts, and highlighting effectively. The
example text was chosen to demonstrate the types of effects which are available and should not be
considered an example of effective styling.
Abort Action
The Abort action option stops execution of the Business Rule and aborts the database operation. When the
Abort action option is selected, you can use the Add Message option to print a message to the screen but no
other options are available. Use this option when the script logic determines the database operation should
not be performed.

### BÀI VIẾT (9 TRÊN 36)

Business Rule Scripts
Business Rules scripts use the server-side APIs to take actions. Those actions could be, but are not limited
to:
Invoking web services
Changing field values
Modifying date formats
Generating events
Writing log messages
The Advanced option must be selected to write Business Rule scripts. The scripting fields are in the
Advanced section.
There are two fields for scripting in the Advanced section:
Condition
Script
current and previous
Business Rules often use the current and previous objects in their script logic.
The current object is automatically instantiated from the GlideRecord class. The current object's properties
are all the fields for a record and all the GlideRecord methods. The property values are the values as they
exist in the runtime environment.
The previous object is also automatically instantiated from the GlideRecord class. The previous object's
properties are also all fields from a record and the GlideRecord methods. The property values are the values
for the record fields when they were loaded from the database and before any changes were made. The
previous object is not available for use in async Business Rules.
The syntax for using the current or previous object in a script is:

```javascript
<object_name>.<field_property>
```

An example script using current and previous:

```javascript
// If the current value of the description field is the same as when the
// record was loaded from the database, stop executing the script
if(current.description == previous.description){
return;
}
```

Condition Field
Use the Condition field to write Javascript to specify when the Business Rule script should execute. Using the
Condition field rather than writing condition logic directly in the Script field avoids loading unnecessary script
logic. The Business Rule script logic only executes when the Condition field returns true. If the Condition field
is empty, the field returns true.
There is a special consideration for async Business Rules and the Condition field. Because async Business
Rules are separated in time from the database operation which launched the Business Rule, there is a
possibility of changes to the record between when the condition was tested and when the async Business
Rule runs. To re-evaluate async Business Rule conditions before running, set the system property,
glide.businessrule.async_condition_check, to true. You can find information about setting system properties
on the ServiceNow docs site (https://docs.servicenow.com/bundle/utah-platform-
administration/page/administer/reference-pages/task/t_AddAPropertyUsingSysPropsList.html).
The Condition script is an expression which returns true or false. If the expression evaluates to true, the
Business Rule runs. If the condition evaluates to false, the Business Rule does not run.
This is CORRECT syntax for a condition script:
current.short_description == "Hello world"
This is INCORRECT syntax for a condition script:

```javascript
if(current.short_description == "Hello world"){}
```

Some example condition scripts:
The value of the State field changed from anything else to 6:
current.state.changesTo(6)
The Short description field has a value:
!current.short_description.nil()
The value of the Short description field is different than when the record was loaded:
current.short_description != previous.short_description
The examples use methods from the server-side API.
The changesTo() (https://developer.servicenow.com/app.do#!/api_doc?
v=utah&id=r_ScopedGlideElementChangesTo_Object_o) method checks if a field value has changed from
something else to a hardcoded value
The nil() (https://developer.servicenow.com/app.do#!/api_doc?v=utah&id=r_ScopedGlideElementNil) method
checks if a field value is either NULL or the empty string
Notice that condition logic is a single JavaScript statement and does not require a semicolon at the end of the
statement.
Script Field
The Script field is pre-populated with a template:
Developers write their code inside the executeRule function. The current and previous objects are
automatically passed to the executeRule function.
Notice the template syntax. The function syntax is known in JavaScript as a self-invoking function or an
Immediately Invoked Function Expression (IIFE). The function is immediately invoked after it is defined.
ServiceNow manages the function and when it is invoked; developers do not explicitly call Business Rule
scripts.

### BÀI VIẾT (10 TRÊN 36)

Dot-Walking
Dot-walking allows direct scripting access to fields and field values on related records. For example, the
NeedIt table has a reference field called Requested for. The Requested for field references records from the
User [sys_user] table. Reference fields contain the sys_id of the record from the related table.
When scripting, use dot-walking to retrieve or set field values on related records. The syntax is:

```javascript
<object>.<related_object>.<field_name>
```

For example:

```javascript
if(current.u_requested_for.email == "beth.anglin@example.com"){
//logic here
```

The example script determines if the NeedIt record's Requested for person's email address is
beth.anglin@example.com.
To easily create dot-walking syntax, use the Script tree in the Script field:
**1.** Toggle the Script tree by clicking the Script Tree button.
**2.** Use the tree to navigate to the field of interest. Click the field name to create the dot-walking syntax in the
script editor. The syntax starts from the current object.
Dot-walking syntax can be several levels deep. The example script finds the latitude for the company related
to the user in the Requested for field.
current.u_requested_for.company.latitude

### BÀI VIẾT (11 TRÊN 36)

Server-side APIs
The complete documentation for the ServiceNow server-side APIs is available on the ServiceNow Developer
Site. API documentation is release-specific. Use the Site Release Selector to set the release before viewing
API documentation.
On the Developer Site, use the Reference menu to open API documentation. Use the Server Scoped API for
scoped application scripts. Use the Server Global API for applications in the global scope. Some global APIs
and methods do not have a scoped equivalent.
After opening API documentation, use the API TYPE field to switch APIs. Use the Start typing to filter list...
field to look for a class or property within the API.
This module addresses some commonly used APIs:

### BÀI VIẾT (12 TRÊN 36)

Use the GlideSystem API to, for example:
Find information about the currently logged in user
Log messages (debug, error, warning, info)
Add messages to pages
Generate events
Execute scheduled jobs
And more...
See the GlideSystem API
(https://developer.servicenow.com/dev.do#!/reference/api/utah/server/c_GlideSystemScopedAPI) reference for a
complete list of methods.
To use methods from the GlideSystem class, use the gs object:

```javascript
gs.<method>
```

Examine the example script:
This sample script writes one message to the log and two messages to the screen:

### BÀI VIẾT (13 TRÊN 36)

The GlideRecord class is the way to interact with the ServiceNow database from a script. See the
GlideRecord API (https://developer.servicenow.com/dev.do#!/reference/api/utah/server/c_GlideRecordScopedAPI)
reference for a complete list of methods.
GlideRecord interactions start with a database query. The generalized strategy is:
**1.** Create a GlideRecord object for the table of interest.
**2.** Build the query condition(s).
**3.** Execute the query.
**4.** Apply script logic to the records returned in the GlideRecord object.
Here is what the generalized strategy looks like in pseudo-code:

```javascript
// 1. Create an object to store rows from a table
```

var myObj = new GlideRecord('table_name');

```javascript
// 2. Build query
```

myObj.addQuery('field_name','operator','value');

```javascript
// 3. Execute query
```

myObj.query();

```javascript
// 4. Process returned records
while(myObj.next()){
//Logic you want to execute.
//Use myObj.field_name to reference record fields
```

GHI CHÚ: The GlideRecord API discussed here is a server-side API. There is a client-side GlideRecord API for global applications.
The client-side GlideRecord API cannot be used in scoped applications.
Build the Query Condition(s)
Use the addQuery() method to add query conditions. The addQuery operators are:
Numbers: =, !=, >, >=, <, <=
Strings: =, !=, STARTSWITH, ENDSWITH, CONTAINS, DOES NOT CONTAIN, IN, NOT IN,
INSTANCEOF
The addQuery() method is typically passed three arguments: field name, operator, and value. In some scripts
you will see only two arguments: field name and value. When the addQuery() method is used without an
operator, the operation is assumed to be =.
When there are multiple queries, each additional clause is treated as an AND.
Queries with no query conditions return all records from a table.
If a malformed query executes in runtime, all records from the table are returned. For more strict query control
you can enable the glide.invalid_query.returns_no_rows property which returns no records for invalid queries.
Iterating through Returned Records
There are several strategies for iterating through returned records.
The next() method and a while loop iterates through all returned records to process script logic:

```javascript
// iterate through all records in the GlideRecord and set the Priority field value to 4 (low priority).
// update the record in the database
```

myObj.priority = 4;
myObj.update();
The next() method and an if processes only the first record returned.

```javascript
// Set the Priority field value to 4 (low priority) for the first record in the GlideRecord
if(myObj.next()){
```

Use the updateMultiple() (https://developer.servicenow.com/dev.do#!/reference/api/utah/server/no-
namespace/c_GlideRecordScopedAPI#r_ScopedGlideRecordUpdateMultiple) method to update all records in a
GlideRecord. To ensure expected results with the updateMultiple() method, set field values with the the
setValue() (https://developer.servicenow.com/dev.do#!/reference/api/utah/server/no-
namespace/c_GlideRecordScopedAPI#r_ScopedGlideRecordSetValue_String_Object) method rather than direct
assignment.

```javascript
// When using updateMultiple(), use the setValue() method.
// Using myObj.priority = 4 may return unexpected results.
```

myObj.setValue('priority',4);
myObj.updateMultiple();
Counting Records in a GlideRecord
The GlideRecord API has a method for counting the number of records returned by a query: getRowCount().
Do not use the getRowCount() method on a production instance as there could be a negative performance
impact on the database. To determine the number of rows returned by a query on a production instance, use
GlideAggregate.

```javascript
// If you need to know the row count for a query on a production instance do this
```

var count = new GlideAggregate('x_snc_needit_needit');
count.addAggregate('COUNT');
count.query();
var recs = 0;

```javascript
if (count.next()){
```

recs = count.getAggregate('COUNT');

```javascript
gs.info("Returned number of rows = " +recs);
// Do not do this on a production instance.
```

var myObj = new GlideRecord('x_snc_needit_needit');

```javascript
gs.info("Returned record count = " + myObj.getRowCount());
```

Encoded Queries
As already discussed, if there are multiple conditions in query, the conditions are ANDed. To use ORs or
create technically complex queries, use encoded queries. The code for using an encoded query looks like
this:
var myObj = new GlideRecord("x_snc_needit_needit");
myObj.addEncodedQuery('<your_encoded_query>');

```javascript
// Logic you want to execute for the GlideRecord records
```

The trick to making this work is to know the encoded query syntax. The syntax is not documented so let
ServiceNow build the encoded query for you. In the main ServiceNow browser window, use the All menu to
open the list for the table of interest. If there is no module to open the list, type <table_name>.list in the Filter
field.
Use the Filter to build the query condition.
Click the Run button to execute the query. Right-click the breadcrumbs and select the Copy query menu
item. Where you click in the breadcrumbs matters. The copied query includes the condition you right-clicked
on and all conditions to the left. To copy the entire query, right-click the condition farthest to the right.
Return to the script and paste the encoded query into the addEncodedQuery() method. Be sure to enclose
the encoded query in "" or ''.
myObj.addEncodedQuery("u_when_neededBETWEENjavascript:gs.daysAgoStart(0)@javascript:gs.quartersAgoEnd(1)^active=tr

```javascript
// Insert logic you want to execute for the GlideRecord records
```


### BÀI VIẾT (14 TRÊN 36)

The scoped GlideDateTime class provides methods for performing operations on GlideDateTime objects. Use
the GlideDateTime methods to perform date-time operations, such as instantiating a GlideDateTime object,
performing date-time calculations, formatting a date-time, or converting between date-time formats. See the
GlideDateTime API (https://developer.servicenow.com/dev.do#!/reference/api/utah/server/c_APIRef) reference for a
ServiceNow provides no default logic for managing dates in applications. The NeedIt application, for example,
has a When needed field. There is no default logic preventing a user from setting the When needed date to a
date in the past.
Applications that use dates may require script logic for the date fields. Examples include:
Prevent users from selecting dates in the past
Require start dates to be before end dates
Disallow new requests to be submitted for today
When working with the GlideDateTime methods, pay attention to the date format and time zones. Some
methods use GMT/UTC and some use local time zones. Some methods use the date in milliseconds and
some do not.
GHI CHÚ: The GlideSystem API (https://developer.servicenow.com/dev.do#!/reference/api/utah/server/c_GlideSystemScopedAPI) also has
useful methods for managing dates. For example, gs.daysAgo().

### BÀI TẬP (15 TRÊN 36)

Exercise: Create a Business Rule
In this exercise, you will write and test a Business Rule to prevent users from setting the When needed field
value to a date in the past when creating NeedIt requests.
Create the Business Rule
In this section of the exercise, you will create a Business Rule to test the When needed field date.
**1.** Create a Business Rule.
**2.** In Studio, click the Create Application File link.
**3.** In the Filter... field, enter the text Business OR select Server Development in the categories pane.
**4.** Select Business Rule in the middle pane as the file type, then select the Create button.
**5.** Configure the Business Rule:
**6.** Name: NeedIt When needed field date
Table: NeedIt [x_<your_company_code>_needit_needit]
Active: Selected (checked)
Advanced: Selected (checked)
**7.** Switch to the When to run section and continue configuring the Business Rule:
**8.** When: before
Insert: Selected (checked)
**9.** Click the Submit button.
Write the Business Rule Script
**1.** Switch to the Advanced section.
**2.** Copy this script and paste it into the executeRule function in the Script field. Do not overwrite the
template; paste the script after the Add your code here comment.

```javascript
// rightnow stores the current time
```

var rightnow = new GlideDateTime();

```javascript
// Create a GlideDateTime object for the When needed date
```

var whenNeeded = new GlideDateTime(current.u_when_needed);

```javascript
// If the When needed date is before rightnow, do not write the record to the database
// Output an error message to the screen
if(whenNeeded.before(rightnow)){
gs.addErrorMessage("When needed date cannot be in the past. Your request has not been s
```

current.setAbortAction(true);
**3.** Click the Update button.
Test the Business Rule
**1.** In the main ServiceNow browser window (not Studio), use the All menu to open NeedIt > Create New.
**2.** Set the When needed field value to a value in the past.
**3.** Click the Additional actions menu (
) and select the Save menu item. Do not click the Submit button because that will take you away from the
form.
**4.** Examine the error messages.
**5.** Create a NeedIt record and set the When needed date in the future.
**6.** Save the record. The record should be written to the database with no error messages. If the record
does not save, debug and re-test.
Thử Thách
The NeedIt application is used to request goods and services from various departments. The departments
need a little time to fulfill requests, so same-day requests are not allowed. Modify the Business Rule script to
prevent users from submitting requests for today. You will find the scoped GlideDateTime API documentation
(https://developer.servicenow.com/app.do#!/api_doc?v=utah&id=r_ScopedGlideDateTimeGlideDateTime) on the
developer site useful.

### BÀI VIẾT (16 TRÊN 36)

Debugging Business Rules
So far in this module, debugging has primarily been:
Use the Script Editor to find JavaScript syntax errors
Examine scripts to look for errors
Verify the Business Rule is configured correctly
The strategies used so far are useful but are inadequate for fully debugging. Additional debugging strategies
are:
System Logs
Debug Business Rule (Details)
JavaScript Debugger
The scoped GlideSystem API has logging methods:

```javascript
gs.info() (https://developer.servicenow.com/app.do#!/api_doc?
```

v=utah&id=r_ScopedGlideSystemInf_String_Object_Object_Object_Object_Object)

```javascript
gs.warn() (https://developer.servicenow.com/app.do#!/api_doc?
```

v=utah&id=r_ScopedGlideSystemWarn_String_Object_Object_Object_Object_Object)

```javascript
gs.error() (https://developer.servicenow.com/app.do#!/api_doc?
```

v=utah&id=r_ScopedGlideSystemError_String_Object_Object_Object_Object_Object)

```javascript
gs.debug() (https://developer.servicenow.com/app.do#!/api_doc?
```

v=utah&id=r_ScopedGlideSystemDebug_String_Object_Object_Object_Object_Object) (must be enabled)
All of the logging methods write to the System Log. Pass strings, variables that resolve to strings, or methods
that resolve to strings into the logging methods.

```javascript
gs.error("The value of the Short description field is " + short_description);
```

To view the log messages, use the All menu to open System Logs > System Log > Application Logs.
The example script uses the scoped GlideSystem info(), warn(), error(), and debug() methods.
The log messages display the time created, verbosity level, message, scope, and script name.
The scoped GlideSystem API has a gs.debug() method. By default, the scoped GlideSystem debug() method
does not write to the Application log when the gs.debug() method is used in a script. To enable the gs.debug()
method, create or modify the application property with the name syntax <app_scope>.logging.verbosity. Set
the Value field in the <app_scope>.logging.verbosity property to debug to log debug messages from the

```javascript
gs.debug() method to the Application Log. For all other log levels, set the Value field to a comma-separated
```

list of desired log levels. Do not use spaces in the Value field. For example:
info,warn,error
GHI CHÚ: ServiceNow does not automatically create the <app_scope>.logging.verbosity property for applications.
To learn more about application properties, check out the Application Properties
(https://developer.servicenow.com/dev.do#!/learn/courses/utah/app_store_learnv2_automatingapps_utah_automating_app
training module that is part of the Automating Application Logic course.
To debug a Condition field script, enable detailed Business Rule Debugging. To enable debugging, use the All
menu to open System Diagnostics >Session Debug > Debug Business Rule (Details). The Session Log
opens. Open the form for a record of interest and force the Business Rule being debugged to execute by
doing whatever is necessary to trigger the Business Rule. Logging information is written to the Session Log.
In the example, the Business Rule user query was skipped because the Condition field did not evaluate to
true.
GHI CHÚ: There is more information about the Session Log later in this module.
To see debugging information directly on a form or list, open the form or list and force the Business Rule
being debugged to execute by doing whatever is necessary to trigger the Business Rule. Logging information
is written to the bottom of the page. In the example, the Logging Demo Business Rule did not execute
because the Condition field script did not evaluate to true.
To turn off detailed Business Rule debugging, use the All menu to execute System Diagnostics > Session
Debug > Disable All.

### BÀI VIẾT (17 TRÊN 36)

Script Tracer
Use the Script Tracer tab in the Script Debugger to debug synchronous, server-side scripts which are
executed as part of an application's logic.
Tracing
To begin a trace, use the All menu to open System Diagnostics > Script Tracer. The Script Tracer opens in
a new window. Click the Start Tracer button.
Return to the form being debugged and make whatever change is needed to trigger the scripts being
debugged. The Script Tracer begins tracing when a UI Action, such as the Save or Update button is clicked,
or some other transaction occurs.
The Script Tracer table displays a list of server-side scripts and UI Actions that executed during the tracing
period. Errors are indicated by a red circle with a white X to the left of the table row.
Trace Details
To view trace details, click a row in the table. The State, Script, and Transactions tabs are displayed for the
selected row.
State
The State tab displays the fields and new values resulting from the row selected in the table. To see all of the
record's fields and values, deselect (uncheck) the Show only changed values option. Changed values are
highlighted in green.
The Script tab shows the specific line of the script associated with the selected row. To see the complete
script, and not just the associated script line, click the Show Script button.
In the example, line 1 is the Condition field from the Save UI Action. To see the UI Action script, click the
Show Script button. To debug the script in the Script Debugger, click the Debug Script button. To edit the UI
Action record in the Now Platform, click the View File button.
Transaction
The Transaction tab displays details about the current transaction.

### BÀI VIẾT (18 TRÊN 36)

Script Debugger
The Script Debugger is the primary strategy for debugging Business Rules and other synchronous server-
side scripts.
Set, remove, and pause at breakpoints
Step through code line-by-line
Step into and out of functions and method calls
View the values of local, global, and private variables
View the call stack
The JavaScript debugger components are:
Launching the Script Debugger
Only users with the admin or script_debugger roles can use the Script Debugger.
There are multiple ways to launch the Script Debugger. Not all strategies work for all users. For example, if
pop-ups are blocked.
Use the All menu to open System Diagnostics > Script Debugger
In Studio, open the File > Script Debugger menu item
Click the JavaScript Debugger button (
) in the Script editor toolbar.
In the main ServiceNow browser window, click the user avatar. Select the Preferences menu item. Click
the Debugging card, then click the Open button for the Script Debugger.

### BÀI VIẾT (19 TRÊN 36)

Breakpoints
Breakpoints pause script execution to give developers the chance to examine variables and their values. The
Script Debugger status bar indicates whether scripts are paused at breakpoints or waiting for breakpoints to
be reached.
Conditional breakpoints pause script execution only when the breakpoint's condition script returns true.
Breakpoints are session-specific. Setting breakpoints affects script execution only for the developer who set
the breakpoint.
Setting Breakpoints
Set breakpoints in the Script Debugger or in the Script Editor in a server-side script record. The examples
show setting breakpoints in the Script Editor. The process for setting breakpoints in the Script debugger is the
same as the process for setting breakpoints in the Script Editor. To set a breakpoint, click in the gutter for the
line of interest.
Or right-click in the gutter and select the Add breakpoint choice.
Breakpoints are indicated by a purple arrow (
) and a gray background on the breakpoint line.
Click or right-click a breakpoint to remove it.
Setting Conditional Breakpoints
Set conditional breakpoints in the Script Debugger or in the Script Editor in a server-side script record. To set
a conditional breakpoint, right-click in the gutter for the line of interest and select the Add conditional
breakpoint choice.
To add a condition to an existing breakpoint, right-click the breakpoint and select the Add Condition choice.
After setting a conditional breakpoint, add the condition to the breakpoint. Conditions are server-side Script.
The condition script can end with a semicolon (;) but a semicolon is not required.
Breakpoints with conditions are indicated by a yellow arrow (
To view a conditional breakpoint's condition script, hover over the conditional breakpoint arrow.
To edit a conditional breakpoint, right-click the conditional breakpoint and select the Edit condition choice.
Using Breakpoints
After setting breakpoints, force the script to execute by creating or modifying a record that meets the script
trigger criteria. In the ServiceNow browser window, a dialog indicates that script execution is paused at a
breakpoint.
In the Script Debugger, a red arrow and red highlight indicate that a script is paused at a breakpoint. While
script execution is paused, examine the variables and their values. In the screenshot, script execution is
paused at line 4. The logic on line 4 is not yet executed. The short_description value shown is from the
current object. The previous object (not shown) has no values because the script is executing for a new
record.
When script execution is paused, use the controls to move through scripts:
Pause debugging (
): Stops any current debugging session, and disables the Script Debugger for the current user. The Script
Debugger does not pause on breakpoints for the current user until it is restarted.
Start debugging (
): Enables the Script Debugger for the current user. The Script Debugger pauses on breakpoints.
Resume script execution (
): Advances from the current breakpoint to the next breakpoint. If there are no other breakpoints, the
script runs to completion.
Step over next function call (
): When execution is paused on a line that is about to invoke a function, step over causes the code in the
function to execute, but does not pause on each individual line of code inside the function.
Step into next function call (
): When the Script Debugger pauses on a method call, this control allows the user to advance to the first
line of executed code within the method call. Stepping into a method updates the current position within
the call stack. If the user does not have read access to the method call, then this control acts like step
over instead.
Step out of current function (
): When the Script Debugger pauses within a method call, this control allows the user to exit the current
method call and return to the calling script from the call stack. If the user is not within a method call, then
this control acts like step over instead.
Call Stack
The call stack shows list of methods and functions called to run as part of the script execution. Click an item
in the call stack to see the definition. Execution must be paused at a breakpoint to examine the call stack.
Transaction Details
When paused at a breakpoint, the Transaction Details show information about the current transaction
including the URL, session ID, user, request parameters, instance, start time, and more.

### BÀI VIẾT (20 TRÊN 36)

Session Log
Use the Session Log tab in the Script Debugger to see session debugging information for:
SQL
Escalations
Scopes
Business Rules (Details)
SQL (Detailed)
Data Policies
Date/Time
Log
Security
Quotas
GraphQL
Security Rules
Homepage Render
Selecting What to Log
In the baseline case, no messages appear in the Session Log. Click the Settings icon to select what to log. In
the Settings dialog, select (check) the items to log.
Filtering Log Text
All log information is written to the log text area of the Session Log. Use the filters to further refine what log
information to display. Select from:
Debug Output: Log types selected in the Settings dialog such as Business Rules or Log
Apps: Application scopes involved in the transactions such as Global or NeedIt
Message Type: Log levels such as Info or Error
The values in the filters depend on the application, scope, selected debug output options, and message levels
based on the transactions that have occurred during the session.

### BÀI VIẾT (21 TRÊN 36)

Logpoints
Logpoints allow debugging information to be logged to the Script Debugger's Session Log without editing the
server-side script being debugged.
Logpoints are session-specific. Setting a logpoint affects only the developer who created the logpoint.
Enabling Logpoints
Logpoints are disabled by default. To enable logpoints a user with the admin or script_debugger role must set
the glide.debug.log_point system property to true.
Setting Logpoints
Set logpoints in the JavaScript Debugger or in the Script Editor in a server-side script record. The examples
show setting logpoints in the JavaScript Debugger. The process for setting logpoints in the JavaScript
Debugger is the same as the process for setting logpoints in the Script Editor. To set a logpoint, right-click in
the gutter for the line of interest. Select the Add logpoint choice. If there is no Add logpoint choice, logpoints
have not been enabled on the instance.
After setting a logpoint, write a server-side script specifying what to log. Use the gs.info()
(https://developer.servicenow.com/dev.do#!/reference/api/utah/server/no-
namespace/c_GlideSystemScopedAPI#r_ScopedGlideSystemInf_String_Object_Object_Object_Object_Object) or

```javascript
gs.debug() (https://developer.servicenow.com/dev.do#!/reference/api/utah/server/no-
```

namespace/c_GlideSystemScopedAPI#r_ScopedGlideSystemDebug_String_Object_Object_Object_Object_Object)
methods. Logpoint scripts can end with a semicolon (;) but a semicolon is not required.
Logpoints are indicated by a green arrow (
) and a gray background on the logpoint line.
To view a logpoint's script, hover over the logpoint arrow.
To edit a logpoint, right-click the logpoint and select the Edit logpoint choice.
Viewing Logpoint Messages
Logpoints write to the JavaScript Debugger Session Log. To view logpoint messages, switch to the Session
Log tab.
Open the Settings menu and enable the Log option.
If desired, use the Session Log Filters to restrict the number of log messages. In the example, only Info-level
messages will be logged.
Force the script to execute by creating or modifying a record that meets the script trigger criteria. After the
JavaScript debugger passes a line containing a logpoint, switch to the Session Log tab. Depending on how
much is being logged, it might be necessary to select a transaction in the Transactions pane. Logpoint
messages are written to the log text area of the Session Log.
GlideSystem logging methods are color coded in the Session Log.

```javascript
gs.info: no highlight
gs.warn: yellow highlight
gs.err: red highlight
gs.debug: no highlight
```


### BÀI VIẾT (22 TRÊN 36)

Console Debugger
The Script Debugger Console Debugger allows developers to evaluate script expressions in real time.
Enabled when the Script Debugger is paused at a breakpoint
Executes within the scope, context, and thread in which execution is paused
Writes evaluation results to the Console
Accessing the Console Debugger
By default, when the Script Debugger launches, the Console is collapsed. Click the Open Console icon (
) to expand the Console.
The Console is disabled until the Script Debugger is paused at a breakpoint.
Evaluating Expressions
When the Script Debugger is paused at a breakpoint, server-side JavaScript expressions can be evaluated.
The Console evaluates expressions within the scope, thread, and context of the paused Debugger to provide
real-time debugging capability. The result of the evaluation is written to the Console and is indicated by the <
(less than) character.
Pressing the Enter/Return key causes the Console to evaluate the expression. For scripts with multiple lines,
press <Shift> + <Enter> between lines of the script.
MẸO CHO DEVELOPER: To scroll through previously entered expressions, use the up arrow (↑) and down arrow (↓) keys, then
press <Enter> to evaluate the expression again.

### BÀI TẬP (23 TRÊN 36)

Exercise: Script Debugger
In this exercise you will practice using the Script Debugger.
Preparation - Enable Logpoints
In this part of the exercise, you will modify a system setting to allow the use of logpoints.
**1.** In the main ServiceNow browser window, not Studio, type sys_properties.list into the Filter field in the
All menu, then press the <return> key on the keyboard.
**2.** Open the glide.debug.log_point record for editing.
**3.** If prompted to change scope, click the here link.
**4.** Change the value in the Value field to true.
**5.** Click the Update button.
**1.** In Studio, click the Create Application File link.
**2.** In the Filter... field enter the text Business OR select Server Development from the categories in
the left hand pane.
**3.** Select Business Rule in the middle pane as the file type, then select the Create button.
**2.** Configure the Business Rule:
**1.** Name: NeedIt Debugging Practice
Table: NeedIt [x_58872_needit_needit]
**3.** Switch to the When to run section and continue configuring the Business Rule:
**1.** When: Before
Update: Selected (checked)
**4.** Click the Submit button.
**5.** Switch to the Advanced section.
**6.** Copy this script and paste it into the executeRule function in the Script field. Do not overwrite the
current.short_description = "This text set by the Debugging Business Rules business rule.";
var myNum = current.state;

```javascript
// The function in this try/catch is not defined
```

try{
thisFunctionDoesNotExist();
catch(err){

```javascript
gs.error("NeedIt App: a JavaScript runtime error occurred - " + err);
// This function is not defined and is not part of a try/catch
```

thisFunctionAlsoDoesNotExist();

```javascript
// getNum and setNum demonstrate JavaScript Closure
```

var x = 7;
function numFunc(){
var x = 10;

```javascript
return{
```

getNum: function(){
return x;
},
setNum: function(newNum){
x = newNum;

```javascript
};
```

var callFunc = numFunc();
callFunc.getNum();
callFunc.setNum(2);
**7.** Click the Update button.
Use the Script Tracer
**1.** In Studio, open the JavaScript Debugger by clicking the JavaScript Debugger button (
) in the Script Editor toolbar. If the JavaScript Debugger does not open, it is likely your browser is
blocking it from opening. Add your instance to the allowed list of popups in your browser.
**2.** Click the Script Tracer tab.
**3.** Trace a UI interaction for a NeedIt record.
**1.** Click the Start Tracer button.
**2.** Use the All menu in the main ServiceNow window, not Studio, to open NeedIt > Open.
**3.** Click the Number field for any NeedIt record to open the NeedIt form.
**4.** Change the value in the Priority field.
**4.** Return to the Script Tracer window and click the Stop Tracer button.
**5.** Examine the table in the Script Tracer for errors.
**1.** Icons that are a red circle with a white X indicate errors. Locate the two errors.
**2.** Click the row for the first error.
**1.** Examine the State tab to determine what the error might be.
**2.** Click the Script tab to see the script where the error occurred. Do not fix the error.
**3.** Click the row for the second error and examine the State and Script tabs for the error. Do not fix the
error.
**6.** Examine the Script Trace for the Save UI Action.
**1.** In the Script Tracer table, click the Save row.
**2.** Examine the State tab to see which field value changed.
**3.** Click the Script tab to see the script line to see the UI Action script line involved in the UI interaction.
**4.** Click the Transaction tab to see the transaction details.
**7.** Close the Debugger window.
Testing
**1.** In Studio, add breakpoints to the NeedIt Debugging Practice script.
**1.** Click in the gutter to set three breakpoints.
**1.** var myNum = current.state

```javascript
gs.error
```

100%;"/>
GHI CHÚ: Your line numbers may be different than the line numbers pictured, depending on where you pasted the
script.
**2.** In Studio, open the JavaScript Debugger by clicking the JavaScript Debugger button (
) in the Script Editor toolbar.
**3.** Set a logpoint on the current.short_description line.
**1.** Right-click the gutter for the current.short_description line and select the Add logpoint choice.
**2.** Enter the script gs.info("Short description = " + current.short_description); then press the
<Enter> or <Return> key.
**4.** Trigger the Business Rule.
**1.** Switch to the main ServiceNow browser window.
**2.** In the All menu, open NeedIt > Open.
**3.** Open a record of your choice for editing. Notice the value in the Short description field.
**4.** Make a change to any record field except Short description.
**5.** Use the Additional actions menu (
) to Save the record.
**5.** Return to the JavaScript Debugger window. The script execution should be stopped at the first
**6.** Examine the Local variables and their values. Open both the current and previous objects and look at
the values of the short_description property.
**7.** Examine the value for the myNum variable.
**8.** Use the Console to find the values of the Short description field.
**1.** Click the Open Console icon (
**2.** In the Console, enter current.short_description then press the <Enter> or <Return> key.
**3.** Examine the Console to find the current value of the Short description field.
**4.** Use the Console to find the value of previous.short_description.
**9.** Click the Resume button (
) to move to the next breakpoint.
**10.** The script should be paused at the second breakpoint. Examine the local variables. The myNum variable
should have a value.
**11.** Click the Resume button (
**12.** Force the Business Rule to execute again. When stopped at breakpoints, try the Step over (
), Step into (
), and Step out of (
) buttons.
Using the Session Log
**1.** Switch to the Session Log tab in the JavaScript Debugger.
**2.** Select the information to log.
**1.** Click the Settings icon.
**2.** Configure the Settings.
**1.** Business Rules: Selected (checked)
Log: Selected (checked)
**3.** Click the Enable button.
**3.** If there is any information in the log, click the Clear log icon in the Session Log header.
**4.** Switch to the Script Debugger tab.
**5.** Force the Business Rule to execute again.
**6.** Click the Resume button until the script execution is complete.
**7.** Examine the log.
**8.** Switch to the Session Log tab.
**9.** Scroll through the Transactions list to see what transactions occurred.
**10.** Select the x_58872_needit_needit.do transaction.
**11.** Scroll through the log to see what information was logged.
**12.** Filter the log.
**13.** Click the Apps filter.
**14.** De-select (uncheck) the Global option.
**15.** Examine the messages to determine which was written by the logpoint and which was a runtime error.
**16.** Switch back to the Script Debugger tab and remove the breakpoints by clicking the purple arrow for each
**17.** Remove the logpoint by right-clicking the logpoint and selecting the Remove logpoint choice.
**18.** If you are not going to do the optional Testing Closures part of this exercise, make the NeedIt Debugging
Practice Business Rule inactive.
Testing Closures (Advanced Topic - Optional)
**1.** Return to Studio and comment out or delete these lines of the script:
**2.** Set new breakpoints:
**3.** Edit or create a NeedIt record to trigger the NeedIt Debugging Practice Business Rule.
**4.** Open the Local and Closures variables. Use the Resume button (
) to move between breakpoints. Watch the value of x as you move through the breakpoints. Use your
knowledge of JavaScript closures to explain why x can have different values at the same time.
**5.** Remove the breakpoints and make the NeedIt Debugging Practice Business Rule inactive.

### BÀI VIẾT (24 TRÊN 36)

Script Includes are reusable server-side script logic that define a function or class. Script Includes execute
their script logic only when explicitly called by other scripts. There are different types of Script Includes:
Extend an existing class
Define a new class
Configuring a Script Include
Script Includes do not have many configuration options because they are called rather than triggered.
Name: Name of Script Include.
API Name: The internal name of the Script Include. Used to call the Script Include from out-of-scope
applications.
Client callable: Select this option if client-side scripts can call the Script Include using GlideAjax.
Application: The application the Script Include is part of.
Caller Access: When the Scoped Application Restricted Caller Access
(com.glide.scope.access.restricted_caller) plugin is installed, allow scoped applications to restrict access
to public tables and script includes.
--None--: No restrictions on access.
Caller Restriction: Do not allow access unless an admin approves access by the scope.
Caller Tracking: Allow access but track which scopes access the Script Include.
Accessible from: Choose This application scope only or All application scopes. Specifies the scope(s)
that can use the Script Include.
Active: Select if the Script Include is executable. If this option is not selected the Script Include will not
run even if called from another script.
Description: (optional but highly recommended) Documentation explaining the purpose and function of
the Script Include.
Protection policy: If set to Read-only, instances on which the application is installed from the
ServiceNow Store (https://store.servicenow.com/sn_appstore_store.do) can read but not edit the Script
Include. If set to Protected, the Script Include is encrypted on instances on which the application is
installed from the ServiceNow Store (https://store.servicenow.com/sn_appstore_store.do). Protection policies
are never applied to the instance on which an application is developed.

### BÀI VIẾT (25 TRÊN 36)

On Demand Script Include
A Script Include that defines a single function is known as an on demand, or classless, Script Include. The
function is callable from other server-side scripts. On demand Script Includes can never be used client-side
even if the Client callable option is selected.
A script template is automatically inserted into the Script field. The template does not apply to on demand
Script Includes. Delete the template and replace it with your function definition. The Script Include function is
defined using standard JavaScript syntax. The example shows an on demand Script Include:
The Script Include name must exactly match the name of the function. In the example, both the Script Include
and the function are named sumTwoNums.
The on demand Script Include is usable by any other server-side script allowed by the Accessible from option.
In the example, the Script Include is callable only from NeedIt application server-side scripts. The example
Business Rule script uses the sumTwoNums on demand Script Include:
Although the sumTwoNums function is not defined in the Business Rule script, the function exists because it
is defined in the Script Include.
On demand Script Includes are typically used when script logic needs to be reused. Examples include
standardizing date formats, enabling/disabling logging, and validating email addresses.

### BÀI TẬP (26 TRÊN 36)

Exercise: On Demand Script Include
In this exercise, you will write an on demand Script Include to validate email address syntax. The Script
Include can be used by any scoped application and not just the NeedIt application.
Chuẩn Bị
**1.** Add a string field to the NeedIt table to store an email address.
**2.** In Studio, use the Application Explorer to open Forms & UI > Forms > NeedIt [Default view].
**3.** In the Field Navigator, switch to the Field Types tab.
**4.** Locate the String data type in the Field Types tab. Drag the String data type to the NeedIt form. Drop the
String data type beneath the Requested for field.
**5.** Hover over the new field and click the Edit Properties button (
) to configure the new field.
**6.** Configure the field:
**1.** Label: Requested for email
Name: u_requested_for_email
Max length: 40
Mandatory: Selected (checked)
**7.** Close the Properties dialog by clicking the Close button (
**8.** Click the Save button in the Form Design header to add the field to the NeedIt table in the database.
Write the On Demand Script Include
**1.** Create a Script Include.
**2.** In the Filter... field enter the text Script OR select Server Development from the categories in the
left hand pane.
**3.** Select Script Include in the middle pane as the file type, then click the Create button.
**2.** Configure the Script Include:
**1.** Name: validateEmailAddress
API Name: (this field value is automatically populated)
Application: (this field value is automatically populated)
Accessible from: All application scopes
Description: On demand Script Include to validate email address syntax using regular
expressions.
**3.** Delete the template from the Script field. Copy the script and paste it into the Script field.
function validateEmailAddress(emailStr){

```javascript
// Use JavaScript coercion to guarantee emailStr is a string
```

emailStr = emailStr + '';

```javascript
// Compare emailStr against the allowed syntax as specified in the regular expression
// If emailStr has allowed syntax, return true, else return false
if(emailStr.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,
```

return true;

```javascript
else {
```

return false;
GHI CHÚ: You may see two debugger warning messages about syntax in the regex expression. The warnings are ignorable; the
script runs correctly. If you copy and paste the script, you may also see an ignorable warning about mixed tabs and spaces.
Use the Script Include in a Business Rule
**3.** Select Business Rule in the middle pane as the file type then click the Create button.
**1.** Name: Email Address Syntax Validate

```javascript
// Pass the Requested for email to the Script Include. Store the return
// value from the Script Include in the isEmail variable
```

var isEmail = validateEmailAddress(current.u_requested_for_email);

```javascript
// If isEmail is false (email address syntax is not valid) do not save
// the record. Write an error message to the screen.
if(isEmail == false){
gs.addErrorMessage(current.u_requested_for_email + " is not a valid email address. You
```

Test the Business Rule and Script Include
**1.** Switch to the main ServiceNow browser window and use the browser's refresh button to reload
ServiceNow.
**2.** Create a NeedIt record or open an existing NeedIt record for editing.
**3.** Enter an invalid email address, such as hello, in the Requested for email field.
**4.** Click the Additional actions menu (
) and select the Save menu item. Do not click the Submit or Update buttons because that will take you
away from the form.
**5.** Examine the error message.
**6.** Enter a different invalid email address, such as an address with no .com at the end, in the Requested for
email field.
**7.** Click the Additional actions menu (
) and select the Save menu item.
**8.** Enter an email address with valid syntax in the Requested for email field.
**9.** Click the Additional actions menu (
) and select the Save menu item. There should be no error message.

### BÀI VIẾT (27 TRÊN 36)

Extend a Script Include
Script Includes can extend existing Script Includes by adding new methods and non-method properties.
Although most ServiceNow classes are extensible, the most commonly extended classes are:
GlideAjax: make AJAX calls from Client Scripts
LDAPUtils: add managers to users, set group membership, debug LDAP
Catalog*: set of classes used by the Service Catalog for form processing and UI building
The generalized Script Include script syntax for extending a class is:
By convention, but not required, Script Include names start with an uppercase letter and are camel case
thereafter. This type of capitalization is sometimes referred to as upper camel case. The Script Include name
and the new class name must be an exact match.
If the class being extended is from another scope, prepend the class name with the scope. For example, if
NameOfClassYouAreExtending is in the global scope, reference it as global.NameOfClassYouAreExtending
in the scoped Script Include.
When creating a Script Include, a template is automatically inserted in the Script field:
The Script Include template prototype must be modified when extending a Script Include.
Notice that the template includes an initialize function. When extending Script Includes, be cautious about
overriding methods from the parent class such as the initialize function.

### BÀI VIẾT (28 TRÊN 36)

Mở Rộng GlideAjax
The GlideAjax class is used by client-side scripts to send data to and receive data from the ServiceNow
server. The client-side script passes parameters to the Script Include. The Script Include returns data as XML
or a JSON object. The client-side script parses data from the response and can use the data in subsequent
script logic.
The NeedIt form has a reference field called Requested for. The Requested for field references a record on
the User [sys_user] table. The User table has a column called Email, which stores a User's email address.
Recall that client-side scripts have access only to data from the fields on a form. Although the NeedIt form has
a field that references the User table, it does not have access to the Requested for's email address which is
stored in the database. This example will extend the GlideAjax class. The new class will be passed a sys_id
for the User table and will retrieve and pass back the user's email address.
GlideAjax is used by g_form methods like getReference(). The getReference() method is passed a sys_id and
returns that record as a GlideRecord. The new class created in this demonstration is passed a sys_id and
returns only an email address and not an entire record. Although the performance difference between
returning an entire record and a single value may seem negligible, performance is based on all the calls
occurring on a form and not a single call. If multiple scripts save time, the cumulative effect can be noticeable.
Script Include for Retrieving an Email Address
The Script Include must be client callable because it will be used by client-side scripts.
The AbstractAjaxProcessor class is part of the Global Scope. The GetEmailAddress Script Include is in the
NeedIt scope. To extend the AbstractAjaxProcessor, the class must be prepended by the scope:
global.AbstractAjaxProcessor. The new class defines a method called getEmail.
The syntax this.getParameter('sysparm_<parameter_name>') means to get the value of the parameter
passed in from the client-side script. In this example, sysparm_userID contains the sys_id of a User table
Client-side Script for Using the GetEmailAddress Script Include
Any in-scope client-side script can use Script Includes which extend the AbstractAjaxProcessor. The
generalized syntax is:
The first call to addParam() should be for the parameter sysparm_name and should pass as the value the
name of the server-side method you want to call. Use addParam to pass user-defined parameters starting
with sysparm_ and their values. Users can create their own sysparm_ variables except sysparm_name,
sysparm_type, sysparm_function, and sysparm_value.
The getXML method sends the server a request to execute the method and parameters associated with this
GlideAjax object. The server processes the request asynchronously and returns the results via the function
specified as the callback function. This example, which uses a callback function, is asynchronous meaning
that the user's screen is not frozen while the script waits for a response to come back from the server.
Asynchronous GlideAjax is recommended over synchronous.
The callback function is passed the response back from the server. The script logic extracts the return value
from the response. Subsequent script logic can use the extracted value.
The example shows the client-side logic for using the GetEmailAddress Script Include:
For information about returning multiple values or JSON objects, see the Return multiple values from
GlideAjax (https://community.servicenow.com/community?
id=community_question&sys_id=81b1db6ddbdcdbc01dcaf3231f96190d) article on the ServiceNow community site.

### BÀI TẬP (29 TRÊN 36)

Exercise: Extend GlideAjax
In this exercise, you will write a Script Include to create a client-callable Script Include by extending GlideAjax.
The new Script Include retrieves the Requested for's email address from the User table.
Create the Script Include
**3.** Select Script Include in the middle pane as the file type then click the Create button.
**1.** Name: GetEmailAddress
Client callable: Selected (checked)
Accessible from: This application scope only
Description: Script Include to return an email address. The calling client-side script passes a
sys_id for a User table record.
**3.** Delete the template from the Script field. Copy this script and paste it into the Script field.
var GetEmailAddress = Class.create();

```javascript
// Extend the global.AbstractAjaxProcessor class
```

GetEmailAddress.prototype = Object.extendsObject(global.AbstractAjaxProcessor,{

```javascript
// Define the getEmail function.
// Create a GlideRecord for the User table.
// Use the sysparm_userID passed from the client side to retrieve a record from the User table.
// Return the email address for the requested record
```

getEmail: function() {
var userRecord = new GlideRecord("sys_user");
userRecord.get(this.getParameter('sysparm_userID'));
return userRecord.email + '';
type: 'GetEmailAddress'

```javascript
});
```

Create the Client Script
**1.** Create a Client Script.
**2.** In the Filter... field enter the text Client OR select Client Development from the categories in the
**3.** Select Client Script in the middle pane as the file type then click the Create button.
**2.** Configure the Client Script:
**1.** Name: NeedIt Populate Email Field
UI Type: Desktop
Type: onChange
Field name: Requested for
Description: Use the GetEmail Address Script Include to retrieve the Requested for's email
address from the database when the Requested for value changes.
function onChange(control, oldValue, newValue, isLoading, isTemplate) {

```javascript
// Modified the if to return if the newValue == oldValue to avoid
// unecessary trips to the server
if (isLoading || newValue === '' || newValue == oldValue) {
// Instantiate the GetEmailAddress Script Include
```

var getEmailAddr = new GlideAjax('GetEmailAddress');

```javascript
// Specify the getEmail method
```

getEmailAddr.addParam('sysparm_name','getEmail');

```javascript
// Pass the Requested for sys_id
```

getEmailAddr.addParam('sysparm_userID', g_form.getValue('u_requested_for'));

```javascript
// Send the request to the server
```

getEmailAddr.getXML(populateEmailField);

```javascript
// When the response is back from the server
```

function populateEmailField(response){

```javascript
// Extract the email address from the response, clear any value from the email field,
// set new value in the email field
```

var emailFromScriptInclude = response.responseXML.documentElement.getAttribute("answer")

```javascript
g_form.clearValue('u_requested_for_email');
g_form.setValue('u_requested_for_email',emailFromScriptInclude);
```

Test the Client Script and Script Include
**1.** Switch to the main ServiceNow browser window and use the browser reload button to reload
**2.** Open an existing NeedIt record for editing (for this part of the exercise, do not create a new record).
**3.** Change the value in the Requested for field to Fred Luddy.
**4.** The Requested for email field value should change to fred.luddy@example.com. If not, debug using the
debugging strategies explained earlier in this module. If you see a message about cross-scope
privileges, it was caused by ServiceNow detecting allowed use of an out-of-scope file
(AbstractAjaxProcessor). You will see the message only once.
**5.** Change the value in the Requested for field to Beth Anglin. The value in the Requested for email field
should change again.
**1.** Create a NeedIt record.
**1.** Examine the Requested for field and notice it has a value.
**2.** Examine the Requested for email field and notice it does not have a value.
**2.** Modify the Client Script logic so the Requested for email field is also populated for new NeedIt records.
You may find the GlideForm isNewRecord() (https://developer.servicenow.com/app.do#!/api_doc?
v=utah&id=r_GlideFormIsNewRecord) method useful. Do not simply remove the isLoading check from the if
statement in the existing Client Script. Removing this check means the Script Include is called every time
the NeedIt form loads. Round trip calls to the server are "expensive" from a load time perspective and
should be avoided if possible.

### BÀI VIẾT (30 TRÊN 36)

Utilities Script Include
Although not required, many applications have one or more Script Includes to store the majority of the
application's server-side logic. If there is a single Script Include for an application, it is often named <App
Name>Utils. For example, NeedItUtils. If a Script Include becomes long and hard to manage, consider
breaking it up into multiple Script Includes based on functionality or logical groupings.
Utilities Script Includes typically define a new class and therefore use the automatically inserted script
template.
The initialize function is automatically invoked when JavaScript objects are instantiated from the Script
Include. Any variable defined as part of the this object in the initialize function is known to all other functions in
To use a Utils Script Include in other server-side scripts, instantiate the Script Include. Any script which
instantiates the Script Include has access to the methods and non-method properties from the class.
The value of x is written to the Application Log.

### BÀI TẬP (31 TRÊN 36)

Exercise: Create the NeedItUtils Script Include
In this exercise, you will move the date verification logic you wrote in the NeedIt When needed field date
Business Rule lab into a Script Include. You will call the Script Include method from the Business Rule.
**1.** Name: NeedItUtils
Description: Utils Script Include for the NeedIt application.
**3.** Copy the isDatePast function. Paste it into the Script Include after the initialize function and before the
type property.
isDatePast: function(strDate){

```javascript
// Create GlideDateTime objects for the current date and the passed in date
```

var testdate = new GlideDateTime(strDate);

```javascript
// If the testdate is before rightnow, return true, else return false
if (testdate.before(rightnow)) {
```

Modify the NeedIt When needed field date Business Rule
**1.** In Studio, use the Application Explorer to open Server Development > Business Rules > NeedIt When
needed field date.
**2.** Delete the script logic for testing if the When needed date is in the past:

```javascript
gs.addErrorMessage("When needed date cannot be in the past. Your request has not been saved to th
```

**3.** Copy and paste the new script logic into the Business Rule:

```javascript
// Instantiate the NeedItUtils class. Call the isDatePast method and pass
// the u_when_needed value.
```

var niutils = new NeedItUtils();
var isPast = niutils.isDatePast(current.u_when_needed);

```javascript
// If the isDatePast method returns true, the date is in the past.
if(isPast == true){
```

**4.** Nhấp nút Update.
Test the Script Include and Business Rule
**1.** Return to the main ServiceNow browser window.
**2.** Use the All menu to open NeedIt > Create New.
**3.** Put values in all mandatory fields and set the When needed field date in the past.
**5.** You should see an error message stating that the When needed date cannot be in the past. If you do not
see the error message, debug and re-test. NOTE: If you worked the Challenge part of Exercise: Create a
Business Rule, that logic might now be broken.
If you worked the Challenge part of Exercise: Create a Business Rule:
**1.** Add a function, isDateToday, to the NeedItUtils Script Include. Move the logic to determine if the When
needed date to the isDateToday function.
**2.** Make any modifications necessary to the NeedIt When needed field date Business Rule to use the
isDateToday method.
If you did not work the Challenge part of Exercise: Create a Business Rule you can still do this Challenge:
**1.** Add a function called isDateToday to the NeedItUtils Script Include. Write logic to determine if the When
needed date is after today.
**2.** Add whatever logic is necessary to the NeedIt When needed field date Business Rule to use the
isDateToday method to test whether the When needed date is today. Do not allow users to save new
records if the When needed value is today.

### BÀI VIẾT (32 TRÊN 36)

Other Server-side Script Types
In this module you have learned to write, test, and debug Business Rules and Script Includes. There are
many other types of server-side scripts. The primary difference between the script types is what triggers the
script logic execution.
The table shows some commonly used server-side script types.
Script Type Executes on Description Often used to
Execute logic when records are queried,Validate data or set fields on other records in
Business Rule Database access
updated, inserted, or deleted.response to fields on the current record.
Validate format, retrieve shared records, and
Script Include Must be explicitly called A library of reusable functions.
work with application properties.
Send email notifications or write logging
Script Action Events Respond to an event.
information.
Create reports: send daily, weekly, monthly,
Scheduled Script
quarterly, and annual information. Execute
Execution (alsoScript logic executed on a time-based
Time script logic only on weekdays or weekends.
known as aschedule.
Can also be run on demand so sometimes
Scheduled Job)
used for testing.
Enable users to perform actions such as
Add buttons, links, and context menu
navigating to another page, modifying
UI Actions Usersitems to forms and list to allow users to
records, or allowing operations such as
perform application-specific operations.
saving.
Execute server-side code on demand
admin users only (somefrom a selectable scope. Scripts -
Scripts -
instances require theBackground should be used with cautionTest scripts.
Background
security_admin role)because badly written scripts can
damage the database.
Application installationMake changes that are necessary forCreate or modify groups or user
Fix Scripts
or upgradethe data integrity or product stability.authorizations.
Execute when emails are generated toAdd a CC or BCC email address, or query
Notification Email
Notificationadd content to the email content orthe database and write information to the
Script
configuration.message body.
Request sent or
Return value(s) or a JSON object based on a
Scripted REST APIsreceived through webDefines a web service endpoint
calculation or database lookup(s)
services
UI Page Processing
Users Executes when a UI Page is submitted. Validating data, setting values etc.
Standardize date formats, fill in missing data,
Transform MapModifies or copies data or data formatstandardize values, map incoming values to
Data import
Script when records are imported.database values for choice lists, set default
values.
You can practice using additional server-side script types in other courses and learning modules on the
ServiceNow developer site.

### BÀI TẬP (33 TRÊN 36)

Exercise: Save Your Server-side Scripting Module
Work (Optional)
Source control applications, like GitHub, allow developers to commit changes (save completed work) outside
of the Personal Developer Instance (PDI). Commit changes made to the application to save your work in
source control.
In this exercise, you will save the work completed in this module to your GitHub repository.
để lưu công việc.
Commit Thay Đổi
**1.** If the NeedIt application is not open in Studio, open it now.
**2.** In the Select Application dialog, click the application.
**2.** Mở menu Source Control và chọn mục Commit Changes.
**3.** Chọn các cập nhật để commit.
**1.** In the Select files to commit to source control for <Application> dialog, select All Update Sets.
**2.** Xem lại các file ứng dụng sẽ được commit.
**3.** Nhấp nút Continue.
**4.** In the Confirm files to commit to source control for NeedIt dialog, enter a Commit comment, such as
Server-side Scripting Module Completed.
**5.** Nhấp nút Commit Files.
**6.** Khi hộp thoại Commit Changes báo thành công, nhấp nút Close.
GHI CHÚ: If the commit change fails, you may have entered the ServiceNow repository URL instead of the forked repository
URL in the URL field. See the Troubleshooting GitHub Issues (/dev.do#!/guide/utah/now-platform/github-guide/troubleshooting-
github-issues) section in the GitHub Guide for instructions on troubleshooting GitHub connection issues.

### BÀI VIẾT (34 TRÊN 36)

Kiểm Tra Kiến Thức Lập Trình Phía Server
Muốn xác minh sự hiểu biết về lập trình phía server? Những câu hỏi này sẽ giúp bạn đánh giá
tiến trình. Với mỗi câu hỏi, xác định câu trả lời rồi nhấp vào bất kỳ đâu trong câu hỏi để xem đáp án.

### BÀI VIẾT (35 TRÊN 36)

Tóm Tắt Module Lập Trình Phía Server
Khái Niệm Cốt Lõi:
Server-side scripts execute on the ServiceNow server and have access to the database
Business Rules are triggered by database operations: query, update, insert, and delete
Server-side script APIs include:
Business Rule script logic is executed relative to when the database operation occurs
Debug Business Rules using:
Script Tracer - Determine which server-side scripts execute as part of a UI interaction
JavaScript Debugger - debug script logic
Debug Business Rule (Details) - debug condition script
Application log - view log messages
Use the Script Tracer to find information about:
Use the JavaScript Debugger to debug synchronous server-side scripts
See variable values
Set breakpoints
Set logpoints
Use the Console to evaluate expressions in the runtime environment
View call stack
See transaction information
Script Includes are reusable server-side logic
On demand/classless Script Includes
Cannot be called from the client-side
Contain a single function
Script Includes which extend a class
Inherit properties of extended class
Do not override inherited properties
Most commonly extended class is GlideAjax
Script Includes which create a new class (does not extend an existing class)
Many applications have a Utils Script Include
Initialize function automatically invoked
Developers must create all properties

### BÀI VIẾT (36 TRÊN 36)

Sau Khi Hoàn Thành Lập Trình Phía Server, Bạn Có Thể
Quan Tâm Đến...
Congratulations on completing the Server-side Scripting module. Based on your interest in scripting, you
might also enjoy:
Data Policies (https://developer.servicenow.com/to.do?u=SSS-U-MOD-DAP): In this Developer Site learning
module, you will learn to write, test, and debug Data Polices.
GlideRecord Queries (https://developer.servicenow.com/to.do?u=SSS-U-BLG-GRQuery): In this Developer Site
blog, you will get additional practice writing GlideRecord queries.
GlideRecord get (https://developer.servicenow.com/to.do?u=SSS-U-BLG-GRget): In this Developer Site blog,
you will create GlideRecord queries that use the get() method.
GlideRecord Encoded Queries (https://developer.servicenow.com/to.do?u=SSS-U-BLG-GREncodedQuery): In
this Developer Site blog, you will get practice writing GlideRecord encoded queries. Encoded queries are
useful when there are many query conditions or the conditions mix ANDs and ORs.
GlideAggregate Counts (https://developer.servicenow.com/to.do?u=SSS-U-BLG-GlideAggregateCounts): In this
Developer Site blog, you will use GlideAggregate to count records returned by a query.
Server-side Scripting Technical Best Practices (https://developer.servicenow.com/to.do?u=SSS-U-TBP-
ScriptingTBP): In this Developer Site Technical Best Practices Guide, you will learn best practices for
scripting on the Now Platform.
Server-side Scripting Documentation (https://developer.servicenow.com/to.do?u=SSS-U-DOC-
ServerSideScripting): On the ServiceNow docs site, you will find the complete set of reference material for
server-side scripting.

---

## 4. Giới Thiệu Service Portal

Phiên bản: Zurich
NHÀ PHÁT TRIỂN ỨNG DỤNG SERVICENOW
Giới Thiệu Service Portal

### BÀI VIẾT (1 TRÊN 33)

Mục Tiêu Giới Thiệu Service Portal
Trong module này, bạn sẽ học:
Tạo và cấu hình portal
Sử dụng Designer để tạo trang portal
Thêm containers và layouts vào trang portal
Thêm widgets vào trang portal
Thiết lập widget options
Xem trước trang portal trong quá trình phát triển
Xem trước trang ở các kích thước thiết bị khác nhau
Tạo branding và chủ đề cho portal
Đây là portal bạn sẽ tạo và kiểm thử.

### BÀI VIẾT (2 TRÊN 33)

Về Module Học Tập Này
QUAN TRỌNG: The content in this learning module was last updated for the San Diego ServiceNow release and was not
updated for the Utah release. You may see differences between the Utah release and the content in this learning module.
Service Portal được sử dụng xuyên suốt module học tập này để giới thiệu và minh họa các khái niệm và
quy trình tạo portal. Bạn không xây dựng Service Portal.
Bạn sẽ phát triển portal Portal Meum trong các bài tập thực hành.
Bài tập được chỉ ra theo ba cách:
Biểu tượng Bài tập trong khung Điều hướng.
Biểu tượng Bài tập và chữ Exercise ở đầu trang.
Chữ Exercise hoặc chữ Challenge trong tiêu đề trang.
Portal Portal Meum cho phép người dùng đặt dịch vụ và mặt hàng, truy cập Cơ sở kiến thức, và yêu cầu
trợ giúp từ đội hỗ trợ.

### BÀI VIẾT (3 TRÊN 33)

Portal Là Gì?
Portal là giao diện người dùng (UI) ServiceNow, được xây dựng bằng framework Service Portal, cung cấp
trải nghiệm người dùng thay thế cho UI chuẩn. Đây là cách trực quan để người dùng tương tác với
Now Platform sử dụng số lần nhấp tối thiểu từ bất kỳ thiết bị nào: desktop, tablet, hoặc smartphone. Portals
allow users to access any platform component including:
Selected records from important tables, such as all tasks assigned to the user
Metrics, reports, and analytics
Service Catalog
Cơ sở kiến thức
Surveys
User profile
Phê duyệt
And more!
A portal is easily branded and themed to match your organization's branding.

### BÀI VIẾT (4 TRÊN 33)

Portal Anatomy
Users access a portal using a URL or a module. An example URL is:
ServiceNow administrators can configure a portal to be a user's landing page when they log in to ServiceNow.
Trang
Each portal is made up of one or more pages. Pages are not unique to a portal and can be used in as many
portals as needed. A portal applies theming, a header, a footer, and some additional metadata to a page,
allowing reuse without changes to a page's definition.
An example portal homepage:
An example portal Get Help page:
Containers
Portal pages are organized by containers. Containers create the page layout by organizing pages into
sections. Containers are divided into rows. Containers typically contain a single row but can have multiple
rows. Each row has a specified number of columns. Each row can contain a different number of columns.
Widgets
Widgets define the content for a portal. The default portal container shown is one row which contains three
columns. Although in this example, each column contains two widgets, each column can contain any number
of widgets.

### BÀI TẬP (5 TRÊN 33)

Exercise: Explore a Portal
In this exercise, you will explore a baseline portal in order to understand the organization and layout of the
portal. You will experience the portal as an end user.
GHI CHÚ: If your PDI automatically opens App Engine Studio, you need to change the user role used to access the PDI. To
complete the exercises, switch to the Admin user role (https://developer.servicenow.com/dev.do#!/guides/utah/developer-program/pdi-
guide/managing-your-pdi#changing-your-instance-user-role).
Open the Portal
**1.** Log in to your ServiceNow instance as the admin user.
**2.** To open the baseline portal, modify the instance URL by adding /sp to the end. Note: In a common use
case, users would automatically be taken to the portal when logging in to ServiceNow; they would not
need to type the portal name at the end of the URL.
Explore the Portal
**1.** Try the How can we help? search field.
**1.** Type the word virus in the search field.
**2.** Press the <return> key on the keyboard or click the Search button (
).
**3.** Click the link for the Dealing with Spyware and Viruses article.
**4.** The Dealing with Spyware and Viruses article is part of the Knowledge Base. Examine the article's
page to see what is on the page besides the article text. For example, can you tell how many times
the article has been viewed?
**5.** Return to the homepage by clicking Home in the breadcrumbs.
**2.** Order one box of pens using the Request Something widget.
**1.** On the portal homepage, click the Request Something link.
**2.** In the Categories widget, click Office.
**3.** Click the Paper and Supplies card.
**4.** In the Pens (box of 10) choice list, select 1 box of pens.
**3.** Click the Order Now button.
**1.** In the Order Confirmation dialog, click the Checkout button.
**2.** Check the Request status by clicking Requests in the banner.
**4.** Open the Paper and Supplies request.
**1.** Examine the request to see if you can tell when you can expect to receive the pens.
**2.** Return to the portal homepage by clicking Home in the breadcrumbs.
Thử Thách
Use the Get Help widget to report an outage for email. Populate the outage form fields with the values of
your choice. After reporting the outage, use the Requests link in the banner to find the status of the outage
report.
Exit the Portal and Return to the Main ServiceNow Window
**1.** Exit the portal and return to the ServiceNow landing page by removing /sp (and anything to the right of
that) from the URL.

### BÀI VIẾT (6 TRÊN 33)

Service Portal Framework
The Service Portal framework is a set of tools, APIs, AngularJS services and directives, and components
used to create portals. The Service Portal Framework helps developers and non‑technical administrators
create attractive and engaging user experiences which drive employee adoption of critical enterprise
applications.
Service Portal Configuration
To access the Service Portal framework tools, in the main ServiceNow browser window, use the All menu to
open Service Portal > Service Portal Configuration. The Service Portal configuration page opens in a new
tab and contains:
Branding Editor: Apply your company's branding to the portal including logo, background, and color
scheme.
Designer: Create page layouts by adding or modifying containers, rows, columns, and widgets.
Page Editor: Use a hierarchical map to view or edit page elements.
Widget Editor: Create or edit widgets.
New Portal: Create a Service Portal.
Get Help: View the Service Portal documentation on docs.servicenow.com.

### BÀI VIẾT (7 TRÊN 33)

Create a Portal
To create a portal, click the New Portal tile on the Service Portal Configuration page.
Configure the portal. Asterisks indicate mandatory fields.
*Title: The portal name. In the browser header and for bookmarks, the title appears as <Portal Title> -
<Page Title>.
*URL suffix: URL for accessing this portal. For example, /my_portal.
Homepage: The pages users see first when they sign in.
KB home page: The homepage users see when they go to a Knowledge Base.
Login page: The page used to authenticate users.
Application: The application scope this portal will be created in. The value is set in the Application Picker
and is not editable on the form.
404 page: The default page users see whenever a page cannot load properly. This value can also be
defined in the system property glide.service_portal.default_404_page.
Catalog home page: Service Catalog page users see when they select Service Catalog.
Main menu: The menu which appears in the header.
Theme: Refers to a theme in the sp_theme table which defines the style and branding for the portal. The
theme is the lowest level of style configuration and any changes made in the Branding Editor or to
specific portal components (such as widget or page CSS) override those styles.
Logo: Logo that appears in the page header. You can also configure the logo in Branding Editor.
Icon: The icon which appears in the address bar for your portal. Each portal you create can have a
different icon.
Default: When selected (checked), this portal is treated as your primary portal.
Quick start config: Configuration settings generated by Branding Editor.
CSS variables: Portal-specific Sass variables. You can overwrite existing theme variables in here.
Related Lists are available after the New Service Portal has been saved.
Search Sources related list: The records to search when searching in the portal.
Knowledge Bases related list: The Knowledge Bases associated with the portal. The Knowledge base
widget displays data for the selected Knowledge Bases.
Catalogs related list: The Service Catalogs to use in the portal. Listed in the sc_catalog table.
MẸO CHO DEVELOPER: When creating Portals, specify which Knowledge Bases and Catalogs to include. If no Knowledge Bases or
Catalogs are specified for a portal, the portal uses all Knowledge Bases and all Catalogs.

### BÀI TẬP (8 TRÊN 33)

Exercise: Create a Portal
In this exercise, you will create a portal using baseline pages. You will add a logo and background image. You
will modify the portal configuration in other exercises in this module.
Chuẩn Bị
**1.** Download the files you will use in the new portal.
**1.** Download logo.png. (/dev_download.do?
sysparm_filename=files/logo.png&sysparm_project=app_store_learnv2_serviceportal_zurich)
Download icon.png.
**2.** Use the online translator of your choice, such as translate.google.com, to find the meaning of the Latin
phrase Portal Meum.
**3.** Although not required, you will create a portal in the Global scope. If you have been working on other
training courses on the ServiceNow Developer Site, you may have your scope set to something other
than Global (like Innovate, NeedIt, or Special Occassions). Make sure the scope is set to Global.
**1.** In the main ServiceNow browser window, examine the Application Scope icon (
) in the banner. If there is a red circle around the icon, the scope is not Global.
**2.** Click the Application Scope icon.
**3.** If the Application scope: is Global, skip to the next section of this exercise.
**4.** IF the Application scope is not Global, click the Application scope field.
**5.** In the Application scope flyout, select Global.
Create and Configure a Portal
**1.** In the main ServiceNow browser window, use the All menu to open Service Portal > Service Portal
Configuration.
**2.** Click the New Portal tile on the Service Portal Configuration page.
**3.** Configure the new portal:
**1.** Title: Portal Meum
URL suffix: pm
Homepage: index
KB home page: kb_view2
404 page: 404
Catalog home page: sc_home
Main menu: SP Header Menu
Theme: Stock - High Contrast
**4.** Add a logo to the portal.
**1.** In the Logo field, click the Upload an image button.
**2.** In the file browser, navigate to the logo.png file you downloaded in the Preparation section of this
exercise. Select the logo.png file.
**3.** Click the Open or OK button (browser dependent).
**5.** Add an icon to the portal.
**1.** In the Icon field, click the Upload an Image button.
**2.** In the file browser, navigate to the icon.png file you downloaded in the Preparation section of this
exercise. Select the icon.png file.
**6.** Nhấp nút Save.
Test Portal Meum
**1.** In a new browser tab or window, open Portal Meum:
**2.** Examine Portal Meum. It should look like the baseline portal you examined in an earlier exercise except:
**1.** The rocket logo should be in the banner.
**2.** The rocket icon should be part of the tab title.
**3.** The text Portal Meum should be in the tab name.
**4.** The banner and other page elements are blue instead of green.

### BÀI VIẾT (9 TRÊN 33)

Portal Pages
A portal page houses containers, rows, and columns which then contain widgets. By designing the layout of
the page, and the widgets within it, developers construct the desired user experience. Pages are re-usable
across portals.
Developers can use any of the pages provided with Service Portal as a template or a starting point.
Service Portal includes baseline pages such as the portal landing page:
A baseline 404 (Page not found) portal page is also included:

### BÀI VIẾT (10 TRÊN 33)

Create a Page
To create a portal page, click the Designer tile on the Service Portal Configuration page. The arrow on the tile
indicates Designer opens in a new browser tab.
In Service Portal Designer, click the Add a new Page link.
Enter a Page title and a Page ID.
Page title: Appears in the tab text and bookmarks as <Portal Title> - <Page Title>
Page ID: Unique identifier for the portal page. Do not use spaces or special characters other than
underscores. ServiceNow suggests a Page ID value based on the Page title field. This value is editable.

### BÀI VIẾT (11 TRÊN 33)

Page Layout
A portal page layout is made up of containers, rows, and columns. Containers, rows, and columns give
structure to pages.
Containers divide a page into sections. To add a container to a page, drag a container from the Layouts to the
page.
Rows and Columns
Portal rows are divided into columns. The portal columns use the Bootstrap grid system which divides every
row into 12 columns. (Learn more about the Bootstrap Grid System
(https://getbootstrap.com/docs/4.0/layout/grid/).) Each portal row layout specifies how many columns the row
contains and the width of each column. Portal column width is indicated by how many grid columns the portal
column spans.
To add a row to a container, drag the row from the Layouts to a container.
In this example, the page layout has two containers. The first container has two rows:
One row with two columns
One row with three columns
The second container has no rows yet.
GHI CHÚ: The row columns have been emphasized in the screenshot for clarity. The column indicators in Page Designer are grey
with thinner lines.

### BÀI VIẾT (12 TRÊN 33)

Configure Container Properties
To configure a container's properties, select the container. A blue rectangle and dark gray shading indicate the
container is selected. Click the Edit Container Properties button.
Configure the container's properties.
Name: The name of the container using the format: <page name> - <container number>.
Order: Order in which the container appears on the page.
Page: Page ID for the container's page.
Screen reader title: Alternate title for the container which is read by screen readers for accessibility.
Width: Specify whether the container's width is fixed or fluid. A fluid layout adjusts container elements in
response to browser width.
Parent class: Specify a CSS parent class to inherit its styling.
CSS class: CSS for the container. Can be a parent class or CSS class.
Background color: Specify a color for the container's background. Pick a color using the color selector
or enter a color in hexadecimal (hex). For example, #000000 is hex for the color black.
Background image: Specify an image to be the container's background. Text and other fields render on
top of the image.
Background style: Choose a value to set how the image appears in the container.
Bootstrap alternative: Select this option to remove all Bootstrap styling from the container.
Move to header: Select this option to pin the container to the header. Containers with this option
selected do not scroll off the page when users scroll down on the page.

### BÀI TẬP (13 TRÊN 33)

Exercise: Create a Page
In this exercise, you will create a portal page. You will also create the page layout by adding containers, rows,
and columns to the page.
**1.** If the Service Portal Configuration page is not still open, in the main ServiceNow browser window, use
the All menu to open Service Portal > Service Portal Configuration.
**2.** Click the Designer tile on the Service Portal Configuration page.
**3.** Click the Add a new Page link.
**4.** Configure the page:
**1.** Page title: Portal Meum Homepage
Page ID: pm_index
**5.** Nhấp nút Submit.
Set Portal Meum as the Active Portal
Although portal pages are reusable across portals, some operations in the Service Portal Designer, such as
applying a theme and header to the page, require setting the active portal.
**1.** Examine the Service Portal Designer header to see which portal is active. If the active portal is pm, skip
to the next section of this exercise.
**2.** If Portal Meum (pm) is not the active portal, click on the portal name to select a new portal.
**3.** Click Portal Meum to select it as the active portal.
**4.** Examine the Service Portal Designer header again to see which portal is active. You should see pm as
the active portal.
Add Containers and Rows to the Page
**1.** The default page layout includes one container. Add two more containers to the page.
**1.** Drag a container from the Layouts to the page.
**2.** Add another container to the page for a total of three containers.
**2.** Add a row with a single column spanning all 12 grid columns. Drag the 12 layout item from the Layouts
to the first container.
**3.** Add a row with a 3-column, equally sized columns layout to the second container.
**4.** Add a row with a 3-column, unequally sized column layout to the third container.
**5.** Compare your work against the layout shown. The row columns have been emphasized in the
screenshot for clarity. The column indicators on your screen will be grey with thinner lines. Make any
corrections necessary to make your layout match the image.

### BÀI VIẾT (14 TRÊN 33)

Widgets are reusable components that make up the functionality of a portal page. They consist of HTML
markup, CSS, a JavaScript controller, and client-side and server-side code. Widgets define what a portal
does and what information a user sees. ServiceNow provides a large number of baseline widgets. Examples
include:
Yêu cầu của tôi
Carousel
Nội dung catalog
Câu hỏi phổ biến
Tìm kiếm
Một số widget ví dụ:
Developers can create their own widgets. To learn about creating custom widgets, check out our Creating
Custom Widgets
(https://developer.servicenow.com/dev.do#!/learn/courses/utah/app_store_learnv2_serviceportal_utah_service_portal/app_
training module.

### BÀI VIẾT (15 TRÊN 33)

Add Widgets to a Page
After defining the page layout using containers, rows, and columns, add widgets to the page. Drag widgets
from the Widgets list to a target column on the page. A grey highlight indicates a valid location to place a
widget.
Columns can contain one or more widgets as required by the design. The example shows three columns:
Columns one and two contain one widget each.
Column three contains two widgets.

### BÀI VIẾT (16 TRÊN 33)

Widget Options
Many widgets have user configurable options. The option fields and their possible values depend upon widget
type. A list of baseline widgets and their configuration options (https://docs.servicenow.com/bundle/utah-
servicenow-platform/page/build/service-portal/concept/widget-showcase.html) is available on the ServiceNow
documentation site.
When a widget is added to a page, a unique instance of the widget is created. When setting widget options,
only that unique instance's options are changed. For example, setting the widget options for a Homepage
Search widget instance sets the options for that unique instance of the Homepage Search widget and NOT all
instances of the Homepage Search widget.
To edit widget options, click once on the widget to select it. To make sure the widget is selected:
Examine the breadcrumbs in the banner.
Look for the widget name in the upper left corner of the selected object.
Look for the widget name in the banner.
To edit the widget properties, click one of the Edit Widget Properties buttons.
The default Homepage Search widget configuration:
Customized Homepage Search widget configuration:
The default and customized Homepage Search widgets have different appearances but the same behavior.
Changing one widget instance's options does not affect any other instances of the same widget.
MẸO CHO DEVELOPER: Different widgets have different options.
Previewing Pages
After configuring widget options, preview the changes. To experience the widget as a user would, switch to
the Preview tab in Designer.
To continue editing, return to the Edit tab.

### BÀI TẬP (17 TRÊN 33)

Exercise: Add Widgets and Set Options
In this exercise, you will add widgets to a portal page. You will also set the container options for the first
container and the Homepage Search widget.
Add Widgets to the Page
**1.** If the Portal Meum Homepage is not still open for editing, open it now.
**1.** If the Service Portal Configuration page is not still open, in the main ServiceNow browser window,
use the All menu to open Service Portal > Service Portal Configuration.
**3.** Click the Portal Meum Homepage page to open it for editing.
**2.** Add a Homepage Search widget to the first container on the page.
**1.** In the widgets list, locate the Homepage Search widget.
**2.** Drag the Homepage Search widget to the first container. When the container row turns grey, drop
the widget.
**3.** Add widgets to the page by dragging them from the widgets list to the locations shown in the diagram.
Most of the columns contain a single widget. One of the columns contains two widgets. You have already
added the Homepage Search widget.
**4.** Compare your widget layout against the screenshot. Hover over the Icon Link widgets to see the widget
name.
Set Container Options
**1.** Download the background image file: background.png (/dev_download.do?
sysparm_filename=files/background.png&sysparm_project=app_store_learnv2_serviceportal_zurich).
**2.** Add the background image to the first container.
**1.** Click the first container to select it. Examine the breadcrumbs to make sure the container is
selected. The selected container is also indicated by dark gray shading.
**2.** Click the first container to select it. Examine the breadcrumbs to make sure the container is
selected.
**3.** Click the Edit Options button for the container.
**4.** Add the background.png image to the container's background.
**1.** In the Background image field, click the Upload an image button.
**2.** In the file browser, navigate to where you downloaded the background.png file. Select the file
then click the Open or OK (browser dependent) button.
**5.** The Background style option specifies how the image is rendered in the container relative to image
size. Set the Background style option to Cover.
**6.** Click the Save button to save the changes and close the container properties dialog.
Set the Homepage Search Widget Options
**1.** Click anywhere in the Homepage Search widget to select it. Examine the banner to make sure the
widget is selected.
**2.** Click the Edit Options button in the banner or in the widget.
**3.** Configure the Homepage Widget options.
**1.** Title: We are happy to see you here!
**4.** Click the Save button. The Homepage Search widget should look like this:
Test the Homepage Search Widget
**1.** In Page Designer, switch to the Preview tab.
**2.** In the How can we help? field (search field) enter a search term such as laptop.
**3.** Click the Search icon (
) or press the <return> key on your keyboard.
**4.** Browse through the search results.
**5.** When you are done examining the search results, switch back to the Edit tab in Page Designer.

### BÀI TẬP (18 TRÊN 33)

Exercise: Set Options for the Icon Link Widgets
In this exercise, you will set the options for the three Icon Link widgets. You will configure each Icon Link
widget differently so you can see the different appearance options. You will also apply CSS styling to a
container using a parent class.
**1.** In a new browser window or tab, open the baseline portal by adding /sp to the end of your instance URL.
Replace XXXXX with the number for your personal developer instance.
**2.** Remind yourself of the behavior of this part of the portal. Click each Icon Link widget to see what it
does.
**3.** Close the default portal browser window or tab.
Set Container Properties
ServiceNow has created CSS to give Icon Link widgets an attractive appearance. In this section of the
exercise you will add the CSS to the Icon Link widgets' container.
**1.** Select the second container on the Portal Meum Homepage page (contains the three Icon Link widgets).
**2.** Notice the appearance of the container, then edit the container options.
**1.** Click the Edit Options button for the container.
**2.** Configure the container:
**1.** Screen reader title: Quick Links to order something, access the Knowledge Base, and get
help
Parent class: homepage-quicklinks
**3.** Click the Save button to save the changes and close the options dialog.
Configure the Order Something Icon Link Widget
**1.** Click the first (leftmost) Icon Link widget to select it.
**2.** Click the Edit Options button (on the widget or in the banner).
**3.** Configure the Order Something widget.
**1.** Type: Page
Page: sc_home
Title: Order Something
Short description: Browse the catalog for services and items available to you
Bootstrap color: Primary
Glyph: usd (Use the Search icon field to search for usd)
Template: Top icon
**4.** Click the Save button to save the changes and close the Options dialog. The Icon Link widget should
look like this although your colors may be different:
Configure the Knowledge Base Icon Link Widget
**1.** Click the second (middle) Icon Link widget to select it.
**3.** Configure the Knowledge Base widget.
**1.** Type: KB Category
KB category: Policies
Page: kb_category
Title: Knowledge Base
Short description: Look for answers to your questions about corporate processes and policies
Glyph: eye
Template: Color Box
Challenge - Configure the Get Help Icon Link Widget
Configure the third Icon Link widget to look like this.
Here is a partial list of option values to get you started. Your challenge is to determine which other
options/values to set.
**1.** Type: Catalog category
Catalog category: Can We Help You?
Page: sc_category
Test the Icon Link Widgets
**2.** Click the Order Something Icon Link widget. Does the Service Catalog page open? If not, check the
Order Something Icon Link widget options and test again.
**3.** Click the Back button on your browser or the Home link in the breadcrumbs to return to the Portal Meum
homepage.
**4.** Click the Knowledge Base Icon Link widget. Does the Knowledge Base page open? Is the Policies
category selected? If not, check the Knowledge Base Icon Link widget options and test again.
**5.** Return to the homepage.
**6.** Click the Get Help Icon Link widget. Does the Can We Help You? page open? If not, check the Get Help
Icon Link widget options and test again.
**7.** Switch back to the Edit tab in Page Designer.
GHI CHÚ: In the typical case, all of the Icon Link widgets would be configured to look alike. In this exercise, you configured the
Icon Link widgets differently to explore the different options.

### BÀI TẬP (19 TRÊN 33)

Exercise: Set Options for the Simple List Widget
In this exercise, you will set the options for the Simple List widget to display a list of active Incident records
opened by the currently logged in user.
**1.** In the main ServiceNow browser window, (not the Service Portal configuration page), use the All menu to
open Incident > Open.
**2.** Create a filter to display only active Incident records created by the currently logged in user.
**1.** Click the Filter icon (
) to open the Filter Builder.
**2.** The condition Active is true should already exist in the Filter. Click the AND button (
) to add another filter.
**3.** Configure the new filter condition.
**1.** [Opened by] [is (dynamic)] [Me]
100%;"/>
**3.** Click the Run button to execute the filter (query).
**4.** Make a note of how many records are returned by the query.
**5.** Examine the breadcrumbs.
**6.** Copy the query for use in the Simple List widget configuration by right-clicking in the breadcrumbs on the
condition Opened by is System Administrator and selecting the Copy query menu item.
Challenge - Set Container Background Color
Using the skills you have developed in earlier exercises for setting container properties, set the Background
color for the third container (the container which contains the Simple List widget) to the value #EEECEF.
Configure the Simple List Widget
**1.** Click the Simple List widget to select it.
**3.** Configure the Simple List widget to display active Incident records opened by the currently logged in
user.
**1.** Table: Incident [incident]
Filter: paste in the query you copied in the Preparation section of this Exercise
Display field: Short description
Secondary fields: Number and Updated (after selection, the fields will be listed as number and
sys_updated_on)
Link to this page: ticket
Show even when empty: Selected (checked)
Glyph: list (fa-list)
Maximum entries: 7
**4.** Click the Save button to save the changes and close the Options dialog. The Simple List widget should
look like this. The Incident records and widget colors in your instance may be different than the example.
Test the Simple List Widget
**2.** Examine the list of incidents. Is this the same number of incidents you saw in the Preparation section of
this exercise?
**3.** Click one of the Incident records to see what happens.
**4.** Switch back to the Edit tab in Page Designer.

### BÀI TẬP (20 TRÊN 33)

Exercise: Cool Clock and the Other Widgets
In this exercise, you will set the options for the the Cool Clock and Report widgets. You will also explore the
other widgets you added to the page.
Configure the Cool Clock Widget
**1.** Click the Cool Clock widget to select it.
**3.** Configure the Cool Clock widget.
**1.** Time Zone: Leave at the default value of America/Los_Angeles
Title: Time at ServiceNow Headquarters in Santa Clara, California
Second hand color: #FFA500
**4.** Click the Save button to save the changes and close the Options dialog. The Cool Clock widget second
hand color should be changed. The example shows the Cool Clock widget before sunset. Between
sunset and sunrise, the clock face has a grey background instead of a white background.
Configure the Report Widget
**1.** Click the Report widget to select it.
**3.** Configure the Report widget.
**1.** Report: All Incidents by Category
Show title: Selected (checked)
**4.** Click the Save button to save the changes and close the Options dialog. The Reports widget should
show the report you selected.
Try the Organization Chart Widget
**2.** In the Organization Chart widget, use the Search field to look up Alissa Mountjoy.
**3.** Notice which department Alissa works in. Alissa's location in your instance may be different than the
location shown in the example.

### BÀI TẬP (21 TRÊN 33)

Exercise: Set Portal Homepage
In this exercise, you will set the Portal Meum Homepage as the homepage for the Portal Meum portal.
**1.** In a new browser window or tab, open the Portal Meum portal by appending /pm to the end of your
instance URL. Replace XXXXX with the number for your personal developer instance.
**2.** Notice which page you see. Is this the page you have been working on? When you created the portal,
the Portal Meum Homepage page did not yet exist. An existing page was configured to be the homepage
as a placeholder.
**3.** Close the browser window or tab.
Set the Portal Homepage
**1.** In Page Designer click the Edit portal properties button (
**2.** Change the Homepage field value to pm_index.
**3.** Click the Save button.
Test the New Configuration
**2.** You should see the Portal Meum Homepage page. If you do not, you may need to do a hard reload of the
page to clear the cache. You could also try opening the portal in an incognito/private window.

### BÀI VIẾT (22 TRÊN 33)

Responsive Pages
Service Portal page layouts are responsive to device type and screen resolution. Columns width is
dynamically adjusted and columns are stacked if required by space limitations.
The example shows the baseline Service Portal viewed on the desktop at full screen width. In the header, the
user's avatar and name are displayed. The second container shows all three columns side by side.
The example shows the baseline Service Portal on the desktop at partial screen width. The user's avatar is
still displayed in the header but the user's name no longer appears. The second container's columns are
stacked into two columns.
The example shows the baseline Service Portal on a smartphone. The user information is no longer
displayed. All container columns are stacked into a single column.
Viewports
To understand responsiveness in Service Portal pages, think of pages in terms of viewports. The Bootstrap v3
Grid System has four viewport sizes: Extra Small, Small, Medium, and Large. The viewport's size is
determined by the width of a page in pixels. (Learn more about the Bootstrap Grid System
(https://getbootstrap.com/docs/3.3/examples/grid/)) As a user resizes a page or changes devices, the viewport size
changes. When the viewport size changes, elements are resized. If the elements did not change size as the
viewport size changes, elements could move off the page and require scrolling to access.
The example was captured in a large viewport.
This screenshot was captured for the same container in a medium viewport.
Notice the page elements were resized to fit within the viewport; no scrolling is required.

### BÀI VIẾT (23 TRÊN 33)

Fixed vs. Fluid Containers
To determine UI element behavior when screens are resized, configure containers to be either fixed or fluid.
Fixed Containers
In a fixed layout, page elements remain the same size as the page widens or narrows. Notice that the
distance between the Search field and the page edge changes as the page width changes, but the Search
field width remains the same.
Fluid Containers
In a fluid layout, elements are a percentage of the screen size. Element width varies as page width changes.
Notice that the distance between the Search field and the page edge remains the same, but the Search field
width changes.
Setting Container Width
Use the Width field in the container options to specify whether a container is Fixed or Fluid.

### BÀI VIẾT (24 TRÊN 33)

Showing and Hiding Containers
Some containers and their widgets become unusable or take too much screen real estate when the viewport
size becomes small or extra small.
In the example in the Portal Meum Homepage, the Homepage Search widget and its container disappear
when the elements cannot be rendered in a usable way based on viewport size.
In the baseline Service Portal, when the viewport size becomes small, a Typeahead Search widget is used
instead of the Homepage Search widget.
Use the Parent class field when setting container options to specify the viewport size at which a container
should appear or disappear. In this example, the container is hidden at the viewport size of extra small using
the Parent class value hidden-xs. To show the container for the extra small viewport use the Parent class
value visible-xs.
MẸO CHO DEVELOPER: Use Bootstrap CSS Helper Classes (https://www.w3schools.com/bootstrap/bootstrap_ref_css_helpers.asp) with
any Service Portal field that accepts CSS as a value. To show or hide Service Portal containers, use Bootstrap CSS
Responsive Utilities Helper Classes such as hidden-md.

### BÀI TẬP (25 TRÊN 33)

Exercise: Hiding and Showing Containers
In this exercise, you will create a new container containing a Typeahead Search widget. You will display the
Typeahead Search widget for small screen sizes. For all other sizes you will display the Homepage Search
Add a Container and Typeahead Widget to the Page
**1.** If the Portal Meum Homepage page is not still open for editing, open it now.
**2.** Drag a new container to the page. Place the new container between the container with the Homepage
Search widget and the container with the Icon Link widgets.
**3.** Add a row with a single column spanning all 12 grid columns to the first container by dragging the 12 row
from the Layouts to the new container.
**4.** Add a Typeahead Search widget to the new row.
Configure Container Properties - Typeahead Search Container
**1.** Click the container for the Typeahead Search widget to select it. Examine the breadcrumbs to make sure
the container is selected.
**2.** Click the Edit Options button in the banner to open the container options dialog.
**3.** Configure the container options.
**1.** Parent class: visible-xs
Move to header: Selected (checked)
**4.** Nhấp nút Save.
**5.** Depending on your screen size, you may no longer see container 2 (the container with the Typeahead
Search widget). If you do not see the container, make your page width narrower until you see the
container.
Configure Container Properties - Homepage Search Container
**1.** Click the container for the Homepage Search widget to select it. Examine the breadcrumbs to make sure
**1.** Parent class: hidden-xs
**5.** Depending on your screen size, you may no longer see container 1. If necessary, resize your browser
window.
Test the Page Responsiveness
**2.** In the Preview, make sure the large device is selected in the banner.
**3.** You should see the Homepage Search widget in the page layout.
**4.** Scroll down the page. Does the Homepage Search widget go off screen?
**5.** Select the medium device in the banner.
**6.** You should see the Typeahead Search widget.
**7.** Scroll down the page. Does the Typeahead Search widget go off screen?
**8.** Test the smallest device. Do you get the results you expected? You should see the Typeahead Search
**9.** Switch to the largest device.

### BÀI VIẾT (26 TRÊN 33)

Page Editor
Page Editor provides a tree view of every element on a portal page. Using the tree, developers can open the
record for any element on the page to examine and change element configuration.
To open Page Editor, click the Page Editor tile on the Service Portal Configuration page.
In Page Editor, select a page using the choice list.
Page Editor displays a hierarchical tree view of the page:
Click any element in the tree to see the options and other information, such as the HTML for the element. The
available information depends on the element you are examining.

### BÀI TẬP (27 TRÊN 33)

Exercise: Add a Role to a Widget
In this exercise, you will add a My Approvals widget to the Portal Meum Homepage page. You will make the
My Approvals widget visible only to users with the manager role.
Your organization wants to grant managers the roles they need to approve or reject requests and to manage
reports. In this section of the exercise, you will create a manager role and associate the approver_user and
report_admin roles to the new manager role.
**1.** Create the manager role.
**1.** In the main ServiceNow browser window (not the Service Portal Configuration page), use the All
menu to open User Administration > Roles.
**2.** Nhấp nút New.
**3.** Configure the new role:
**1.** Name: manager
Description: Role given to all supervisors and managers
**4.** Open the Additional actions menu (
) and select the Save menu item.
**2.** Add roles to the manager role.
**1.** In the Contains Roles related list, click the Edit... button.
**2.** Use the Collection Search field to find the approver_user role.
**3.** Click once on the approver_user role to select it, then click the Add (
) button to move the role to the Contains Role List.
**4.** Use what you have learned to add the report_admin role to the Contains Role List.
**5.** Click the Save button.
**3.** Give Fred Luddy the manager role.
**1.** Use the All menu to open User Administration > Users.
**2.** Open the record with the User ID fred.luddy.
**3.** Scroll to the Roles section (tab).
**4.** Click the Edit... button.
**5.** Use the Collection Search field to find the manager role.
**6.** Click once on the manager role to select it, then click the Add (
) button to give the role to Fred Luddy.
**7.** Nhấp nút Save.
Add the Approvals Widget to the Portal Meum Homepage
**2.** Add an Approvals widget to the Portal Meum Homepage page.
**1.** In the widgets list, locate the Approvals widget.
**2.** Drag the Approvals widget and drop it below the Simple List widget.
**3.** Click the Edit button to configure the Approvals widget options.
**1.** Glyph: check-square-o (fa-check-square-o)
Buttons stacked side by side: Selected (checked)
Add a Role to the Approvals Widget
**2.** Click the Page Editor tile on the Service Portal Configuration page.
**3.** Use the Select Page... field to open the Portal Meum Homepage page for editing.
**4.** In the tree, locate pm_index > Portal Meum Homepage - Container 4 > Row 1 < Column 1 < Instance 2.
Notice this is the widget instance of the Approvals widget. Click the Instance 2 widget instance in the
tree.
**5.** In the Roles field, type manager.
**6.** Scroll to the bottom of the page and click the Save button.
Test the Approval Widget
**1.** Impersonate Fred Luddy to test his access to the Approvals widget.
**1.** In the main ServiceNow browser window, open the User menu by clicking your user avatar in the
ServiceNow banner. Select the Impersonate User option.
**2.** In the Search for user field, type fred.
**3.** In the drop-down list, select fred.luddy.
**4.** Click the Impersonate user button.
**5.** Examine the User avatar in the ServiceNow banner. You should now be Fred Luddy.
**2.** Open the portal by adding pm to the end of the instance URL.
**3.** Fred should see the Approvals widget. It is okay if Fred does not have any records to approve as long as
he can see the widget.
**4.** Remove pm from the end of the instance URL.
**5.** Using the same impersonation steps, impersonate Abel Tuter. Abel does not have the manager role.
**1.** Open the Portal Meum portal by modifying the URL.
**2.** Abel should not see the Approvals widget because he does not have the manager role.
**3.** Remove the /pm from the URL to return to the main ServiceNow browser window.
**6.** Return to the System Administrator user.
**1.** Click Abel Tuter in the ServiceNow banner.
**2.** Select the End Impersonation menu item.

### BÀI VIẾT (28 TRÊN 33)

Branding a Service Portal
To apply branding and a color theme to a Service Portal, click the Branding Editor tile on the Service Portal
Configuration page.
Select the portal to brand from the choice list in Branding Editor.
Quick Setup
Use the Quick Setup tab to set a Portal title, Logo, and Logo Padding.
The fields on the Quick Setup tab already have values. When the portal page was created, these fields were
populated. You could edit the same fields by editing the portal options on the portal record. Branding Editor is
a quick way to change these field values.
Chủ đề
Use the Theme Colors tab to set the colors for the Navbar, the Brand, and Text. Many of the default colors
are Twitter Bootstrap defaults. To change any of the values, use the color picker, or specify the color in
hexadecimal. Portal objects automatically update when theme colors change.
Branding and themes are set at the portal level. Changing a theme color, for example, changes only the
currently selected portal.
Theme Preview provides a quick way to determine if the colors in the theme look good together.
To revert changes, click the Reset Changes button to return to the previous theme. The Reset Changes
button is only available if the theme colors have changed.

### BÀI TẬP (29 TRÊN 33)

Exercise: Change Portal Branding
In this exercise, you will change:
The portal logo and logo padding
The color for the Bootstrap color "primary"
Change the Portal Logo
**2.** Click the Branding Editor tile on the Service Portal Configuration page.
**3.** In Branding Editor, select Portal Meum from the choice list.
**4.** Change the logo.
**1.** Select the Quick Setup tab.
**2.** Find a new logo to use with the portal. You can search the web for an icon, use your corporate logo,
or use any image of your choice.
**3.** Click the Upload an image button.
**4.** Use the file browser to navigate to the image file of your choice.
**5.** Click the Open or OK button (browser dependent).
**5.** Use the Logo Padding sliders to change the padding around the logo.
**1.** Left: 10
Top: 4
**6.** Examine the Theme Preview. You should see the new logo and padding.
Change the Color for Primary
**1.** Examine the Knowledge Base Icon Link widget in Portal Meum. Notice the blue color stands out from the
rest of the portal palette and makes the widget the most noticeable widget on the page.
**2.** Examine the Knowledge Base Icon Link widget options to determine which option set the color. Notice
the color is set based on the theme.
**3.** In Branding Editor, examine the Theme Preview. Look for the Primary color in both the buttons and the
text.
**4.** Change the Primary color.
**1.** In Branding Editor, switch to the Theme Colors tab.
**2.** In the Brand section, change the Primary color to #48424C.
**3.** Examine the Theme Preview again. Notice the new color for Primary.
Test the New Branding
**1.** Open the Portal Meum portal in a new tab or window or reload the portal in any already open tab or
window. You should see the new branding.
**2.** Did changing the Primary color make the Knowledge Base Icon Link widget blend in better with the rest
of the portal colors? If you do not like the new Primary color, change it to a color you like better. You
might find a color you prefer in this palette: Portal Meum palette (https://coolors.co/a393bf-9882ac-4a4058-
48424c-0c0910). To use the palette:
**1.** Hover over one of the color swatches.
**2.** Click the Alternative Shades icon.
**3.** Hover over the color of your choice to see the hexadecimal value.

### BÀI TẬP (30 TRÊN 33)

Challenge: Create a 404 Page
In this Challenge, you will create a custom 404 (file not found) page for the Portal Meum portal.
When you created the Portal Meum portal, you configured it to use the baseline 404 page. To see the
baseline 404 page, you can:
Look at the Not Found page in the Page Designer
OR
Open a URL for Portal Meum which is invalid. For example,
Page Requirements
Using the skills you have acquired in the exercises in this module, create a custom 404 page for Portal Meum
which meets these requirements:
Must use at least two containers.
Must use at least two widgets types. You may find the HTML widget to be useful.
The page must work for mobile, tablet, and desktop.
Nobody likes to get a 404 page so design your page to make people smile when they see it.
After creating your 404 page, remember to modify the portal configuration to use the 404 page you created.

### BÀI VIẾT (31 TRÊN 33)

Kiểm Tra Kiến Thức Service Portal
Want to verify your understanding of Service Portal? These questions will help you assess your progress. For
each question, determine your response then click anywhere in the question to see the answer.

### BÀI VIẾT (32 TRÊN 33)

Tóm Tắt Module Giới Thiệu Service Portal
Khái niệm cốt lõi:
Service Portal is a ServiceNow framework for building portals. A portal is a user interface (UI) which
provides an alternative user experience to the standard UI
The Service Portal Configuration page provides easy access to:
Branding Editor
Designer
Widget Editor
New Portal
Get Help
Use Page Designer to create portal pages
Portal pages are made up of:
Rows and columns
Widget configuration options depend on widget type
Use Branding Editor to change logos and themes
Manage page responsiveness to different device types

### BÀI VIẾT (33 TRÊN 33)

After Completing Service Portal Introduction, You
Might Also Be Interested In...
Congratulations on completing the Service Portal Introduction module. Based on your interest in creating
portals, you might also enjoy:
Creating Custom Widgets (https://developer.servicenow.com/to.do?u=SPI-U-MOD-CCW): In this Developer
Site learning module, you will learn to create, test, and use custom widgets in your service portals..
Service Portal Documentation (https://developer.servicenow.com/to.do?u=SPI-U-MOD-DOC-SPLanding): On the
ServiceNow docs site, you will find the complete set of reference material for Service Portal.