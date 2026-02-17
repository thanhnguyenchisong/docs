# Design Patterns - Câu hỏi phỏng vấn Java

## Mục lục
1. [Creational Patterns](#creational-patterns)
2. [Structural Patterns](#structural-patterns)
3. [Behavioral Patterns](#behavioral-patterns)
4. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Creational Patterns

### 1. Singleton Pattern

**Mục đích:** Đảm bảo chỉ có một instance của class.

#### Eager Initialization

```java
public class Singleton {
    private static final Singleton instance = new Singleton();
    
    private Singleton() {
        // Private constructor
    }
    
    public static Singleton getInstance() {
        return instance;
    }
}
```

#### Lazy Initialization

```java
public class Singleton {
    private static Singleton instance;
    
    private Singleton() {}
    
    public static synchronized Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

#### Double-Checked Locking

```java
public class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

#### Bill Pugh Solution (Recommended)

```java
public class Singleton {
    private Singleton() {}
    
    private static class SingletonHelper {
        private static final Singleton INSTANCE = new Singleton();
    }
    
    public static Singleton getInstance() {
        return SingletonHelper.INSTANCE;
    }
}
```

#### Enum Singleton (Best for Java)

```java
public enum Singleton {
    INSTANCE;
    
    public void doSomething() {
        // Implementation
    }
}

// Usage
Singleton.INSTANCE.doSomething();
```

### 2. Factory Pattern

**Mục đích:** Tạo objects mà không expose creation logic.

```java
// Product interface
interface Shape {
    void draw();
}

// Concrete products
class Circle implements Shape {
    @Override
    public void draw() {
        System.out.println("Drawing Circle");
    }
}

class Rectangle implements Shape {
    @Override
    public void draw() {
        System.out.println("Drawing Rectangle");
    }
}

// Factory
class ShapeFactory {
    public Shape getShape(String shapeType) {
        if (shapeType == null) {
            return null;
        }
        if (shapeType.equalsIgnoreCase("CIRCLE")) {
            return new Circle();
        } else if (shapeType.equalsIgnoreCase("RECTANGLE")) {
            return new Rectangle();
        }
        return null;
    }
}

// Usage
ShapeFactory factory = new ShapeFactory();
Shape circle = factory.getShape("CIRCLE");
circle.draw();
```

### 3. Builder Pattern

**Mục đích:** Tạo complex objects step by step.

```java
public class User {
    private String firstName;
    private String lastName;
    private int age;
    private String email;
    
    private User(Builder builder) {
        this.firstName = builder.firstName;
        this.lastName = builder.lastName;
        this.age = builder.age;
        this.email = builder.email;
    }
    
    public static class Builder {
        private String firstName;
        private String lastName;
        private int age;
        private String email;
        
        public Builder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }
        
        public Builder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }
        
        public Builder age(int age) {
            this.age = age;
            return this;
        }
        
        public Builder email(String email) {
            this.email = email;
            return this;
        }
        
        public User build() {
            return new User(this);
        }
    }
}

// Usage
User user = new User.Builder()
    .firstName("John")
    .lastName("Doe")
    .age(30)
    .email("john@example.com")
    .build();
```

### 4. Prototype Pattern

**Mục đích:** Tạo objects bằng cách clone existing instances.

```java
interface Prototype extends Cloneable {
    Prototype clone();
}

class ConcretePrototype implements Prototype {
    private String field;
    
    public ConcretePrototype(String field) {
        this.field = field;
    }
    
    @Override
    public Prototype clone() {
        return new ConcretePrototype(this.field);
    }
    
    public String getField() {
        return field;
    }
}

// Usage
ConcretePrototype original = new ConcretePrototype("Original");
ConcretePrototype cloned = (ConcretePrototype) original.clone();
```

---

## Structural Patterns

### 1. Adapter Pattern

**Mục đích:** Cho phép incompatible interfaces làm việc cùng nhau.

```java
// Target interface
interface MediaPlayer {
    void play(String audioType, String fileName);
}

// Adaptee
interface AdvancedMediaPlayer {
    void playVlc(String fileName);
    void playMp4(String fileName);
}

class VlcPlayer implements AdvancedMediaPlayer {
    @Override
    public void playVlc(String fileName) {
        System.out.println("Playing vlc file: " + fileName);
    }
    
    @Override
    public void playMp4(String fileName) {
        // Do nothing
    }
}

// Adapter
class MediaAdapter implements MediaPlayer {
    private AdvancedMediaPlayer advancedPlayer;
    
    public MediaAdapter(String audioType) {
        if (audioType.equalsIgnoreCase("vlc")) {
            advancedPlayer = new VlcPlayer();
        }
    }
    
    @Override
    public void play(String audioType, String fileName) {
        if (audioType.equalsIgnoreCase("vlc")) {
            advancedPlayer.playVlc(fileName);
        }
    }
}

// Client
class AudioPlayer implements MediaPlayer {
    private MediaAdapter adapter;
    
    @Override
    public void play(String audioType, String fileName) {
        if (audioType.equalsIgnoreCase("mp3")) {
            System.out.println("Playing mp3: " + fileName);
        } else if (audioType.equalsIgnoreCase("vlc")) {
            adapter = new MediaAdapter(audioType);
            adapter.play(audioType, fileName);
        }
    }
}
```

### 2. Decorator Pattern

**Mục đích:** Thêm behavior động cho objects.

```java
// Component
interface Coffee {
    double cost();
    String description();
}

// Concrete component
class SimpleCoffee implements Coffee {
    @Override
    public double cost() {
        return 5.0;
    }
    
    @Override
    public String description() {
        return "Simple Coffee";
    }
}

// Decorator
abstract class CoffeeDecorator implements Coffee {
    protected Coffee coffee;
    
    public CoffeeDecorator(Coffee coffee) {
        this.coffee = coffee;
    }
}

// Concrete decorators
class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) {
        super(coffee);
    }
    
    @Override
    public double cost() {
        return coffee.cost() + 1.0;
    }
    
    @Override
    public String description() {
        return coffee.description() + ", Milk";
    }
}

class SugarDecorator extends CoffeeDecorator {
    public SugarDecorator(Coffee coffee) {
        super(coffee);
    }
    
    @Override
    public double cost() {
        return coffee.cost() + 0.5;
    }
    
    @Override
    public String description() {
        return coffee.description() + ", Sugar";
    }
}

// Usage
Coffee coffee = new SimpleCoffee();
coffee = new MilkDecorator(coffee);
coffee = new SugarDecorator(coffee);
System.out.println(coffee.description() + " - $" + coffee.cost());
```

### 3. Facade Pattern

**Mục đích:** Cung cấp simplified interface cho complex subsystem.

```java
// Subsystem classes
class CPU {
    public void start() {
        System.out.println("CPU started");
    }
}

class Memory {
    public void load() {
        System.out.println("Memory loaded");
    }
}

class HardDrive {
    public void read() {
        System.out.println("Hard drive read");
    }
}

// Facade
class ComputerFacade {
    private CPU cpu;
    private Memory memory;
    private HardDrive hardDrive;
    
    public ComputerFacade() {
        this.cpu = new CPU();
        this.memory = new Memory();
        this.hardDrive = new HardDrive();
    }
    
    public void startComputer() {
        cpu.start();
        memory.load();
        hardDrive.read();
        System.out.println("Computer started");
    }
}

// Usage
ComputerFacade computer = new ComputerFacade();
computer.startComputer();
```

### 4. Proxy Pattern

**Mục đích:** Cung cấp placeholder cho another object.

```java
// Subject
interface Image {
    void display();
}

// Real subject
class RealImage implements Image {
    private String fileName;
    
    public RealImage(String fileName) {
        this.fileName = fileName;
        loadFromDisk();
    }
    
    private void loadFromDisk() {
        System.out.println("Loading " + fileName);
    }
    
    @Override
    public void display() {
        System.out.println("Displaying " + fileName);
    }
}

// Proxy
class ProxyImage implements Image {
    private RealImage realImage;
    private String fileName;
    
    public ProxyImage(String fileName) {
        this.fileName = fileName;
    }
    
    @Override
    public void display() {
        if (realImage == null) {
            realImage = new RealImage(fileName);
        }
        realImage.display();
    }
}

// Usage
Image image = new ProxyImage("test.jpg");
image.display();  // Loading và displaying
image.display();  // Only displaying (already loaded)
```

---

## Behavioral Patterns

### 1. Observer Pattern

**Mục đích:** Define one-to-many dependency giữa objects.

```java
import java.util.ArrayList;
import java.util.List;

// Subject
interface Subject {
    void attach(Observer observer);
    void detach(Observer observer);
    void notifyObservers();
}

// Observer
interface Observer {
    void update(String message);
}

// Concrete subject
class NewsAgency implements Subject {
    private List<Observer> observers = new ArrayList<>();
    private String news;
    
    @Override
    public void attach(Observer observer) {
        observers.add(observer);
    }
    
    @Override
    public void detach(Observer observer) {
        observers.remove(observer);
    }
    
    @Override
    public void notifyObservers() {
        for (Observer observer : observers) {
            observer.update(news);
        }
    }
    
    public void setNews(String news) {
        this.news = news;
        notifyObservers();
    }
}

// Concrete observers
class NewsChannel implements Observer {
    private String name;
    
    public NewsChannel(String name) {
        this.name = name;
    }
    
    @Override
    public void update(String message) {
        System.out.println(name + " received: " + message);
    }
}

// Usage
NewsAgency agency = new NewsAgency();
Observer channel1 = new NewsChannel("CNN");
Observer channel2 = new NewsChannel("BBC");

agency.attach(channel1);
agency.attach(channel2);
agency.setNews("Breaking news!");
```

### 2. Strategy Pattern

**Mục đích:** Define family of algorithms và make them interchangeable.

```java
// Strategy interface
interface PaymentStrategy {
    void pay(int amount);
}

// Concrete strategies
class CreditCardStrategy implements PaymentStrategy {
    private String cardNumber;
    
    public CreditCardStrategy(String cardNumber) {
        this.cardNumber = cardNumber;
    }
    
    @Override
    public void pay(int amount) {
        System.out.println("Paid " + amount + " using credit card");
    }
}

class PayPalStrategy implements PaymentStrategy {
    private String email;
    
    public PayPalStrategy(String email) {
        this.email = email;
    }
    
    @Override
    public void pay(int amount) {
        System.out.println("Paid " + amount + " using PayPal");
    }
}

// Context
class ShoppingCart {
    private PaymentStrategy paymentStrategy;
    
    public void setPaymentStrategy(PaymentStrategy strategy) {
        this.paymentStrategy = strategy;
    }
    
    public void checkout(int amount) {
        paymentStrategy.pay(amount);
    }
}

// Usage
ShoppingCart cart = new ShoppingCart();
cart.setPaymentStrategy(new CreditCardStrategy("1234-5678"));
cart.checkout(100);
```

### 3. Command Pattern

**Mục đích:** Encapsulate requests như objects.

```java
// Command interface
interface Command {
    void execute();
    void undo();
}

// Receiver
class Light {
    public void on() {
        System.out.println("Light is ON");
    }
    
    public void off() {
        System.out.println("Light is OFF");
    }
}

// Concrete command
class LightOnCommand implements Command {
    private Light light;
    
    public LightOnCommand(Light light) {
        this.light = light;
    }
    
    @Override
    public void execute() {
        light.on();
    }
    
    @Override
    public void undo() {
        light.off();
    }
}

// Invoker
class RemoteControl {
    private Command command;
    
    public void setCommand(Command command) {
        this.command = command;
    }
    
    public void pressButton() {
        command.execute();
    }
}

// Usage
Light light = new Light();
Command lightOn = new LightOnCommand(light);
RemoteControl remote = new RemoteControl();
remote.setCommand(lightOn);
remote.pressButton();
```

### 4. Template Method Pattern

**Mục đích:** Define skeleton of algorithm trong base class.

```java
// Abstract class
abstract class Game {
    abstract void initialize();
    abstract void startPlay();
    abstract void endPlay();
    
    // Template method
    public final void play() {
        initialize();
        startPlay();
        endPlay();
    }
}

// Concrete classes
class Cricket extends Game {
    @Override
    void initialize() {
        System.out.println("Cricket Game Initialized");
    }
    
    @Override
    void startPlay() {
        System.out.println("Cricket Game Started");
    }
    
    @Override
    void endPlay() {
        System.out.println("Cricket Game Finished");
    }
}

class Football extends Game {
    @Override
    void initialize() {
        System.out.println("Football Game Initialized");
    }
    
    @Override
    void startPlay() {
        System.out.println("Football Game Started");
    }
    
    @Override
    void endPlay() {
        System.out.println("Football Game Finished");
    }
}

// Usage
Game game = new Cricket();
game.play();
```

---

## Câu hỏi thường gặp

### Q1: Singleton Pattern - Thread-safe implementation?

**Best approach:** Enum hoặc Bill Pugh solution

```java
// Enum (Recommended)
public enum Singleton {
    INSTANCE;
}

// Bill Pugh
public class Singleton {
    private Singleton() {}
    private static class SingletonHelper {
        private static final Singleton INSTANCE = new Singleton();
    }
    public static Singleton getInstance() {
        return SingletonHelper.INSTANCE;
    }
}
```

### Q2: Factory vs Abstract Factory?

**Factory:** Tạo objects của một type
**Abstract Factory:** Tạo families of related objects

### Q3: Adapter vs Decorator?

**Adapter:** Thay đổi interface để compatible
**Decorator:** Thêm behavior mà không thay đổi interface

### Q4: Observer vs Pub-Sub?

**Observer:** Direct communication, tight coupling
**Pub-Sub:** Indirect communication qua message broker, loose coupling

### Q5: Strategy vs State Pattern?

**Strategy:** Algorithms có thể thay đổi
**State:** Behavior thay đổi dựa trên internal state

---

## Best Practices

1. **Don't overuse patterns** - Chỉ dùng khi cần
2. **Understand problem** trước khi chọn pattern
3. **Prefer composition** over inheritance
4. **Keep it simple** - Đơn giản hóa khi có thể
5. **Java built-in patterns** - Sử dụng khi có thể (Collections, Streams)

---

## Bài tập thực hành

### Bài 1: Implement Repository Pattern

```java
// Yêu cầu: Tạo generic repository với CRUD operations
// Sử dụng generics và interface
```

### Bài 2: Chain of Responsibility

```java
// Yêu cầu: Implement approval chain
// Request đi qua nhiều handlers cho đến khi được approve
```

### Bài 3: MVC Pattern

```java
// Yêu cầu: Implement MVC pattern cho User management
// Model: User entity
// View: Console output
// Controller: Business logic
```

---

## Tổng kết

- **Creational**: Singleton, Factory, Builder, Prototype
- **Structural**: Adapter, Decorator, Facade, Proxy
- **Behavioral**: Observer, Strategy, Command, Template Method
- **Choose wisely**: Không overuse patterns
- **Java built-in**: Collections, Streams sử dụng nhiều patterns
