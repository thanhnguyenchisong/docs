# Forms

Angular có hai cách làm form: **Template-driven** (gắn với template, đơn giản) và **Reactive Forms** (logic trong class, dễ test và validate phức tạp). Ứng dụng lớn thường dùng Reactive Forms.

## Mục lục
1. [Form trong Angular là gì? (Cho người mới)](#form-trong-angular-là-gì-cho-người-mới)
2. [Ví dụ trực quan: Form đăng nhập và validation](#ví-dụ-trực-quan-form-đăng-nhập-và-validation)
3. [Template-driven forms](#template-driven-forms)
4. [Reactive Forms](#reactive-forms)
5. [Validation](#validation)
6. [FormArray và form động](#formarray-và-form-động)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Form trong Angular là gì? (Cho người mới)

- **Form** = thu thập và kiểm tra dữ liệu từ user (đăng nhập, đăng ký, tạo sản phẩm…). Angular cung cấp **FormsModule** (template-driven) và **ReactiveFormsModule** (reactive forms) để gắn input với model, **validation** (bắt buộc, email, độ dài…), và xử lý submit.
- **Template-driven:** Form được “kéo” từ template: dùng `ngModel`, `name`, `#form="ngForm"`. Đơn giản cho form nhỏ; logic validation nằm trong template (required, minlength…).
- **Reactive Forms:** Form được **tạo trong class** (FormGroup, FormControl), template chỉ bind qua `[formGroup]` và `formControlName`. Dễ test, dễ validate phức tạp (custom validator, form động, FormArray). Ứng dụng lớn thường chọn Reactive Forms.

---

## Ví dụ trực quan: Form đăng nhập và validation

Tạo component `ng g c login`. Import `ReactiveFormsModule`, trong class tạo form:

```typescript
form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
});
constructor(private fb: FormBuilder) {}
```

Template: `<form [formGroup]="form" (ngSubmit)="onSubmit()">` (trong class `onSubmit() { console.log(this.form.value); }`), hai input `formControlName="email"` và `formControlName="password"`, nút submit `[disabled]="form.invalid"`. **Trên màn hình:** Ô email để trống hoặc sai định dạng → nút “Đăng nhập” bị disabled. Nhập đúng email và mật khẩu ≥ 6 ký tự → nút bật, bấm submit in ra object `{ email, password }`. Thêm `<span *ngIf="form.get('email')?.invalid && form.get('email')?.touched">Email không hợp lệ</span>` — bạn sẽ thấy thông báo lỗi khi rời khỏi ô email. Đó là form + validation trực quan.

---

## Template-driven forms

Dùng `NgModel` và `#form="ngForm"`. Cần import `FormsModule`.

```html
<form #f="ngForm" (ngSubmit)="onSubmit(f)">
  <input name="email" ngModel required email />
  <input name="password" type="password" ngModel required minlength="6" />
  <button [disabled]="f.invalid">Đăng nhập</button>
</form>
```

```typescript
onSubmit(form: NgForm) {
  console.log(form.value);
}
```

- **ngModel**: Two-way binding; cần `name` để form group nhận diện.
- **#f="ngForm"**: Tham chiếu đến NgForm (valid, value, errors).

---

## Reactive Forms

Khai báo form trong class, bind vào template qua `[formGroup]`, `formControlName`. Cần import `ReactiveFormsModule`.

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class LoginComponent {
  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="email" />
  <span *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
    Email không hợp lệ
  </span>
  <input formControlName="password" type="password" />
  <button [disabled]="form.invalid">Đăng nhập</button>
</form>
```

---

## Validation

**Built-in validators**: `Validators.required`, `Validators.email`, `Validators.minLength(n)`, `Validators.maxLength(n)`, `Validators.pattern(regex)`.

**Custom validator**: Hàm nhận `AbstractControl`, trả về `ValidationErrors | null`.

```typescript
function forbiddenName(control: AbstractControl): ValidationErrors | null {
  if (control.value === 'admin') {
    return { forbiddenName: true };
  }
  return null;
}
this.form.get('username')?.addValidators(forbiddenName);
```

**Async validator** (ví dụ kiểm tra username tồn tại): Trả về `Observable<ValidationErrors | null>`.

---

## FormArray và form động

Danh sách field động (ví dụ nhiều số điện thoại):

```typescript
form = this.fb.group({
  name: [''],
  phones: this.fb.array([
    this.fb.control(''),
  ]),
});

get phones() {
  return this.form.get('phones') as FormArray;
}

addPhone() {
  this.phones.push(this.fb.control(''));
}
```

```html
<div formArrayName="phones">
  <input *ngFor="let c of phones.controls; let i = index" [formControlName]="i" />
</div>
<button type="button" (click)="addPhone()">Thêm SĐT</button>
```

---

## Câu hỏi thường gặp

**Template-driven vs Reactive?**  
Template-driven: nhanh cho form đơn giản, ít logic. Reactive: kiểm soát tốt hơn, test dễ, validation phức tạp, FormArray → phù hợp form lớn.

**Lấy lỗi hiển thị cho từng control?**  
`form.get('email')?.errors` (object) hoặc `form.get('email')?.hasError('required')`. Nên kiểm tra thêm `touched`/`dirty` để chỉ hiện lỗi sau khi user tương tác.

**FormBuilder vs new FormGroup?**  
FormBuilder chỉ là helper: `this.fb.group({...})` tương đương `new FormGroup({...})`. Dùng FormBuilder ngắn gọn hơn.

---

## Senior / Master

### Typed Forms (Angular 14+)

Từ Angular 14, Reactive Forms hỗ trợ **strict typing** — `FormGroup`, `FormControl` có generic type, TypeScript kiểm tra tên field và kiểu giá trị tại compile time.

```typescript
// ❌ Cũ (untyped) — form.value là any
const form = new FormGroup({
  name: new FormControl(''),
  age: new FormControl(0),
});
form.value; // { name: string | null; age: number | null } — nhưng trước v14 là any

// ✅ Mới (typed) — FormBuilder tự infer type
const form = this.fb.group({
  name: this.fb.nonNullable.control('', Validators.required),
  age: this.fb.nonNullable.control(0),
  email: ['', [Validators.required, Validators.email]],
});
// form.value → { name: string; age: number; email: string | null }
// form.getRawValue() → { name: string; age: number; email: string }

// Truy cập type-safe
form.controls.name.value; // string (nonNullable)
form.controls.email.value; // string | null
```

**NonNullableFormBuilder** — tất cả control mặc định `nonNullable`:

```typescript
private fb = inject(NonNullableFormBuilder);

form = this.fb.group({
  name: ['', Validators.required],
  email: ['', Validators.email],
});
// form.value → { name: string; email: string } (không có null)
// Reset về giá trị khởi tạo (không phải null)
form.reset(); // → { name: '', email: '' }
```

### ControlValueAccessor — Custom Form Control hoàn chỉnh

Tạo component mà dùng được với `formControlName`, `[(ngModel)]`, `formControl`:

```typescript
import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    @for (star of stars; track star) {
      <button
        type="button"
        [class.active]="star <= value()"
        [attr.aria-label]="star + ' sao'"
        (click)="select(star)"
        [disabled]="disabled()"
      >
        ★
      </button>
    }
  `,
  styles: [`
    button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #ccc; }
    button.active { color: #f5a623; }
    button:disabled { cursor: not-allowed; opacity: 0.5; }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StarRatingComponent),
      multi: true,
    },
  ],
})
export class StarRatingComponent implements ControlValueAccessor {
  stars = [1, 2, 3, 4, 5];
  value = signal(0);
  disabled = signal(false);

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  // Angular gọi khi form set giá trị (patchValue, setValue, reset)
  writeValue(value: number): void {
    this.value.set(value || 0);
  }

  // Angular truyền callback — gọi khi giá trị đổi
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  // Angular truyền callback — gọi khi control bị "chạm" (blur)
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Angular gọi khi form control bị disabled/enabled
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  select(star: number) {
    this.value.set(star);
    this.onChange(star);   // Thông báo form: giá trị đã đổi
    this.onTouched();      // Thông báo form: đã tương tác
  }
}
```

**Sử dụng trong form:**

```html
<form [formGroup]="reviewForm">
  <app-star-rating formControlName="rating" />
  <span *ngIf="reviewForm.get('rating')?.hasError('min')">Chọn ít nhất 1 sao</span>
</form>
```

```typescript
reviewForm = this.fb.group({
  rating: [0, [Validators.required, Validators.min(1)]],
  comment: [''],
});
```

### Async Validator với Debounce

```typescript
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, map, first } from 'rxjs';

export function uniqueUsername(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return control.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(value => userService.checkUsername(value)),
      map(exists => (exists ? { usernameTaken: true } : null)),
      first(), // Complete sau lần đầu
    );
  };
}

// Dùng
form = this.fb.group({
  username: ['', {
    validators: [Validators.required],
    asyncValidators: [uniqueUsername(inject(UserService))],
    updateOn: 'blur', // Chỉ validate khi blur (tránh gọi API liên tục)
  }],
});
```

### Cross-field Validation

```typescript
function passwordMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

form = this.fb.group({
  password: ['', [Validators.required, Validators.minLength(6)]],
  confirmPassword: ['', Validators.required],
}, { validators: [passwordMatch] }); // Validator ở cấp FormGroup
```

```html
<span *ngIf="form.hasError('passwordMismatch')">Mật khẩu không khớp</span>
```

---

→ Tiếp theo: [08 - HTTP Client](08-http-client.md)
