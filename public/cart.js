// JavaScript-код для получения информации о товаре по его id
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

fetch(`/product/${productId}`)
.then(response => response.json())
.then(product => {
    const productDetails = document.getElementById('product-details');
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
        <img src="${product.изображение}" alt="${product.название}" width=400 height=450>
        <h3>${product.название}</h3>
        <p>${product.описание}</p>
        <p>Цена: ${product.цена} руб.</p>
        <p>Категория: ${product.категория}</p>
        <p>Производитель: ${product.производитель}</p>
    `;
    productDetails.appendChild(productCard);
})
.catch(error => console.error('Ошибка загрузки данных:', error));

// JavaScript-код для отправки запроса на сервер для добавления товара в корзину
document.getElementById('add-to-cart-btn').addEventListener('click', function() {
    fetch(`/add-to-cart/${productId}`, { method: 'POST' })
    .then(response => {
        if (response.ok) {
            alert('Товар успешно добавлен в корзину');
            window.location.href = `/basket.html`; // Переход на страницу basket.html с ID товара в URL
        } else {
            throw new Error('Ошибка при добавлении товара в корзину');
        }
    })
    .catch(error => console.error('Ошибка добавления товара в корзину:', error));
});