# Bài 06: Generic Components

## 📚 Mục tiêu bài học

- Tạo component generic type-safe: `List<T>`, `Select<T>`, `Table<T>`
- Patterns: constrained generics, inferred generics, polymorphic components
- Khi nào dùng generic vs union

---

## 1. Generic Component Cơ Bản — List\<T\>

```tsx
type ListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
};

function List<T>({ items, renderItem, keyExtractor, emptyMessage = 'Không có dữ liệu' }: ListProps<T>) {
  if (items.length === 0) return <p>{emptyMessage}</p>;

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// Sử dụng — T được suy luận tự động:
<List
  items={users}                           // T = User
  keyExtractor={(user) => user.id}        // user: User
  renderItem={(user) => <span>{user.name} ({user.email})</span>}
/>

<List
  items={products}                        // T = Product
  keyExtractor={(p) => p.id}
  renderItem={(p) => <div>{p.name} - {p.price}₫</div>}
/>
```

---

## 2. Select\<T\> — Dropdown Type-Safe

```tsx
type SelectProps<T> = {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  getLabel: (item: T) => string;
  getValue: (item: T) => string | number;
  placeholder?: string;
};

function Select<T>({ options, value, onChange, getLabel, getValue, placeholder }: SelectProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = options.find(opt => String(getValue(opt)) === e.target.value);
    if (selected) onChange(selected);
  };

  return (
    <select value={value ? String(getValue(value)) : ''} onChange={handleChange}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={String(getValue(opt))} value={String(getValue(opt))}>
          {getLabel(opt)}
        </option>
      ))}
    </select>
  );
}

// Sử dụng:
const [selectedUser, setSelectedUser] = useState<User | null>(null);

<Select
  options={users}
  value={selectedUser}
  onChange={setSelectedUser}         // (value: User) => void
  getLabel={(u) => u.name}          // u: User — TypeScript biết
  getValue={(u) => u.id}
  placeholder="Chọn người dùng"
/>
```

---

## 3. Table\<T\> — Data Table Generic

```tsx
type Column<T> = {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  sortable?: boolean;
};

type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
};

function Table<T>({ data, columns, keyExtractor, onRowClick }: TableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
          >
            {columns.map(col => (
              <td key={col.key}>{col.render(item)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Sử dụng:
const columns: Column<Product>[] = [
  { key: 'name', header: 'Tên', render: (p) => p.name },
  { key: 'price', header: 'Giá', render: (p) => `${p.price.toLocaleString()}₫` },
  { key: 'category', header: 'Danh mục', render: (p) => p.category },
  { key: 'actions', header: '', render: (p) => <button onClick={() => edit(p)}>Sửa</button> },
];

<Table
  data={products}
  columns={columns}
  keyExtractor={(p) => p.id}
  onRowClick={(p) => navigate(`/products/${p.id}`)}
/>
```

---

## 4. Constrained Generics

Giới hạn T phải có certain properties:

```tsx
// T phải có id và name
type HasIdAndName = { id: number | string; name: string };

type SearchableListProps<T extends HasIdAndName> = {
  items: T[];
  onSelect: (item: T) => void;
};

function SearchableList<T extends HasIdAndName>({ items, onSelect }: SearchableListProps<T>) {
  const [query, setQuery] = useState('');

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm..." />
      {filtered.map(item => (
        <div key={item.id} onClick={() => onSelect(item)}>
          {item.name}
        </div>
      ))}
    </div>
  );
}

// ✅ OK — User có id và name
<SearchableList items={users} onSelect={(u) => console.log(u.email)} />

// ❌ Type error — { price: number } không có id, name
// <SearchableList items={[{ price: 100 }]} onSelect={() => {}} />
```

---

## 5. Polymorphic Component — "as" prop

Component có thể render thành bất kỳ HTML element hoặc component nào:

```tsx
type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<E>, 'as' | 'children'>;

function Text<E extends React.ElementType = 'span'>({
  as,
  children,
  ...rest
}: PolymorphicProps<E>) {
  const Component = as || 'span';
  return <Component {...rest}>{children}</Component>;
}

// Sử dụng:
<Text>Default span</Text>
<Text as="h1" id="title">Heading</Text>
<Text as="p" className="description">Paragraph</Text>
<Text as="a" href="/about">Link</Text>
<Text as="label" htmlFor="email">Label</Text>
```

---

## 6. Khi Nào Dùng Generic vs Union

| Dùng Generic | Dùng Union |
|-------------|-----------|
| Component tái sử dụng với **nhiều kiểu data** khác nhau | Component có **số ít variant** cố định |
| `List<T>`, `Select<T>`, `Table<T>` | `Button variant: 'primary' | 'secondary'` |
| Callback trả về **cùng type** với input | Props không liên quan đến nhau |
| Khi cần **type inference** từ props | Khi muốn **exhaustive check** |

---

## 📝 Bài Tập

1. Tạo `Autocomplete<T>` — input + dropdown suggestions type-safe.
2. Tạo `Pagination<T>` component: nhận `items: T[]`, `pageSize`, render từng page.
3. Tạo `Modal<T>` với `onConfirm: (data: T) => void` — truyền data khi confirm.

---

> **Bài trước:** [05 - Forms & API ←](./05-typing-forms-api.md)  
> **Bài tiếp theo:** [07 - Advanced Patterns →](./07-advanced-patterns.md)
