const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const порт = 3001;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'Dima',
    password: 'password',
    database: 'stolman',
    port: 3306
});



connection.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных: ' + err.stack);
        return;
    }
    console.log('Подключено к базе данных');
});

// Добавляем middleware для обработки JSON
app.use(express.json());

app.use(session({
    secret: 'pass', // Секретный ключ для подписи куки сессии
    resave: false,
    saveUninitialized: true
}));

// Парсинг application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Парсинг application/json
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

app.use(express.static('D:/Учёба/8 семестр/Что за бизнес/stolman/public'));


// Маршрут для получения всех товаров
app.get('/products', (req, res) => {
    connection.query('SELECT * FROM товары', (err, results) => {
        if (err) {
            console.error('Ошибка выполнения запроса к базе данных:', err);
            res.status(500).send('Ошибка сервера');
            return;
        }
        // Добавляем поле изображение к каждому товару
        const productsWithImage = results.map(product => {
            return {
                id: product.id,
                название: product.название,
                описание: product.описание,
                цена: product.цена,
                изображение: product.изображение // включаем путь к изображению в ответе
            };
        });
        res.json(productsWithImage);
    });
});

  // Маршрут для фильтрации товаров по категории
  app.get('/products/category/:category', (req, res) => {
    const category = req.params.category;
    connection.query('SELECT * FROM товары WHERE категория = ?', [category], (err, results) => {
      if (err) {
        console.error('Ошибка выполнения запроса к базе данных:', err);
        res.status(500).send('Ошибка сервера');
        return;
      }
      res.json(results);
    });
  });
  
  // Маршрут для сортировки товаров по цене (по возрастанию)
  app.get('/products/sort/asc', (req, res) => {
    connection.query('SELECT * FROM товары ORDER BY цена ASC', (err, results) => {
      if (err) {
        console.error('Ошибка выполнения запроса к базе данных:', err);
        res.status(500).send('Ошибка сервера');
        return;
      }
      res.json(results);
    });
  });
  
  // Маршрут для сортировки товаров по цене (по убыванию)
  app.get('/products/sort/desc', (req, res) => {
    connection.query('SELECT * FROM товары ORDER BY цена DESC', (err, results) => {
      if (err) {
        console.error('Ошибка выполнения запроса к базе данных:', err);
        res.status(500).send('Ошибка сервера');
        return;
      }
      res.json(results);
    });
  });

  app.get('/product/:id', (req, res) => {
    const productId = req.params.id;
    connection.query('SELECT * FROM товары WHERE id = ?', [productId], (err, results) => {
        if (err) {
            console.error('Ошибка выполнения запроса к базе данных:', err);
            res.status(500).send('Ошибка сервера');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Товар не найден');
            return;
        }
        const product = results[0];
        res.json({ 
            id: product.id,
            название: product.название,
            описание: product.описание,
            цена: product.цена,
            категория: product.категория,
            производитель: product.производитель,
            изображение: product.изображение // включаем путь к изображению в ответе
        });
    });
});

 // Маршрут для добавления товара в корзину и создания заказа
app.post('/add-to-cart/:id', (req, res) => {
    const productId = req.params.id;
    const userId = req.session.userId; // Получаем ID текущего пользователя из сессии

    // Проверяем, аутентифицирован ли пользователь
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Пользователь не аутентифицирован' });
    }

    // Создаем новый заказ и добавляем товар в таблицу "Товары_в_заказе"
    const insertOrderQuery = 'INSERT INTO Заказы (id_пользователя, дата, статус, общая_стоимость) VALUES (?, NOW(), ?, ?)';
    const insertOrderItemQuery = 'INSERT INTO Товары_в_заказе (id_заказа, id_товара) VALUES (?, ?)';

    // Здесь должна быть логика для расчета общей стоимости и количества товаров
    const totalPrice = req.body.price;
    const quantity = 1;

    connection.beginTransaction((err) => {
        if (err) {
            console.error('Ошибка транзакции:', err);
            return res.status(500).json({ success: false, error: 'Ошибка сервера' });
        }

        connection.query(insertOrderQuery, [userId, 'Оформлен', totalPrice], (error, results) => {
            if (error) {
                console.error('Ошибка при создании заказа:', error);
                return connection.rollback(() => {
                    res.status(500).json({ success: false, error: 'Ошибка сервера' });
                });
            }

            const orderId = results.insertId; // ID созданного заказа

            connection.query(insertOrderItemQuery, [orderId, productId, quantity], (error, results) => {
                if (error) {
                    console.error('Ошибка при добавлении товара в заказ:', error);
                    return connection.rollback(() => {
                        res.status(500).json({ success: false, error: 'Ошибка сервера' });
                    });
                }

                connection.commit((err) => {
                    if (err) {
                        console.error('Ошибка при фиксации транзакции:', err);
                        return connection.rollback(() => {
                            res.status(500).json({ success: false, error: 'Ошибка сервера' });
                        });
                    }

                    console.log('Товар успешно добавлен в корзину');
                    res.json({ success: true, message: 'Товар успешно добавлен в корзину' });
                });
            });
        });
    });
});



