# Collections Framework - Câu hỏi phỏng vấn Java

## Mục lục
1. [Tổng quan Collections Framework](#tổng-quan-collections-framework)
2. [List Interface](#list-interface)
3. [Set Interface](#set-interface)
4. [Map Interface](#map-interface)
5. [Queue Interface](#queue-interface)
6. [So sánh các Collections](#so-sánh-các-collections)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Tổng quan Collections Framework

### Hierarchy

```
Collection (Interface)
├── List (Interface)
│   ├── ArrayList
│   ├── LinkedList
│   └── Vector
│       └── Stack
├── Set (Interface)
│   ├── HashSet
│   ├── LinkedHashSet
│   └── TreeSet
└── Queue (Interface)
    ├── PriorityQueue
    └── Deque (Interface)
        ├── ArrayDeque
        └── LinkedList

Map (Interface)
├── HashMap
├── LinkedHashMap
├── TreeMap
└── Hashtable
```

### Core Interfaces

- **Collection**: Root interface cho tất cả collections
- **List**: Ordered collection, cho phép duplicates
- **Set**: Không cho phép duplicates
- **Map**: Key-value pairs
- **Queue**: FIFO hoặc priority-based

---

## List Interface

### ArrayList

```java
List<String> list = new ArrayList<>();

// Thêm elements
list.add("Apple");
list.add("Banana");
list.add(0, "Orange");  // Insert at index

// Access
String first = list.get(0);
int size = list.size();

// Iterate
for (String item : list) {
    System.out.println(item);
}

// Java 8+
list.forEach(System.out::println);
```

**Đặc điểm:**
- Dynamic array, tự động resize
- Random access: O(1)
- Insert/Delete ở giữa: O(n)
- Not synchronized (thread-unsafe)
- Cho phép null và duplicates

### LinkedList

```java
List<String> list = new LinkedList<>();

list.add("First");
list.addFirst("New First");
list.addLast("Last");
list.removeFirst();
list.removeLast();
```

**Đặc điểm:**
- Doubly linked list
- Insert/Delete: O(1) nếu có reference
- Random access: O(n)
- Better cho frequent insertions/deletions
- Not synchronized

### Vector vs ArrayList

```java
// Vector: Synchronized, thread-safe
Vector<String> vector = new Vector<>();

// ArrayList: Not synchronized, faster
ArrayList<String> list = new ArrayList<>();

// Thread-safe ArrayList
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
```

| Feature | ArrayList | Vector |
|---------|-----------|--------|
| **Synchronization** | No | Yes |
| **Performance** | Faster | Slower |
| **Growth** | 50% | 100% |
| **When to use** | Single-threaded | Multi-threaded (legacy) |

### Câu hỏi phỏng vấn

**Q: Khi nào dùng ArrayList, khi nào dùng LinkedList?**

**ArrayList:**
- Frequent random access
- Less insertions/deletions ở giữa
- Better memory efficiency

**LinkedList:**
- Frequent insertions/deletions
- Less random access
- Implement Queue/Deque

<img width="609" height="296" alt="image" src="https://github.com/user-attachments/assets/0c3b72f8-28c6-48e2-a37a-c97caec6ba62" />

**Q: Có thể tạo ArrayList với initial capacity không?**
```java
ArrayList<String> list = new ArrayList<>(100);  // Initial capacity 100
```

---

## Set Interface

### HashSet

```java
Set<String> set = new HashSet<>();

set.add("Apple");
set.add("Banana");
set.add("Apple");  // Duplicate, sẽ bị ignore

System.out.println(set.size());  // 2

// Check existence
boolean exists = set.contains("Apple");

// Iterate (order không guaranteed)
for (String item : set) {
    System.out.println(item);
}
```

**Đặc điểm:**
- Hash table implementation
- No duplicates
- No order guarantee
- O(1) average time cho add, remove, contains
- Cho phép null (chỉ 1 null)

### LinkedHashSet

```java
Set<String> set = new LinkedHashSet<>();

set.add("Apple");
set.add("Banana");
set.add("Cherry");

// Maintains insertion order
for (String item : set) {
    System.out.println(item);  // Apple, Banana, Cherry
}
```

**Đặc điểm:**
- Giống HashSet nhưng maintain insertion order
- Slightly slower than HashSet
- O(1) operations

### TreeSet

```java
Set<String> set = new TreeSet<>();

set.add("Banana");
set.add("Apple");
set.add("Cherry");

// Sorted order
for (String item : set) {
    System.out.println(item);  // Apple, Banana, Cherry
}

// Custom comparator
Set<Person> people = new TreeSet<>((p1, p2) -> 
    p1.getAge() - p2.getAge());
```

**Đặc điểm:**
- Red-Black tree implementation
- Sorted order (natural hoặc comparator)
- O(log n) cho add, remove, contains
- Không cho phép null (nếu không có comparator)

### Câu hỏi phỏng vấn

**Q: Sự khác biệt giữa HashSet, LinkedHashSet, TreeSet?**

| Feature | HashSet | LinkedHashSet | TreeSet |
|---------|---------|---------------|---------|
| **Order** | No | Insertion | Sorted |
| **Performance** | O(1) | O(1) | O(log n) |
| **Null allowed** | Yes (1) | Yes (1) | No |
| **Implementation** | Hash table | Hash table + LinkedList | Red-Black tree |

1️⃣ HashSet

Dựa trên HashMap → cấu trúc hash table
Không duy trì thứ tự
Performance:

add → O(1)
remove → O(1)
contains → O(1)


Không chứa phần tử trùng lặp
Không có index / không random access

📌 Dùng khi:
Bạn cần Set đơn giản, hiệu năng cao nhất, không quan tâm thứ tự.

2️⃣ LinkedHashSet

Dựa trên LinkedHashMap
→ nghĩa là HashMap + doubly linked list để duy trì thứ tự
Duy trì thứ tự insertion (hoặc access-order nếu bật)
Performance:

add → O(1)
remove → O(1)
contains → O(1)


Không chứa phần tử trùng lặp
Không có index / không random access

📌 Dùng khi:
Cần Set không trùng lặp nhưng vẫn giữ thứ tự đã thêm.

3️⃣ TreeSet

Dựa trên Red-Black Tree
Các phần tử được sắp xếp tự động theo:

natural order, hoặc
comparator bạn cung cấp


Performance:

add → O(log n)
remove → O(log n)
contains → O(log n)


Không hỗ trợ index / random access (vì là cây, không phải mảng)

📌 Dùng khi:
Cần một Set được sort tự động và hỗ trợ tìm kiếm theo thứ tự (higher(), lower(),…).

**Q: Làm sao để Set không cho phép duplicates?**

Set sử dụng `equals()` và `hashCode()` để check duplicates:

```java
class Person {
    private String name;
    private int age;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Person person = (Person) o;
        return age == person.age && Objects.equals(name, person.name);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
}
```

**Q: Tại sao phải override cả equals() và hashCode()?**
- Contract: Nếu 2 objects equal thì phải có cùng hashCode
- HashSet/HashMap sử dụng hashCode để tìm bucket, sau đó dùng equals() để compare

---

## Map Interface

### HashMap

```java
Map<String, Integer> map = new HashMap<>();

// Put
map.put("Apple", 10);
map.put("Banana", 20);
map.put("Apple", 15);  // Overwrite previous value

// Get
Integer count = map.get("Apple");  // 15
Integer count2 = map.getOrDefault("Cherry", 0);  // 0

// Check
boolean exists = map.containsKey("Apple");
boolean hasValue = map.containsValue(15);

// Iterate
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// Java 8+
map.forEach((key, value) -> 
    System.out.println(key + ": " + value));
```

**Đặc điểm:**
- Hash table implementation
- No order guarantee
- O(1) average time cho put, get, remove
- Cho phép null key (1) và null values
- Not synchronized

### LinkedHashMap

```java
Map<String, Integer> map = new LinkedHashMap<>();

map.put("Apple", 10);
map.put("Banana", 20);
map.put("Cherry", 30);

// Maintains insertion order
for (String key : map.keySet()) {
    System.out.println(key);  // Apple, Banana, Cherry
}

// Access order (LRU cache)
Map<String, Integer> lruCache = new LinkedHashMap<>(16, 0.75f, true) {
    @Override
    protected boolean removeEldestEntry(Map.Entry<String, Integer> eldest) {
        return size() > 100;  // Max 100 entries
    }
};
```

**Đặc điểm:**
- Giống HashMap nhưng maintain order
- Có thể maintain insertion order hoặc access order
- Useful cho LRU cache

### TreeMap

```java
Map<String, Integer> map = new TreeMap<>();

map.put("Banana", 20);
map.put("Apple", 10);
map.put("Cherry", 30);

// Sorted by key
for (String key : map.keySet()) {
    System.out.println(key);  // Apple, Banana, Cherry
}

// Custom comparator
Map<Person, Integer> people = new TreeMap<>((p1, p2) -> 
    p1.getAge() - p2.getAge());
```

**Đặc điểm:**
- Red-Black tree implementation
- Sorted by keys
- O(log n) cho put, get, remove
- Không cho phép null key

### Hashtable vs HashMap

```java
// Hashtable: Synchronized, thread-safe
Hashtable<String, Integer> table = new Hashtable<>();

// HashMap: Not synchronized, faster
HashMap<String, Integer> map = new HashMap<>();

// Thread-safe HashMap
Map<String, Integer> syncMap = Collections.synchronizedMap(new HashMap<>());

// ConcurrentHashMap: Better cho multi-threading
ConcurrentHashMap<String, Integer> concurrentMap = new ConcurrentHashMap<>();
```

| Feature | HashMap | Hashtable |
|---------|---------|-----------|
| **Synchronization** | No | Yes |
| **Null keys/values** | Yes | No |
| **Performance** | Faster | Slower |
| **Legacy** | Modern | Legacy |

### Câu hỏi phỏng vấn

**Q: Internal working của HashMap?**

1. **Hash Function**: `hashCode()` của key được hash
2. **Bucket**: Hash value xác định bucket index
3. **Collision**: Nhiều keys có cùng hash → stored trong linked list hoặc tree (Java 8+) bên trong bucket. Khi size đủ lơn thì nó sẽ huyển từ linked list -> tree. Phần tử trong linked list sẽ có dang [Node: key ="A", value=100] -> [Node: key="B", value=200]
4. **Load Factor**: Default 0.75, khi 75% full thì resize (double size)

Từ key -> lấy được hash value thông qua hashCode() -> từ hash value chúng ta có được index của bucket -> Từ index bucket chúng ta sẽ lấy được vị trí của bucket và lấy ra giá trị, trong trường hợp collision chúng ta vẫn lấy được đúng giá trị vì nó duyệt các phần tử là có so sánh key để lấy giá trị

```java
// HashMap structure
// Bucket 0: [Entry1 -> Entry2 -> null]
// Bucket 1: [Entry3 -> null]
// Bucket 2: [null]
```

**Q: Tại sao HashMap không thread-safe?**

- Multiple threads có thể modify cùng lúc
- Có thể dẫn đến data corruption hoặc infinite loop
- Sử dụng `ConcurrentHashMap` cho thread-safety

**Q: ConcurrentHashMap vs synchronizedMap?**

**ConcurrentHashMap:**
- Lock ở bucket level (segment locking)
- Better performance cho concurrent access
- Không lock toàn bộ map

**synchronizedMap:**
- Lock toàn bộ map
- Slower nhưng đơn giản hơn

---

## Queue Interface

### PriorityQueue

```java
Queue<Integer> queue = new PriorityQueue<>();

queue.offer(5);
queue.offer(2);
queue.offer(8);
queue.offer(1);

// Poll: Lấy và remove element nhỏ nhất
while (!queue.isEmpty()) {
    System.out.println(queue.poll());  // 1, 2, 5, 8
}

// Custom comparator
Queue<Person> people = new PriorityQueue<>((p1, p2) -> 
    p1.getAge() - p2.getAge());
```

**Đặc điểm:**
- Min-heap implementation
- O(log n) cho insert, O(1) cho peek
- Not thread-safe

### ArrayDeque

```java
Deque<String> deque = new ArrayDeque<>();

// Add
deque.addFirst("First");
deque.addLast("Last");
deque.offerFirst("New First");
deque.offerLast("New Last");

// Remove
String first = deque.removeFirst();
String last = deque.removeLast();
String peek = deque.peekFirst();

// Stack operations
deque.push("Top");
String top = deque.pop();
```

**Đặc điểm:**
- Resizable array implementation
- Faster than Stack và LinkedList
- O(1) cho add/remove ở cả 2 đầu
- Not thread-safe

### BlockingQueue

```java
BlockingQueue<String> queue = new ArrayBlockingQueue<>(10);

// Producer
queue.put("Item");  // Block nếu full

// Consumer
String item = queue.take();  // Block nếu empty

// Non-blocking
queue.offer("Item");  // Return false nếu full
String item = queue.poll();  // Return null nếu empty
```

---

## So sánh các Collections

### Time Complexity

| Operation | ArrayList | LinkedList | HashSet | TreeSet | HashMap | TreeMap |
|-----------|-----------|------------|---------|---------|---------|---------|
| **Add** | O(1) amortized | O(1) | O(1) | O(log n) | O(1) | O(log n) |
| **Remove** | O(n) | O(1) | O(1) | O(log n) | O(1) | O(log n) |
| **Get/Search** | O(1) | O(n) | O(1) | O(log n) | O(1) | O(log n) |
| **Contains** | O(n) | O(n) | O(1) | O(log n) | O(1) | O(log n) |

### Khi nào dùng gì?

**List:**
- Cần order và duplicates → ArrayList (random access) hoặc LinkedList (frequent insert/delete)

**Set:**
- Không cần duplicates
  - Không cần order → HashSet
  - Cần insertion order → LinkedHashSet
  - Cần sorted → TreeSet

**Map:**
- Key-value pairs
  - Không cần order → HashMap
  - Cần insertion/access order → LinkedHashMap
  - Cần sorted → TreeMap
  - Thread-safe → ConcurrentHashMap

**Queue:**
- FIFO → ArrayDeque
- Priority → PriorityQueue
- Thread-safe → BlockingQueue implementations

---

## Câu hỏi thường gặp

### Q1: Fail-fast vs Fail-safe iterators

```java
// Fail-fast: Throw ConcurrentModificationException
List<String> list = new ArrayList<>();
list.add("A");
Iterator<String> it = list.iterator();
list.add("B");  // Modify after iterator created
it.next();  // ConcurrentModificationException

// Fail-safe: Work on snapshot
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put("A", 1);
Iterator<Map.Entry<String, Integer>> it = map.entrySet().iterator();
map.put("B", 2);  // OK, iterator works on snapshot
```

### Q2: Comparable vs Comparator

```java
// Comparable: Natural ordering (implement trong class)
class Person implements Comparable<Person> {
    private int age;
    
    @Override
    public int compareTo(Person other) {
        return this.age - other.age;
    }
}

// Comparator: External ordering
Comparator<Person> byAge = (p1, p2) -> p1.getAge() - p2.getAge();
Collections.sort(people, byAge);
```

### Q3: Collections vs Collection

- **Collection**: Interface (List, Set, Queue extend từ đây)
- **Collections**: Utility class với static methods (sort, reverse, synchronized, etc.)

```java
Collections.sort(list);
Collections.reverse(list);
Collections.shuffle(list);
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
```

### Q4: Làm sao sort một List?

```java
List<String> list = Arrays.asList("Banana", "Apple", "Cherry");

// Natural order
Collections.sort(list);

// Custom comparator
Collections.sort(list, (s1, s2) -> s1.length() - s2.length());

// Java 8+
list.sort(Comparator.naturalOrder());
list.sort(Comparator.comparing(String::length));
list.sort(Comparator.comparing(String::length).reversed());
```

### Q5: Làm sao convert Array sang List?

```java
String[] array = {"A", "B", "C"};

// Fixed-size list (backed by array)
List<String> list1 = Arrays.asList(array);

// Mutable list
List<String> list2 = new ArrayList<>(Arrays.asList(array));

// Java 8+
List<String> list3 = Arrays.stream(array).collect(Collectors.toList());
```

### Q6: Immutable Collections

```java
// Java 9+
List<String> immutable = List.of("A", "B", "C");
Set<String> immutableSet = Set.of("A", "B");
Map<String, Integer> immutableMap = Map.of("A", 1, "B", 2);

// Collections.unmodifiableXXX
List<String> unmodifiable = Collections.unmodifiableList(new ArrayList<>());
```

---

## Best Practices

1. **Chọn đúng Collection type** dựa trên requirements
2. **Override equals() và hashCode()** cho custom objects trong Set/Map
3. **Sử dụng generics** để type-safe
4. **Prefer interface types** (List, Set, Map) thay vì concrete implementations
5. **Thread-safety**: Sử dụng ConcurrentHashMap, CopyOnWriteArrayList cho concurrent access
6. **Performance**: Chọn collection phù hợp với use case

---

## Bài tập thực hành

### Bài 1: Tìm duplicates trong array

```java
// Yêu cầu: Tìm và in ra các phần tử duplicate
int[] arr = {1, 2, 3, 2, 4, 3, 5};
// Output: [2, 3]
```

### Bài 2: Implement LRU Cache

```java
// Yêu cầu: Implement LRU Cache sử dụng LinkedHashMap
// Methods: get(key), put(key, value)
// Khi cache full, remove least recently used item
```

### Bài 3: Group by và count

```java
// Yêu cầu: Group các Person theo age và count số lượng
List<Person> people = ...;
// Output: Map<Age, Count>
```

---

## HashMap Internal Working - Chi tiết

### Hash Function và Buckets

```java
// HashMap structure
// Bucket 0: [Entry1 -> Entry2 -> null]
// Bucket 1: [Entry3 -> null]
// Bucket 2: [null]
// ...

// Hash calculation
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}

// Bucket index calculation
int index = (n - 1) & hash(key);  // n = capacity (power of 2)
```

### Collision Resolution

**Java 8 trước:**
- Chỉ dùng linked list cho collisions
- O(n) worst case

**Java 8+:**
- Linked list khi ít elements (< 8)
- Red-Black tree khi nhiều elements (>= 8)
- O(log n) worst case với tree

```java
// HashMap structure với tree
// Bucket 0: [Entry1 -> Entry2 -> Tree Node]
//           Tree: Entry3
//                  /    \
//              Entry4  Entry5
```

### Load Factor và Resizing

```java
// Default values
static final float DEFAULT_LOAD_FACTOR = 0.75f;
static final int DEFAULT_INITIAL_CAPACITY = 16;

// Resize khi: size > capacity * loadFactor
// New capacity = old capacity * 2
// Rehash tất cả entries
```

**Ví dụ:**
- Initial capacity: 16
- Load factor: 0.75
- Resize khi: size > 12 (16 * 0.75)
- New capacity: 32

### equals() và hashCode() Contract

```java
class Person {
    private String name;
    private int age;
    
    // Contract: If two objects are equal, they must have same hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Person person = (Person) o;
        return age == person.age && Objects.equals(name, person.name);
    }
    
    @Override
    public int hashCode() {
        // Must use same fields as equals()
        return Objects.hash(name, age);
    }
}

// Violating contract - DANGEROUS!
class BadPerson {
    @Override
    public boolean equals(Object o) {
        // Uses name and age
    }
    
    @Override
    public int hashCode() {
        return name.hashCode();  // Only uses name - WRONG!
    }
    // Two objects can be equal but have different hashCodes
    // This breaks HashMap/HashSet behavior!
}
```

### HashMap vs Hashtable vs ConcurrentHashMap

```java
// HashMap: Not thread-safe, allows null
HashMap<String, Integer> map = new HashMap<>();
map.put(null, 1);  // OK
map.put("key", null);  // OK

// Hashtable: Thread-safe, no null
Hashtable<String, Integer> table = new Hashtable<>();
table.put(null, 1);  // NullPointerException
table.put("key", null);  // NullPointerException

// ConcurrentHashMap: Thread-safe, no null, better performance
ConcurrentHashMap<String, Integer> concurrent = new ConcurrentHashMap<>();
concurrent.put(null, 1);  // NullPointerException
concurrent.put("key", null);  // NullPointerException

// Performance comparison (concurrent access):
// Hashtable: Locks entire table
// ConcurrentHashMap: Locks only bucket/segment
```

## Advanced Interview Questions

### Q1: Tại sao HashMap initial capacity là 16?

```java
// 16 = 2^4, power of 2
// Benefits:
// 1. Fast modulo: index = hash & (capacity - 1) instead of hash % capacity
// 2. Better distribution of hash values
// 3. Efficient resizing: new capacity = old * 2

// Example:
int hash = 12345;
int capacity = 16;
int index = hash & (capacity - 1);  // Fast: 12345 & 15 = 9

// vs
int index = hash % capacity;  // Slower: 12345 % 16 = 9
```

### Q2: Tại sao load factor là 0.75?

**Trade-off giữa:**
- **Space**: Lower load factor = more space, fewer collisions
- **Time**: Higher load factor = less space, more collisions

**0.75 là optimal:**
- Balance giữa space và time
- Statistical analysis shows best performance
- 75% full = good balance

### Q3: HashMap resize process?

```java
// 1. Create new array với double capacity
Node<K,V>[] newTable = new Node[oldCapacity * 2];

// 2. Rehash all entries
for (Node<K,V> e : oldTable) {
    while (e != null) {
        Node<K,V> next = e.next;
        int newIndex = (newCapacity - 1) & hash(e.key);
        e.next = newTable[newIndex];
        newTable[newIndex] = e;
        e = next;
    }
}

// 3. Replace old table
table = newTable;
```

### Q4: ConcurrentModificationException - Tại sao?

```java
// ❌ Throws ConcurrentModificationException
List<String> list = new ArrayList<>();
list.add("A");
list.add("B");

for (String item : list) {
    list.remove(item);  // Exception!
}

// ✅ Solution 1: Use Iterator
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String item = it.next();
    it.remove();  // Safe
}

// ✅ Solution 2: Use removeIf (Java 8+)
list.removeIf(item -> item.equals("A"));

// ✅ Solution 3: Collect items to remove first
List<String> toRemove = new ArrayList<>();
for (String item : list) {
    if (shouldRemove(item)) {
        toRemove.add(item);
    }
}
list.removeAll(toRemove);
```

### Q5: ArrayList vs Vector - Performance?

```java
// ArrayList: Not synchronized, faster
ArrayList<String> list = new ArrayList<>();
// Single-threaded: Fast
// Multi-threaded: Need external synchronization

// Vector: Synchronized, slower
Vector<String> vector = new Vector<>();
// Multi-threaded: Thread-safe but slower

// Performance test (10,000,000 operations):
// ArrayList: ~500ms
// Vector: ~2000ms (4x slower due to synchronization)
```

### Q6: TreeSet/TreeMap - Red-Black Tree?

```java
// Red-Black Tree properties:
// 1. Every node is either red or black
// 2. Root is always black
// 3. No two red nodes are adjacent
// 4. Every path from root to null has same number of black nodes

// Benefits:
// - Self-balancing
// - O(log n) for insert, delete, search
// - Maintains sorted order

// TreeSet implementation
TreeSet<Integer> set = new TreeSet<>();
set.add(5);
set.add(2);
set.add(8);
set.add(1);
// Internally stored as balanced tree
// In-order traversal: 1, 2, 5, 8
```

### Q7: PriorityQueue - Heap Implementation?

```java
// PriorityQueue uses min-heap
// Parent is always <= children

// Structure:
//        1
//       / \
//      2   3
//     / \ / \
//    4  5 6  7

// Operations:
// - Insert: O(log n) - bubble up
// - Remove min: O(log n) - bubble down
// - Peek: O(1)

PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(5);
pq.offer(2);
pq.offer(8);
pq.offer(1);

while (!pq.isEmpty()) {
    System.out.println(pq.poll());  // 1, 2, 5, 8
}
```

### Q8: CopyOnWriteArrayList - Khi nào dùng?

```java
// CopyOnWriteArrayList: Thread-safe, read-heavy scenarios

// How it works:
// - Read operations: No locking, fast
// - Write operations: Create new copy, then replace

List<String> list = new CopyOnWriteArrayList<>();
list.add("A");

// Thread 1: Reading (no lock)
for (String item : list) {
    System.out.println(item);  // Fast, no synchronization
}

// Thread 2: Writing (creates copy)
list.add("B");  // Creates new array, replaces old one

// Use cases:
// - Read-heavy (many reads, few writes)
// - Iterators should not throw ConcurrentModificationException
// - Small to medium size lists

// ❌ Not good for:
// - Write-heavy scenarios (too many copies)
// - Large lists (memory overhead)
```

### Q9: Custom Comparator Examples

```java
// Natural order
List<String> list = Arrays.asList("Banana", "Apple", "Cherry");
list.sort(Comparator.naturalOrder());

// Reverse order
list.sort(Comparator.reverseOrder());

// Custom comparator
list.sort((s1, s2) -> s1.length() - s2.length());

// Multiple criteria
List<Person> people = Arrays.asList(...);
people.sort(Comparator
    .comparing(Person::getAge)
    .thenComparing(Person::getName)
    .reversed());

// Null handling
list.sort(Comparator.nullsFirst(Comparator.naturalOrder()));
list.sort(Comparator.nullsLast(Comparator.naturalOrder()));
```

### Q10: Performance Optimization Tips

```java
// 1. Set initial capacity nếu biết size
List<String> list = new ArrayList<>(1000);  // Avoid resizing

// 2. Use appropriate collection
// Random access → ArrayList
// Frequent insert/delete → LinkedList
// No duplicates → Set
// Key-value → Map

// 3. Use stream operations cho complex operations
List<String> result = list.stream()
    .filter(s -> s.length() > 5)
    .map(String::toUpperCase)
    .collect(Collectors.toList());

// 4. Use parallel streams cho large datasets
List<String> result = largeList.parallelStream()
    .filter(s -> s.length() > 5)
    .collect(Collectors.toList());

// 5. Use ConcurrentHashMap cho concurrent access
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

// 6. Use Immutable collections khi có thể
List<String> immutable = List.of("A", "B", "C");
Set<String> immutableSet = Set.of("A", "B");
Map<String, Integer> immutableMap = Map.of("A", 1, "B", 2);
```

## Tổng kết

- **List**: Ordered, duplicates allowed → ArrayList, LinkedList
- **Set**: No duplicates → HashSet, LinkedHashSet, TreeSet
- **Map**: Key-value → HashMap, LinkedHashMap, TreeMap
- **Queue**: FIFO/Priority → ArrayDeque, PriorityQueue
- **Thread-safety**: ConcurrentHashMap, CopyOnWriteArrayList
- **Performance**: Chọn collection phù hợp với use case
- **HashMap Internal**: Hash function, buckets, collision resolution, resizing
- **Best Practices**: Proper equals/hashCode, initial capacity, appropriate collection type
