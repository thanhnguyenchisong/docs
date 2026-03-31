# Master AngularJS (1.x) — Từ Cơ Bản đến Chuyên Sâu

> **AngularJS** (v1.x) là framework JavaScript do Google phát triển, khác hoàn toàn với **Angular** (v2+).
> AngularJS vẫn được sử dụng rộng rãi trong **ServiceNow**, nhiều hệ thống enterprise legacy, và các ứng dụng cũ.

## Mục lục
- [1. AngularJS vs Angular (Modern)](#1-angularjs-vs-angular-modern)
- [2. Core Concepts](#2-core-concepts)
- [3. Modules & Dependency Injection](#3-modules--dependency-injection)
- [4. Controllers & $scope](#4-controllers--scope)
- [5. Data Binding](#5-data-binding)
- [6. Directives](#6-directives)
- [7. Services, Factories & Providers](#7-services-factories--providers)
- [8. Filters](#8-filters)
- [9. Routing (ngRoute & ui-router)](#9-routing-ngroute--ui-router)
- [10. Forms & Validation](#10-forms--validation)
- [11. HTTP & API ($http, $resource)](#11-http--api-http-resource)
- [12. Custom Directives](#12-custom-directives)
- [13. Component Architecture](#13-component-architecture)
- [14. Digest Cycle & Performance](#14-digest-cycle--performance)
- [15. Testing](#15-testing)
- [16. Best Practices & Patterns](#16-best-practices--patterns)
- [17. ServiceNow & AngularJS](#17-servicenow--angularjs)
- [18. Interview Questions](#18-interview-questions)

---

## 1. AngularJS vs Angular (Modern)

```
SO SÁNH:

┌─────────────────┬────────────────────┬────────────────────┐
│                 │ AngularJS (1.x)    │ Angular (2+/17+)   │
├─────────────────┼────────────────────┼────────────────────┤
│ Language        │ JavaScript (ES5)   │ TypeScript         │
│ Architecture    │ MVC / MVVM         │ Component-based    │
│ Binding         │ Two-way ($scope)   │ Two-way + Signals  │
│ DI System       │ String-based       │ Hierarchical       │
│ Rendering       │ Dirty checking     │ Zone.js / Signals  │
│ Routing         │ ngRoute/ui-router  │ @angular/router    │
│ Mobile          │ Not designed for   │ PWA support        │
│ CLI             │ None (manual)      │ Angular CLI        │
│ Performance     │ Slower (digest)    │ Much faster        │
│ Status          │ Long-term support  │ Active development │
│ Used in         │ ServiceNow, legacy │ New enterprise apps│
└─────────────────┴────────────────────┴────────────────────┘

QUAN TRỌNG:
- AngularJS dùng JavaScript ES5 (var, function, prototype)
- Angular (modern) dùng TypeScript (class, decorator, import)
- Chúng KHÔNG tương thích — code KHÔNG thể copy-paste giữa 2 bản
```

---

## 2. Core Concepts

### 2.1 Architecture

```
AngularJS Architecture:

┌─────────────────────────────────────────────────────────┐
│                    HTML TEMPLATE                        │
│  ┌───────────────────────────────────────────────────┐ │
│  │  <div ng-app="myApp" ng-controller="MainCtrl">   │ │
│  │      <h1>{{ title }}</h1>                         │ │
│  │      <input ng-model="name">                      │ │
│  │      <p>Hello, {{ name }}!</p>                    │ │
│  │  </div>                                           │ │
│  └───────────────────────────────────────────────────┘ │
│                   ↕ Two-way Binding                    │
│  ┌───────────────────────────────────────────────────┐ │
│  │              CONTROLLER ($scope)                  │ │
│  │  $scope.title = 'My App';                         │ │
│  │  $scope.name = 'World';                           │ │
│  └───────────────────────────────────────────────────┘ │
│                   ↕ DI                                │
│  ┌───────────────────────────────────────────────────┐ │
│  │              SERVICES                              │ │
│  │  UserService, $http, $resource, $q                │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

Key concepts:
├── Module     → Container cho app/feature (angular.module)
├── Controller → Business logic, bind data to view ($scope)
├── Directive  → Extend HTML (ng-model, ng-repeat, custom)
├── Service    → Reusable business logic (singleton)
├── Filter     → Transform data for display (currency, date)
├── $scope     → Glue between Controller and View
└── Dependency Injection → Auto-inject services
```

---

## 3. Modules & Dependency Injection

### 3.1 Module

```javascript
// ═══════════════════════════════════════
// Module = Container cho AngularJS app
// ═══════════════════════════════════════

// Tạo module (có [] = CREATE)
var app = angular.module('myApp', ['ngRoute', 'ngResource']);
//                                  └── dependency modules

// Lấy module đã tạo (KHÔNG có [] = GET)
var app = angular.module('myApp');

// Module con (feature modules)
var userModule = angular.module('myApp.users', []);
var orderModule = angular.module('myApp.orders', []);

// Main module include sub-modules
var app = angular.module('myApp', [
    'ngRoute',
    'myApp.users',
    'myApp.orders'
]);
```

### 3.2 Dependency Injection

```javascript
// AngularJS DI: tự động inject services vào controllers/services

// ═══ Cách 1: Implicit (theo tên parameter) — KHÔNG nên dùng
app.controller('MainCtrl', function($scope, $http) {
    // $scope và $http tự động inject dựa trên tên
    // ❌ BUG: Minification sẽ đổi tên parameter → break!
});

// ═══ Cách 2: Inline Array Annotation — KHUYẾN NGHỊ
app.controller('MainCtrl', ['$scope', '$http', 'UserService',
    function($scope, $http, UserService) {
        // String names survive minification ✅
        $scope.users = [];
        UserService.getAll().then(function(users) {
            $scope.users = users;
        });
    }
]);

// ═══ Cách 3: $inject property
function MainCtrl($scope, $http, UserService) {
    // ...
}
MainCtrl.$inject = ['$scope', '$http', 'UserService'];
app.controller('MainCtrl', MainCtrl);
```

---

## 4. Controllers & $scope

### 4.1 Controller Basics

```javascript
// Controller = function gắn logic vào view thông qua $scope

app.controller('UserCtrl', ['$scope', function($scope) {
    // Data
    $scope.user = {
        name: 'Thanh',
        email: 'thanh@example.com'
    };
    
    $scope.users = [
        { id: 1, name: 'Alice', active: true },
        { id: 2, name: 'Bob', active: false },
        { id: 3, name: 'Charlie', active: true }
    ];
    
    // Methods
    $scope.greet = function() {
        return 'Hello, ' + $scope.user.name + '!';
    };
    
    $scope.addUser = function(newUser) {
        $scope.users.push(angular.copy(newUser));
        $scope.newUser = {}; // Reset form
    };
    
    $scope.removeUser = function(index) {
        $scope.users.splice(index, 1);
    };
    
    $scope.toggleActive = function(user) {
        user.active = !user.active;
    };
}]);
```

```html
<!-- Template sử dụng controller -->
<div ng-controller="UserCtrl">
    <h2>{{ greet() }}</h2>
    
    <ul>
        <li ng-repeat="user in users track by user.id"
            ng-class="{ 'active': user.active }">
            {{ user.name }}
            <button ng-click="toggleActive(user)">Toggle</button>
            <button ng-click="removeUser($index)">Remove</button>
        </li>
    </ul>
    
    <form ng-submit="addUser(newUser)">
        <input ng-model="newUser.name" placeholder="Name" required>
        <button type="submit">Add</button>
    </form>
</div>
```

### 4.2 $scope Hierarchy (Inheritance)

```javascript
// $scope kế thừa theo DOM tree (prototypal inheritance)

app.controller('ParentCtrl', ['$scope', function($scope) {
    $scope.parentValue = 'I am parent';
    $scope.shared = { message: 'From parent' }; // Object → shared by reference
}]);

app.controller('ChildCtrl', ['$scope', function($scope) {
    // $scope.parentValue → accessible (inherited)
    // $scope.shared.message → accessible AND shared
    
    $scope.childValue = 'I am child';
    
    // ⚠️ GOTCHA: Assigning primitive creates NEW property on child scope
    $scope.parentValue = 'Modified'; // Creates NEW property, doesn't modify parent!
    
    // ✅ Correct: modify through object reference
    $scope.shared.message = 'Modified by child'; // Modifies parent's object
}]);
```

```html
<div ng-controller="ParentCtrl">
    <p>{{ parentValue }}</p>         <!-- "I am parent" -->
    <p>{{ shared.message }}</p>      <!-- "From parent" → "Modified by child" -->
    
    <div ng-controller="ChildCtrl">
        <p>{{ parentValue }}</p>     <!-- "Modified" (child's own copy) -->
        <p>{{ shared.message }}</p>  <!-- "Modified by child" (shared ref) -->
    </div>
</div>
```

### 4.3 controllerAs Syntax (Best Practice)

```javascript
// ═══ "controller as" — tránh dùng $scope trực tiếp

app.controller('UserCtrl', [function() {
    var vm = this; // vm = ViewModel
    
    vm.user = { name: 'Thanh', email: 'thanh@example.com' };
    vm.users = [];
    
    vm.greet = function() {
        return 'Hello, ' + vm.user.name;
    };
    
    vm.addUser = function(newUser) {
        vm.users.push(angular.copy(newUser));
    };
}]);
```

```html
<!-- controllerAs trong template -->
<div ng-controller="UserCtrl as userCtrl">
    <h2>{{ userCtrl.greet() }}</h2>
    <p>{{ userCtrl.user.email }}</p>
    
    <ul>
        <li ng-repeat="u in userCtrl.users">
            {{ u.name }}
        </li>
    </ul>
</div>

<!-- Lợi ích:
     1. Rõ ràng data thuộc controller nào (nested controllers)
     2. Tránh $scope inheritance pitfalls
     3. Giống component pattern (Angular 2+)
-->
```

---

## 5. Data Binding

```
AngularJS Data Binding Types:

1. INTERPOLATION (one-way: model → view)
   {{ expression }}
   {{ user.name }}
   {{ 1 + 2 }}
   {{ isActive ? 'Yes' : 'No' }}

2. ng-bind (one-way: model → view, no flash)
   <span ng-bind="user.name"></span>
   <!-- Tránh flash {{ }} khi page load -->

3. ng-model (two-way: model ↔ view)
   <input ng-model="user.name">
   <!-- Thay đổi input → tự động update $scope -->
   <!-- Thay đổi $scope → tự động update input -->

4. ng-bind-html (bind HTML content)
   <div ng-bind-html="trustedHtml"></div>
   <!-- Cần $sce.trustAsHtml() để tránh XSS -->

5. ONE-TIME BINDING (::) — Performance optimization
   {{ ::user.name }}
   <!-- Bind 1 lần, sau đó không watch nữa -->
   <!-- Giảm watchers → tăng performance -->
```

```javascript
// Two-way binding example
app.controller('FormCtrl', ['$scope', function($scope) {
    $scope.user = { name: '', email: '' };
    
    // Watch for changes (manual watcher)
    $scope.$watch('user.name', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            console.log('Name changed from', oldVal, 'to', newVal);
        }
    });
    
    // Deep watch (watch object properties)
    $scope.$watch('user', function(newVal, oldVal) {
        console.log('User object changed');
    }, true); // true = deep watch (expensive!)
    
    // Watch collection (array length/order changes)
    $scope.$watchCollection('users', function(newVal, oldVal) {
        console.log('Users array changed');
    });
}]);
```

---

## 6. Directives

### 6.1 Built-in Directives

```html
<!-- ═══ Structural Directives ═══ -->

<!-- ng-if: Add/remove DOM element -->
<div ng-if="user.isLoggedIn">Welcome back!</div>

<!-- ng-show/ng-hide: Show/hide (CSS display, element stays in DOM) -->
<div ng-show="loading">Loading...</div>
<div ng-hide="loading">Content loaded</div>

<!-- ng-switch -->
<div ng-switch="user.role">
    <div ng-switch-when="admin">Admin Panel</div>
    <div ng-switch-when="user">User Dashboard</div>
    <div ng-switch-default>Guest View</div>
</div>

<!-- ng-repeat: Loop -->
<ul>
    <li ng-repeat="item in items track by item.id">
        {{ $index + 1 }}. {{ item.name }}
        <span ng-if="$first">← First</span>
        <span ng-if="$last">← Last</span>
        <span ng-if="$even">← Even row</span>
    </li>
</ul>

<!-- ng-repeat with (key, value) for objects -->
<div ng-repeat="(key, value) in user">
    {{ key }}: {{ value }}
</div>

<!-- ═══ Attribute Directives ═══ -->

<!-- ng-class -->
<div ng-class="{ 'active': isActive, 'error': hasError }">
    Styled element
</div>
<div ng-class="[class1, class2]">Multiple classes</div>

<!-- ng-style -->
<div ng-style="{ color: textColor, 'font-size': fontSize + 'px' }">
    Dynamic style
</div>

<!-- ng-click, ng-submit, ng-change -->
<button ng-click="doSomething()">Click</button>
<form ng-submit="submitForm()">...</form>
<input ng-model="query" ng-change="search()">

<!-- ng-disabled, ng-readonly, ng-checked -->
<button ng-disabled="!form.$valid">Submit</button>
<input ng-readonly="isLocked">

<!-- ng-src, ng-href (prevent broken links during load) -->
<img ng-src="{{ user.avatar }}">
<a ng-href="{{ dynamicUrl }}">Link</a>

<!-- ng-include (template inclusion) -->
<div ng-include="'partials/header.html'"></div>

<!-- ng-cloak (prevent {{ }} flash) -->
<div ng-cloak>{{ user.name }}</div>
```

---

## 7. Services, Factories & Providers

### 7.1 So sánh

```
Service vs Factory vs Provider:

┌──────────┬─────────────────────────────────────────────┐
│ Type     │ Khi nào dùng                                │
├──────────┼─────────────────────────────────────────────┤
│ Service  │ Simple object with methods (new keyword)    │
│ Factory  │ Need to return different things / logic     │
│ Provider │ Need to configure before app starts         │
│ Value    │ Simple value/object (no DI in definition)   │
│ Constant │ Value available in config phase              │
└──────────┴─────────────────────────────────────────────┘

Tất cả đều là SINGLETON (1 instance duy nhất trong app)
```

### 7.2 Service

```javascript
// Service: AngularJS gọi new ServiceFunction()
// → "this" là instance object

app.service('UserService', ['$http', function($http) {
    var self = this;
    var baseUrl = '/api/users';
    
    self.getAll = function() {
        return $http.get(baseUrl).then(function(response) {
            return response.data;
        });
    };
    
    self.getById = function(id) {
        return $http.get(baseUrl + '/' + id).then(function(response) {
            return response.data;
        });
    };
    
    self.create = function(user) {
        return $http.post(baseUrl, user).then(function(response) {
            return response.data;
        });
    };
    
    self.update = function(id, user) {
        return $http.put(baseUrl + '/' + id, user).then(function(response) {
            return response.data;
        });
    };
    
    self.delete = function(id) {
        return $http.delete(baseUrl + '/' + id);
    };
}]);
```

### 7.3 Factory

```javascript
// Factory: return object/function/value trực tiếp

app.factory('AuthService', ['$http', '$window', function($http, $window) {
    var tokenKey = 'auth_token';
    
    // Private functions
    function saveToken(token) {
        $window.localStorage.setItem(tokenKey, token);
    }
    
    function getToken() {
        return $window.localStorage.getItem(tokenKey);
    }
    
    // Public API (trả về object)
    return {
        login: function(credentials) {
            return $http.post('/api/auth/login', credentials)
                .then(function(response) {
                    saveToken(response.data.token);
                    return response.data;
                });
        },
        
        logout: function() {
            $window.localStorage.removeItem(tokenKey);
        },
        
        isAuthenticated: function() {
            return !!getToken();
        },
        
        getToken: getToken
    };
}]);
```

### 7.4 Provider

```javascript
// Provider: configurable service

app.provider('ApiConfig', function() {
    var baseUrl = '';
    var timeout = 5000;
    
    // Configuration methods (available in config phase)
    this.setBaseUrl = function(url) {
        baseUrl = url;
    };
    
    this.setTimeout = function(ms) {
        timeout = ms;
    };
    
    // $get returns the service instance
    this.$get = ['$http', function($http) {
        return {
            get: function(path) {
                return $http.get(baseUrl + path, { timeout: timeout });
            },
            post: function(path, data) {
                return $http.post(baseUrl + path, data, { timeout: timeout });
            },
            getBaseUrl: function() {
                return baseUrl;
            }
        };
    }];
});

// Configure in config phase
app.config(['ApiConfigProvider', function(ApiConfigProvider) {
    ApiConfigProvider.setBaseUrl('https://api.example.com');
    ApiConfigProvider.setTimeout(10000);
}]);

// Use in controller/service
app.controller('MainCtrl', ['ApiConfig', function(ApiConfig) {
    ApiConfig.get('/users').then(function(response) {
        // ...
    });
}]);
```

---

## 8. Filters

```javascript
// ═══ Built-in Filters
// {{ expression | filter:arg1:arg2 }}

// In template:
// {{ user.name | uppercase }}          → "THANH"
// {{ user.name | lowercase }}          → "thanh"
// {{ price | currency:'₫' }}           → "₫100.00"
// {{ today | date:'dd/MM/yyyy' }}      → "31/03/2026"
// {{ longText | limitTo:100 }}         → Truncate to 100 chars
// {{ items | orderBy:'name' }}         → Sort by name
// {{ items | orderBy:'name':true }}    → Sort descending
// {{ items | filter:searchText }}      → Filter by search
// {{ number | number:2 }}             → "1,234.56"
// {{ data | json }}                   → Pretty-print JSON

// ═══ Custom Filter
app.filter('truncate', function() {
    return function(input, length, suffix) {
        length = length || 100;
        suffix = suffix || '...';
        
        if (!input || input.length <= length) {
            return input;
        }
        return input.substring(0, length) + suffix;
    };
});
// Usage: {{ longText | truncate:50:'...' }}

// Filter in controller
app.controller('MainCtrl', ['$scope', '$filter', function($scope, $filter) {
    var uppercase = $filter('uppercase');
    $scope.name = uppercase('thanh'); // 'THANH'
    
    var dateFilter = $filter('date');
    $scope.formattedDate = dateFilter(new Date(), 'dd/MM/yyyy');
}]);

// Chaining filters
// {{ items | filter:search | orderBy:'name' | limitTo:10 }}
```

---

## 9. Routing (ngRoute & ui-router)

### 9.1 ngRoute

```javascript
// ngRoute — basic routing (1 view per route)

// Install: angular-route.js
var app = angular.module('myApp', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl',
                controllerAs: 'vm'
            })
            .when('/users', {
                templateUrl: 'views/users.html',
                controller: 'UsersCtrl',
                controllerAs: 'vm',
                resolve: {
                    // Pre-fetch data before controller loads
                    users: ['UserService', function(UserService) {
                        return UserService.getAll();
                    }]
                }
            })
            .when('/users/:id', {
                templateUrl: 'views/user-detail.html',
                controller: 'UserDetailCtrl',
                controllerAs: 'vm'
            })
            .otherwise({
                redirectTo: '/'
            });
        
        // HTML5 mode (remove # from URL)
        $locationProvider.html5Mode(true);
    }
]);

// Access route params
app.controller('UserDetailCtrl', ['$routeParams', 'UserService',
    function($routeParams, UserService) {
        var vm = this;
        var userId = $routeParams.id;
        
        UserService.getById(userId).then(function(user) {
            vm.user = user;
        });
    }
]);
```

```html
<!-- ng-view: nơi render template theo route -->
<div ng-app="myApp">
    <nav>
        <a ng-href="#!/">Home</a>
        <a ng-href="#!/users">Users</a>
    </nav>
    
    <div ng-view></div> <!-- Route template renders here -->
</div>
```

### 9.2 ui-router (Advanced)

```javascript
// ui-router — supports nested views, multiple named views

var app = angular.module('myApp', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl as vm'
            })
            .state('users', {
                url: '/users',
                templateUrl: 'views/users.html',
                controller: 'UsersCtrl as vm'
            })
            .state('users.detail', {  // Nested state!
                url: '/:id',
                templateUrl: 'views/user-detail.html',
                controller: 'UserDetailCtrl as vm',
                resolve: {
                    user: ['$stateParams', 'UserService',
                        function($stateParams, UserService) {
                            return UserService.getById($stateParams.id);
                        }
                    ]
                }
            });
        
        $urlRouterProvider.otherwise('/');
    }
]);
```

---

## 10. Forms & Validation

```html
<!-- AngularJS auto-tracks form state -->
<form name="userForm" ng-submit="vm.submit()" novalidate>
    
    <!-- Text input with validation -->
    <div>
        <label>Name:</label>
        <input type="text"
               name="name"
               ng-model="vm.user.name"
               ng-minlength="2"
               ng-maxlength="50"
               required>
        
        <!-- Validation messages -->
        <div ng-messages="userForm.name.$error" ng-if="userForm.name.$touched">
            <p ng-message="required">Name is required</p>
            <p ng-message="minlength">At least 2 characters</p>
            <p ng-message="maxlength">Max 50 characters</p>
        </div>
    </div>
    
    <!-- Email -->
    <div>
        <input type="email"
               name="email"
               ng-model="vm.user.email"
               ng-pattern="/^[^\s@]+@[^\s@]+\.[^\s@]+$/"
               required>
        
        <div ng-messages="userForm.email.$error" ng-if="userForm.email.$dirty">
            <p ng-message="required">Email is required</p>
            <p ng-message="email">Invalid email format</p>
            <p ng-message="pattern">Must be a valid email</p>
        </div>
    </div>
    
    <!-- Submit button disabled when invalid -->
    <button type="submit" ng-disabled="userForm.$invalid">
        Save
    </button>
    
    <!-- Form state info -->
    <!-- userForm.$valid     → all fields valid -->
    <!-- userForm.$invalid   → at least one invalid -->
    <!-- userForm.$dirty     → user has modified a field -->
    <!-- userForm.$pristine  → no fields touched -->
    <!-- userForm.$submitted → form submitted -->
</form>
```

```javascript
// Custom validator directive
app.directive('uniqueEmail', ['UserService', function(UserService) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            ngModelCtrl.$asyncValidators.uniqueEmail = function(modelValue) {
                return UserService.checkEmail(modelValue).then(
                    function(response) {
                        if (response.data.exists) {
                            return $q.reject('exists');
                        }
                        return true;
                    }
                );
            };
        }
    };
}]);
// Usage: <input ng-model="email" unique-email>
```

---

## 11. HTTP & API ($http, $resource)

### 11.1 $http

```javascript
// $http — core HTTP service

app.service('ApiService', ['$http', '$q', function($http, $q) {
    var baseUrl = '/api';
    
    this.get = function(path, params) {
        return $http({
            method: 'GET',
            url: baseUrl + path,
            params: params || {},
            headers: { 'Accept': 'application/json' }
        }).then(function(response) {
            return response.data;
        }).catch(function(error) {
            console.error('API Error:', error.status, error.data);
            return $q.reject(error);
        });
    };
    
    this.post = function(path, data) {
        return $http.post(baseUrl + path, data)
            .then(function(response) { return response.data; });
    };
    
    this.put = function(path, data) {
        return $http.put(baseUrl + path, data)
            .then(function(response) { return response.data; });
    };
    
    this.delete = function(path) {
        return $http.delete(baseUrl + path)
            .then(function(response) { return response.data; });
    };
}]);

// HTTP Interceptor (middleware)
app.factory('AuthInterceptor', ['$q', '$window', function($q, $window) {
    return {
        // Before request
        request: function(config) {
            var token = $window.localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }
            return config;
        },
        
        // On request error
        requestError: function(rejection) {
            return $q.reject(rejection);
        },
        
        // After response
        response: function(response) {
            return response;
        },
        
        // On response error
        responseError: function(rejection) {
            if (rejection.status === 401) {
                $window.location.href = '/login';
            }
            return $q.reject(rejection);
        }
    };
}]);

// Register interceptor
app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
}]);
```

---

## 12. Custom Directives

```javascript
// Custom Directive — extend HTML

app.directive('userCard', function() {
    return {
        restrict: 'E',            // E=Element, A=Attribute, C=Class, M=Comment
        scope: {                   // Isolated scope
            user: '=',            // Two-way binding (=)
            onDelete: '&',        // Expression binding (&) → callback
            title: '@'            // String binding (@) → one-way text
        },
        templateUrl: 'directives/user-card.html',
        // template: '<div class="card">{{ user.name }}</div>',
        controller: ['$scope', function($scope) {
            $scope.confirmDelete = function() {
                if (confirm('Delete ' + $scope.user.name + '?')) {
                    $scope.onDelete({ user: $scope.user });
                }
            };
        }],
        link: function(scope, element, attrs) {
            // DOM manipulation here
            element.on('mouseenter', function() {
                element.addClass('highlight');
            });
            element.on('mouseleave', function() {
                element.removeClass('highlight');
            });
            
            // Cleanup on destroy
            scope.$on('$destroy', function() {
                element.off('mouseenter');
                element.off('mouseleave');
            });
        }
    };
});
```

```html
<!-- user-card.html template -->
<div class="user-card">
    <h3>{{ title }}</h3>
    <p>{{ user.name }}</p>
    <p>{{ user.email }}</p>
    <button ng-click="confirmDelete()">Delete</button>
</div>

<!-- Usage -->
<user-card
    user="selectedUser"
    title="User Details"
    on-delete="removeUser(user)">
</user-card>
```

### Scope Types

```
Directive Scope Binding:

@  (At/String)    → One-way string, interpolated
                    scope: { title: '@' }
                    <dir title="{{ vm.title }}">
                    
=  (Equal/Two-way) → Two-way object binding
                    scope: { user: '=' }
                    <dir user="vm.selectedUser">
                    
&  (Ampersand/Expr)→ Expression/callback binding
                    scope: { onSave: '&' }
                    <dir on-save="vm.save(item)">
                    
<  (One-way binding)→ One-way object (AngularJS 1.5+)
                    scope: { data: '<' }
                    <dir data="vm.data">
```

---

## 13. Component Architecture

```javascript
// Component = Simplified directive (AngularJS 1.5+)
// Giống Angular 2+ component pattern

app.component('userList', {
    templateUrl: 'components/user-list.html',
    controller: UserListController,
    bindings: {
        users: '<',           // One-way input binding
        onSelect: '&',        // Output callback
        title: '@'            // String binding
    }
});

function UserListController() {
    var ctrl = this;
    
    // Lifecycle hooks (giống Angular 2+)
    ctrl.$onInit = function() {
        // Component initialized
        ctrl.filteredUsers = ctrl.users || [];
    };
    
    ctrl.$onChanges = function(changes) {
        // Input bindings changed
        if (changes.users) {
            ctrl.filteredUsers = changes.users.currentValue;
        }
    };
    
    ctrl.$onDestroy = function() {
        // Cleanup
    };
    
    ctrl.selectUser = function(user) {
        ctrl.onSelect({ $event: { user: user } });
    };
}
UserListController.$inject = [];
```

```html
<!-- user-list.html -->
<div class="user-list">
    <h3>{{ $ctrl.title }}</h3>
    <div ng-repeat="user in $ctrl.filteredUsers track by user.id"
         ng-click="$ctrl.selectUser(user)">
        {{ user.name }}
    </div>
</div>

<!-- Usage (parent template) -->
<user-list
    users="vm.users"
    title="Team Members"
    on-select="vm.handleSelect($event)">
</user-list>
```

---

## 14. Digest Cycle & Performance

### 14.1 Digest Cycle

```
Digest Cycle = cách AngularJS detect changes

┌────────────────────────────────────────┐
│   User Action (click, type, etc.)      │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│   Angular directive handles event      │
│   (ng-click, ng-model, etc.)           │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│   $scope.$apply() called              │
│   (automatic for Angular events)       │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│   DIGEST CYCLE starts                  │
│                                        │
│   For each $watch:                     │
│   ├── Compare new value vs old value   │
│   ├── If changed → run listener        │
│   ├── Mark dirty = true                │
│   └── Continue checking...             │
│                                        │
│   If any dirty → RUN AGAIN             │
│   Repeat until stable (max 10 cycles)  │
│                                        │
│   If > 10 cycles → Error!              │
└────────────────────────────────────────┘

QUAN TRỌNG:
- Mỗi {{ expression }} tạo 1 $watch
- Mỗi ng-model tạo 1 $watch
- Mỗi ng-show/ng-if tạo 1 $watch
- 2000+ watchers = PERFORMANCE PROBLEM
```

### 14.2 Performance Optimization

```javascript
// ═══ 1. One-time binding (::) — reduce watchers
// {{ ::user.name }}  → binds once, then removes watcher

// ═══ 2. track by in ng-repeat — avoid DOM recreation
// <li ng-repeat="item in items track by item.id">

// ═══ 3. ng-if vs ng-show
// ng-if: removes from DOM entirely (no watchers when hidden)
// ng-show: hides with CSS (watchers still active)
// → Use ng-if for rarely shown content

// ═══ 4. Debounce ng-model
// <input ng-model="search" ng-model-options="{ debounce: 300 }">

// ═══ 5. $scope.$apply vs $scope.$digest
// $apply: runs $rootScope.$digest (entire app)
// $digest: runs only current scope and children
// Prefer $digest when possible

// ═══ 6. Avoid heavy computation in watchers/expressions
// ❌
// {{ computeExpensiveValue() }}  → Called EVERY digest cycle!
// ✅
// $scope.cachedValue = computeExpensiveValue(); // Compute once

// ═══ 7. Disable watchers when not needed
// Use angular.element(element).scope().$destroy() for hidden components

// ═══ 8. Use $scope.$applyAsync for batching
app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.useApplyAsync(true); // Batch HTTP response digests
}]);
```

---

## 15. Testing

```javascript
// ═══ Unit Testing with Jasmine + Karma

// Test a service
describe('UserService', function() {
    var UserService, $httpBackend;
    
    // Setup
    beforeEach(module('myApp'));
    
    beforeEach(inject(function(_UserService_, _$httpBackend_) {
        UserService = _UserService_;
        $httpBackend = _$httpBackend_;
    }));
    
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
    
    it('should fetch all users', function() {
        var mockUsers = [{ id: 1, name: 'Thanh' }];
        
        $httpBackend.expectGET('/api/users')
            .respond(200, mockUsers);
        
        var result;
        UserService.getAll().then(function(users) {
            result = users;
        });
        
        $httpBackend.flush();
        expect(result).toEqual(mockUsers);
    });
});

// Test a controller
describe('UserCtrl', function() {
    var $scope, controller;
    
    beforeEach(module('myApp'));
    
    beforeEach(inject(function($rootScope, $controller) {
        $scope = $rootScope.$new();
        controller = $controller('UserCtrl', { $scope: $scope });
    }));
    
    it('should have initial user list', function() {
        expect($scope.users).toBeDefined();
        expect(angular.isArray($scope.users)).toBe(true);
    });
    
    it('should add user', function() {
        var newUser = { name: 'Test', email: 'test@test.com' };
        $scope.addUser(newUser);
        expect($scope.users.length).toBe(1);
    });
});
```

---

## 16. Best Practices & Patterns

```
AngularJS Best Practices:

CODE ORGANIZATION:
├── ✅ 1 file per component/service/directive
├── ✅ Feature-based folder structure (not type-based)
├── ✅ Use controllerAs syntax (avoid $scope when possible)
├── ✅ Use .component() instead of .directive() (1.5+)
└── ✅ Use $inject array notation (minification-safe)

PERFORMANCE:
├── ✅ Use one-time binding (::) for static data
├── ✅ Use track by in ng-repeat
├── ✅ Prefer ng-if over ng-show for heavy content
├── ✅ Debounce ng-model inputs
├── ✅ Keep watchers < 2000
├── ✅ Avoid filters in ng-repeat (use pre-computed)
└── ✅ Use $applyAsync for HTTP batching

PATTERNS:
├── ✅ Thin controllers, fat services
├── ✅ Services for business logic, controllers for UI logic
├── ✅ Use resolve in routes (pre-fetch data)
├── ✅ Event communication: $emit (up), $broadcast (down)
├── ✅ Use $on('$destroy') for cleanup
└── ✅ Avoid $rootScope for data sharing (use services)

SECURITY:
├── ✅ Use $sce for trusted HTML
├── ✅ Use ng-bind instead of {{ }} (prevent XSS flash)
├── ✅ Sanitize user input
├── ✅ Use $http interceptors for auth tokens
└── ✅ Never store sensitive data in $scope

FOLDER STRUCTURE (recommended):
app/
├── app.module.js
├── app.config.js
├── app.routes.js
├── components/
│   ├── user-list/
│   │   ├── user-list.component.js
│   │   ├── user-list.html
│   │   └── user-list.css
│   └── user-card/
│       ├── user-card.directive.js
│       └── user-card.html
├── services/
│   ├── user.service.js
│   ├── auth.service.js
│   └── api.service.js
├── filters/
│   └── truncate.filter.js
└── views/
    ├── home.html
    └── users.html
```

---

## 17. ServiceNow & AngularJS

```
ServiceNow sử dụng AngularJS trong:

SERVICE PORTAL:
├── Widgets (AngularJS 1.x based)
│   ├── Client Script (controller logic)
│   ├── HTML Template (view)
│   ├── CSS/SCSS (styling)
│   ├── Server Script (server-side data)
│   └── Link function (DOM manipulation)
├── Pages (collections of widgets)
└── Themes (portal-wide styling)

KEY DIFFERENCES từ standard AngularJS:
├── Không import angular.module — ServiceNow tự quản lý
├── Data truyền qua c.data (server) và c.options (config)
├── $scope được inject tự động vào Client Script
├── Dùng spUtil, $sp cho ServiceNow-specific features
├── Server Script dùng GlideRecord (server-side JS)
└── g_form, g_user, g_list — ServiceNow global objects

WIDGET STRUCTURE:
┌──────────────────────────────────────┐
│  SERVER SCRIPT                        │
│  (function() {                        │
│    var gr = new GlideRecord('incident');│
│    gr.query();                        │
│    data.incidents = [];               │
│    while (gr.next()) {                │
│      data.incidents.push({            │
│        number: gr.getValue('number'), │
│        description: gr.getValue('short_description')│
│      });                              │
│    }                                  │
│  })();                                │
├──────────────────────────────────────┤
│  CLIENT SCRIPT                        │
│  function($scope, spUtil) {           │
│    var c = this;                      │
│    // c.data = server data            │
│    c.incidents = c.data.incidents;    │
│    c.selectIncident = function(inc) { │
│      c.selected = inc;               │
│    };                                 │
│  }                                    │
├──────────────────────────────────────┤
│  HTML TEMPLATE                        │
│  <div ng-repeat="inc in c.incidents">│
│    <span>{{ inc.number }}</span>      │
│    <span>{{ inc.description }}</span> │
│    <button ng-click="c.selectIncident(inc)">│
│      View                             │
│    </button>                          │
│  </div>                              │
└──────────────────────────────────────┘
```

---

## 18. Interview Questions

```
AngularJS Interview Cheat Sheet:

CORE:
├── AngularJS vs Angular?        → JS vs TS, MVC vs Component, $scope vs DI
├── Digest Cycle?                → dirty checking, $watch, $apply, max 10 loops
├── $scope inheritance?          → prototypal, primitive vs object gotcha
├── Directive vs Component?      → component = simplified directive (1.5+)
├── Service vs Factory?          → new vs return, both singleton
├── Provider khi nào dùng?       → cần config trước app start

BINDING:
├── One-way vs Two-way?          → {{ }}/ng-bind vs ng-model
├── @, =, &, < trong directive?  → string, two-way, expression, one-way
├── ng-if vs ng-show?            → remove DOM vs CSS display
├── One-time binding (::)?       → bind once, remove watcher

ADVANCED:
├── $apply vs $digest?           → root vs current scope
├── $emit vs $broadcast?         → up vs down the scope tree
├── Interceptors?                → middleware for $http requests
├── Resolve trong route?         → pre-fetch data before controller loads
├── track by trong ng-repeat?    → performance, avoid DOM recreation

PERFORMANCE:
├── Quá nhiều watchers?          → ::binding, track by, ng-if, debounce
├── $watchCollection vs $watch deep? → array changes vs deep compare
├── ng-model-options debounce?   → { debounce: 300 }
├── $applyAsync?                 → batch HTTP digests
```

---

**Quay lại:** [← Frontend README](./README.md)
