# Stream API và Lambda Expressions - Câu hỏi phỏng vấn Java

## Mục lục
1. [Lambda Expressions](#lambda-expressions)
2. [Functional Interfaces](#functional-interfaces)
3. [Method References](#method-references)
4. [Stream API](#stream-api)
5. [Stream Operations](#stream-operations)
6. [Optional](#optional)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Lambda Expressions

### Syntax

```java
// Basic syntax
(parameters) -> expression
(parameters) -> { statements; }

// Examples
() -> System.out.println("Hello");
(x) -> x * 2;
(x, y) -> x + y;
(String s) -> s.length();
```

### Ví dụ

```java
// Before Java 8
List<String> list = Arrays.asList("Apple", "Banana", "Cherry");
Collections.sort(list, new Comparator<String>() {
    @Override
    public int compare(String s1, String s2) {
        return s1.compareTo(s2);
    }
});

// Java 8 with Lambda
Collections.sort(list, (s1, s2) -> s1.compareTo(s2));
list.sort((s1, s2) -> s1.compareTo(s2));

// Runnable
Runnable r = () -> System.out.println("Running");
new Thread(r).start();

// Or inline
new Thread(() -> System.out.println("Running")).start();
```

### Lambda với Multiple Statements

```java
// Single expression
Function<String, Integer> func = s -> s.length();

// Multiple statements
Function<String, String> func = s -> {
    String trimmed = s.trim();
    return trimmed.toUpperCase();
};
```

### Variable Capture

```java
int multiplier = 10;

// Lambda có thể access local variables (effectively final)
Function<Integer, Integer> multiply = x -> x * multiplier;

// multiplier = 20;  // ERROR: Cannot modify effectively final variable
```

---

## Functional Interfaces

### Định nghĩa

Functional Interface là interface có **exactly one abstract method**.

```java
@FunctionalInterface
public interface MyFunctionalInterface {
    void doSomething();
    
    // Có thể có default methods
    default void doSomethingElse() {
        System.out.println("Default implementation");
    }
    
    // Có thể có static methods
    static void staticMethod() {
        System.out.println("Static method");
    }
}
```

### Built-in Functional Interfaces
# Java Functional Interfaces

| Interface            | Đầu vào | Đầu ra  | Ý nghĩa / Ứng dụng | Ví dụ |
|----------------------|---------|---------|--------------------|-------|
| **Predicate<T>**     | T       | boolean | Kiểm tra điều kiện (true/false) | `Predicate<String> isEmpty = s -> s.isEmpty();` |
| **Function<T,R>**    | T       | R       | Biến đổi từ T sang R | `Function<String,Integer> length = s -> s.length();` |
| **Consumer<T>**      | T       | void    | Nhận dữ liệu, xử lý nhưng không trả về | `Consumer<String> printer = s -> System.out.println(s);` |
| **Supplier<R>**      | none    | R       | Cung cấp dữ liệu, không cần đầu vào | `Supplier<Double> random = () -> Math.random();` |
| **UnaryOperator<T>** | T       | T       | Biến đổi dữ liệu cùng kiểu | `UnaryOperator<Integer> square = x -> x*x;` |
| **BinaryOperator<T>**| T,T     | T       | Kết hợp 2 giá trị cùng kiểu thành 1 | `BinaryOperator<Integer> sum = (a,b) -> a+b;` |
| **BiFunction<T,U,R>**| T,U     | R       | Nhận 2 đầu vào khác kiểu, trả về R | `BiFunction<String,Integer,String> repeat = (s,n) -> s.repeat(n);` |


#### 1. Predicate<T>

```java
Predicate<String> isEmpty = s -> s.isEmpty();
Predicate<String> isLong = s -> s.length() > 10;

// Test
boolean result = isEmpty.test("");  // true
boolean result2 = isLong.test("Hello World");  // true

// Combine predicates
Predicate<String> isLongAndNotEmpty = isLong.and(isEmpty.negate());

// Usage
list.stream()
    .filter(s -> s.length() > 5)
    .forEach(System.out::println);
```

#### 2. Function<T, R>

```java
Function<String, Integer> length = s -> s.length();
Function<Integer, Integer> square = x -> x * x;

// Apply
Integer len = length.apply("Hello");  // 5
Integer sq = square.apply(5);  // 25

// Compose
Function<String, Integer> lengthThenSquare = length.andThen(square);
Integer result = lengthThenSquare.apply("Hi");  // 4 (2*2)

// Compose (reverse order)
Function<Integer, String> toString = String::valueOf;
Function<String, Integer> squareThenLength = square.compose(toString);
```

#### 3. Consumer<T>

```java
Consumer<String> printer = s -> System.out.println(s);
Consumer<String> upperCase = s -> System.out.println(s.toUpperCase());

// Accept
printer.accept("Hello");  // Prints: Hello

// Chain consumers
Consumer<String> printAndUpperCase = printer.andThen(upperCase);
printAndUpperCase.accept("Hello");
// Prints: Hello
// Prints: HELLO

// Usage
list.forEach(System.out::println);
```

#### 4. Supplier<T>

```java
Supplier<String> supplier = () -> "Hello";
Supplier<Double> random = () -> Math.random();
Supplier<LocalDateTime> now = LocalDateTime::now;

// Get
String value = supplier.get();  // "Hello"
Double rand = random.get();  // Random number

// Usage
Optional<String> optional = Optional.empty();
String value = optional.orElseGet(() -> "Default");
```

#### 5. UnaryOperator<T>

```java
UnaryOperator<String> upperCase = s -> s.toUpperCase();
UnaryOperator<Integer> increment = x -> x + 1;

// Apply
String result = upperCase.apply("hello");  // "HELLO"
Integer result2 = increment.apply(5);  // 6

// Compose
UnaryOperator<Integer> doubleThenIncrement = increment.andThen(x -> x * 2);
```

#### 6. BinaryOperator<T>

```java
BinaryOperator<Integer> add = (x, y) -> x + y;
BinaryOperator<Integer> multiply = (x, y) -> x * y;
BinaryOperator<String> concat = (s1, s2) -> s1 + s2;

// Apply
Integer sum = add.apply(5, 3);  // 8
Integer product = multiply.apply(5, 3);  // 15
String combined = concat.apply("Hello", "World");  // "HelloWorld"

// Usage
list.stream()
    .reduce(0, Integer::sum);
```

### Other Functional Interfaces

```java
// BiPredicate<T, U>
BiPredicate<String, Integer> isLonger = (s, len) -> s.length() > len;

// BiFunction<T, U, R>
BiFunction<String, Integer, String> repeat = (s, n) -> s.repeat(n);

// BiConsumer<T, U>
BiConsumer<String, Integer> print = (s, n) -> System.out.println(s + ": " + n);
```

---

## Method References

### Types

#### 1. Static Method Reference

```java
// Lambda
Function<String, Integer> parseInt = s -> Integer.parseInt(s);

// Method reference
Function<String, Integer> parseInt = Integer::parseInt;

// Usage
list.stream()
    .map(Integer::parseInt)
    .collect(Collectors.toList());
```

#### 2. Instance Method Reference

```java
// Lambda
Function<String, Integer> length = s -> s.length();

// Method reference
Function<String, Integer> length = String::length;

// Usage
list.stream()
    .map(String::length)
    .collect(Collectors.toList());
```

#### 3. Instance Method của Object cụ thể

```java
String prefix = "Hello ";

// Lambda
Function<String, String> addPrefix = s -> prefix.concat(s);

// Method reference
Function<String, String> addPrefix = prefix::concat;

// Usage
list.stream()
    .map(prefix::concat)
    .collect(Collectors.toList());
```

#### 4. Constructor Reference

```java
// Lambda
Supplier<List<String>> listSupplier = () -> new ArrayList<>();

// Constructor reference
Supplier<List<String>> listSupplier = ArrayList::new;

// With parameters
Function<Integer, List<String>> listWithSize = ArrayList::new;
List<String> list = listWithSize.apply(10);
```

### Common Examples

```java
// System.out::println
list.forEach(System.out::println);

// String::toUpperCase
list.stream().map(String::toUpperCase).collect(Collectors.toList());

// Integer::sum
list.stream().reduce(0, Integer::sum);

// String::compareToIgnoreCase
list.sort(String::compareToIgnoreCase);

// ArrayList::new
Supplier<List<String>> supplier = ArrayList::new;
```

---

## Stream API

### Tạo Stream

```java
// From Collection
List<String> list = Arrays.asList("A", "B", "C");
Stream<String> stream = list.stream();

// From Array
String[] array = {"A", "B", "C"};
Stream<String> stream = Arrays.stream(array);

// Static methods
Stream<String> stream = Stream.of("A", "B", "C");
Stream<Integer> numbers = Stream.iterate(0, n -> n + 1).limit(10);
Stream<Double> randoms = Stream.generate(Math::random).limit(5);

// Empty stream
Stream<String> empty = Stream.empty();

// From file
Stream<String> lines = Files.lines(Paths.get("file.txt"));
```

### Stream Characteristics

- **Non-mutating**: Không modify source collection
- **Lazy evaluation**: Chỉ execute khi có terminal operation
- **Functional**: Không có side effects
- **Potentially unbounded**: Có thể infinite

---

## Stream Operations

### Intermediate Operations (Lazy)

#### 1. filter()

```java
List<String> list = Arrays.asList("Apple", "Banana", "Cherry", "Date");

List<String> filtered = list.stream()
    .filter(s -> s.length() > 5)
    .collect(Collectors.toList());
// ["Banana", "Cherry"]
```

#### 2. map()

```java
List<String> list = Arrays.asList("apple", "banana", "cherry");

List<String> upperCase = list.stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());
// ["APPLE", "BANANA", "CHERRY"]

List<Integer> lengths = list.stream()
    .map(String::length)
    .collect(Collectors.toList());
// [5, 6, 6]
```

#### 3. flatMap()

```java
List<List<String>> nested = Arrays.asList(
    Arrays.asList("A", "B"),
    Arrays.asList("C", "D")
);

List<String> flat = nested.stream()
    .flatMap(List::stream)
    .collect(Collectors.toList());
// ["A", "B", "C", "D"]

// Split strings into characters
List<String> words = Arrays.asList("Hello", "World");
List<String> chars = words.stream()
    .flatMap(s -> Arrays.stream(s.split("")))
    .collect(Collectors.toList());
// ["H", "e", "l", "l", "o", "W", "o", "r", "l", "d"]
```

#### 4. distinct()

```java
List<Integer> numbers = Arrays.asList(1, 2, 2, 3, 3, 3, 4);

List<Integer> unique = numbers.stream()
    .distinct()
    .collect(Collectors.toList());
// [1, 2, 3, 4]
```

#### 5. sorted()

```java
List<String> list = Arrays.asList("Banana", "Apple", "Cherry");

// Natural order
List<String> sorted = list.stream()
    .sorted()
    .collect(Collectors.toList());
// ["Apple", "Banana", "Cherry"]

// Custom comparator
List<String> reverse = list.stream()
    .sorted(Comparator.reverseOrder())
    .collect(Collectors.toList());
// ["Cherry", "Banana", "Apple"]

// By length
List<String> byLength = list.stream()
    .sorted(Comparator.comparing(String::length))
    .collect(Collectors.toList());
```

#### 6. peek()

```java
List<String> list = Arrays.asList("A", "B", "C");

List<String> result = list.stream()
    .peek(System.out::println)  // Debug: print each element
    .map(String::toLowerCase)
    .peek(System.out::println)
    .collect(Collectors.toList());
```

#### 7. limit() và skip()

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// First 5
List<Integer> first5 = numbers.stream()
    .limit(5)
    .collect(Collectors.toList());
// [1, 2, 3, 4, 5]

// Skip first 3
List<Integer> skip3 = numbers.stream()
    .skip(3)
    .collect(Collectors.toList());
// [4, 5, 6, 7, 8, 9, 10]

// Pagination
int page = 2;
int pageSize = 5;
List<Integer> page2 = numbers.stream()
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .collect(Collectors.toList());
// [6, 7, 8, 9, 10]
```

### Terminal Operations (Eager)

#### 1. forEach()

```java
list.stream()
    .forEach(System.out::println);

// Parallel stream
list.parallelStream()
    .forEach(System.out::println);
```

#### 2. collect()

```java
// To List
List<String> list = stream.collect(Collectors.toList());

// To Set
Set<String> set = stream.collect(Collectors.toSet());

// To Map
Map<String, Integer> map = stream.collect(
    Collectors.toMap(
        s -> s,           // Key mapper
        String::length    // Value mapper
    )
);

// Grouping
Map<Integer, List<String>> grouped = stream.collect(
    Collectors.groupingBy(String::length)
);

// Partitioning
Map<Boolean, List<String>> partitioned = stream.collect(
    Collectors.partitioningBy(s -> s.length() > 5)
);

// Joining
String joined = stream.collect(Collectors.joining(", "));
```

#### 3. reduce()

```java
// Sum
Optional<Integer> sum = numbers.stream()
    .reduce(Integer::sum);

// With identity
Integer sum = numbers.stream()
    .reduce(0, Integer::sum);

// Custom reduction
String longest = list.stream()
    .reduce("", (s1, s2) -> s1.length() > s2.length() ? s1 : s2);
```

#### 4. findFirst() và findAny()

```java
Optional<String> first = list.stream()
    .filter(s -> s.startsWith("A"))
    .findFirst();

Optional<String> any = list.parallelStream()
    .filter(s -> s.startsWith("A"))
    .findAny();  // Faster in parallel streams
```

#### 5. anyMatch(), allMatch(), noneMatch()

```java
boolean hasA = list.stream()
    .anyMatch(s -> s.startsWith("A"));

boolean allLong = list.stream()
    .allMatch(s -> s.length() > 5);

boolean noneEmpty = list.stream()
    .noneMatch(String::isEmpty);
```

#### 6. count()

```java
long count = list.stream()
    .filter(s -> s.length() > 5)
    .count();
```

#### 7. min() và max()

```java
Optional<String> min = list.stream()
    .min(Comparator.naturalOrder());

Optional<String> max = list.stream()
    .max(Comparator.comparing(String::length));
```

---

## Optional

### Tạo Optional

```java
// Empty
Optional<String> empty = Optional.empty();

// Of (non-null)
Optional<String> optional = Optional.of("Hello");
// Optional.of(null);  // NullPointerException

// OfNullable (nullable)
Optional<String> nullable = Optional.ofNullable(getString());
```

### Operations

```java
Optional<String> optional = Optional.of("Hello");

// isPresent() và isEmpty()
if (optional.isPresent()) {
    String value = optional.get();
}

// ifPresent()
optional.ifPresent(System.out::println);

// orElse()
String value = optional.orElse("Default");

// orElseGet()
String value = optional.orElseGet(() -> "Default");

// orElseThrow()
String value = optional.orElseThrow(() -> new RuntimeException("Not found"));

// map()
Optional<Integer> length = optional.map(String::length);

// flatMap()
Optional<String> upper = optional.flatMap(s -> Optional.of(s.toUpperCase()));

// filter()
Optional<String> filtered = optional.filter(s -> s.length() > 5);
```

### Best Practices

```java
// ❌ Bad: Check và get
if (optional.isPresent()) {
    String value = optional.get();
    // Use value
}

// ✅ Good: ifPresent
optional.ifPresent(value -> {
    // Use value
});

// ❌ Bad: Nested optionals
Optional<Optional<String>> nested = optional.map(s -> Optional.of(s.toUpperCase()));

// ✅ Good: flatMap
Optional<String> upper = optional.flatMap(s -> Optional.of(s.toUpperCase()));

// ❌ Bad: Null check
String value = getString();
if (value != null) {
    // Use value
}

// ✅ Good: Optional
Optional.ofNullable(getString())
    .ifPresent(value -> {
        // Use value
    });
```

---

## Câu hỏi thường gặp

### Q1: Sự khác biệt giữa Stream và Collection?

| Feature | Collection | Stream |
|---------|------------|--------|
| **Storage** | Store elements | Don't store elements |
| **Mutability** | Can modify | Immutable |
| **Evaluation** | Eager | Lazy |
| **Traversable** | Multiple times | Once |
| **Operations** | Add, remove, etc. | Functional operations |

### Q2: Parallel Stream khi nào dùng?

```java
// Sequential
list.stream()
    .filter(s -> s.length() > 5)
    .collect(Collectors.toList());

// Parallel
list.parallelStream()
    .filter(s -> s.length() > 5)
    .collect(Collectors.toList());
```

**Khi dùng Parallel Stream:**
- Large datasets
- CPU-intensive operations
- Independent operations (no shared state)

**Khi không dùng:**
- Small datasets (overhead > benefit)
- Operations depend on order
- Shared mutable state

### Q3: Sự khác biệt giữa map() và flatMap()?

```java
// map(): 1-to-1 transformation
List<String> words = Arrays.asList("Hello", "World");
List<Integer> lengths = words.stream()
    .map(String::length)  // String -> Integer
    .collect(Collectors.toList());
// [5, 5]

// flatMap(): 1-to-many transformation, then flatten
List<String> words = Arrays.asList("Hello", "World");
List<String> chars = words.stream()
    .flatMap(s -> Arrays.stream(s.split("")))  // String -> Stream<String> -> flatten
    .collect(Collectors.toList());
// ["H", "e", "l", "l", "o", "W", "o", "r", "l", "d"]
```

### Q4: Stream có thể reuse không?

```java
// ❌ No: Stream can only be used once
Stream<String> stream = list.stream();
stream.forEach(System.out::println);
stream.forEach(System.out::println);  // IllegalStateException

// ✅ Yes: Create new stream each time
list.stream().forEach(System.out::println);
list.stream().forEach(System.out::println);
```

### Q5: Sự khác biệt giữa findFirst() và findAny()?

- **findFirst()**: Luôn trả về element đầu tiên (theo encounter order)
- **findAny()**: Trả về bất kỳ element nào (faster trong parallel streams)

### Q6: Optional.get() có an toàn không?

```java
// ❌ No: Có thể throw NoSuchElementException
Optional<String> empty = Optional.empty();
String value = empty.get();  // Exception

// ✅ Yes: Check trước
if (empty.isPresent()) {
    String value = empty.get();
}

// ✅ Better: Use orElse/orElseGet
String value = empty.orElse("Default");
```

---

## Best Practices

1. **Prefer method references** khi có thể
2. **Use Optional** thay vì null checks
3. **Avoid side effects** trong stream operations
4. **Use parallel streams** cho large datasets
5. **Chain operations** để code readable
6. **Use appropriate collectors** cho use case
7. **Avoid nested optionals** với flatMap
8. **Don't reuse streams**
9. **Use peek()** cho debugging only
10. **Prefer functional style** over imperative

---

## Bài tập thực hành

### Bài 1: Stream Operations

```java
// Yêu cầu: Cho List<Person> với name, age, city
// 1. Filter people > 18 tuổi
// 2. Group by city
// 3. Calculate average age per city
// 4. Find oldest person
```

### Bài 2: Optional Chaining

```java
// Yêu cầu: Implement method chain với Optional
// getPerson() -> Optional<Person>
// person.getAddress() -> Optional<Address>
// address.getCity() -> Optional<String>
// Return city name hoặc "Unknown"
```

### Bài 3: Custom Collector

```java
// Yêu cầu: Tạo custom collector để tính statistics
// - Count, Sum, Average, Min, Max
// Sử dụng trong stream
```

---

## Tổng kết

- **Lambda Expressions**: Anonymous functions, concise syntax
- **Functional Interfaces**: Single abstract method, @FunctionalInterface
- **Method References**: Shorthand cho lambdas
- **Stream API**: Functional programming cho collections
- **Stream Operations**: Intermediate (lazy) và Terminal (eager)
- **Optional**: Handle null values safely
- **Best Practices**: Functional style, avoid side effects, use appropriately
