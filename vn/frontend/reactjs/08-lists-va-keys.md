# Bài 08: Lists & Keys - Render Danh Sách

## 📚 Mục tiêu bài học
- Render danh sách với `map()`
- Hiểu tại sao `key` quan trọng và cách chọn key đúng
- Xử lý danh sách phức tạp: lọc, sắp xếp, nhóm
- Performance khi render danh sách lớn

---

## 1. Render Danh Sách Cơ Bản

```jsx
function FruitList() {
  const fruits = ['🍎 Táo', '🍌 Chuối', '🍊 Cam', '🍇 Nho', '🍓 Dâu'];

  return (
    <ul>
      {fruits.map((fruit, index) => (
        <li key={index}>{fruit}</li>
      ))}
    </ul>
  );
}
```

### Render mảng objects

```jsx
function UserList() {
  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@email.com', role: 'admin' },
    { id: 2, name: 'Trần Thị B', email: 'b@email.com', role: 'user' },
    { id: 3, name: 'Lê Văn C', email: 'c@email.com', role: 'editor' },
  ];

  return (
    <div className="user-list">
      {users.map(user => (
        <div key={user.id} className="user-card">
          <h3>{user.name}</h3>
          <p>📧 {user.email}</p>
          <span className={`badge-${user.role}`}>{user.role}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 2. Keys - Tại Sao Quan Trọng?

### Key là gì?

Key giúp React **nhận diện** mỗi element trong danh sách để biết element nào đã thay đổi, thêm, hoặc xóa.

```
Không có key - React BỐI RỐI:      Có key - React BIẾT CHÍNH XÁC:

Trước:  [A] [B] [C]                 Trước:  [A:1] [B:2] [C:3]
Sau:    [A] [D] [B] [C]             Sau:    [A:1] [D:4] [B:2] [C:3]
                                            
React: "Cái gì thay đổi?           React: "À! Thêm D:4 vào vị trí 2,
B→D? C→B? Thêm C mới?"              A, B, C không đổi!"
→ Re-render TẤT CẢ                  → Chỉ thêm D, KHÔNG re-render A,B,C
```

### Quy tắc chọn Key

```jsx
// ✅ TỐT NHẤT - ID duy nhất từ data
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}

// ✅ OK - Giá trị duy nhất khác (email, slug, etc.)
{articles.map(article => (
  <Article key={article.slug} article={article} />
))}

// ⚠️ CẨN THẬN - Index chỉ OK khi danh sách KHÔNG thay đổi
{staticItems.map((item, index) => (
  <li key={index}>{item}</li>
))}

// ❌ SAI - Random values tạo key mới mỗi render
{items.map(item => (
  <li key={Math.random()}>{item}</li>  // 💥 Component bị mount lại MỖI LẦN
))}

