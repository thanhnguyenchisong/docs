# OOP Concepts - Câu hỏi phỏng vấn Java

## Mục lục
1. [4 Pillars of OOP](#4-pillars-of-oop)
2. [Encapsulation](#encapsulation)
3. [Inheritance](#inheritance)
4. [Polymorphism](#polymorphism)
5. [Abstraction](#abstraction)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## 4 Pillars of OOP

Object-Oriented Programming (OOP) có 4 nguyên lý cơ bản:

1. **Encapsulation** (Đóng gói)
2. **Inheritance** (Kế thừa)
3. **Polymorphism** (Đa hình)
4. **Abstraction** (Trừu tượng hóa)

---

## Encapsulation

### Định nghĩa
Encapsulation là việc ẩn dấu chi tiết triển khai và chỉ expose những gì cần thiết thông qua public interface.

### Ví dụ

```java
public class BankAccount {
    // Private fields - data hiding
    private double balance;
    private String accountNumber;
    
    // Public methods - controlled access
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        } else {
            throw new IllegalArgumentException("Amount must be positive");
        }
    }
    
    public void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
        } else {
            throw new IllegalArgumentException("Invalid amount");
        }
    }
    
    public double getBalance() {
        return balance;
    }
    
    // Private method - internal implementation
    private void logTransaction(String type, double amount) {
        // Logging logic
    }
}
```

### Lợi ích
- **Data Protection**: Ngăn chặn truy cập trực tiếp vào data
- **Flexibility**: Có thể thay đổi implementation mà không ảnh hưởng client code
- **Validation**: Có thể validate data trước khi set
- **Maintainability**: Dễ bảo trì và debug

### Câu hỏi phỏng vấn

**Q: Tại sao cần Encapsulation?**
- Bảo vệ data khỏi truy cập không hợp lệ
- Cho phép thay đổi implementation mà không ảnh hưởng code khác
- Dễ dàng thêm validation và business logic

**Q: Sự khác biệt giữa private, protected, default, và public?**
```java
public class AccessModifiers {
    private int privateVar;        // Chỉ truy cập trong cùng class
    int defaultVar;                // Truy cập trong cùng package
    protected int protectedVar;    // Truy cập trong cùng package + subclass
    public int publicVar;          // Truy cập ở mọi nơi
}
```

---

## Inheritance

### Định nghĩa
Inheritance cho phép class con kế thừa properties và methods từ class cha.

### Ví dụ

```java
// Parent class
public class Animal {
    protected String name;
    protected int age;
    
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public void eat() {
        System.out.println(name + " is eating");
    }
    
    public void sleep() {
        System.out.println(name + " is sleeping");
    }
}

// Child class
public class Dog extends Animal {
    private String breed;
    
    public Dog(String name, int age, String breed) {
        super(name, age);  // Gọi constructor của parent
        this.breed = breed;
    }
    
    // Method overriding
    @Override
    public void eat() {
        System.out.println(name + " is eating dog food");
    }
    
    // New method specific to Dog
    public void bark() {
        System.out.println(name + " is barking");
    }
}
```

### Types of Inheritance

1. **Single Inheritance**: Một class chỉ kế thừa từ một class cha
2. **Multilevel Inheritance**: Class con có thể trở thành class cha
3. **Hierarchical Inheritance**: Nhiều class con kế thừa từ một class cha

```java
// Multilevel
class A {}
class B extends A {}
class C extends B {}

// Hierarchical
class Animal {}
class Dog extends Animal {}
class Cat extends Animal {}
```

### super keyword

```java
public class Parent {
    protected String name;
    
    public Parent(String name) {
        this.name = name;
    }
    
    public void display() {
        System.out.println("Parent: " + name);
    }
}

public class Child extends Parent {
    private int age;
    
    public Child(String name, int age) {
        super(name);  // Gọi constructor của parent
        this.age = age;
    }
    
    @Override
    public void display() {
        super.display();  // Gọi method của parent
        System.out.println("Child age: " + age);
    }
}
```

### Câu hỏi phỏng vấn

**Q: Java có hỗ trợ Multiple Inheritance không?**
- Không, Java chỉ hỗ trợ single inheritance cho classes
- Nhưng có thể implement nhiều interfaces
- Để tránh "Diamond Problem"

**Q: Sự khác biệt giữa extends và implements?**
```java
// extends: Kế thừa từ class
class Dog extends Animal {}

// implements: Implement interface
class Dog implements Runnable, Serializable {}
```

**Q: Tại sao Java không có Multiple Inheritance?**
- Tránh Diamond Problem (ambiguity khi có cùng method name)
- Làm code phức tạp hơn
- Interface đã giải quyết được vấn đề này

---

## Polymorphism

### Định nghĩa
Polymorphism cho phép một object có nhiều hình thái khác nhau.

### Types

#### 1. Compile-time Polymorphism (Method Overloading)

```java
public class Calculator {
    // Same method name, different parameters
    public int add(int a, int b) {
        return a + b;
    }
    
    public int add(int a, int b, int c) {
        return a + b + c;
    }
    
    public double add(double a, double b) {
        return a + b;
    }
}
```

#### 2. Runtime Polymorphism (Method Overriding)

```java
public class Animal {
    public void makeSound() {
        System.out.println("Animal makes sound");
    }
}

public class Dog extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Dog barks");
    }
}

public class Cat extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Cat meows");
    }
}

// Usage
Animal animal1 = new Dog();
Animal animal2 = new Cat();
animal1.makeSound();  // "Dog barks"
animal2.makeSound();  // "Cat meows"
```

### Method Overriding Rules

```java
public class Parent {
    // Rule 1: Access modifier không thể restrictive hơn
    protected void method1() {}
    
    // Rule 2: Return type phải compatible
    public Number method2() { return 1; }
    
    // Rule 3: Không thể override final methods
    public final void method3() {}
    
    // Rule 4: Không thể override static methods
    public static void method4() {}
}

public class Child extends Parent {
    // OK: public > protected
    @Override
    public void method1() {}
    
    // OK: Integer extends Number
    @Override
    public Integer method2() { return 1; }
    
    // ERROR: Cannot override final method
    // @Override
    // public void method3() {}
}
```

### Câu hỏi phỏng vấn

**Q: Sự khác biệt giữa Overloading và Overriding?**

| Overloading | Overriding |
|-------------|------------|
| Same class | Different classes (inheritance) |
| Compile-time | Runtime |
| Different parameters | Same signature |
| Return type có thể khác | Return type phải compatible |

**Q: Có thể override static method không?**
- Không, static methods thuộc về class, không phải instance
- Nếu có cùng signature, đó là method hiding, không phải overriding

```java
class Parent {
    static void method() {
        System.out.println("Parent");
    }
}

class Child extends Parent {
    static void method() {  // Method hiding, not overriding
        System.out.println("Child");
    }
}

Parent.method();  // "Parent"
Child.method();   // "Child"
```

**Q: Có thể override private method không?**
- Không, private methods không thể override vì không visible ở subclass

---

## Abstraction

### Định nghĩa
Abstraction ẩn đi chi tiết implementation và chỉ hiển thị essential features.

### Cách triển khai

#### 1. Abstract Class

```java
// Abstract class - không thể instantiate
public abstract class Shape {
    protected String color;
    
    // Abstract method - phải được implement bởi subclass
    public abstract double calculateArea();
    
    // Concrete method - có implementation
    public void setColor(String color) {
        this.color = color;
    }
    
    // Concrete method
    public String getColor() {
        return color;
    }
}

public class Circle extends Shape {
    private double radius;
    
    public Circle(double radius) {
        this.radius = radius;
    }
    
    @Override
    public double calculateArea() {
        return Math.PI * radius * radius;
    }
}

public class Rectangle extends Shape {
    private double width;
    private double height;
    
    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }
    
    @Override
    public double calculateArea() {
        return width * height;
    }
}
```

#### 2. Interface (Java 8+)

```java
// Interface với default methods
public interface Drawable {
    // Abstract method
    void draw();
    
    // Default method (Java 8+)
    default void drawWithColor(String color) {
        System.out.println("Drawing with color: " + color);
        draw();
    }
    
    // Static method (Java 8+)
    static void printInfo() {
        System.out.println("This is a Drawable interface");
    }
}

public class Circle implements Drawable {
    @Override
    public void draw() {
        System.out.println("Drawing a circle");
    }
}
```

### Abstract Class vs Interface

| Feature | Abstract Class | Interface |
|---------|---------------|-----------|
| **Fields** | Có thể có instance variables | Chỉ có constants (public static final) |
| **Methods** | Có thể có abstract và concrete | Trước Java 8: chỉ abstract. Java 8+: có default và static |
| **Constructor** | Có | Không |
| **Multiple Inheritance** | Không | Có (implement nhiều interfaces) |
| **Access Modifier** | Có thể có private, protected | Mặc định public |
| **When to use** | Khi có shared code | Khi định nghĩa contract |

### Ví dụ thực tế

```java
// Abstract class: Khi có shared implementation
public abstract class DatabaseConnection {
    protected String url;
    protected String username;
    protected String password;
    
    public DatabaseConnection(String url, String username, String password) {
        this.url = url;
        this.username = username;
        this.password = password;
    }
    
    // Shared implementation
    public void connect() {
        System.out.println("Connecting to: " + url);
        // Common connection logic
    }
    
    // Abstract - mỗi DB có cách khác nhau
    public abstract void executeQuery(String query);
}

// Interface: Khi chỉ định nghĩa contract
public interface PaymentProcessor {
    void processPayment(double amount);
    void refund(double amount);
    PaymentStatus getStatus();
}
```

### Câu hỏi phỏng vấn

**Q: Khi nào dùng Abstract Class, khi nào dùng Interface?**

**Abstract Class:**
- Khi có shared code giữa các subclasses
- Khi cần constructor
- Khi cần non-public methods
- Khi muốn force implementation của một số methods

**Interface:**
- Khi chỉ định nghĩa contract
- Khi cần multiple inheritance
- Khi muốn loose coupling
- Khi làm API design

**Q: Có thể có abstract method trong non-abstract class không?**
- Không, nếu class có abstract method thì class phải là abstract

**Q: Interface có thể extend interface khác không?**
- Có, interface có thể extend nhiều interfaces

```java
interface A {}
interface B {}
interface C extends A, B {}  // Multiple inheritance cho interfaces
```

---

## Câu hỏi thường gặp

### Q1: Giải thích 4 pillars của OOP với ví dụ thực tế

**Encapsulation**: BankAccount class ẩn balance và chỉ expose deposit/withdraw methods

**Inheritance**: Dog và Cat kế thừa từ Animal

**Polymorphism**: Animal reference có thể point đến Dog hoặc Cat object

**Abstraction**: Shape abstract class định nghĩa calculateArea() mà các subclass phải implement

### Q2: Sự khác biệt giữa Composition và Inheritance?

```java
// Inheritance: IS-A relationship
class Car extends Vehicle {}

// Composition: HAS-A relationship
class Car {
    private Engine engine;  // Car HAS-A Engine
    private Wheel[] wheels;
}
```

**Inheritance**: Tight coupling, khó thay đổi
**Composition**: Loose coupling, flexible hơn

### Q3: Tại sao nên prefer Composition over Inheritance?

- **Flexibility**: Có thể thay đổi behavior at runtime
- **Loose Coupling**: Không phụ thuộc vào implementation của parent
- **Avoid Diamond Problem**: Không có vấn đề multiple inheritance
- **Better Testing**: Dễ test hơn với mocking

### Q4: final keyword trong OOP

```java
// final class: Không thể extend
final class ImmutableClass {}

// final method: Không thể override
class Parent {
    public final void method() {}
}

// final variable: Không thể reassign
final int x = 10;
```

### Q5: this vs super

```java
class Parent {
    protected String name;
    
    public Parent(String name) {
        this.name = name;  // this: current instance
    }
}

class Child extends Parent {
    private int age;
    
    public Child(String name, int age) {
        super(name);  // super: parent class
        this.age = age;
    }
}
```

---

## Bài tập thực hành

### Bài 1: Tạo hệ thống quản lý thư viện

```java
// Yêu cầu:
// 1. Tạo abstract class Book với abstract method calculateFine()
// 2. Tạo FictionBook và NonFictionBook extends Book
// 3. Sử dụng polymorphism để tính fine cho các loại sách khác nhau
// 4. Implement encapsulation cho các fields
```

### Bài 2: Design hệ thống Payment

```java
// Yêu cầu:
// 1. Tạo interface PaymentMethod với methods: processPayment(), refund()
// 2. Implement CreditCard, PayPal, BankTransfer
// 3. Sử dụng polymorphism để xử lý payment
```

---

## Câu hỏi phỏng vấn nâng cao

### Q1: Giải thích chi tiết 4 pillars với ví dụ thực tế

**Encapsulation - Ví dụ thực tế:**
```java
// Banking System
public class BankAccount {
    private double balance;  // Hidden
    private String accountNumber;
    private String pin;
    
    // Controlled access
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            logTransaction("DEPOSIT", amount);
        }
    }
    
    public boolean withdraw(double amount, String pin) {
        if (!validatePin(pin)) {
            throw new SecurityException("Invalid PIN");
        }
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            logTransaction("WITHDRAW", amount);
            return true;
        }
        return false;
    }
    
    public double getBalance(String pin) {
        if (!validatePin(pin)) {
            throw new SecurityException("Invalid PIN");
        }
        return balance;
    }
    
    private boolean validatePin(String pin) {
        return this.pin.equals(pin);
    }
    
    private void logTransaction(String type, double amount) {
        // Internal logging logic
    }
}
```

**Inheritance - Ví dụ thực tế:**
```java
// Payment System
public abstract class PaymentMethod {
    protected String accountNumber;
    protected double balance;
    
    public PaymentMethod(String accountNumber, double balance) {
        this.accountNumber = accountNumber;
        this.balance = balance;
    }
    
    public abstract boolean processPayment(double amount);
    public abstract void refund(double amount);
    
    protected boolean hasSufficientFunds(double amount) {
        return balance >= amount;
    }
}

public class CreditCard extends PaymentMethod {
    private double creditLimit;
    
    public CreditCard(String accountNumber, double creditLimit) {
        super(accountNumber, 0);
        this.creditLimit = creditLimit;
    }
    
    @Override
    public boolean processPayment(double amount) {
        if (balance + amount <= creditLimit) {
            balance += amount;
            return true;
        }
        return false;
    }
    
    @Override
    public void refund(double amount) {
        balance = Math.max(0, balance - amount);
    }
}

public class DebitCard extends PaymentMethod {
    public DebitCard(String accountNumber, double balance) {
        super(accountNumber, balance);
    }
    
    @Override
    public boolean processPayment(double amount) {
        if (hasSufficientFunds(amount)) {
            balance -= amount;
            return true;
        }
        return false;
    }
    
    @Override
    public void refund(double amount) {
        balance += amount;
    }
}
```

**Polymorphism - Ví dụ thực tế:**
```java
// Payment processing với polymorphism
public class PaymentProcessor {
    public void processPayments(List<PaymentMethod> methods, double amount) {
        for (PaymentMethod method : methods) {
            // Runtime polymorphism - mỗi method có implementation khác nhau
            if (method.processPayment(amount)) {
                System.out.println("Payment successful");
            } else {
                System.out.println("Payment failed");
            }
        }
    }
}

// Usage
List<PaymentMethod> methods = Arrays.asList(
    new CreditCard("1234", 1000),
    new DebitCard("5678", 500)
);
processor.processPayments(methods, 100);
```

**Abstraction - Ví dụ thực tế:**
```java
// Database abstraction
public abstract class DatabaseConnection {
    protected String url;
    protected String username;
    protected String password;
    
    public DatabaseConnection(String url, String username, String password) {
        this.url = url;
        this.username = username;
        this.password = password;
    }
    
    // Abstract methods - must be implemented
    public abstract void connect();
    public abstract void disconnect();
    public abstract ResultSet executeQuery(String query);
    
    // Concrete method - shared implementation
    protected void logConnection(String dbType) {
        System.out.println("Connecting to " + dbType + " database: " + url);
    }
}

public class MySQLConnection extends DatabaseConnection {
    public MySQLConnection(String url, String username, String password) {
        super(url, username, password);
    }
    
    @Override
    public void connect() {
        logConnection("MySQL");
        // MySQL specific connection logic
    }
    
    @Override
    public void disconnect() {
        // MySQL specific disconnection logic
    }
    
    @Override
    public ResultSet executeQuery(String query) {
        // MySQL specific query execution
        return null;
    }
}
```

### Q2: Composition vs Inheritance - Khi nào dùng gì?

**Inheritance (IS-A):**
```java
// ✅ Good: Dog IS-A Animal
class Animal {
    protected String name;
    public void eat() { }
}

class Dog extends Animal {
    public void bark() { }
}

// ❌ Bad: Car IS-A Engine? No!
class Car extends Engine { }  // Wrong!
```

**Composition (HAS-A):**
```java
// ✅ Good: Car HAS-A Engine
class Engine {
    public void start() { }
}

class Car {
    private Engine engine;  // Composition
    private Wheel[] wheels;
    
    public Car() {
        this.engine = new Engine();
        this.wheels = new Wheel[4];
    }
    
    public void start() {
        engine.start();  // Delegate to Engine
    }
}

// ✅ Better: Flexible, can change engine at runtime
class Car {
    private Engine engine;
    
    public Car(Engine engine) {
        this.engine = engine;  // Dependency injection
    }
    
    public void setEngine(Engine engine) {
        this.engine = engine;  // Can change engine
    }
}
```

**Khi dùng Inheritance:**
- True IS-A relationship
- Need to override methods
- Need polymorphism
- Shared behavior

**Khi dùng Composition:**
- HAS-A relationship
- Need flexibility
- Need to change behavior at runtime
- Avoid tight coupling

### Q3: Method Overriding Rules - Chi tiết

```java
class Parent {
    // Rule 1: Access modifier không thể restrictive hơn
    protected void method1() { }
    public void method2() { }
    
    // Rule 2: Return type phải compatible (covariant return types)
    public Number method3() { return 1; }
    
    // Rule 3: Không thể override final methods
    public final void method4() { }
    
    // Rule 4: Không thể override static methods (method hiding)
    public static void method5() { }
    
    // Rule 5: Không thể override private methods
    private void method6() { }
}

class Child extends Parent {
    // ✅ OK: public > protected
    @Override
    public void method1() { }
    
    // ✅ OK: Integer extends Number (covariant return)
    @Override
    public Integer method3() { return 1; }
    
    // ❌ ERROR: Cannot override final method
    // @Override
    // public void method4() { }
    
    // ⚠️ Method hiding, not overriding
    public static void method5() { }
    
    // ⚠️ Not overriding, this is a new method
    private void method6() { }
}
```

### Q4: Covariant Return Types

```java
class Animal {
    public Animal reproduce() {
        return new Animal();
    }
}

class Dog extends Animal {
    // ✅ Covariant return type: Dog extends Animal
    @Override
    public Dog reproduce() {
        return new Dog();
    }
}

// Usage
Animal animal = new Dog();
Animal child = animal.reproduce();  // Returns Dog, but assigned to Animal
```

### Q5: Method Hiding vs Overriding

```java
class Parent {
    public static void staticMethod() {
        System.out.println("Parent static");
    }
    
    public void instanceMethod() {
        System.out.println("Parent instance");
    }
}

class Child extends Parent {
    // Method hiding - resolved at compile time
    public static void staticMethod() {
        System.out.println("Child static");
    }
    
    // Method overriding - resolved at runtime
    @Override
    public void instanceMethod() {
        System.out.println("Child instance");
    }
}

// Usage
Parent parent = new Child();
parent.staticMethod();   // "Parent static" (compile-time)
parent.instanceMethod(); // "Child instance" (runtime)
```

### Q6: Constructor Chaining

```java
class Grandparent {
    public Grandparent() {
        System.out.println("Grandparent");
    }
}

class Parent extends Grandparent {
    public Parent() {
        // Implicit super() call
        System.out.println("Parent");
    }
    
    public Parent(String name) {
        this();  // Call no-arg constructor
        System.out.println("Parent: " + name);
    }
}

class Child extends Parent {
    public Child() {
        super("Child");  // Explicit super() call
        System.out.println("Child");
    }
}

// Output when creating Child:
// Grandparent
// Parent
// Parent: Child
// Child
```

### Q7: Interface Default Methods và Multiple Inheritance

```java
interface A {
    default void method() {
        System.out.println("A");
    }
}

interface B {
    default void method() {
        System.out.println("B");
    }
}

// ❌ Compile error: Ambiguous method
// class C implements A, B { }

// ✅ Solution 1: Override method
class C implements A, B {
    @Override
    public void method() {
        System.out.println("C");
    }
}

// ✅ Solution 2: Choose specific implementation
class C implements A, B {
    @Override
    public void method() {
        A.super.method();  // Call A's default method
    }
}
```

### Q8: Functional Interfaces và Lambda

```java
// Functional Interface: Exactly one abstract method
@FunctionalInterface
interface Calculator {
    int calculate(int a, int b);
    
    // Can have default methods
    default int add(int a, int b) {
        return a + b;
    }
    
    // Can have static methods
    static Calculator multiply() {
        return (a, b) -> a * b;
    }
}

// Usage
Calculator add = (a, b) -> a + b;
Calculator subtract = (a, b) -> a - b;

int result1 = add.calculate(5, 3);        // 8
int result2 = subtract.calculate(5, 3);   // 2
```

### Q9: SOLID Principles trong OOP

**S - Single Responsibility Principle:**
```java
// ❌ Bad: Class có nhiều responsibilities
class User {
    public void save() { }
    public void sendEmail() { }
    public void generateReport() { }
}

// ✅ Good: Mỗi class một responsibility
class User {
    public void save() { }
}

class EmailService {
    public void sendEmail() { }
}

class ReportGenerator {
    public void generateReport() { }
}
```

**O - Open/Closed Principle:**
```java
// ✅ Good: Open for extension, closed for modification
interface PaymentMethod {
    void pay(double amount);
}

class CreditCard implements PaymentMethod {
    public void pay(double amount) { }
}

class PayPal implements PaymentMethod {
    public void pay(double amount) { }
}

// Can add new payment methods without modifying existing code
```

**L - Liskov Substitution Principle:**
```java
// ✅ Good: Subclass có thể thay thế parent class
class Rectangle {
    protected int width, height;
    public void setWidth(int w) { width = w; }
    public void setHeight(int h) { height = h; }
}

class Square extends Rectangle {
    @Override
    public void setWidth(int w) {
        width = height = w;  // Maintains square property
    }
    
    @Override
    public void setHeight(int h) {
        width = height = h;  // Maintains square property
    }
}

// Square can be used wherever Rectangle is expected
```

**I - Interface Segregation Principle:**
```java
// ❌ Bad: Large interface
interface Worker {
    void work();
    void eat();
    void sleep();
}

// ✅ Good: Segregated interfaces
interface Workable {
    void work();
}

interface Eatable {
    void eat();
}

interface Sleepable {
    void sleep();
}

class Human implements Workable, Eatable, Sleepable {
    public void work() { }
    public void eat() { }
    public void sleep() { }
}

class Robot implements Workable {
    public void work() { }
    // Doesn't need eat() or sleep()
}
```

**D - Dependency Inversion Principle:**
```java
// ❌ Bad: High-level module depends on low-level module
class MySQLDatabase {
    public void save() { }
}

class UserService {
    private MySQLDatabase database;  // Tight coupling
    public void saveUser() {
        database.save();
    }
}

// ✅ Good: Both depend on abstraction
interface Database {
    void save();
}

class MySQLDatabase implements Database {
    public void save() { }
}

class UserService {
    private Database database;  // Depends on abstraction
    public UserService(Database database) {
        this.database = database;
    }
    public void saveUser() {
        database.save();
    }
}
```

## Tổng kết

- **Encapsulation**: Ẩn implementation, expose interface
- **Inheritance**: Code reuse, IS-A relationship
- **Polymorphism**: Một interface, nhiều implementations
- **Abstraction**: Ẩn complexity, focus vào essentials

**Best Practices:**
- Prefer composition over inheritance
- Use interfaces cho contracts
- Use abstract classes cho shared code
- Keep classes focused và cohesive
- Follow SOLID principles
- Use @Override annotation
- Understand method overriding rules
- Use covariant return types appropriately
