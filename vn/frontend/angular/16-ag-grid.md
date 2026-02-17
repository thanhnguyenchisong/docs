# AG-Grid trong Angular

AG-Grid là thư viện **data grid** mạnh cho Angular: sort, filter, pagination, virtual scroll, grouping, pivot, cell editor, export. Dùng khi cần bảng dữ liệu lớn, tương tác nhiều — sau khi đọc bài này bạn biết tích hợp và dùng cơ bản đến nâng cao.

## Mục lục
1. [AG-Grid là gì?](#ag-grid-là-gì)
2. [Cài đặt và cấu hình](#cài-đặt-và-cấu-hình)
3. [Column definition và data binding](#column-definition-và-data-binding)
4. [Sort, filter, pagination](#sort-filter-pagination)
5. [Virtual scroll và performance](#virtual-scroll-và-performance)
6. [Cell editor, cell renderer](#cell-editor-cell-renderer)
7. [Tích hợp với Angular (reactive, OnPush)](#tích-hợp-với-angular-reactive-onpush)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## AG-Grid là gì?

- **Data grid** enterprise: bảng có sort, filter, resize, reorder cột, grouping, aggregation, export Excel/CSV.
- **Angular**: Có package `ag-grid-angular`; dùng như component Angular, binding với `[rowData]`, `[columnDefs]`.
- **Bản Community (miễn phí)** và **Enterprise (trả phí)** — Enterprise có thêm grouping nâng cao, pivot, tree data, Excel export đầy đủ.
- Dùng khi: danh sách lớn (hàng nghìn dòng), cần filter/sort mạnh, virtual scroll, inline edit — thay thế cho table thủ công hoặc Material Table khi cần tính năng grid đầy đủ.

---

## Cài đặt và cấu hình

```bash
npm install ag-grid-community ag-grid-angular
```

Module (standalone): import `AgGridAngular` và styles.

```typescript
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

@Component({
  standalone: true,
  imports: [AgGridAngular],
  template: `
    <div class="ag-theme-alpine" style="height: 400px;">
      <ag-grid-angular
        [rowData]="rowData"
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        (gridReady)="onGridReady($event)"
      />
    </div>
  `,
})
export class GridComponent {
  rowData: any[] = [];
  columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Tên', sortable: true, filter: true },
    { field: 'email', headerName: 'Email', filter: 'agTextColumnFilter' },
    { field: 'role', headerName: 'Vai trò' },
  ];
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }
}
```

- **ag-theme-alpine** (hoặc quartz, balham): theme; cần container có **height** (px hoặc %) để grid tính viewport.
- **gridReady**: Lấy `gridApi` / `columnApi` để gọi setRowData, export, getSelectedRows...

---

## Column definition và data binding

- **columnDefs**: Mảng `ColDef[]` — `field` khớp property của row; `headerName` tiêu đề; `width`, `flex` (tỉ lệ).
- **rowData**: Mảng dữ liệu; có thể gán trực tiếp hoặc qua **Server-Side Row Model** (data từ server theo từng trang/filter).
- **defaultColDef**: Áp cho mọi cột (sortable, filter, resizable).

```typescript
columnDefs: ColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', flex: 1, minWidth: 150 },
  { field: 'amount', valueFormatter: (p) => p.value != null ? p.value.toLocaleString() : '' },
  { field: 'date', valueFormatter: (p) => p.value ? new Date(p.value).toLocaleDateString() : '' },
];
```

- **valueGetter** / **valueFormatter**: Tính hoặc format giá trị hiển thị.
- **valueSetter**: Khi edit, ghi lại vào row (inline edit).

---

## Sort, filter, pagination

- **Sort**: Mặc định client-side (sort trên toàn bộ rowData). Cột có `sortable: true`; có thể `sort: 'asc'/'desc'` mặc định.
- **Filter**: `filter: true` hoặc `filter: 'agTextColumnFilter'`, `agNumberColumnFilter`, `agDateColumnFilter`. Filter tích hợp trong header.
- **Pagination**: `pagination: true`, `paginationPageSize: 20`, `paginationPageSizeSelector: [10, 20, 50]`. Client-side pagination cắt rowData theo trang; với data lớn nên dùng **Server-Side Row Model** (load từng trang từ API).

---

## Virtual scroll và performance

- **DOM virtualisation**: AG-Grid chỉ render **dòng trong viewport** (+ buffer) → hàng chục nghìn dòng vẫn mượt.
- **domLayout: 'autoHeight'**: Grid không virtual theo chiều cao (mọi row trong DOM) — tránh dùng khi row rất nhiều.
- **Best practice**: Giữ `domLayout` mặc định; tránh cell renderer quá nặng; dùng **valueFormatter** thay renderer phức tạp khi có thể; **suppressCellFocus** nếu không cần keyboard nav để giảm xử lý.

---

## Cell editor, cell renderer

- **Cell Renderer**: Component hoặc hàm hiển thị ô (ví dụ badge, nút, progress bar). `cellRenderer: MyComponent` hoặc `cellRenderer: (params) => params.value`.
- **Cell Editor**: Component hoặc editor mặc định (text, number, select) khi double-click hoặc Enter. `cellEditor: 'agSelectCellEditor'`, `cellEditorParams: { values: ['A','B'] }`.
- **Angular component làm renderer/editor**: Implement interface (ICellRendererAngularComp / ICellEditorAngularComp), đăng ký trong module/components; trong ColDef dùng `cellRenderer: MyAngularComponent`.

---

## Tích hợp với Angular (reactive, OnPush)

- **rowData từ Observable/signal**: Gán `rowData = data$ | async` hoặc `rowData = this.data();` — khi stream/state đổi, grid nhận mảng mới. Với **OnPush**, đảm bảo reference `rowData` đổi (immutable update) để Angular detect.
- **columnDefs**: Có thể bind từ component; thay đổi columnDefs (reference mới) thì grid cập nhật cấu hình.
- **Grid API**: Lấy trong `gridReady`; gọi `api.setRowData([])` hoặc `api.applyTransaction()` khi cập nhật từ service/NgRx. Tránh giữ reference cũ rowData và mutate trong khi grid đang dùng.
- **Change Detection**: Grid chạy nội bộ; với OnPush, nếu bạn chỉ cập nhật input `[rowData]` bằng reference mới thì không cần gọi `detectChanges()` thủ công.

---

## Câu hỏi thường gặp

**AG-Grid Community vs Enterprise?**  
Community đủ sort, filter, CSV export, virtual scroll. Enterprise thêm grouping nâng cao, pivot, tree data, Excel export, clipboard nâng cao. Xem bảng tính năng trên ag-grid.com.

**Làm sao load data từ API theo trang?**  
Dùng **Server-Side Row Model**: cấu hình `rowModelType: 'serverSide'`, `serverSideDatasource` với `getRows(params)` gọi API (skip, take, sort, filter) rồi gọi `params.success(rows, total)`.

**Cell renderer Angular có cần OnPush?**  
Có thể dùng OnPush cho renderer component; grid truyền params vào, khi params thay đổi (row/col refresh) component cập nhật. Tránh logic nặng trong renderer.

**So với Angular Material Table?**  
Material Table đơn giản, đồng bộ Material Design. AG-Grid mạnh hơn về sort/filter/virtual/export/grouping; phù hợp dashboard, admin, báo cáo. Có thể dùng cả hai trong cùng app (Material cho form/list đơn giản, AG-Grid cho màn danh sách lớn).

---

→ Dùng kết hợp với [11 - UI & Styling](./11-ui-styling.md) (theme, responsive).  
→ Checklist Master: [15 - Master Angular](./15-master-angular.md).
