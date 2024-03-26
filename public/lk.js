document.addEventListener("DOMContentLoaded", function() {
    const loggedInUserEmail = localStorage.getItem("loggedInUserEmail");
    if (loggedInUserEmail) {
        fetchUserData(loggedInUserEmail);
    }

    const updateButton = document.getElementById("update-info-btn");
    if (updateButton) {
        updateButton.addEventListener("click", function(event) {
            event.preventDefault(); // Предотвращаем стандартное поведение кнопки

            const email = localStorage.getItem("loggedInUserEmail");
            if (email) {
                fetchUserData(email);
            } else {
                console.error("Ошибка: Email пользователя не найден в локальном хранилище");
            }
        });
    }
});

function fetchUserData(email) {
    console.log("Отправка запроса на получение данных пользователя для email:", email);
    fetch("/userData/" + email)
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка сервера");
            }
            return response.json();
        })
        .then(data => {
            console.log("Получены данные пользователя:", data);
            fillUserData(data.userData);
        })
        .catch(error => {
            console.error("Произошла ошибка:", error.message);
        });
}

function fillUserData(userData) {
    document.getElementById("email").value = userData.email || "";
    document.getElementById("first_name").value = userData.имя || "";
    document.getElementById("last_name").value = userData.фамилия || "";
    document.getElementById("address").value = userData.адрес || "";
    document.getElementById("phone_number").value = userData.телефон || "";
    const dateOfBirth = new Date(userData.дата_рождения);
    const formattedDate = dateOfBirth.toISOString().split('T')[0];
    document.getElementById("date_of_birth").value = formattedDate || "";
    // document.getElementById("date_of_birth").value = userData.дата_рождения || "";
    document.getElementById("sex").value = userData.пол || "";
}

// Добавляем обработчик события для формы редактирования информации о пользователе
document.getElementById("user-profile-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение формы

    const formData = new FormData(this);
    const userData = {};
    for (const [key, value] of formData.entries()) {
        userData[key] = value;
    }

    // Отправляем запрос на обновление данных о пользователе
    fetch("/updateProfile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Ошибка сервера");
        }
        return response.json();
    })
    .then(data => {
        console.log("Данные пользователя успешно обновлены:", data);
        alert("Данные успешно обновлены");
        // Дополнительные действия после успешного обновления данных
    })
    .catch(error => {
        console.error("Произошла ошибка:", error.message);
        alert("Произошла ошибка при обновлении данных");
    });
});

// Функция для загрузки и отображения всех сделанных пользователем заказов
function loadUserOrders() {
    fetch('/user-orders')
    .then(response => response.json())
    .then(orders => {
        const ordersList = document.getElementById('orders-list');

        // Очищаем список заказов перед добавлением новых
        ordersList.innerHTML = '';

        // Перебираем полученные заказы и добавляем их в список
        orders.forEach(order => {
            const orderItem = document.createElement('li');
            orderItem.innerHTML = `
                <strong>Название товара:</strong> ${order.название}<br>
                <strong>Цена:</strong> ${order.цена} руб.<br>
                <strong></strong> <img src="${order.изображение}" alt="${order.название}" width="100"><br>
                <strong>Идентификатор заказа:</strong> ${order.orderId}<br><br>
            `;
            ordersList.appendChild(orderItem);
        });
    })
    .catch(error => console.error('Ошибка загрузки данных о заказах:', error));
}

// Вызываем функцию загрузки заказов при загрузке страницы
window.onload = loadUserOrders;


