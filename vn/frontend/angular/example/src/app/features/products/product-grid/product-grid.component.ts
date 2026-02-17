/**
 * ===================================================================
 * ProductGridComponent — AG-Grid Demo
 * 📖 Lý thuyết: 16-ag-grid.md
 *   - Cài đặt, cấu hình AG-Grid
 *   - Column definition, data binding
 *   - Sort, filter, pagination
 *   - Virtual scroll, performance
 *   - Cell renderer, valueFormatter
 *   - Tích hợp Angular (OnPush, signal-based data)
 * ===================================================================
 *
 * AG-Grid là data grid enterprise cho Angular:
 *   - Sort, filter, resize, reorder cột
 *   - Virtual scroll (chỉ render dòng trong viewport)
 *   - Pagination client-side / server-side
 *   - Cell editor, cell renderer
 *   - Export CSV/Excel
 *
 * Dùng khi: danh sách lớn, cần filter/sort mạnh, inline edit
 * → thay thế Material Table cho use case phức tạp
 */
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [AgGridAngular, RouterLink, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <div class="flex between center">
        <h1>AG-Grid Demo</h1>
        <div class="flex gap-sm">
          <button mat-button (click)="exportCsv()">
            <mat-icon>download</mat-icon> Export CSV
          </button>
          <a mat-button routerLink="/products">
            <mat-icon>arrow_back</mat-icon> Quay lại
          </a>
        </div>
      </div>

      <!--
        📖 Bài 16: ag-grid-angular component
        - [rowData]: Mảng dữ liệu
        - [columnDefs]: Cấu hình cột
        - [defaultColDef]: Config mặc định cho mọi cột
        - [pagination]: Bật phân trang
        - [paginationPageSize]: Số dòng mỗi trang
        - (gridReady): Lấy gridApi để gọi export, getSelectedRows, ...

        📖 Bài 16: Container PHẢI có height (px hoặc %) để grid tính viewport
      -->
      <div class="ag-theme-alpine" style="height: 500px; width: 100%;">
        <ag-grid-angular
          style="width: 100%; height: 100%;"
          [rowData]="rowData"
          [columnDefs]="columnDefs"
          [defaultColDef]="defaultColDef"
          [pagination]="true"
          [paginationPageSize]="10"
          [paginationPageSizeSelector]="[5, 10, 20, 50]"
          [rowSelection]="'multiple'"
          [animateRows]="true"
          (gridReady)="onGridReady($event)"
        />
      </div>
    </div>
  `,
})
export class ProductGridComponent implements OnInit {

  private readonly productService = inject(ProductService);
  private gridApi?: GridApi;

  // ─── Row Data ──────────────────────────────────────────────────
  // 📖 Bài 16: rowData — mảng dữ liệu, mỗi phần tử là một row
  rowData: Product[] = [];

  // ─── Column Definitions ────────────────────────────────────────
  /**
   * 📖 Bài 16: ColDef[] — cấu hình từng cột
   *
   * - field: Khớp property của row object
   * - headerName: Tiêu đề cột
   * - width / flex: Độ rộng cố định hoặc tỉ lệ
   * - sortable: Cho phép sort
   * - filter: Cho phép filter (true hoặc loại filter cụ thể)
   * - valueFormatter: Format giá trị hiển thị
   * - cellRenderer: Custom render (component hoặc function)
   * - editable: Cho phép inline edit
   */
  columnDefs: ColDef<Product>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      // 📖 Bài 16: sort mặc định
      sort: 'asc',
    },
    {
      field: 'name',
      headerName: 'Tên sản phẩm',
      flex: 2,
      minWidth: 200,
      // 📖 Bài 16: filter — loại filter cụ thể
      filter: 'agTextColumnFilter',
    },
    {
      field: 'category',
      headerName: 'Danh mục',
      flex: 1,
      // 📖 Bài 16: filter set (dropdown) — user chọn từ danh sách
      filter: 'agSetColumnFilter',
    },
    {
      field: 'price',
      headerName: 'Giá',
      flex: 1,
      filter: 'agNumberColumnFilter',
      // 📖 Bài 16: valueFormatter — format giá trị hiển thị
      // Nhận params, trả về string
      valueFormatter: (params) => {
        if (params.value == null) return '';
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(params.value);
      },
    },
    {
      field: 'stock',
      headerName: 'Tồn kho',
      width: 120,
      filter: 'agNumberColumnFilter',
      // 📖 Bài 16: cellRenderer — custom render bằng function
      // Hiển thị badge màu theo số lượng tồn
      cellRenderer: (params: any) => {
        const stock = params.value ?? 0;
        const color = stock > 20 ? '#4caf50' : stock > 5 ? '#ff9800' : '#f44336';
        return `<span style="color: ${color}; font-weight: bold">${stock}</span>`;
      },
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 120,
      // 📖 Bài 16: cellRenderer — hiển thị sao
      cellRenderer: (params: any) => {
        const rating = params.value ?? 0;
        return '⭐'.repeat(Math.round(rating)) + ` (${rating})`;
      },
    },
  ];

  // ─── Default Column Config ─────────────────────────────────────
  /**
   * 📖 Bài 16: defaultColDef — config mặc định áp cho MỌI cột
   * Cột riêng có thể override
   */
  defaultColDef: ColDef = {
    sortable: true,       // Tất cả cột có thể sort
    filter: true,         // Tất cả cột có thể filter
    resizable: true,      // Kéo thay đổi độ rộng
    // 📖 Bài 16: floatingFilter — filter hiển thị dưới header (trực quan)
    floatingFilter: true,
  };

  // ─── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    // Load mock data
    this.rowData = this.productService.getMockProducts();
  }

  // ─── Grid API ──────────────────────────────────────────────────
  /**
   * 📖 Bài 16: gridReady event — lấy GridApi
   * GridApi dùng để: setRowData, getSelectedRows, exportDataAsCsv, ...
   */
  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    // Auto-size columns theo nội dung
    event.api.sizeColumnsToFit();
  }

  /**
   * 📖 Bài 16: Export data ra CSV
   */
  exportCsv(): void {
    this.gridApi?.exportDataAsCsv({
      fileName: 'products.csv',
    });
  }
}