// Маршрут для получения товаров в корзине
app.get('/basket', (req, res) => {
    const userId = req.session.userId; // Получаем ID текущего пользователя из сессии

    // Проверяем, аутентифицирован ли пользователь
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Пользователь не аутентифицирован' });
    }
    console.log('UserID:', userId);
    // Запрос для извлечения информации о товарах в корзине текущего пользователя
    const basketQuery = `
    SELECT 
        товары.id, 
        товары.название, 
        товары.цена, 
        товары.изображение, 
        товары_в_заказе.количество,
        товары_в_заказе.id_заказа AS orderId
    FROM 
        товары 
    INNER JOIN 
        товары_в_заказе 
    ON 
        товары.id = товары_в_заказе.id_товара 
    INNER JOIN 
        заказы 
    ON 
        товары_в_заказе.id_заказа = заказы.id 
    WHERE 
        заказы.id_пользователя = ?`;

    connection.query(basketQuery, [userId], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса к базе данных:', err);
            return res.status(500).json({ success: false, error: 'Ошибка сервера' });
        }

        // Отправляем список товаров в корзине текущего пользователя на клиент
        res.json(results);
    });
});

// Маршрут для удаления товара из корзины
app.delete('/remove-from-cart/:orderId/:productId', (req, res) => {
    const orderId = req.params.orderId;
    const productId = req.params.productId;
    const userId = req.session.userId; // Получаем ID текущего пользователя из сессии

    // Проверяем, аутентифицирован ли пользователь
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Пользователь не аутентифицирован' });
    }

    // Удаляем товар из таблицы "Товары_в_заказе" на основе ID заказа и ID товара
    const removeFromCartQuery = 'DELETE FROM Товары_в_заказе WHERE id_заказа = ? AND id_товара = ?';
    connection.query(removeFromCartQuery, [orderId, productId], (error, results) => {
        if (error) {
            console.error('Ошибка при удалении товара из корзины:', error);
            return res.status(500).json({ success: false, error: 'Ошибка сервера' });
        }

        // Проверяем, была ли удалена хотя бы одна запись
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Товар не найден в корзине' });
        }

        console.log('Товар успешно удален из корзины');
        res.json({ success: true, message: 'Товар успешно удален из корзины' });
    });
});

// Маршрут для обновления статуса заказа
app.put('/update-order-status/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    
    // Обновляем статус заказа в базе данных на "удаленный"
    const updateOrderStatusQuery = 'UPDATE заказы SET статус = "удаленный" WHERE id = ?';
    connection.query(updateOrderStatusQuery, [orderId], (error, results) => {
        if (error) {
            console.error('Ошибка при обновлении статуса заказа:', error);
            return res.status(500).json({ success: false, error: 'Ошибка сервера' });
        }
        
        console.log('Статус заказа успешно обновлен на "удаленный"');
        res.json({ success: true, message: 'Статус заказа успешно обновлен на "удаленный"' });
    });
});

// Добавляем маршрут для оформления заказа
app.put('/place-order', (req, res) => {
    // Получаем ID заказа из тела запроса
    const orderId = req.body.orderId;
    console.log('orderId:', orderId);
    // Обновляем статус заказа в базе данных на "оформлен"
    const updateOrderStatusQuery = 'UPDATE заказы SET статус = "оформлен" WHERE id = ?';
    connection.query(updateOrderStatusQuery, [orderId], (error, results) => {
        if (error) {
            console.error('Ошибка при оформлении заказа:', error);
            return res.status(500).json({ success: false, error: 'Ошибка сервера' });
        }

        console.log('Заказ успешно оформлен');
        res.json({ success: true, message: 'Заказ успешно оформлен' });
    });
});




// Маршрут для регистрации нового пользователя
app.post('/register', (req, res) => {
    const { firstName, lastName, email, phoneNumber, address, sex, password, dateOfBirth } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !address || !sex || !password || !dateOfBirth) {
        console.error('Некорректные данные пользователя');
        return res.status(400).json({ success: false, error: 'Некорректные данные пользователя' });
    }

    const checkUserQuery = 'SELECT COUNT(*) AS count FROM пользователи WHERE email = ?';
    connection.query(checkUserQuery, [email], (error, results) => {
        if (error) {
            console.error('Ошибка при выполнении запроса к базе данных: ' + error.message);
            return res.status(500).json({ success: false, error: 'Ошибка при выполнении запроса к базе данных' });
        }

        if (results[0].count > 0) {
            console.error('Пользователь с таким email уже зарегистрирован');
            return res.status(409).json({ success: false, error: 'Пользователь с таким email уже зарегистрирован' });
        }

        const registerUserQuery = 'INSERT INTO пользователи (имя, фамилия, email, телефон, адрес, пол, пароль, дата_рождения) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(registerUserQuery, [firstName, lastName, email, phoneNumber, address, sex, password, dateOfBirth], (error, results) => {
            if (error) {
                console.error('Ошибка при выполнении запроса к базе данных: ' + error.message);
                return res.status(500).json({ success: false, error: 'Ошибка при выполнении запроса к базе данных' });
            }
            console.log('Пользователь успешно зарегистрирован.');
            return res.json({ success: true });
        });
    });
});

