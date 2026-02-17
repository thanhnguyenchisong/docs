# Multithreading và Concurrency - Câu hỏi phỏng vấn Java

## Mục lục
1. [Thread Basics](#thread-basics)
2. [Thread Lifecycle](#thread-lifecycle)
3. [Synchronization](#synchronization)
4. [Thread Communication](#thread-communication)
5. [Concurrent Collections](#concurrent-collections)
6. [Executor Framework](#executor-framework)
7. [Futures và CompletableFuture](#futures-và-completablefuture)
8. [Virtual Threads (Java 21)](#virtual-threads-java-21)
9. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Thread Basics

### Tạo Thread

#### Cách 1: Extend Thread class

```java
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Thread running: " + Thread.currentThread().getName());
    }
}

// Usage
MyThread thread = new MyThread();
thread.start();  // Start thread
```

#### Cách 2: Implement Runnable interface

```java
class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("Thread running: " + Thread.currentThread().getName());
    }
}

// Usage
Thread thread = new Thread(new MyRunnable());
thread.start();

// Lambda
Thread thread2 = new Thread(() -> {
    System.out.println("Lambda thread");
});
thread2.start();
```

### Thread Methods

```java
Thread thread = new Thread(() -> {
    try {
        Thread.sleep(1000);
        System.out.println("Thread completed");
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
});

thread.start();
thread.join();  // Wait for thread to complete
System.out.println("Main thread continues");

// Thread info
System.out.println("Name: " + thread.getName());
System.out.println("Priority: " + thread.getPriority());
System.out.println("State: " + thread.getState());
System.out.println("Is alive: " + thread.isAlive());
```

### Daemon Threads

```java
Thread daemonThread = new Thread(() -> {
    while (true) {
        System.out.println("Daemon running");
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            break;
        }
    }
});

daemonThread.setDaemon(true);  // Set as daemon
daemonThread.start();

// Daemon threads tự động terminate khi main thread ends
```

---

## Thread Lifecycle

### States

```java
public enum Thread.State {
    NEW,           // Thread created but not started
    RUNNABLE,      // Thread is executing
    BLOCKED,       // Waiting for monitor lock
    WAITING,       // Waiting indefinitely
    TIMED_WAITING, // Waiting with timeout
    TERMINATED     // Thread completed
}
```

### State Transitions

```
NEW → start() → RUNNABLE → run() completes → TERMINATED
                ↓
            wait() → WAITING → notify() → RUNNABLE
                ↓
            sleep(timeout) → TIMED_WAITING → timeout → RUNNABLE
                ↓
            synchronized → BLOCKED → lock acquired → RUNNABLE
```

### Example

```java
Thread thread = new Thread(() -> {
    try {
        System.out.println("State: " + Thread.currentThread().getState());  // RUNNABLE
        Thread.sleep(1000);  // TIMED_WAITING
        synchronized (lock) {
            lock.wait();  // WAITING
        }
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
});

System.out.println(thread.getState());  // NEW
thread.start();
System.out.println(thread.getState());  // RUNNABLE
```

---

## Synchronization

### Problem: Race Condition

```java
class Counter {
    private int count = 0;
    
    public void increment() {
        count++;  // Not thread-safe!
    }
    
    public int getCount() {
        return count;
    }
}

// Multiple threads accessing cùng lúc → incorrect results
```

### Solution 1: synchronized keyword

```java
class Counter {
    private int count = 0;
    
    // Synchronized method
    public synchronized void increment() {
        count++;
    }
    
    public synchronized int getCount() {
        return count;
    }
}

// Synchronized block
public void increment() {
    synchronized (this) {
        count++;
    }
}
```

### Solution 2: Lock Interface

```java
import java.util.concurrent.locks.ReentrantLock;

class Counter {
    private int count = 0;
    private ReentrantLock lock = new ReentrantLock();
    
    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();  // Always unlock in finally
        }
    }
    
    // Try lock with timeout
    public boolean tryIncrement() {
        if (lock.tryLock(1, TimeUnit.SECONDS)) {
            try {
                count++;
                return true;
            } finally {
                lock.unlock();
            }
        }
        return false;
    }
}
```

### ReentrantLock vs synchronized

| Feature | synchronized | ReentrantLock |
|---------|-------------|---------------|
| **Lock mechanism** | JVM level | API level |
| **Fairness** | No | Yes (optional) |
| **Try lock** | No | Yes |
| **Interruptible** | No | Yes |
| **Performance** | Faster (JVM optimized) | Slightly slower |

### ReadWriteLock

```java
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

class DataStore {
    private Map<String, String> data = new HashMap<>();
    private ReadWriteLock lock = new ReentrantReadWriteLock();
    
    public String read(String key) {
        lock.readLock().lock();
        try {
            return data.get(key);
        } finally {
            lock.readLock().unlock();
        }
    }
    
    public void write(String key, String value) {
        lock.writeLock().lock();
        try {
            data.put(key, value);
        } finally {
            lock.writeLock().unlock();
        }
    }
}
```

### Volatile Keyword

```java
class SharedData {
    private volatile boolean flag = true;  // Ensures visibility
    
    public void stop() {
        flag = false;  // Visible to all threads immediately
    }
    
    public void run() {
        while (flag) {
            // Do work
        }
    }
}
```

**Volatile đảm bảo:**
- **Visibility**: Changes visible to all threads
- **No reordering**: Prevents compiler optimizations
- **Không đảm bảo atomicity**: Không thread-safe cho compound operations

---

## Thread Communication

### wait(), notify(), notifyAll()

```java
class ProducerConsumer {
    private Queue<Integer> queue = new LinkedList<>();
    private int capacity = 5;
    private Object lock = new Object();
    
    public void produce() throws InterruptedException {
        int value = 0;
        while (true) {
            synchronized (lock) {
                while (queue.size() == capacity) {
                    lock.wait();  // Wait if queue is full
                }
                queue.offer(value++);
                System.out.println("Produced: " + value);
                lock.notifyAll();  // Notify consumers
            }
            Thread.sleep(1000);
        }
    }
    
    public void consume() throws InterruptedException {
        while (true) {
            synchronized (lock) {
                while (queue.isEmpty()) {
                    lock.wait();  // Wait if queue is empty
                }
                int value = queue.poll();
                System.out.println("Consumed: " + value);
                lock.notifyAll();  // Notify producers
            }
            Thread.sleep(1000);
        }
    }
}
```

### CountDownLatch

```java
import java.util.concurrent.CountDownLatch;

CountDownLatch latch = new CountDownLatch(3);

// Worker threads
for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        // Do work
        latch.countDown();  // Decrement count
    }).start();
}

latch.await();  // Wait until count reaches 0
System.out.println("All workers completed");
```

### CyclicBarrier

```java
import java.util.concurrent.CyclicBarrier;

CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("All threads reached barrier");
});

for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        try {
            // Do work
            barrier.await();  // Wait for all threads
            // Continue after all threads reach barrier
        } catch (Exception e) {
            e.printStackTrace();
        }
    }).start();
}
```

### Semaphore

```java
import java.util.concurrent.Semaphore;

Semaphore semaphore = new Semaphore(3);  // Allow 3 concurrent accesses

for (int i = 0; i < 10; i++) {
    new Thread(() -> {
        try {
            semaphore.acquire();  // Acquire permit
            // Critical section (max 3 threads)
            System.out.println("Thread in critical section");
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            semaphore.release();  // Release permit
        }
    }).start();
}
```

---

## Concurrent Collections

### ConcurrentHashMap

```java
import java.util.concurrent.ConcurrentHashMap;

ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

// Thread-safe operations
map.put("key", 1);
map.putIfAbsent("key", 2);  // Only put if absent
map.compute("key", (k, v) -> v == null ? 1 : v + 1);

// Atomic operations
map.merge("key", 1, Integer::sum);
```

### CopyOnWriteArrayList

```java
import java.util.concurrent.CopyOnWriteArrayList;

CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();

// Thread-safe, good for read-heavy scenarios
list.add("Item");
// Creates new copy on write, expensive for frequent writes
```

### BlockingQueue

```java
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ArrayBlockingQueue;

BlockingQueue<String> queue = new ArrayBlockingQueue<>(10);

// Producer
queue.put("Item");  // Block if full

// Consumer
String item = queue.take();  // Block if empty

// Non-blocking
queue.offer("Item");  // Return false if full
String item = queue.poll();  // Return null if empty
```

---

## Executor Framework

### ThreadPoolExecutor

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

// Fixed thread pool
ExecutorService executor = Executors.newFixedThreadPool(5);

// Submit tasks
for (int i = 0; i < 10; i++) {
    final int taskId = i;
    executor.submit(() -> {
        System.out.println("Task " + taskId + " executed by " + 
            Thread.currentThread().getName());
    });
}

// Shutdown
executor.shutdown();
try {
    if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
        executor.shutdownNow();
    }
} catch (InterruptedException e) {
    executor.shutdownNow();
}
```

### Types of Thread Pools

```java
// Fixed: Fixed number of threads
ExecutorService fixed = Executors.newFixedThreadPool(5);

// Cached: Creates new threads as needed, reuses idle threads
ExecutorService cached = Executors.newCachedThreadPool();

// Single: Single worker thread
ExecutorService single = Executors.newSingleThreadExecutor();

// Scheduled: For scheduled tasks
ScheduledExecutorService scheduled = Executors.newScheduledThreadPool(5);
scheduled.schedule(() -> System.out.println("Delayed task"), 5, TimeUnit.SECONDS);
scheduled.scheduleAtFixedRate(() -> System.out.println("Repeated"), 0, 1, TimeUnit.SECONDS);
```

### Custom ThreadPoolExecutor

```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5,                      // Core pool size
    10,                     // Maximum pool size
    60L,                    // Keep alive time
    TimeUnit.SECONDS,       // Time unit
    new LinkedBlockingQueue<>(100),  // Work queue
    new ThreadFactory() {    // Thread factory
        @Override
        public Thread newThread(Runnable r) {
            Thread t = new Thread(r);
            t.setName("CustomThread-" + t.getId());
            return t;
        }
    },
    new ThreadPoolExecutor.CallerRunsPolicy()  // Rejection policy
);
```

---

## Futures và CompletableFuture

### Future

```java
import java.util.concurrent.Future;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

ExecutorService executor = Executors.newFixedThreadPool(5);

Future<String> future = executor.submit(() -> {
    Thread.sleep(2000);
    return "Result";
});

// Check if done
if (future.isDone()) {
    String result = future.get();
}

// Get with timeout
try {
    String result = future.get(1, TimeUnit.SECONDS);
} catch (TimeoutException e) {
    future.cancel(true);
}
```

### CompletableFuture

```java
import java.util.concurrent.CompletableFuture;

// Create
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    return "Hello";
});

// Chain operations
CompletableFuture<String> result = CompletableFuture
    .supplyAsync(() -> "Hello")
    .thenApply(s -> s + " World")
    .thenApply(String::toUpperCase);

result.thenAccept(System.out::println);  // "HELLO WORLD"

// Combine futures
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "Hello");
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "World");

CompletableFuture<String> combined = future1.thenCombine(future2, (s1, s2) -> s1 + " " + s2);

// Handle errors
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> {
        if (Math.random() > 0.5) {
            throw new RuntimeException("Error");
        }
        return "Success";
    })
    .exceptionally(ex -> "Error: " + ex.getMessage())
    .thenApply(String::toUpperCase);
```

### Async Operations

```java
// All of
CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> "A");
CompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> "B");
CompletableFuture<String> f3 = CompletableFuture.supplyAsync(() -> "C");

