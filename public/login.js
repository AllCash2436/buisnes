// Функция для отправки данных на сервер при входе (логине)
document.getElementById("login-btn").addEventListener("click", function() {
    const email = document.getElementById("email").value; // Получаем значение email
    const password = document.getElementById("password").value; // Получаем значение пароля

    // Проверяем, что email и пароль не пустые
    if (email.trim() === '' || password.trim() === '') {
        document.getElementById("error-message").textContent = "Пожалуйста, заполните все поля";
        return;
    }

    // Отправляем данные на сервер для проверки
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }) // Отправляем email и пароль на сервер
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Ошибка сервера");
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log("Успешный вход:", data);
            // Сохраняем email пользователя в локальное хранилище
            localStorage.setItem("loggedInUserEmail", email);
            // Перенаправляем пользователя на страницу личного кабинета
            window.location.href = "/lk.html";
        } else {
            // Если вход неуспешный, отображаем сообщение об ошибке
            console.error("Ошибка входа:", data.error);
            document.getElementById("error-message").textContent = data.error;
    
            // Показываем кнопку "Зарегистрироваться", если пользователь не найден
            if (data.error.includes('зарегистрируйтесь')) {
                document.getElementById("register-btn").style.display = "block";
            } else {
                document.getElementById("register-btn").style.display = "none";
            }
        }
    })
    .catch(error => {
        console.error("Ошибка входа:", error.message);
        document.getElementById("error-message").textContent = "Ошибка входа. Пожалуйста, попробуйте еще раз.";
    });
});

// Перенаправление на страницу регистрации при нажатии кнопки "Зарегистрироваться"
document.getElementById("register-btn").addEventListener("click", function() {
    window.location.href = "/register.html";
});
