# State & Kiến trúc

Quản lý state (dữ liệu dùng chung, cache, UI state) ảnh hưởng lớn đến cấu trúc ứng dụng Angular. Bài này tóm tắt các hướng tiếp cận và best practices.

## Mục lục
1. [State ở đâu?](#state-ở-đâu)
2. [Service-based state](#service-based-state)
3. [NgRx overview](#ngrx-overview)
4. [Best practices](#best-practices)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## State ở đâu?

| Nơi | Phù hợp khi |
|-----|-------------|
| **Component** (property, signal) | Chỉ component đó (và con) dùng |
| **Service providedIn: 'root'** | State dùng chung toàn app (user, cart, theme) |
| **Service providers trong route** | State theo feature/route, hủy khi thoát |
| **NgRx (Store)** | State phức tạp, nhiều tương tác, cần time-travel/debug |

---

## Service-based state

Dùng service + BehaviorSubject/signal để lưu và phát state.

```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();

  add(item: CartItem) {
    this._items.update(list => [...list, item]);
  }

  remove(id: number) {
    this._items.update(list => list.filter(i => i.id !== id));
  }
}
```

Component đọc qua inject + signal hoặc async pipe nếu dùng Observable.

- **Ưu**: Đơn giản, ít boilerplate, đủ cho nhiều app.
- **Nhược**: Không có pattern chuẩn cho side effect (gọi API) và debug.

---

## NgRx overview

NgRx dùng mô hình **Redux**: state trong một store, thay đổi qua **actions** và **reducers**, side effect qua **effects**.

- **Store**: Một object state toàn cục (hoặc feature stores).
- **Action**: Event mô tả “chuyện gì xảy ra” (e.g. `[Cart] Add Item`).
- **Reducer**: Hàm pure (state, action) => state mới.
- **Effect**: Xử lý async (gọi API), dispatch action mới khi xong.
- **Selector**: Hàm (state) => derived data, dùng để đọc trong component.

Khi nào cân nhắc NgRx: state lớn, nhiều nguồn cập nhật, cần trace action, làm việc với team quen Redux. Với form đơn giản hoặc CRUD nhỏ, service + signal thường đủ.

→ **Chi tiết đầy đủ**: [14 - NgRx](14-ngrx.md) (Actions, Reducers, Effects, Selectors, feature state, component, testing).

---

## Best practices

- **Đặt state gần nơi dùng**: Tránh đưa mọi thứ lên root service hoặc store.
- **Immutable update**: Dùng spread, map, filter thay vì mutate; với signal dùng `update()`.
- **Unsubscribe / takeUntilDestroyed**: Tránh leak khi subscribe trong component.
- **Tách feature**: Core (auth, api), shared (UI components), features (domain); state theo feature khi có thể.
- **Typed models**: Interface/type cho entity và state, tránh any.

---

## Câu hỏi thường gặp

**Có bắt buộc dùng NgRx không?**  
Không. Service + signal/BehaviorSubject đủ cho rất nhiều ứng dụng. NgRx hữu ích khi state và luồng dữ liệu phức tạp.

**Signal vs Observable cho state trong service?**  
Signal (Angular 16+) đơn giản cho state đồng bộ, template đọc trực tiếp. Observable phù hợp stream async (HTTP, router). Có thể kết hợp: service expose Observable, component dùng async pipe; hoặc service dùng signal, component inject và đọc.

**Khi nào nên tách state ra feature module?**  
Khi feature có state riêng, ít dùng chéo (ví dụ admin dashboard). Giúp lazy load và tách biệt logic.

---

→ Tiếp theo: [11 - UI & Styling](11-ui-styling.md)