CompletableFuture<Void> all = CompletableFuture.allOf(f1, f2, f3);
all.thenRun(() -> {
    System.out.println("All completed");
});

// Any of
CompletableFuture<String> any = CompletableFuture.anyOf(f1, f2, f3);
any.thenAccept(result -> System.out.println("First completed: " + result));
```

---

## Virtual Threads (Java 21)

### Giới thiệu

Virtual Threads là lightweight threads được quản lý bởi JVM, không phải OS threads.

### Tạo Virtual Threads

```java
// Cách 1: Thread.ofVirtual()
Thread virtualThread = Thread.ofVirtual().start(() -> {
    System.out.println("Virtual thread: " + Thread.currentThread());
});

// Cách 2: Executors.newVirtualThreadPerTaskExecutor()
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10000; i++) {
        executor.submit(() -> {
            // I/O operations - không tốn nhiều resources
            Thread.sleep(1000);
            System.out.println("Task completed");
        });
    }
}

// Cách 3: Thread.Builder
Thread.Builder builder = Thread.ofVirtual().name("worker-", 0);
Thread vt1 = builder.start(() -> System.out.println("Task 1"));
Thread vt2 = builder.start(() -> System.out.println("Task 2"));
```

### Lợi ích

- **High concurrency**: Có thể tạo hàng triệu virtual threads
- **Low overhead**: Không tốn nhiều memory như platform threads
- **I/O-bound**: Perfect cho I/O operations (network, file, database)
- **Blocking-friendly**: Blocking operations không tốn nhiều resources

### Khi nào dùng

**Virtual Threads:**
- I/O-bound tasks
- High concurrency requirements
- Blocking operations

**Platform Threads:**
- CPU-intensive tasks
- Long-running computations
- Tasks cần OS-level thread features

---

## Câu hỏi thường gặp

### Q1: Sự khác biệt giữa start() và run()?

```java
Thread thread = new Thread(() -> System.out.println("Running"));

