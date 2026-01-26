const inputNum = document.querySelector('.inputNum');
const textInput = document.querySelector('.textInput');
const textOutputTemp = document.querySelector('.textOutputTemp');
const textOutputResult = document.querySelector('.textOutputResult');
const charCountElement = document.getElementById('charCount');

// --- Функция для обновления счетчика символов ---
const updateCharCount = () => {
    const text = textInput.value;
    // Считаем все символы, включая пробелы
    const count = text.length;
    charCountElement.textContent = count.toLocaleString(); // Форматирование с разделителями тысяч
    
    // Динамическое изменение цвета в зависимости от количества
    if (count === 0) {
        charCountElement.style.color = '#999';
    } else if (count < 1000) {
        charCountElement.style.color = '#4CAF50'; // Зеленый
    } else if (count < 5000) {
        charCountElement.style.color = '#FF9800'; // Оранжевый
    } else {
        charCountElement.style.color = '#F44336'; // Красный
    }
};

// --- Функция для автоматической подстройки высоты textarea ---
const autoResize = () => {
    textInput.style.height = 'auto';
    textInput.style.height = textInput.scrollHeight + 'px';

    textOutputTemp.style.height = 'auto';
    textOutputTemp.style.height = textOutputTemp.scrollHeight + 'px';
};

// --- Функция для разбивки текста на части с учётом новых правил ---
const splitTextIntoChunks = (text, chunkSize = 200) => {
    const chunks = [];
  
    // Разбиваем текст на предложения
    const sentences = text.match(/[^.!?]*[.!?]+/g) || [text];
  
    sentences.forEach(sentence => {
        sentence = sentence.trim();
        if (!sentence) return;
  
        // ✅ Если предложение короче 150 символов → не делим
        if (sentence.length < 150) {
            chunks.push(addDotIfNeeded(sentence));
            return;
        }
  
        // ✅ Если предложение длиннее или равно 150 символам → пытаемся разбить
        const words = sentence.split(" ");
        let part = "";
  
        for (const [index, word] of words.entries()) {
            const testPart = part ? `${part} ${word}` : word;
  
            // --- 🔍 Проверяем длину начала и остатка ---
            const remainingWords = words.slice(index + 1);
            const remainingText = remainingWords.join(" ");
  
            // ✅ Если и начало >= 50, и остаток >= 50 → можно добавить слово
            if (
                testPart.length <= chunkSize &&
                testPart.length >= 50 &&
                remainingText.length >= 50
            ) {
                part = testPart;
            } else {
                // ❌ Иначе — проверяем, какая часть < 50
                if (part && part.length >= 50 && remainingText.length >= 50) {
                    // Обе части >= 50 → сохраняем part и начинаем новую
                    chunks.push(addDotIfNeeded(part));
                    part = word;
                } else {
                    // ❌ Одна из частей < 50 → разбиваем всё предложение пополам
                    const mid = Math.ceil(words.length / 2);
                    const firstHalf = words.slice(0, mid).join(" ");
                    const secondHalf = words.slice(mid).join(" ");
  
                    chunks.push(addDotIfNeeded(firstHalf));
                    chunks.push(addDotIfNeeded(secondHalf));
                    return; // Завершаем обработку этого предложения
                }
            }
        }
  
        // Добавляем последнюю часть
        if (part) {
            chunks.push(addDotIfNeeded(part));
        }
    });
  
    return chunks;
};

// --- Вспомогательная функция для добавления точки ---
const addDotIfNeeded = (sentence) => {
    const trimmed = sentence.trim();
    if (!trimmed) return trimmed;
  
    const lastChar = trimmed.slice(-1);
    if ([".", "!", "?"].includes(lastChar)) {
        return trimmed;
    } else {
        return trimmed + ".";
    }
};

// --- Функция для разбивки текста на блоки по заданному размеру ---
const splitIntoBlocks = (text, maxSize) => {
    textOutputResult.innerHTML = '';

    // Разбиваем текст на предложения по знакам препинания
    const sentences = text.match(/[^.!?]*[.!?]+/g) || [text];

    const blocks = [];
    let currentBlock = '';

    sentences.forEach(sentence => {
        sentence = sentence.trim();
        if (!sentence) return;

        const testBlock = currentBlock ? `${currentBlock} ${sentence}` : sentence;

        if (testBlock.length <= maxSize) {
            currentBlock = testBlock;
        } else {
            if (currentBlock) {
                blocks.push(addDotIfNeeded(currentBlock));
            }
            currentBlock = sentence;
        }
    });

    if (currentBlock) {
        blocks.push(addDotIfNeeded(currentBlock));
    }

    // --- Рендерим блоки ---
    blocks.forEach((block, i) => {
        const count = document.createElement('div');
        count.className = 'Count';
        count.innerHTML = `${i + 1}<br><br>`;
        textOutputResult.appendChild(count);

        const div = document.createElement('div');
        div.className = 'OuterText';
        div.textContent = block;
        div.innerHTML += '<br><br><br>';
        textOutputResult.appendChild(div);

        // Обработчик клика
        div.addEventListener('click', () => {
            div.style.color = 'blue';
            navigator.clipboard.writeText(div.textContent.trim());
            
            // Возвращаем цвет через 1 секунду
            setTimeout(() => {
                div.style.color = '';
            }, 1000);
        });
    });
};

// --- Обработчик ввода в первую textarea ---
const handleTextInput = () => {
    updateCharCount(); // Обновляем счетчик символов
    
    const text = textInput.value.trim();
    if (!text) {
        textOutputTemp.value = '';
        textOutputResult.innerHTML = '';
        return;
    }

    const chunks = splitTextIntoChunks(text, 200);
    textOutputTemp.value = chunks.join('\n\n');
    autoResize();

    // Автоматически вызываем разбивку по inputNum, если он заполнен
    const num = parseInt(inputNum.value);
    if (num) {
        splitIntoBlocks(textOutputTemp.value, num);
    }
};

// --- Обработчик изменения inputNum и второй textarea ---
const handleInputNumOrTextOutputTemp = () => {
    const num = parseInt(inputNum.value);
    const text = textOutputTemp.value.trim();

    if (num && text) {
        splitIntoBlocks(text, num);
    } else {
        textOutputResult.innerHTML = '';
    }
};

// --- Слушатели событий ---
textInput.addEventListener('input', handleTextInput);
textOutputTemp.addEventListener('input', handleInputNumOrTextOutputTemp);
inputNum.addEventListener('input', handleInputNumOrTextOutputTemp);

// --- Инициализация ---
autoResize();
updateCharCount(); // Инициализируем счетчик при загрузке