let coinCount = 0
let coinsPerClick = 1
let upgradeCost = 100
let upgrades = [100, 200, 400, 700, 1000]
let upgradeIndex = 0
let clicks = 0
let spentBalance = 0
const validPromoCodes = ['bonus', 'Dogcoin']
let usedPromoCodes = new Set()
let tasksCompleted = [false, false, false, false, false, false]

function clickCoin() {
	coinCount += coinsPerClick
	clicks++
	document.getElementById('coinCount').innerText = coinCount
	document.getElementById('clickCount').innerText = clicks
}

function upgrade() {
	if (coinCount >= upgradeCost && upgradeIndex < upgrades.length) {
		coinCount -= upgradeCost
		spentBalance += upgradeCost
		coinsPerClick += 2
		upgradeIndex++
		upgradeCost = upgrades[upgradeIndex] || 'Максимум улучшений'

		document.getElementById('coinCount').innerText = coinCount
		document.getElementById('upgradeBtn').innerText =
			upgradeIndex < upgrades.length
				? `Улучшение: ${upgradeCost} монет`
				: 'Улучшено до максимума'
		document.getElementById('upgradeBtn').disabled =
			upgradeIndex >= upgrades.length
		document.getElementById('spentBalance').innerText = spentBalance

		showUpgradeMessage()
		unlockTasks()
	}
}

function showUpgradeMessage() {
	const messageElement = document.getElementById('upgradeMessage')
	messageElement.innerText = 'Поздравляю, вы улучшили Dogcoin!'
	messageElement.style.opacity = 1

	setTimeout(() => {
		messageElement.style.opacity = 0
	}, 2000)
}

function applyPromo() {
	const promoCode = document.getElementById('promoCode').value.trim()
	if (validPromoCodes.includes(promoCode) && !usedPromoCodes.has(promoCode)) {
		coinCount += 200
		usedPromoCodes.add(promoCode)
		document.getElementById('coinCount').innerText = coinCount
		alert('Промокод применен! Вы получили 200 монет.')
	} else if (usedPromoCodes.has(promoCode)) {
		alert('Этот промокод уже был использован.')
	} else {
		alert('Неверный промокод.')
	}
}

function showTab(tabName) {
	document
		.querySelectorAll('.content-tab')
		.forEach(tab => tab.classList.add('hidden'))
	document.getElementById(tabName).classList.remove('hidden')
}

function completeTask(taskId) {
	if (taskId === 1 && !tasksCompleted[0]) {
		window.open('https://t.me/HomsvelIT', '_blank') // Вставьте ссылку на ваш телеграмм канал
		tasksCompleted[0] = true
		coinCount += 250
		document.getElementById('coinCount').innerText = coinCount
		alert('Вы получили 250 монет за подписку!')
	} else if (
		taskId > 1 &&
		taskId <= 6 &&
		!tasksCompleted[taskId - 1] &&
		upgradeIndex >= 2
	) {
		tasksCompleted[taskId - 1] = true
		coinCount += 100 // Добавьте награду за каждое задание
		document.getElementById('coinCount').innerText = coinCount
		alert(`Вы выполнили задание ${taskId} и получили 100 монет!`)
	}
}

function unlockTasks() {
	if (upgradeIndex >= 2) {
		// Разблокировка после улучшения на 400
		document.querySelectorAll('.task.locked').forEach(task => {
			task.classList.remove('locked')
			task.onclick = function () {
				completeTask(parseInt(task.innerText.match(/\d+/)[0]))
			}
		})
	}
}


const bombCells = 24;  // Количество ячеек
const bombCount = 3;   // Количество бомб
let currentBet = 0;    // Текущая ставка
let bombs = [];        // Позиции бомб
let selectedCells = []; // Выбранные безопасные клетки
let gameActive = false;
let multiplier = 1; // Изначальный коэффициент

function startBombGame() {
    // Проверяем, достаточно ли монет для ставки
    currentBet = parseInt(document.getElementById('betAmount').value);
    if (coinCount < currentBet || currentBet <= 0) {
        alert('Недостаточно монет для ставки!');
        return;
    }
    
    // Обнуляем предыдущие значения
    resetGame();
    gameActive = true;
    coinCount -= currentBet; // Снимаем монеты за ставку
    document.getElementById('coinCount').innerText = coinCount;
    
    // Генерируем случайные бомбы
    bombs = generateBombs();
    document.getElementById('cashOutBtn').disabled = false;
    document.getElementById('resetGameBtn').disabled = false;
    
    document.getElementById('gameStatus').innerText = 'Выберите клетку.';
    createBombGrid();
}

function generateBombs() {
    const bombPositions = new Set();
    while (bombPositions.size < bombCount) {
        const bombPosition = Math.floor(Math.random() * bombCells);
        bombPositions.add(bombPosition);
    }
    return Array.from(bombPositions);
}

function createBombGrid() {
    const grid = document.getElementById('bombGrid');
    grid.innerHTML = ''; // Очищаем перед каждой новой игрой
    for (let i = 0; i < bombCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.onclick = () => handleCellClick(i, cell);
        grid.appendChild(cell);
    }
}

function handleCellClick(index, cell) {
    if (!gameActive || cell.classList.contains('disabled')) return;
    
    if (bombs.includes(index)) {
        // Если игрок попал на бомбу
        cell.classList.add('bomb');
        gameOver(false);
    } else {
        // Если игрок попал на безопасную клетку
        cell.classList.add('safe');
        selectedCells.push(index);
        multiplier *= 1.55; // Увеличиваем коэффициент
        cell.classList.add('disabled');
        
        // Проверяем, выиграл ли игрок все безопасные клетки
        if (selectedCells.length === bombCells - bombCount) {
            gameOver(true);
        } else {
            document.getElementById('gameStatus').innerText = `Коэффициент: ${multiplier.toFixed(2)}`;
        }
    }
}

function gameOver(win) {
    gameActive = false;
    document.querySelectorAll('.cell').forEach((cell, index) => {
        if (bombs.includes(index)) {
            cell.classList.add('bomb');
        }
        cell.classList.add('disabled');
    });
    
    if (win) {
        document.getElementById('gameStatus').innerText = `Поздравляем, вы выиграли! Коэффициент: ${multiplier.toFixed(2)}`;
        cashOut();
    } else {
        document.getElementById('gameStatus').innerText = 'Вы проиграли! Ваша ставка сгорела.';
        spentBalance += currentBet;
        document.getElementById('spentBalance').innerText = spentBalance;
        document.getElementById('cashOutBtn').disabled = true;
    }
}

function cashOut() {
    const winnings = Math.floor(currentBet * multiplier);
    coinCount += winnings;
    document.getElementById('coinCount').innerText = coinCount;
    resetGame();
}

function resetGame() {
    gameActive = false;
    bombs = [];
    selectedCells = [];
    multiplier = 1;
    document.getElementById('gameStatus').innerText = '';
    document.getElementById('cashOutBtn').disabled = true;
    document.getElementById('resetGameBtn').disabled = true;
    createBombGrid();
}