thread.start();  // Tạo thread mới và execute run() trong thread đó
thread.run();    // Chỉ gọi run() method trong current thread (không tạo thread mới)
```

### Q2: Deadlock là gì? Làm sao tránh?

```java
// Deadlock example
Object lock1 = new Object();
Object lock2 = new Object();

Thread t1 = new Thread(() -> {
    synchronized (lock1) {
        synchronized (lock2) {
            // ...
        }
    }
});

Thread t2 = new Thread(() -> {
    synchronized (lock2) {
        synchronized (lock1) {  // Deadlock!
            // ...
        }
    }
});
```

**Cách tránh:**
- Lock ordering: Luôn lock theo cùng một thứ tự
- Timeout: Sử dụng tryLock với timeout
- Avoid nested locks: Tránh nested synchronized blocks

### Q3: Thread-safe là gì?

Code thread-safe khi có thể được sử dụng bởi multiple threads mà không gây ra race conditions hoặc data corruption.

### Q4: volatile vs synchronized?

| Feature | volatile | synchronized |
|---------|----------|--------------|
| **Scope** | Variable | Method/Block |
| **Visibility** | Yes | Yes |
| **Atomicity** | No | Yes |
| **Performance** | Faster | Slower |

### Q5: Thread pool size nên là bao nhiêu?

**CPU-bound tasks:**
```
pool size = number of CPU cores
```

**I/O-bound tasks:**
```
pool size = number of CPU cores × (1 + wait time / compute time)
```

**Ví dụ:** Nếu wait time = 90%, compute time = 10%
```
pool size = 4 × (1 + 0.9/0.1) = 4 × 10 = 40
```

### Q6: InterruptedException là gì?

```java
Thread thread = new Thread(() -> {
    try {
        Thread.sleep(1000);
    } catch (InterruptedException e) {
        // Thread was interrupted
        Thread.currentThread().interrupt();  // Restore interrupt flag
        return;  // Exit gracefully
    }
});

