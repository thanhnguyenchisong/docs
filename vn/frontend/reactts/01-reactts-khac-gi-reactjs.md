# Bài 01: ReactTS Khác Gì ReactJS?

## 📚 Mục tiêu bài học

- Hiểu **ReactTS** là gì (React + TypeScript) và **khác gì** so với ReactJS (React + JavaScript)
- Nắm các điểm khác biệt quan trọng: **typing**, **tooling**, **code organization**, **refactor**, **runtime vs compile-time**
- Biết khi nào nên chọn ReactTS / ReactJS cho dự án thực tế

---

## 1. Định nghĩa nhanh

### ReactJS là gì?
- **ReactJS**: React dùng với **JavaScript** (thường là `.jsx` / `.js`)
- Linh hoạt, viết nhanh, học dễ, nhưng nhiều lỗi chỉ lộ ra **khi chạy** (runtime)

### ReactTS là gì?
- **ReactTS**: React dùng với **TypeScript** (thường là `.tsx` / `.ts`)
- TypeScript = JavaScript + **static types** + **type checker**
- Nhiều lỗi sẽ bị chặn **trước khi chạy** (compile-time / type-check time)

> **Quan trọng**: ReactTS không làm app “chạy nhanh hơn” một cách tự động. ReactTS chủ yếu nâng chất lượng dev: bắt lỗi sớm, refactor an toàn, DX tốt hơn.

---

## 2. Khác biệt “cốt lõi”: Runtime (JS) vs Type-check (TS)

### ReactJS
- Trình duyệt chạy JS trực tiếp.
- Sai kiểu dữ liệu thường không bị phát hiện ngay trong editor.
- Lỗi hay gặp:
  - `Cannot read properties of undefined`
  - Truyền sai props (ví dụ `onClick` là string)
  - API trả về shape khác dự đoán → render crash

### ReactTS
- TypeScript được **compile** sang JavaScript để chạy.
- Type checker chạy trong quá trình dev/build, giúp:
  - Phát hiện sai kiểu props/state trước khi runtime
  - Autocomplete & “go to definition” chính xác
  - Refactor đổi tên field/hàm an toàn hơn

---

## 3. Khác biệt về file extensions và cú pháp JSX

- ReactJS thường dùng:
  - `.jsx` (JS + JSX)
  - `.js`
- ReactTS thường dùng:
  - `.tsx` (TS + JSX)
  - `.ts`

Ví dụ đơn giản:

```tsx
// Greeting.tsx
type GreetingProps = { name: string };

export function Greeting({ name }: GreetingProps) {
  return <h1>Hello {name}</h1>;
}
```

Trong ReactJS, bạn vẫn viết y như vậy nhưng **không có type**:

```jsx
// Greeting.jsx
export function Greeting({ name }) {
  return <h1>Hello {name}</h1>;
}
```

---

## 4. Khác biệt lớn nhất trong thực tế: Props / State / Event typing

### 4.1 Props: ReactTS bắt lỗi truyền sai

ReactTS:

```tsx
type ButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export function Button({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

Khi dùng:

```tsx
<Button label="Save" onClick={() => console.log('ok')} />
<Button label="Save" onClick="click" />
//                      ^^^^^^^ Type error: onClick phải là function
```

ReactJS:
- Bạn vẫn có thể truyền nhầm và chỉ phát hiện khi chạy (hoặc không phát hiện nếu code path không đi qua).
- Có thể dùng `PropTypes` nhưng:
  - Không mạnh bằng TS cho refactor/generics
  - Không giúp autocomplete tốt bằng
  - Thường bị bỏ qua trong codebase hiện đại

### 4.2 State: null/undefined được “ép” xử lý đúng

ReactTS:

```tsx
type User = { id: number; name: string };

function Profile() {
  const [user, setUser] = useState<User | null>(null);

  return <div>{user.name}</div>;
  //            ^^^^ Type error: user có thể null
}
```

Bạn buộc phải xử lý:

```tsx
return <div>{user ? user.name : 'Loading...'}</div>;
```

ReactJS:
- `user` null thì runtime mới nổ: `Cannot read properties of null`.

### 4.3 Events: gợi ý đúng kiểu event/target

ReactTS:

```tsx
function SearchBox() {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  return <input onChange={handleChange} />;
}
```

ReactJS:
- Viết nhanh hơn, nhưng ít gợi ý chính xác hơn khi app lớn.

---

## 5. Typing Children và Component API “đúng nghĩa”

ReactTS giúp bạn thiết kế API component rõ ràng:

```tsx
type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};
```

Hoặc “siết” hơn nếu muốn chỉ nhận một element:

```tsx
type StrictSlotProps = { children: React.ReactElement };
```

ReactJS:
- Quy ước bằng docs/team convention, nhưng không có ràng buộc compile-time.

---

## 6. Custom Hooks: ReactTS làm hook “type-safe”

ReactTS:

```tsx
type Status = 'idle' | 'loading' | 'error' | 'success';

