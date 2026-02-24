## CDI Basics & ArC (Quarkus)

### Differences between Build-Time and Runtime Optimizations

- **Build-Time Optimizations:** These are performed at compile time. Code analysis and processing happen during the build, leading to optimized bytecode that is smaller and faster. The benefits include:
  - Faster startup time
  - Reduced memory footprint

- **Runtime Optimizations:** These occur during application execution. The framework adapts to the runtime environment, allowing for more dynamic behaviors. Key aspects include:
  - Flexibility in bean resolution
  - Ability to handle more dynamic scenarios

### Examples of Build-Time Optimization in Action
1. **Unused Bean Removal:** If you have registered beans that are never used in your application, ArC automatically identifies and removes these unused beans during the build stage, improving both startup time and memory usage.
   
2. **Simplification of Proxies:** ArC eliminates the need for proxy classes by resolving dependencies at build-time, which can significantly enhance performance.

### Process Comparison Diagram

```markdown
```plaintext
  +---------------------+                  +--------------------------+
  |   Build-Time        |                  |       Runtime            |
  |   Optimizations     |                  |       Optimizations      |
  +---------------------+                  +--------------------------+
  | - Code Analysis     |                  | - Dynamic Bean Loading   |
  | - Unused Bean Removal|                  | - Flexible Configuration  |
  | - Efficient Proxies  |                  | - Adaptability           |
  +---------------------+                  +--------------------------+
```

### Key Features of ArC
- **Unused Bean Removal:** Removing unused beans during the build provides a cleaner environment and leads to performance benefits, such as:
  - Reduced application size
  - Faster boot times
  - Improved manageability of codebase by avoiding unnecessary clutter.

These optimizations and strategies ensure that applications are not only efficient but also simpler to manage, maximizing the advantages of Quarkus' architecture.