thread.interrupt();  // Interrupt the thread
```

### Q7: ThreadLocal là gì?

```java
ThreadLocal<String> threadLocal = new ThreadLocal<>();

// Set value for current thread
threadLocal.set("Thread-specific value");

// Get value
String value = threadLocal.get();

// Remove
threadLocal.remove();

// With initial value
ThreadLocal<String> withDefault = ThreadLocal.withInitial(() -> "Default");
```

**Use cases:**
- User context trong web applications
- Database connections
- Transaction context

---

## Best Practices

1. **Prefer ExecutorService** thay vì tạo threads manually
2. **Always shutdown ExecutorService** để tránh resource leaks
3. **Use concurrent collections** thay vì synchronized collections
4. **Avoid synchronized** khi có thể dùng concurrent utilities
5. **Handle InterruptedException** properly
6. **Use CompletableFuture** cho async programming
7. **Virtual Threads** cho I/O-bound tasks (Java 21+)
8. **Avoid deadlocks** với lock ordering
9. **Minimize shared state** để giảm synchronization overhead
10. **Test thoroughly** với multiple threads

---

## Bài tập thực hành

### Bài 1: Producer-Consumer với BlockingQueue

```java
// Yêu cầu: Implement Producer-Consumer pattern sử dụng BlockingQueue
// Producer: Tạo numbers từ 1 đến 100
// Consumer: In ra các numbers
```

### Bài 2: Parallel Processing với CompletableFuture

```java
// Yêu cầu: Process 10 URLs song song và collect results
List<String> urls = Arrays.asList("url1", "url2", ..., "url10");
// Sử dụng CompletableFuture để fetch tất cả URLs song song
```

### Bài 3: Thread-safe Counter

```java
// Yêu cầu: Implement thread-safe counter với multiple approaches:
// 1. synchronized
// 2. ReentrantLock
// 3. AtomicInteger
// So sánh performance
```

---

## Tổng kết

- **Thread Basics**: Tạo threads với Thread class hoặc Runnable
- **Synchronization**: synchronized, Lock, volatile
- **Thread Communication**: wait/notify, CountDownLatch, CyclicBarrier, Semaphore
- **Concurrent Collections**: ConcurrentHashMap, BlockingQueue
- **Executor Framework**: Thread pools, Futures, CompletableFuture
- **Virtual Threads**: Lightweight threads cho I/O-bound tasks (Java 21+)
- **Best Practices**: Proper shutdown, error handling, avoid deadlocks
