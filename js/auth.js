
  document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const rol = document.getElementById("role").value;

    if (!nombre || !password) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const usuario = { nombre, password, rol };
    localStorage.setItem("usuario", JSON.stringify(usuario));
    window.location.href = "dashboard.html";
  });
