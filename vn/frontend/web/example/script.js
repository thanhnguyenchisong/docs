// Minh họa DOM / Event — tài liệu web
document.querySelector('form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('name')?.value;
  const email = document.getElementById('email')?.value;
  if (name && email) {
    alert('Đã gửi (demo): ' + name + ', ' + email);
  }
});

// Focus visible cho accessibility
document.querySelectorAll('a, button, input').forEach(function (el) {
  el.addEventListener('focus', function () {
    this.classList.add('focus-visible');
  });
  el.addEventListener('blur', function () {
    this.classList.remove('focus-visible');
  });
});
