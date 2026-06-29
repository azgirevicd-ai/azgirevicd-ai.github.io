// ─── Скрипт динамической ломаной линии с импульсом ───
(function() {
  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('connect-line-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Настраиваем холст на размеры всего документа, чтобы рисовать между шапкой и контентом
    function resizeCanvas() {
      canvas.width = document.documentElement.scrollWidth;
      canvas.height = document.documentElement.scrollHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let pulseProgress = 0; // Переменная для движения импульса света

    // Функция вычисления точек ломаной линии
    function getLinePath() {
      // 1. Ищем активную кнопку категории в меню
      const activeNav = document.querySelector('nav a.active');
      // 2. Ищем карточку заголовка поста
      const titleCard = document.querySelector('.post-title-card');

      if (!activeNav || !titleCard) return null;

      const navRect = activeNav.getBoundingClientRect();
      const titleRect = titleCard.getBoundingClientRect();
      const scrollY = window.scrollY;

      // Точка А (Старт): Нижний центр активной кнопки меню
      const startX = navRect.left + navRect.width / 2 + window.scrollX;
      const startY = navRect.bottom + scrollY;

      // Точка Б (Финиш): Верхний центр карточки заголовка
      const endX = titleRect.left + titleRect.width / 2 + window.scrollX;
      const endY = titleRect.top + scrollY;

      // Вычисляем высоту излома (ровно посередине между меню и заголовком)
      const midY = startY + (endY - startY) / 2;

      // Возвращаем массив точек для ломаной линии: Старт -> Излом 1 -> Излом 2 -> Финиш
      return [
        { x: startX, y: startY }, // Старт под иконкой
        { x: startX, y: midY },   // Спуск вниз до середины
        { x: endX, y: midY },     // Поворот по горизонтали до центра заголовка
        { x: endX, y: endY }      // Финальный спуск в заголовок
      ];
    }

    // Вспомогательная функция для поиска точки на ломаной линии по проценту пути (от 0 до 1)
    function getPointOnPath(path, t) {
      if (!path || path.length < 2) return null;
      
      // Вычисляем длины отрезков
      const segments = [];
      let totalLength = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const dx = path[i+1].x - path[i].x;
        const dy = path[i+1].y - path[i].y;
        const len = Math.hypot(dx, dy);
        segments.push(len);
        totalLength += len;
      }

      let targetLen = t * totalLength;
      let accumulatedLen = 0;

      // Ищем, на какой отрезок попадает наш процент
      for (let i = 0; i < segments.length; i++) {
        if (accumulatedLen + segments[i] >= targetLen) {
          const segT = (targetLen - accumulatedLen) / segments[i];
          const p1 = path[i];
          const p2 = path[i+1];
          return {
            x: p1.x + (p2.x - p1.x) * segT,
            y: p1.y + (p2.y - p1.y) * segT
          };
        }
        accumulatedLen += segments[i];
      }
      return path[path.length - 1];
    }

    // Главный цикл анимации
    function animateLine() {
      // Очищаем холст под новую прорисовку при скролле или ресайзе
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const path = getLinePath();
      if (path) {
        // 1. Рисуем базовую тонкую тусклую линию (кабель данных)
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.strokeStyle = 'rgba(45, 45, 45, 0.6)'; // Тусклый серый цвет в тон рамкам
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 2. Рисуем бегущий световой импульс (светящийся квант данных)
        pulseProgress += 0.006; // Скорость движения импульса (чем больше, тем быстрее летит)
        if (pulseProgress > 1) pulseProgress = 0; // Зацикливаем бег

        const pulsePoint = getPointOnPath(path, pulseProgress);
        if (pulsePoint) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(pulsePoint.x, pulsePoint.y, 3, 0, Math.PI * 2);
          
          // Эффект яркого неонового свечения импульса
          ctx.fillStyle = '#00ff66'; // Матричный зеленый заряд
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00ff66';
          ctx.fill();
          ctx.restore();
        }
      }

      requestAnimationFrame(animateLine);
    }

    // Запускаем постоянное отслеживание и анимацию
    animateLine();

    // Перерисовываем холст при скролле, чтобы линия не съезжала
    window.addEventListener('scroll', () => {
      // Микро-таймаут для сглаживания прыжков скролла
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  });
})();
