# JVM và Memory Management - Câu hỏi phỏng vấn Java

## Mục lục
1. [JVM Architecture](#jvm-architecture)
2. [Memory Areas](#memory-areas)
3. [Garbage Collection](#garbage-collection)
4. [GC Algorithms](#gc-algorithms)
5. [Memory Leaks](#memory-leaks)
6. [Performance Tuning](#performance-tuning)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## JVM Architecture

### Components

```
┌─────────────────────────────────────┐
│         Java Application            │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Class Loader Subsystem       │
│  - Loading, Linking, Initialization  │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Runtime Data Areas           │
│  - Method Area, Heap, Stack, PC      │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Execution Engine                │
│  - Interpreter, JIT Compiler         │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Garbage Collector                │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Native Method Interface (JNI)   │
└─────────────────────────────────────┘
```

### Class Loader Subsystem

**Loading:**
- Load .class files vào memory
- Tạo Class objects

**Linking:**
- Verification: Kiểm tra bytecode
- Preparation: Allocate memory cho static variables
- Resolution: Resolve symbolic references

**Initialization:**
- Initialize static variables
- Execute static blocks

---

## Memory Areas

### Heap Memory

**Đặc điểm:**
- Shared bởi tất cả threads
- Store objects và arrays
- Managed bởi Garbage Collector

**Structure:**

```
┌─────────────────────────────────┐
│          Heap Memory            │
├─────────────────────────────────┤
│     Young Generation            │
│   ┌───────────────────────┐     │
│   │   Eden Space          │     │
│   └───────────────────────┘     │
│   ┌───────────────────────┐     │
│   │   Survivor S0        │     │
│   └───────────────────────┘     │
│   ┌───────────────────────┐     │
│   │   Survivor S1        │     │
│   └───────────────────────┘     │
├─────────────────────────────────┤
│     Old Generation               │
│   (Tenured Space)                │
├─────────────────────────────────┤
│     Metaspace (Java 8+)          │
│   (PermGen in Java 7-)           │
└─────────────────────────────────┘
```

**Young Generation:**
- Eden: New objects được tạo ở đây
- Survivor S0, S1: Objects sống sót sau minor GC

**Old Generation:**
- Objects sống lâu (survived nhiều GC cycles)
- Major GC (Full GC) chạy ở đây

**Metaspace (Java 8+):**
- Store class metadata
- Native memory, không giới hạn bởi -XX:MaxPermSize
- Thay thế PermGen

### Stack Memory

**Đặc điểm:**
- Private cho mỗi thread
- Store local variables, method calls (vs trường hợp object, stack lưu tham chiếu, heap lưu dữ liệu thật của object)
- Fast access

**Structure:**

```
┌─────────────────────┐
│   Stack Frame 1     │  ← Current method
│  - Local variables  │
│  - Operand stack    │
│  - Reference data    │
├─────────────────────┤
│   Stack Frame 2     │  ← Calling method
│  - Local variables  │
│  - Operand stack    │
│  - Reference data    │
└─────────────────────┘
```

**Stack Frame chứa:**
- Local variables
- Operand stack
- Reference to runtime constant pool
- Return address

### Method Area (PermGen/Metaspace)

**Java 7 và trước:**
- PermGen: Fixed size, có thể OutOfMemoryError

**Java 8+:**
- Metaspace: Native memory, auto-resize
- Store class metadata, static variables, method data

### Program Counter (PC) Register

- Mỗi thread có PC register riêng
- Store address của instruction hiện tại
- Native methods: PC register = undefined

### Native Method Stack

- Cho native methods (JNI)
- Mỗi thread có native stack riêng

---

## Garbage Collection

### Object Lifecycle

```
Object Created (Eden)
    ↓
Minor GC → Survive? → Move to Survivor
    ↓
Multiple Minor GCs → Still alive? → Move to Old Generation
    ↓
Major GC → Still alive? → Keep in Old Generation
    ↓
Major GC → Not referenced? → Collected
```

### GC Process

**Minor GC (Young Generation):**
1. Objects trong Eden được check
2. Live objects move sang Survivor
3. Objects trong Survivor được check
4. Live objects move sang Survivor khác hoặc Old Generation
5. Dead objects được collected

**Major GC (Full GC):**
1. Collect cả Young và Old Generation
2. Stop-the-world (STW) - pause application
3. Slower than Minor GC

### GC Roots

Objects được coi là "live" nếu reachable từ GC roots:

- Local variables trong active stack frames
- Static variables
- Threads
- JNI references
- Monitors

### Reachability

```
Strong Reference → Object is reachable
Soft Reference → Collected khi memory pressure
Weak Reference → Collected in next GC
Phantom Reference → Collected, notification before finalization
```

---

## GC Algorithms

### Serial GC

```bash
-XX:+UseSerialGC
```

**Đặc điểm:**
- Single-threaded
- Stop-the-world
- Good cho small applications
- Low overhead

**Use case:** Small applications, single-core systems

### Parallel GC (Throughput Collector)

```bash
-XX:+UseParallelGC
-XX:ParallelGCThreads=4
```

**Đặc điểm:**
- Multi-threaded
- Stop-the-world
- Maximize throughput
- Default trên server-class machines

**Use case:** Batch processing, high throughput

### CMS (Concurrent Mark Sweep) - Deprecated

```bash
-XX:+UseConcMarkSweepGC
```

**Đặc điểm:**
- Concurrent marking và sweeping
- Lower pause times
- More CPU usage
- Fragmentation issues

**Status:** Deprecated từ Java 9, removed từ Java 14

### G1 GC (Garbage First)

```bash
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
```

**Đặc điểm:**
- Low-latency collector
- Concurrent và parallel
- Heap divided into regions
- Predictable pause times

**Use case:** Large heaps (>4GB), low-latency requirements

### ZGC (Z Garbage Collector)

```bash
-XX:+UseZGC
```

**Đặc điểm:**
- Ultra-low latency (<10ms pauses)
- Scalable to large heaps
- Concurrent marking, relocating, compacting
- Available từ Java 11 (experimental), production từ Java 15

**Use case:** Very large heaps, ultra-low latency

### Shenandoah GC

```bash
-XX:+UseShenandoahGC
```

**Đặc điểm:**
- Low-latency collector
- Concurrent evacuation
- Similar to ZGC
- Available từ Java 12

**Use case:** Low-latency applications

### GC Selection Guide

| GC | Heap Size | Pause Time | Throughput | Use Case |
|----|-----------|------------|------------|----------|
| **Serial** | Small | High | Medium | Small apps |
| **Parallel** | Medium | High | High | Batch processing |
| **G1** | Large | Low | Medium | General purpose |
| **ZGC** | Very Large | Ultra-low | Medium | Low-latency |
| **Shenandoah** | Large | Low | Medium | Low-latency |

---

## Memory Leaks

### Common Causes

#### 1. Static Collections

```java
// ❌ Bad: Static collection không bao giờ clear
private static List<Object> cache = new ArrayList<>();

public void addToCache(Object obj) {
    cache.add(obj);  // Objects never removed
}

// ✅ Good: Use bounded cache hoặc clear periodically
private static final int MAX_SIZE = 1000;
private static List<Object> cache = new ArrayList<>();

public void addToCache(Object obj) {
    if (cache.size() >= MAX_SIZE) {
        cache.remove(0);
    }
    cache.add(obj);
}
```

#### 2. Unclosed Resources

```java
// ❌ Bad: Resources không được close
public void readFile() {
    FileReader file = new FileReader("file.txt");
    // File not closed
}

// ✅ Good: Use try-with-resources
public void readFile() {
    try (FileReader file = new FileReader("file.txt")) {
        // Auto-closed
    }
}
```

#### 3. Listeners không được remove

```java
// ❌ Bad: Listener không được remove
button.addActionListener(listener);
// Listener reference button, button reference listener → circular reference

// ✅ Good: Remove listener khi không cần
button.removeActionListener(listener);
```

#### 4. Inner Classes reference Outer Class

```java
// ❌ Bad: Inner class giữ reference đến outer class
class Outer {
    private byte[] data = new byte[1000000];
    
    class Inner {
        // Giữ reference đến Outer, data không thể GC
    }
}

// ✅ Good: Use static inner class nếu không cần outer reference
static class Inner {
    // Không giữ reference đến Outer
}
```

#### 5. ThreadLocal không được clear

```java
// ❌ Bad: ThreadLocal không được remove
ThreadLocal<Object> threadLocal = new ThreadLocal<>();
threadLocal.set(new Object());
// Object không được GC nếu thread còn sống

// ✅ Good: Remove khi không cần
threadLocal.remove();
```

### Detecting Memory Leaks

#### 1. Heap Dump Analysis

```bash
# Generate heap dump
jmap -dump:format=b,file=heap.hprof <pid>

# Analyze với jhat hoặc Eclipse MAT
jhat heap.hprof
```

#### 2. JVM Options

```bash
# Enable GC logging
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-Xloggc:gc.log

# Enable heap dump on OOM
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/path/to/dump.hprof
```

#### 3. Monitoring Tools

- **jstat**: GC statistics
- **jmap**: Heap dump
- **jconsole**: Visual monitoring
- **VisualVM**: Profiling
- **Eclipse MAT**: Heap analysis

---

## Performance Tuning

### Heap Size Tuning

```bash
# Initial heap size
-Xms2g

# Maximum heap size
-Xmx4g

# Young generation size
-Xmn1g

# Ratio between young and old
-XX:NewRatio=2  # Old:Young = 2:1
```

### GC Tuning

```bash
# G1 GC tuning
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=16m
-XX:InitiatingHeapOccupancyPercent=45

# Parallel GC tuning
-XX:+UseParallelGC
-XX:ParallelGCThreads=4
-XX:MaxGCPauseMillis=200

# GC logging (Java 9+)
-Xlog:gc*:file=gc.log:time,level,tags
```

### Metaspace Tuning

```bash
# Metaspace size (Java 8+)
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m
```

### JIT Compiler Tuning

```bash
# Disable JIT (for debugging)
-Xint

# Compiler threshold
-XX:CompileThreshold=10000

# Print compilation
-XX:+PrintCompilation
```

---

## Câu hỏi thường gặp

### Q1: Sự khác biệt giữa Heap và Stack?

| Feature | Heap | Stack |
|---------|------|-------|
| **Scope** | Shared by all threads | Per thread |
| **Size** | Larger, configurable | Smaller, fixed |
| **Speed** | Slower | Faster |
| **Storage** | Objects, arrays | Local variables, method calls |
| **GC** | Managed by GC | Auto-cleared when method returns |
| **OutOfMemoryError** | Yes | StackOverflowError |

### Q2: PermGen vs Metaspace?

**PermGen (Java 7-):**
- Fixed size (-XX:MaxPermSize)
- Part of heap
- OutOfMemoryError: PermGen space

**Metaspace (Java 8+):**
- Native memory, auto-resize
- Not part of heap
- OutOfMemoryError: Metaspace
- Better performance

### Q3: Khi nào OutOfMemoryError xảy ra?

- **Heap space**: Không đủ memory cho objects
- **Metaspace**: Không đủ memory cho class metadata
- **Direct memory**: Không đủ native memory
- **GC overhead limit**: GC takes >98% time, <2% heap recovered

### Q4: StackOverflowError là gì?

```java
// Recursive call without base case
public void recursive() {
    recursive();  // StackOverflowError
}
```

**Causes:**
- Infinite recursion
- Deep recursion
- Large local variables

**Solution:**
- Increase stack size: `-Xss2m`
- Fix recursion logic

### Q5: String Pool và Memory

```java
// String pool trong heap (Java 7+)
String s1 = "Hello";  // String literal → pool
String s2 = "Hello";  // Same reference
String s3 = new String("Hello");  // New object, not in pool

// Intern: Add to pool
String s4 = s3.intern();  // Returns reference from pool
```

### Q6: WeakReference, SoftReference, PhantomReference?

```java
// Strong reference
Object obj = new Object();  // Not collected

// Soft reference: Collected khi memory pressure
SoftReference<Object> softRef = new SoftReference<>(obj);
obj = null;
// Collected only if memory is needed

// Weak reference: Collected in next GC
WeakReference<Object> weakRef = new WeakReference<>(obj);
obj = null;
// Collected in next GC cycle

// Phantom reference: Collected, notification before finalization
ReferenceQueue<Object> queue = new ReferenceQueue<>();
PhantomReference<Object> phantomRef = new PhantomReference<>(obj, queue);
obj = null;
// Collected, notification sent to queue
```

### Q7: Tại sao có Young và Old Generation?

**Young Generation:**
- Most objects die young
- Fast collection (minor GC)
- Small pause time

**Old Generation:**
- Long-lived objects
- Slower collection (major GC)
- Larger pause time

**Benefits:**
- Optimize GC performance
- Reduce pause times
- Better memory utilization

### Q8: GC Log Analysis

```bash
# GC log format
[GC (Allocation Failure) [PSYoungGen: 1024K->512K(2048K)] 1024K->512K(4096K), 0.0012345 secs]

# Meaning:
# - GC type: Minor GC
# - Reason: Allocation Failure
# - Young Gen: 1024K used -> 512K used (2048K total)
# - Heap: 1024K used -> 512K used (4096K total)
# - Time: 0.0012345 seconds
```

---

## Best Practices

1. **Monitor memory usage** với jstat, jmap, VisualVM
2. **Tune heap size** dựa trên application requirements
3. **Choose appropriate GC** cho use case
4. **Avoid memory leaks** với proper resource management
5. **Use try-with-resources** cho auto-closing
6. **Clear collections** khi không cần
7. **Remove listeners** khi không dùng
8. **Use weak references** cho caches
9. **Profile regularly** để detect issues early
10. **Set appropriate GC goals** (throughput vs latency)

---

## Tools

### Command Line Tools

```bash
# jps: List Java processes
jps

# jstat: GC statistics
jstat -gc <pid> 1000  # Every 1 second

# jmap: Heap dump
jmap -heap <pid>
jmap -dump:format=b,file=heap.hprof <pid>

# jstack: Thread dump
jstack <pid>

# jinfo: JVM configuration
jinfo <pid>
```

### GUI Tools

- **jconsole**: Built-in monitoring
- **VisualVM**: Profiling và monitoring
- **Eclipse MAT**: Heap dump analysis
- **JProfiler**: Commercial profiler
- **YourKit**: Commercial profiler

---

## Bài tập thực hành

### Bài 1: Memory Leak Detection

```java
// Yêu cầu: Tìm và fix memory leaks trong code
// 1. Static collection không được clear
// 2. Listeners không được remove
// 3. ThreadLocal không được clear
```

### Bài 2: GC Tuning

```java
// Yêu cầu: Tune GC cho application với requirements:
// - Heap: 4GB
// - Pause time: <200ms
// - Throughput: High
// Chọn GC phù hợp và tune parameters
```

### Bài 3: Heap Analysis

```java
// Yêu cầu: 
// 1. Generate heap dump khi OutOfMemoryError
// 2. Analyze heap dump với Eclipse MAT
// 3. Identify memory leaks
// 4. Fix issues
```

---

## Tổng kết

- **JVM Architecture**: Class Loader, Runtime Data Areas, Execution Engine, GC
- **Memory Areas**: Heap (Young/Old), Stack, Method Area (Metaspace), PC Register
- **Garbage Collection**: Minor GC, Major GC, GC algorithms
- **GC Algorithms**: Serial, Parallel, G1, ZGC, Shenandoah
- **Memory Leaks**: Static collections, unclosed resources, listeners, ThreadLocal
- **Performance Tuning**: Heap size, GC selection, monitoring
- **Tools**: jstat, jmap, jstack, VisualVM, Eclipse MAT