// ❌ SAI - Không có key
{items.map(item => (
  <li>{item}</li>  // Warning trong console
))}
```

### Khi nào KHÔNG dùng index làm key?

```jsx
// ❌ Danh sách có thể thêm/xóa/sắp xếp lại → KHÔNG dùng index
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Học React' },
    { id: 2, text: 'Làm bài tập' },
    { id: 3, text: 'Đọc sách' },
  ]);

  const addToTop = () => {
    setTodos([
      { id: Date.now(), text: 'Mục mới' },
      ...todos
    ]);
  };

  return (
    <div>
      <button onClick={addToTop}>Thêm vào đầu</button>
      {todos.map(todo => (
        // ✅ Dùng todo.id, KHÔNG dùng index
        // Vì khi thêm vào đầu, index thay đổi → re-render sai
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}
```

### Key phải unique trong siblings

```jsx
function App() {
  const users = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
  const posts = [{ id: 1, title: 'Post 1' }, { id: 2, title: 'Post 2' }];

  return (
    <div>
      {/* ✅ OK - Key chỉ cần unique trong cùng mảng */}
      {users.map(u => <UserCard key={u.id} user={u} />)}
      {posts.map(p => <PostCard key={p.id} post={p} />)}
      {/* id=1 ở users và id=1 ở posts KHÔNG conflict */}
    </div>
  );
}
```

---

## 3. Tách Component Cho List Item

```jsx
// ✅ Tách component riêng cho mỗi item
function ProductCard({ product, onAddToCart, onToggleFavorite }) {
  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">{formatPrice(product.price)}</p>
      <div className="rating">
        {'⭐'.repeat(Math.round(product.rating))}
        <span>({product.reviewCount})</span>
      </div>
      <div className="actions">
        <button onClick={() => onAddToCart(product.id)}>🛒 Thêm</button>
        <button onClick={() => onToggleFavorite(product.id)}>
          {product.isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  );
}

function ProductList() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Laptop', price: 25000000, rating: 4.5, reviewCount: 120, isFavorite: false, image: '/laptop.jpg' },
    { id: 2, name: 'Phone', price: 15000000, rating: 4.8, reviewCount: 250, isFavorite: true, image: '/phone.jpg' },
    { id: 3, name: 'Tablet', price: 12000000, rating: 4.2, reviewCount: 80, isFavorite: false, image: '/tablet.jpg' },
  ]);

  const handleAddToCart = (productId) => {
    console.log('Added to cart:', productId);
  };

  const handleToggleFavorite = (productId) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
        />
      ))}
    </div>
  );
}
```

---

## 4. Lọc Danh Sách (Filter)

```jsx
function FilterableProductList() {
  const [products] = useState([
    { id: 1, name: 'iPhone 16', category: 'phone', price: 25000000, inStock: true },
    { id: 2, name: 'Samsung S25', category: 'phone', price: 22000000, inStock: false },
    { id: 3, name: 'MacBook Pro', category: 'laptop', price: 45000000, inStock: true },
    { id: 4, name: 'iPad Air', category: 'tablet', price: 18000000, inStock: true },
    { id: 5, name: 'Dell XPS', category: 'laptop', price: 35000000, inStock: false },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // Derived state - lọc từ state hiện có
  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => !showInStockOnly || p.inStock);

  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div>
      <div className="filters">
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="🔍 Tìm kiếm..."
        />

        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'Tất cả' : cat}
            </option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            checked={showInStockOnly}
            onChange={e => setShowInStockOnly(e.target.checked)}
          />
          Chỉ còn hàng
        </label>
      </div>

      <p>Tìm thấy: {filteredProducts.length} / {products.length} sản phẩm</p>

      {filteredProducts.length === 0 ? (
        <p className="empty">Không tìm thấy sản phẩm nào 😢</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <p>{product.price.toLocaleString('vi-VN')}đ</p>
              <span className={product.inStock ? 'in-stock' : 'out-of-stock'}>
                {product.inStock ? '✅ Còn hàng' : '❌ Hết hàng'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 5. Sắp Xếp Danh Sách (Sort)

```jsx
function SortableTable() {
  const [employees] = useState([
    { id: 1, name: 'Nguyễn Văn A', age: 28, salary: 15000000, department: 'Engineering' },
    { id: 2, name: 'Trần Thị B', age: 32, salary: 20000000, department: 'Design' },
    { id: 3, name: 'Lê Văn C', age: 25, salary: 12000000, department: 'Engineering' },
    { id: 4, name: 'Phạm Thị D', age: 30, salary: 18000000, department: 'Marketing' },
  ]);

  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    let comparison = 0;
    if (typeof a[sortField] === 'string') {
      comparison = a[sortField].localeCompare(b[sortField]);
    } else {
      comparison = a[sortField] - b[sortField];
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span>↕️</span>;
    return sortDirection === 'asc' ? <span>⬆️</span> : <span>⬇️</span>;
  };

  return (
    <table>
      <thead>
        <tr>
          {['name', 'age', 'salary', 'department'].map(field => (
            <th key={field} onClick={() => handleSort(field)} style={{ cursor: 'pointer' }}>
              {field.charAt(0).toUpperCase() + field.slice(1)} <SortIcon field={field} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedEmployees.map(emp => (
          <tr key={emp.id}>
            <td>{emp.name}</td>
            <td>{emp.age}</td>
            <td>{emp.salary.toLocaleString('vi-VN')}đ</td>
            <td>{emp.department}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 6. Nhóm Danh Sách (Group)

```jsx
function GroupedList() {
  const tasks = [
    { id: 1, title: 'Thiết kế UI', status: 'done', priority: 'high' },
    { id: 2, title: 'Viết API', status: 'in-progress', priority: 'high' },
    { id: 3, title: 'Viết test', status: 'todo', priority: 'medium' },
    { id: 4, title: 'Deploy', status: 'todo', priority: 'low' },
    { id: 5, title: 'Code frontend', status: 'in-progress', priority: 'high' },
    { id: 6, title: 'Docs', status: 'done', priority: 'low' },
  ];

  // Nhóm theo status
  const groupedByStatus = tasks.reduce((groups, task) => {
    const key = task.status;
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
    return groups;
  }, {});

  const statusLabels = {
    'todo': { label: '📋 Cần làm', color: '#e3f2fd' },
    'in-progress': { label: '🔄 Đang làm', color: '#fff3e0' },
    'done': { label: '✅ Hoàn thành', color: '#e8f5e9' },
  };

  return (
    <div className="kanban-board" style={{ display: 'flex', gap: 16 }}>
      {Object.entries(groupedByStatus).map(([status, tasks]) => (
        <div
          key={status}
          className="kanban-column"
          style={{
            flex: 1,
            backgroundColor: statusLabels[status]?.color,
            padding: 16,
            borderRadius: 8
          }}
        >
          <h3>{statusLabels[status]?.label} ({tasks.length})</h3>
          {tasks.map(task => (
            <div key={task.id} className="task-card" style={{
              background: '#fff',
              padding: 12,
              margin: '8px 0',
              borderRadius: 6,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <p>{task.title}</p>
              <small>Ưu tiên: {task.priority}</small>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## 7. Render Nested Lists (Danh Sách Lồng Nhau)

```jsx
function FileExplorer() {
  const fileTree = [
    {
      id: 1, name: 'src', type: 'folder', children: [
        {
          id: 2, name: 'components', type: 'folder', children: [
            { id: 3, name: 'Header.jsx', type: 'file' },
            { id: 4, name: 'Footer.jsx', type: 'file' },
          ]
        },
        { id: 5, name: 'App.jsx', type: 'file' },
        { id: 6, name: 'main.jsx', type: 'file' },
      ]
    },
    { id: 7, name: 'package.json', type: 'file' },
    { id: 8, name: 'README.md', type: 'file' },
  ];

  // Component đệ quy (recursive)
  function TreeNode({ node, depth = 0 }) {
    const [isOpen, setIsOpen] = useState(true);
    const paddingLeft = depth * 20;

    if (node.type === 'file') {
      return (
        <div style={{ paddingLeft }} className="tree-file">
          📄 {node.name}
        </div>
      );
    }

    return (
      <div>
        <div
          style={{ paddingLeft, cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '📂' : '📁'} {node.name}
        </div>
        {isOpen && node.children?.map(child => (
          <TreeNode key={child.id} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  return (
    <div className="file-explorer">
      <h3>📁 File Explorer</h3>
      {fileTree.map(node => (
        <TreeNode key={node.id} node={node} />
      ))}
    </div>
  );
}
```

---

## 📝 Bài Tập Thực Hành

### Bài 1: Contact List
Render danh sách liên hệ với tìm kiếm, lọc theo nhóm (Gia đình, Bạn bè, Công việc), sắp xếp A-Z/Z-A.

### Bài 2: Shopping Cart
Giỏ hàng với: danh sách sản phẩm, thay đổi số lượng, xóa item, tính tổng tiền.

### Bài 3: Kanban Board
Board Kanban với 3 cột (Todo, In Progress, Done), có thể di chuyển task giữa các cột.

### Bài 4: File Explorer
Tạo file explorer đệ quy (recursive) có thể expand/collapse folders.

---

## 🔑 Tóm Tắt

| Khái niệm | Giải thích |
|-----------|------------|
| `map()` | Render mảng thành danh sách JSX elements |
| `key` | Identifer duy nhất giúp React theo dõi elements |
| ID as key | Luôn ưu tiên dùng ID từ data làm key |
| Index as key | Chỉ dùng khi danh sách tĩnh, không thay đổi |
| `filter()` | Lọc mảng trước khi render |
| `sort()` | Sắp xếp (nhớ tạo bản sao trước!) |
| `reduce()` | Nhóm dữ liệu theo category |
| Recursive | Render danh sách lồng nhau (tree) |

---

> **Bài trước:** [07 - Conditional Rendering ←](./07-conditional-rendering.md)  
> **Bài tiếp theo:** [09 - Forms →](./09-forms.md)
