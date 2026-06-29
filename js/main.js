let allPosts = [];             // Полный массив постов из JSON
let filteredPosts = [];        // Отфильтрованный массив под текущую страницу
let currentPage = 1;           // Текущая страница пагинации
const POSTS_PER_PAGE = 10;     // Максимум 10 постов на одну страницу

async function initializeApp() {
  const postsContainer = document.getElementById('posts-container');
  if (!postsContainer) return; // Защита: если на странице нет блока постов (например, в about.html), ничего не делаем

  try {
    // 1. Загрузка базы данных постов
    const response = await fetch('posts.json');
    if (!response.ok) throw new Error('DATA_LOAD_ERROR');
    
    const rawPosts = await response.json();
    
    // Сортировка: от свежих к старым
    allPosts = rawPosts.sort((a, b) => {
      const dateA = new Date(parseMyDate(a.date));
      const dateB = new Date(parseMyDate(b.date));
      return dateB - dateA;
    });
    
    // 2. УМНЫЙ СТАРТ: Авто-определение категории по активной кнопке в HTML
const path = window.location.pathname;
const pageName = path.split('/').pop().replace('.html', '').toUpperCase();
let currentCategory = null;

if (pageName === 'INDEX' || pageName === '') {
  currentCategory = 'ALL';
} else if (['EXPERIMENTS', 'ENGINEERING', 'SECURITY', 'IDEAS'].includes(pageName)) {
  currentCategory = pageName;
}

if (currentCategory === 'ALL') {
  filteredPosts = [...allPosts];
} else if (currentCategory) {
  filteredPosts = allPosts.filter(post => post.category === currentCategory);
} else {
  // Если страница не определена (например, about.html) — показываем все посты (или можно скрыть)
  filteredPosts = [...allPosts];
}

    // 3. Отрисовка карточек на текущей странице
    renderCurrentPage();

  } catch (error) {
    console.error('Database Fatal Error:', error);
    postsContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; color:#ff3333; font-family:monospace; padding:40px; border: 1px dashed #ff3333; border-radius: 8px;">
        [FATAL_ERROR]: UNABLE_TO_INITIALIZE_POST_DATABASE.<br>
        <span style="color:#667788; font-size:12px;">Check your Python server status and posts.json syntax.</span>
      </div>
    `;
  }
}

// ─── Рендеринг карточек и управления пагинацией ───
function renderCurrentPage() {
  const postsContainer = document.getElementById('posts-container');
  const paginationContainer = document.getElementById('pagination-controls');
  
  postsContainer.innerHTML = '';
  if (paginationContainer) paginationContainer.innerHTML = '';

  if (filteredPosts.length === 0) {
    postsContainer.innerHTML = '<div class="system-alert">[DATABASE_EMPTY]: No records found in this partition.</div>';
    return;
  }

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const pagePosts = filteredPosts.slice(startIndex, endIndex);

  pagePosts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'card';
    
    let statusColor = '#00ff66'; 
    if (post.status === 'ACTIVE') statusColor = '#F5C542';   
    if (post.status === 'DEGRADED') statusColor = '#ff3333'; 

    card.onclick = () => window.location.href = post.url;

    card.innerHTML = `
      <div class="thumbnail">${post.icon || '🧠'}</div>
      <div class="card-meta-top">
        <span class="card-category">// ${post.category}</span>
        <span class="card-status-dot" style="background-color: ${statusColor}; box-shadow: 0 0 6px ${statusColor}"></span>
      </div>
      <div class="title">${post.title}</div>
      <div class="date">${post.date}</div>
    `;
    postsContainer.appendChild(card);
  });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  if (totalPages > 1 && paginationContainer) {
    renderPaginationControls(totalPages);
  }
}

// ─── Генерация кнопок пагинации ───
function renderPaginationControls(totalPages) {
  const paginationContainer = document.getElementById('pagination-controls');

  const prevBtn = document.createElement('button');
  prevBtn.className = 'cyber-page-btn';
  prevBtn.innerText = '[ PREV_PAGE ]';
  if (currentPage === 1) prevBtn.disabled = true;
  prevBtn.onclick = () => {
    currentPage--;
    renderCurrentPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageIndicator = document.createElement('span');
  pageIndicator.className = 'cyber-page-indicator';
  pageIndicator.innerText = `SYS_PAGE: ${currentPage} // ${totalPages}`;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'cyber-page-btn';
  nextBtn.innerText = '[ NEXT_PAGE ]';
  if (currentPage === totalPages) nextBtn.disabled = true;
  nextBtn.onclick = () => {
    currentPage++;
    renderCurrentPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  paginationContainer.appendChild(prevBtn);
  paginationContainer.appendChild(pageIndicator);
  paginationContainer.appendChild(nextBtn);
}

// Вспомогательный парсер дат
function parseMyDate(dateStr) {
  const months = {
    'янв': 'Jan', 'фев': 'Feb', 'мар': 'Mar', 'апр': 'Apr', 'май': 'May', 'июн': 'Jun',
    'июл': 'Jul', 'авг': 'Aug', 'сен': 'Sep', 'окт': 'Oct', 'ноя': 'Nov', 'дек': 'Dec'
  };
  let lowerStr = dateStr.toLowerCase();
  for (let key in months) {
    if (lowerStr.includes(key)) {
      return lowerStr.replace(key, months[key]);
    }
  }
  return dateStr;
}


// ─── Живая соединительная линия (только на страницах с .post-title-card) ───
function drawCyberConnection() {
  const activeBtn = document.querySelector('nav a.active');
  const titleCard = document.querySelector('.post-title-card');
  if (!activeBtn || !titleCard) return;

  // Определяем цвет по категории
  const category = activeBtn.getAttribute('data-category') || 'ALL';
  let glowColor;
  switch(category.toUpperCase()) {
    case 'SECURITY': glowColor = '#ff4444'; break;
    case 'EXPERIMENTS': glowColor = '#00ff66'; break;
    case 'ENGINEERING': glowColor = '#F5C542'; break;
    case 'IDEAS': glowColor = '#00ccff'; break;
    default: glowColor = '#00ff66';
  }

  // Создаём или очищаем SVG
  let svg = document.getElementById('connection-svg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'connection-svg';
    svg.style.position = 'fixed';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '999';
    document.body.appendChild(svg);
  }
  svg.innerHTML = '';

  const btnRect = activeBtn.getBoundingClientRect();
  const cardRect = titleCard.getBoundingClientRect();

  const startX = btnRect.left + btnRect.width / 2;
  const startY = btnRect.bottom;
  const endX = cardRect.left + cardRect.width / 2;
  const endY = cardRect.top;

  // === ВЕРХНЯЯ ЛИНИЯ (от кнопки к карточке темы) ===
  const d = `M ${startX} ${startY} L ${startX} ${(startY+endY)/2} L ${endX} ${(startY+endY)/2} L ${endX} ${endY}`;
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  const length = path.getTotalLength();
  path.style.setProperty('--path-length', length);
  path.classList.add('connection-line-path');
  path.style.setProperty('--glow-color', glowColor);
  path.setAttribute('stroke', glowColor);
  svg.appendChild(path);

  // Пульсирующая точка в конце верхней линии
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', endX);
  circle.setAttribute('cy', endY);
  circle.setAttribute('r', '4');
  circle.setAttribute('fill', glowColor);
  circle.classList.add('connection-pulse-dot');
  circle.style.setProperty('--glow-color', glowColor);
  svg.appendChild(circle);
}

window.addEventListener('load', drawCyberConnection);
window.addEventListener('resize', drawCyberConnection);
window.addEventListener('scroll', drawCyberConnection);

function revealPostContent() {
  const postContent = document.querySelector('.post-content');
  if (!postContent) return;

  // Создаём скрытый замерочный блок вне потока
  const ghost = document.createElement('div');
  ghost.style.visibility = 'hidden';
  ghost.style.position = 'absolute';
  ghost.style.top = '0';
  ghost.style.left = '0';
  ghost.style.width = postContent.clientWidth + 'px';
  ghost.style.pointerEvents = 'none';
  ghost.style.zIndex = '-1';
  // Копируем всех прямых потомков (глубоко)
  const children = postContent.children;
  for (let child of children) {
    ghost.appendChild(child.cloneNode(true));
  }
  document.body.appendChild(ghost);

  // Фиксируем min-height по замеру
  const finalHeight = ghost.getBoundingClientRect().height;
  postContent.style.minHeight = finalHeight + 'px';

  // Удаляем замерочный блок
  document.body.removeChild(ghost);

  // Запускаем построчную печать
  const elements = Array.from(children);
  elements.forEach((el, index) => {
    setTimeout(() => {
      typeTextInElement(el);
    }, index * 16);
  });
}

// Рекурсивно обходит все текстовые узлы внутри элемента и печатает их
function typeTextInElement(el) {
  // Делаем элемент видимым
  el.classList.add('reveal-active');

  const walker = document.createTreeWalker(
    el,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  // Для каждого текстового узла запускаем посимвольную печать
  textNodes.forEach((node, nodeIndex) => {
    const fullText = node.textContent;
    node.textContent = ''; // очищаем
    let charIndex = 0;
    const interval = setInterval(() => {
      node.textContent += fullText.charAt(charIndex);
      charIndex++;
      if (charIndex >= fullText.length) {
        clearInterval(interval);
      }
    }, 15); // скорость печати (15 мс на символ)
  });
}
document.addEventListener('DOMContentLoaded', revealPostContent);

// ─── СИСТЕМА МОНИТОРИНГА: ЧАСЫ, ДАТА, IP И ГЕОЛОКАЦИЯ ───
function initSessionMonitor() {
  const clockEl = document.getElementById('live-clock');
  const dateEl = document.getElementById('live-date');
  const ipEl = document.getElementById('user-ip');
  const geoEl = document.getElementById('user-geo');

  // 1. Часы и Дата
  if (clockEl && dateEl) {
    const updateTime = () => {
      const now = new Date();
      clockEl.innerText = now.toLocaleTimeString('ru-RU') + ' // LIVE';
      const dateStr = now.toLocaleDateString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric'
      }).toUpperCase().replace(',', '');
      dateEl.innerText = dateStr + ' // SECURE';
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  // 2. IP + Страна (CORS-безопасный вариант)
  if (ipEl || geoEl) {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(ipData => {
        if (ipEl) ipEl.innerText = (ipData.ip || '???') + ' // TARGET';
        return fetch(`https://api.country.is/${ipData.ip}`);
      })
      .then(res => {
        if (!res.ok) throw new Error('GEO_FAIL');
        return res.json();
      })
      .then(geoData => {
        if (geoEl) {
          const country = (geoData.country && geoData.country.toUpperCase()) || 'UN';
          geoEl.innerText = `GEO: ${country} // DETECTED`;
          geoEl.style.color = '#00ff66';
        }
      })
      .catch(error => {
        console.warn('Сетевой мониторинг: локальный режим', error);
        if (ipEl) ipEl.innerText = '127.0.0.1 // LOCALHOST';
        if (geoEl) geoEl.innerText = 'LOOPBACK_TUNNEL // SECURE';
      });
  }
}

// ─── ЕДИНЫЙ ЦЕНТР ЗАПУСКА ВСЕХ СКРИПТОВ НА САЙТЕ ───
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initializeApp === 'function') {
    initializeApp();
  }
  initSessionMonitor();
});
