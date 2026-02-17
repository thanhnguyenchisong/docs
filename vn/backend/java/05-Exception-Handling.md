# Exception Handling - Câu hỏi phỏng vấn Java

## Mục lục
1. [Exception Hierarchy](#exception-hierarchy)
2. [Checked vs Unchecked Exceptions](#checked-vs-unchecked-exceptions)
3. [try-catch-finally](#try-catch-finally)
4. [throw và throws](#throw-và-throws)
5. [Custom Exceptions](#custom-exceptions)
6. [Best Practices](#best-practices)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Exception Hierarchy

```
Throwable
├── Error (Unchecked)
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── VirtualMachineError
└── Exception
    ├── RuntimeException (Unchecked)
    │   ├── NullPointerException
    │   ├── IllegalArgumentException
    │   ├── ArrayIndexOutOfBoundsException
    │   └── ClassCastException
    └── Checked Exceptions
        ├── IOException
        ├── SQLException
        ├── FileNotFoundException
        └── ClassNotFoundException
```

### Throwable

```java
// Throwable là base class cho tất cả errors và exceptions
Throwable throwable = new Exception("Error message");
System.out.println(throwable.getMessage());
throwable.printStackTrace();
```

---

## Checked vs Unchecked Exceptions

### Checked Exceptions

**Định nghĩa:** Phải được handle hoặc declare trong method signature.

```java
// Phải handle hoặc declare throws
public void readFile() throws IOException {
    FileReader file = new FileReader("file.txt");
    // ...
}

// Hoặc handle
public void readFile() {
    try {
        FileReader file = new FileReader("file.txt");
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

**Ví dụ:**
- `IOException`
- `SQLException`
- `ClassNotFoundException`
- `FileNotFoundException`

### Unchecked Exceptions

**Định nghĩa:** Không cần handle hoặc declare, compiler không bắt buộc.

```java
// Không cần throws
public void divide(int a, int b) {
    int result = a / b;  // Có thể throw ArithmeticException
}

// Có thể handle nếu muốn
public void divide(int a, int b) {
    try {
        int result = a / b;
    } catch (ArithmeticException e) {
        System.out.println("Cannot divide by zero");
    }
}
```

**Ví dụ:**
- `NullPointerException`
- `ArrayIndexOutOfBoundsException`
- `IllegalArgumentException`
- `ArithmeticException`

### So sánh

| Feature | Checked | Unchecked |
|---------|---------|-----------|
| **Compile-time check** | Yes | No |
| **Must handle/declare** | Yes | No |
| **Extends** | Exception (không phải RuntimeException) | RuntimeException |
| **When to use** | Recoverable errors | Programming errors |

---

## try-catch-finally

### Basic Syntax

```java
try {
    // Code that may throw exception
    int result = 10 / 0;
} catch (ArithmeticException e) {
    // Handle specific exception
    System.out.println("Division by zero: " + e.getMessage());
} catch (Exception e) {
    // Handle general exception (must be last)
    System.out.println("General error: " + e.getMessage());
} finally {
    // Always executes (cleanup code)
    System.out.println("Finally block executed");
}
```

### Multiple Catch Blocks

```java
try {
    // Code
} catch (FileNotFoundException e) {
    // Handle FileNotFoundException
} catch (IOException e) {
    // Handle other IOExceptions
} catch (Exception e) {
    // Handle any other exceptions
}
```

**Lưu ý:** Catch blocks phải theo thứ tự từ specific đến general.

### try-with-resources (Java 7+)

```java
// Auto-close resources
try (FileReader file = new FileReader("file.txt");
     BufferedReader reader = new BufferedReader(file)) {
    String line = reader.readLine();
} catch (IOException e) {
    e.printStackTrace();
}
// Resources automatically closed, không cần finally

// Resources phải implement AutoCloseable
class MyResource implements AutoCloseable {
    @Override
    public void close() throws Exception {
        System.out.println("Resource closed");
    }
}

try (MyResource resource = new MyResource()) {
    // Use resource
}
```

### Finally Block

```java
try {
    return 1;
} catch (Exception e) {
    return 2;
} finally {
    // Always executes, even if return statement in try/catch
    System.out.println("Finally");
    // return 3;  // This return will override try/catch returns
}
```

**Lưu ý:** 
- Finally luôn execute (trừ System.exit())
- Return trong finally sẽ override return trong try/catch

---

## throw và throws

### throw

Dùng để throw exception explicitly.

```java
public void validateAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("Age cannot be negative");
    }
    if (age > 150) {
        throw new IllegalArgumentException("Age cannot be greater than 150");
    }
}
```

### throws

Dùng để declare exceptions mà method có thể throw.

```java
// Checked exception phải declare
public void readFile(String filename) throws IOException {
    FileReader file = new FileReader(filename);
}

// Có thể declare nhiều exceptions
public void processFile(String filename) 
    throws IOException, SQLException {
    // ...
}

// Unchecked exception không cần declare (nhưng có thể)
public void divide(int a, int b) throws ArithmeticException {
    if (b == 0) {
        throw new ArithmeticException("Division by zero");
    }
    return a / b;
}
```

### Method Overriding và Exceptions

```java
class Parent {
    public void method() throws IOException {
        // ...
    }
}

class Child extends Parent {
    // Rule 1: Có thể không declare exception
    @Override
    public void method() {
        // ...
    }
    
    // Rule 2: Có thể declare same exception
    @Override
    public void method() throws IOException {
        // ...
    }
    
    // Rule 3: Có thể declare subclass exception
    @Override
    public void method() throws FileNotFoundException {
        // ...
    }
    
    // Rule 4: KHÔNG thể declare broader exception
    // @Override
    // public void method() throws Exception {  // ERROR!
    //     ...
    // }
    
    // Rule 5: KHÔNG thể declare checked exception nếu parent không có
    // @Override
    // public void method() throws SQLException {  // ERROR!
    //     ...
    // }
}
```

---

## Custom Exceptions

### Tạo Custom Exception

```java
// Checked exception
public class InsufficientFundsException extends Exception {
    private double amount;
    
    public InsufficientFundsException(double amount) {
        super("Insufficient funds. Required: " + amount);
        this.amount = amount;
    }
    
    public double getAmount() {
        return amount;
    }
}

// Unchecked exception
public class InvalidInputException extends RuntimeException {
    public InvalidInputException(String message) {
        super(message);
    }
    
    public InvalidInputException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

### Sử dụng Custom Exception

```java
class BankAccount {
    private double balance;
    
    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(amount);
        }
        balance -= amount;
    }
    
    public void transfer(BankAccount to, double amount) 
        throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(amount);
        }
        this.balance -= amount;
        to.balance += amount;
    }
}

// Usage
try {
    account.withdraw(1000);
} catch (InsufficientFundsException e) {
    System.out.println("Error: " + e.getMessage());
    System.out.println("Required amount: " + e.getAmount());
}
```

### Exception Chaining

```java
public void processData(String data) throws ProcessingException {
    try {
        // Some processing
        parseData(data);
    } catch (ParseException e) {
        // Wrap exception (exception chaining)
        throw new ProcessingException("Failed to process data", e);
    }
}

// ProcessingException
public class ProcessingException extends Exception {
    public ProcessingException(String message, Throwable cause) {
        super(message, cause);  // Preserve original exception
    }
}

// Access original exception
try {
    processData(data);
} catch (ProcessingException e) {
    Throwable cause = e.getCause();  // Original ParseException
    cause.printStackTrace();
}
```

---

## Best Practices

### 1. Specific Exception Types

```java
// ❌ Bad
catch (Exception e) {
    // Too generic
}

// ✅ Good
catch (FileNotFoundException e) {
    // Handle specific case
} catch (IOException e) {
    // Handle IO errors
}
```

### 2. Don't Swallow Exceptions

```java
// ❌ Bad
try {
    processData();
} catch (Exception e) {
    // Swallowed - no logging, no handling
}

// ✅ Good
try {
    processData();
} catch (Exception e) {
    logger.error("Error processing data", e);
    // Handle or rethrow
    throw new ProcessingException("Failed to process", e);
}
```

### 3. Use try-with-resources

```java
// ❌ Bad
FileReader file = null;
try {
    file = new FileReader("file.txt");
    // ...
} finally {
    if (file != null) {
        try {
            file.close();
        } catch (IOException e) {
            // ...
        }
    }
}

// ✅ Good
try (FileReader file = new FileReader("file.txt")) {
    // ...
}
```

### 4. Don't Catch và Ignore

```java
// ❌ Bad
try {
    importantOperation();
} catch (Exception e) {
    // Ignored
}

// ✅ Good
try {
    importantOperation();
} catch (Exception e) {
    logger.error("Operation failed", e);
    // Take appropriate action
}
```

### 5. Provide Meaningful Messages

```java
// ❌ Bad
throw new Exception("Error");

// ✅ Good
throw new IllegalArgumentException("Age must be between 0 and 150, got: " + age);
```

### 6. Use Unchecked Exceptions for Programming Errors

```java
// ✅ Good: Programming error
public void setAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("Age cannot be negative");
    }
    this.age = age;
}

// ✅ Good: Recoverable error
public void readConfig() throws IOException {
    // Caller can handle or recover
}
```

### 7. Document Exceptions

```java
/**
 * Transfers money between accounts.
 * 
 * @param to Target account
 * @param amount Amount to transfer
 * @throws InsufficientFundsException if source account has insufficient funds
 * @throws IllegalArgumentException if amount is negative
 */
public void transfer(Account to, double amount) 
    throws InsufficientFundsException {
    // ...
}
```

---

## Câu hỏi thường gặp

### Q1: Sự khác biệt giữa Error và Exception?

**Error:**
- Serious problems không nên catch
- OutOfMemoryError, StackOverflowError
- Thường do JVM hoặc system

**Exception:**
- Có thể handle
- Checked hoặc Unchecked
- Thường do application code

### Q2: Có thể có try block mà không có catch không?

```java
// ✅ Yes: try-finally (Java 7+)
try {
    // Code
} finally {
    // Cleanup
}

// ✅ Yes: try-with-resources
try (Resource resource = new Resource()) {
    // Code
}
```

### Q3: Có thể có nhiều finally blocks không?

```java
// ❌ No: Chỉ có 1 finally block
try {
    // ...
} catch (Exception e) {
    // ...
} finally {
    // Only one finally
}
```

### Q4: Return trong finally block?

```java
public int method() {
    try {
        return 1;
    } finally {
        return 2;  // This will override try's return
    }
    // Returns 2, not 1
}
```

### Q5: Exception trong finally block?

```java
try {
    // Code
} finally {
    // Nếu exception trong finally, nó sẽ override exception trong try
    throw new RuntimeException("Finally exception");
}
```

### Q6: Sự khác biệt giữa final, finally, finalize?

**final:**
- Keyword cho variables, methods, classes
- Variable: cannot reassign
- Method: cannot override
- Class: cannot extend

**finally:**
- Block trong try-catch
- Always executes

**finalize:**
- Method trong Object class
- Called bởi GC trước khi object bị destroy
- Deprecated từ Java 9

### Q7: Suppressed Exceptions (Java 7+)

```java
try (Resource resource = new Resource()) {
    throw new IOException("Primary exception");
} catch (IOException e) {
    // Primary exception
    Throwable[] suppressed = e.getSuppressed();  // Exceptions from close()
    for (Throwable t : suppressed) {
        System.out.println("Suppressed: " + t);
    }
}
```

### Q8: Multi-catch (Java 7+)

```java
// Catch multiple exceptions in one block
try {
    // Code
} catch (IOException | SQLException e) {
    // Handle both exceptions
    // e is final, cannot reassign
}
```

---

## Common Exceptions

### NullPointerException

```java
String str = null;
int length = str.length();  // NullPointerException

// Prevention
if (str != null) {
    int length = str.length();
}

// Java 8+
Optional<String> optional = Optional.ofNullable(str);
int length = optional.map(String::length).orElse(0);
```

### ArrayIndexOutOfBoundsException

```java
int[] arr = {1, 2, 3};
int value = arr[5];  // ArrayIndexOutOfBoundsException

// Prevention
if (index >= 0 && index < arr.length) {
    int value = arr[index];
}
```

### ClassCastException

```java
Object obj = "Hello";
Integer num = (Integer) obj;  // ClassCastException

// Prevention
if (obj instanceof Integer) {
    Integer num = (Integer) obj;
}

// Java 17+
if (obj instanceof Integer num) {
    // Use num directly
}
```

### IllegalArgumentException

```java
public void setAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("Age cannot be negative: " + age);
    }
    this.age = age;
}
```

---

## Bài tập thực hành

### Bài 1: Validation với Custom Exception

```java
// Yêu cầu: Tạo custom exception cho validation
// - EmailInvalidException
// - PasswordTooWeakException
// Validate email và password, throw appropriate exceptions
```

### Bài 2: Resource Management

```java
// Yêu cầu: Implement class quản lý file với proper exception handling
// - Sử dụng try-with-resources
// - Handle IOException properly
// - Cleanup resources
```

### Bài 3: Exception Chaining

```java
// Yêu cầu: Implement method chain với exception chaining
// Method A calls B, B calls C
// Nếu C throws exception, wrap trong B's exception, wrap trong A's exception
```

---

## Tổng kết

- **Exception Hierarchy**: Throwable → Error/Exception
- **Checked vs Unchecked**: Checked phải handle/declare, Unchecked không
- **try-catch-finally**: Handle exceptions, finally luôn execute
- **try-with-resources**: Auto-close resources
- **throw/throws**: throw để throw exception, throws để declare
- **Custom Exceptions**: Tạo exception riêng cho domain-specific errors
- **Best Practices**: Specific exceptions, don't swallow, meaningful messages