function useRequest<T>() {
  const [status, setStatus] = useState<Status>('idle');
  const [data, setData] = useState<T | null>(null);
  return { status, data, setStatus, setData };
}

const { data } = useRequest<{ id: number; name: string }>();
// data?.name được gợi ý đúng
```

ReactJS:
- Bạn vẫn làm được, nhưng “shape” data chỉ nằm trong đầu/dev docs.

---

## 7. Refactor & Scale: lợi thế lớn nhất của ReactTS

### Khi đổi tên field/hàm
ReactTS:
- Đổi `userName` → `name`, IDE + TS sẽ chỉ ra toàn bộ nơi bị ảnh hưởng (compile-time).

ReactJS:
- Dựa vào search/grep + test coverage; dễ sót, đặc biệt với object shape từ API.

### Khi thiết kế component dùng lại (generic)
ReactTS cho generic component type-safe (List/Table/Select), giúp tái sử dụng mà ít bug.

---

## 8. Tooling khác nhau

### ReactJS thường cần:
- ESLint + Prettier (bắt lỗi style & một phần bug)
- Tests (Jest/Vitest + Testing Library)
- Runtime validation (đôi khi) cho API data

### ReactTS thường thêm:
- TypeScript compiler (`tsc`) / type-check trong build
- `@types/*` cho thư viện chưa có types built-in
- Quy ước types: `type`/`interface`, folder `types/`, `*.d.ts`

> Thực tế tốt nhất: ReactTS vẫn cần ESLint + tests. TypeScript không thay thế testing.

---

## 9. Chi phí (trade-offs) khi dùng ReactTS

- **Learning curve**: generics, union, narrowing, utility types
- **Thời gian code ban đầu**: define types cho props/data
- **Friction với thư viện**: một số lib types phức tạp hoặc thiếu types
- **Over-typing**: lạm dụng types (đặc biệt `any`, `as unknown as`) làm mất lợi ích

Nhưng đổi lại:
- **Ít bug** do mismatch data/props
- **Refactor nhanh & an toàn**
- **DX tốt**: autocomplete, navigation, docs “sống”
- **Onboarding team** nhanh hơn (API component rõ ràng)

---

## 10. Khi nào chọn ReactJS, khi nào chọn ReactTS?

### Chọn ReactJS khi:
- Dự án nhỏ, prototype/MVP rất nhanh, vòng đời ngắn
- Team toàn junior chưa biết TS và deadline gấp (nhưng vẫn nên lên kế hoạch chuyển dần)
- Codebase ít module, ít component dùng lại, ít refactor

### Chọn ReactTS khi:
- Dự án vừa/lớn, nhiều màn hình, nhiều người cùng làm
- Nhiều domain models, nhiều API, nhiều trạng thái phức tạp
- Cần refactor thường xuyên, muốn giảm regressions
- Muốn standard hóa codebase theo kiểu “self-documenting”

> Kinh nghiệm thực tế: với production app, **ReactTS thường là lựa chọn mặc định**.

---

## 11. Checklist “convert ReactJS → ReactTS” (thực dụng)

1. **Bắt đầu từ tooling**: thêm TS, chạy type-check song song
2. **Đổi file**: `.jsx` → `.tsx` cho components có props phức tạp trước
3. **Typing dần**:
   - Props
   - API responses
   - Shared domain types (`User`, `Product`, `Order`)
4. **Tránh `any`**: dùng `unknown` + validate/narrowing
5. **Chuẩn hóa event & HTML props**: `React.ComponentProps<'input'>`, `React.ButtonHTMLAttributes<...>`

---

## 🔑 Tóm tắt ngắn gọn

| Tiêu chí | ReactJS | ReactTS |
|---|---|---|
| Ngôn ngữ | JavaScript | TypeScript (compile ra JS) |
| Bắt lỗi | Nhiều lỗi chỉ thấy khi chạy | Bắt nhiều lỗi từ editor/type-check |
| Refactor | Dễ sót khi app lớn | An toàn, IDE hỗ trợ mạnh |
| Tốc độ viết ban đầu | Nhanh | Chậm hơn chút (typing) |
| Scale team/codebase | Khó dần theo thời gian | Dễ scale, API rõ ràng |
| Best fit | Prototype, dự án nhỏ | Production app, dự án vừa/lớn |

---

> Nếu bạn muốn, mình có thể tạo thêm bài 02 “Setup ReactTS (Vite/Next) + cấu trúc project + conventions types” và bài 03 “Typing patterns hay dùng (Props, hooks, forms, API)”.
