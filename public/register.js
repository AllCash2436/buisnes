// Функция для отправки данных на сервер при регистрации
document.getElementById("register-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Предотвращаем отправку формы по умолчанию

    // Получаем значения из полей формы
    const firstName = document.getElementById("first_name").value;
    const lastName = document.getElementById("last_name").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phone_number").value;
    const address = document.getElementById("address").value;
    const sex = document.getElementById("sex").value;
    const password = document.getElementById("password").value;
    const dateOfBirth = document.getElementById("date_of_birth").value;
    
    // Отправляем данные на сервер
    fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ firstName, lastName, email, phoneNumber, address, sex, password, dateOfBirth })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Ошибка сервера");
        }
        return response.json();
    })
    .then(data => {
        console.log("Успешная регистрация:", data);
        // После успешной регистрации можно выполнить дополнительные действия, например, перенаправить пользователя на страницу личного кабинета
        window.location.href = "/lk.html"; // Перенаправляем пользователя на страницу личного кабинета
    })
    .catch(error => {
        console.error("Ошибка регистрации:", error.message);
        document.getElementById("error-message").textContent = "Ошибка регистрации. Пожалуйста, попробуйте еще раз.";
    });
});
