# Forms

Angular có hai cách làm form: **Template-driven** (gắn với template, đơn giản) và **Reactive Forms** (logic trong class, dễ test và validate phức tạp). Ứng dụng lớn thường dùng Reactive Forms.

## Mục lục
1. [Template-driven forms](#template-driven-forms)
2. [Reactive Forms](#reactive-forms)
3. [Validation](#validation)
4. [FormArray và form động](#formarray-và-form-động)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

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

- **ControlValueAccessor**: Interface để tạo **custom form control** tích hợp với Reactive Forms (ví dụ date picker, tag input). Implement `writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState` và đăng ký với `NG_VALUE_ACCESSOR` (multi: true). Khi đó có thể dùng `formControlName` trên component của bạn.
- **Async validator**: Trả về `Observable<ValidationErrors | null>`; dùng cho kiểm tra trùng username, validate API. Tránh gọi API quá dày (debounce trong form hoặc template).
- **FormArray với FormGroup**: Danh sách object (ví dụ nhiều địa chỉ): `this.fb.array([this.fb.group({ street: [''], city: [''] })])`; template dùng `formGroupName` với index.

---

→ Tiếp theo: [08 - HTTP Client](08-http-client.md)