// Маршрут для получения информации о пользователе
app.get('/user/:id', (req, res) => {
    const userId = req.params.id;

    // Выполнить запрос к базе данных для получения информации о пользователе по его ID
    const getUserQuery = 'SELECT * FROM пользователи WHERE id = ?';
    connection.query(getUserQuery, [userId], (error, results) => {
        if (error) {
            console.error('Ошибка при выполнении запроса к базе данных: ' + error.message);
            return res.status(500).json({ success: false, error: 'Ошибка при выполнении запроса к базе данных' });
        }

        if (results.length === 0) {
            console.error('Пользователь не найден');
            return res.status(404).json({ success: false, error: 'Пользователь не найден' });
        }

        const user = results[0];
        // Отправить информацию о пользователе клиенту
        return res.json({ success: true, user });
    });
});

// Маршрут для аутентификации (логина) пользователя
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.error('Некорректные данные пользователя');
        return res.status(400).json({ success: false, error: 'Некорректные данные пользователя' });
    }

    const checkUserQuery = 'SELECT id FROM пользователи WHERE email = ? AND пароль = ?';
    connection.query(checkUserQuery, [email, password], (error, results) => {
        if (error) {
            console.error('Ошибка при выполнении запроса к базе данных: ' + error.message);
            return res.status(500).json({ success: false, error: 'Ошибка при выполнении запроса к базе данных' });
        }

        if (results.length === 0) {
            console.log('Пользователь не найден или неверный пароль');
            // Пользователь не найден, предлагаем зарегистрироваться
            return res.status(401).json({ success: false, error: 'Пользователь не найден или неверный пароль. Пожалуйста, зарегистрируйтесь.' });
        }

        // Пользователь успешно аутентифицирован, сохраняем его идентификатор в сессии
        const userId = results[0].id;
        req.session.userId = userId;

        console.log('Пользователь успешно авторизован.');
        return res.json({ success: true });
    });
});


// Маршрут для получения данных о пользователе из базы данных
app.get('/userData/:email', (req, res) => {
    const email = req.params.email;
    const getUserDataQuery = 'SELECT * FROM пользователи WHERE email = ?';
    connection.query(getUserDataQuery, [email], (error, results) => {
        if (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            return res.status(500).json({ success: false, error: 'Ошибка при выполнении запроса к базе данных' });
        }
        if (results.length === 0) {
            console.error('Пользователь с адресом электронной почты не найден');
            return res.status(404).json({ success: false, error: 'Пользователь не найден' });
        }
        const userData = results[0];
        console.log('Полученные данные пользователя:', userData);
        return res.json({ success: true, userData });
    });
});

// Маршрут для обновления информации о пользователе
app.post('/updateProfile', (req, res) => {
    const userData = req.body;
    
    const updateUserQuery = 'UPDATE пользователи SET имя=?, фамилия=?, адрес=?, телефон=?, дата_рождения=?, пол=? WHERE email=?';
    const values = [userData.first_name, userData.last_name, userData.address, userData.phone_number, userData.date_of_birth, userData.sex, userData.email];

    connection.query(updateUserQuery, values, (error, results) => {
        if (error) {
            console.error('Ошибка при обновлении информации о пользователе:', error);
            return res.status(500).json({ success: false, error: 'Ошибка при обновлении информации о пользователе' });
        }

        console.log('Информация о пользователе успешно обновлена');
        res.json({ success: true });
    });
});

// Маршрут для получения всех заказов пользователя со статусом "оформленный"
app.get('/user-orders', (req, res) => {
    const userId = req.session.userId; // Получаем ID текущего пользователя из сессии

    // Проверяем, аутентифицирован ли пользователь
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Пользователь не аутентифицирован' });
    }

    // Запрос для извлечения всех заказов пользователя со статусом "оформленный"
    const userOrdersQuery = `
        SELECT 
            товары.название, 
            товары.цена, 
            товары.изображение, 
            заказы.id AS orderId
        FROM 
            товары 
        INNER JOIN 
            товары_в_заказе 
        ON 
            товары.id = товары_в_заказе.id_товара 
        INNER JOIN 
            заказы 
        ON 
            товары_в_заказе.id_заказа = заказы.id 
        WHERE 
            заказы.id_пользователя = ? AND заказы.статус = 'Оформлен'`;

    connection.query(userOrdersQuery, [userId], (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса к базе данных:', err);
            return res.status(500).json({ success: false, error: 'Ошибка сервера' });
        }

        // Отправляем список заказов пользователя на клиент
        res.json(results);
    });
});


app.listen(порт, () => {
    console.log('Server started on http://localhost:3001');
});
