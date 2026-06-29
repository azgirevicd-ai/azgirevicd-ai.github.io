// ─── Анимация нейронов в шапке ───
(function() {
  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('neuro-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    const particles = [];
    let textParticles = [];

    // ─── Новые настройки для длинных цепочек и редких символов ───
    const NUM_PARTICLES = 120;      // Намного больше нейронов для плотности
    const CONNECTION_DIST = 140;    // Увеличенный радиус связей для выстраивания в длинные цепочки
    const MOUSE_RADIUS = 160;       
    const PARTICLE_SIZE = 1.8;      // Чуть уменьшили размер точек, чтобы сеть выглядела изящнее
    const MAX_SPEED = 2.5;          // Замедлили базовую скорость для плавности созвездий

    let mouse = { x: null, y: null };
    let lastTextX = 0;              // Переменные для контроля шага мыши
    let lastTextY = 0;

    const formulas = [
      '∂L/∂w', 'σ(z)', 'ReLU', 'softmax', 'Σ', '∏', '∇', 'δ', 'ε', 'θ','∂L/∂w', 'σ(z)', 'ReLU', 'softmax',
  'Σ', '∏', 'lim', '∫',
  '∇', 'δ', 'ε', 'θ',
  'λ', 'π', 'τ', 'φ', 'Ψ', 'Ω', 'α', 'β', 'γ',
  '√', '∞', '∂', '∆',
  // Линейная алгебра
  '||W||²', 'A·B', 'Xᵀ', 'ŷ', 'ŷ',
  '||x||', '⟨u,v⟩', 'det(A)', 'tr(A)',
  // Функции
  'sigmoid', 'tanh', 'softmax', 'ReLU',
  'Leaky ReLU', 'ELU', 'GELU',
  // ML термины
  'loss', 'accuracy', 'epoch', 'batch',
  'learning_rate', 'gradient', 'backprop',
  'forward', 'weights', 'biases', 'optimizer',
  'SGD', 'Adam', 'RMSprop', 'AdaGrad',
  'dropout', 'batch_norm', 'layer_norm',
  // Код
  'return', 'print', 'def', 'class',
  'import', 'from', 'if', 'else',
  'for', 'while', 'try', 'except',
  'raise', 'assert', 'lambda', 'yield',
  'break', 'continue', 'pass', 'global',
  'nonlocal', 'with', 'as', 'in',
  // Безопасность
  'exploit', 'injection', 'prompt', 'jailbreak',
  'shield', 'secure', 'hack', 'crack',
  'patch', 'firewall', 'breach', 'intrusion',
  'audit', 'CVE-2026', 'XSS', 'SQLi',
  // Сети
  'TCP', 'UDP', 'HTTP', 'HTTPS',
  'SSL', 'TLS', 'AES', 'RSA',
  'ECC', 'PKI', 'CIA', 'AAA',
  // Шестнадцатеричные и бинарные
  '0xDEAD', '0xBEEF', '0xCAFE', '0xBA5E',
  '0xFF', '0x00', '0101', '1010',
  'NULL', 'nullptr', 'void', 'main',
  'argc', 'argv', 'errno', 'EOF',
  // ИИ
  'AGI', 'NLP', 'LLM', 'transformer',
  'attention', 'token', 'embedding',
  'context', 'fine-tune', 'RLHF',
  'RAG', 'few-shot', 'zero-shot',
  'chain-of-thought', 'CoT', 'TOT',
  // Процессы
  '[SYSTEM]', '[OK]', '[FAIL]', '[WARN]',
  '[INFO]', '[DEBUG]', '[ERROR]', '[CRIT]',
  '[PROCESS]', '[THREAD]', '[CPU]', '[GPU]',
  '[RAM]', '[IO]', '[DISK]', '[NET]',
  // Операторы и синтаксис
  '->', '=>', '::', '++', '--',
  '+=', '-=', '*=', '/=', '%=',
  '==', '!=', '===', '!==',
  '&&', '||', '!', '?', ':',
  '@', '#', '$', '%', '^',
  '&', '*', '(', ')', '[',
  ']', '{', '}', '<', '>',
  '/', '\\', '|', '~', '`',
  ';', ':', ',', '.', '/',
  // Дополнительно
  'epoch=100', 'lr=0.001', 'bs=32',
  'dropout=0.2', 'optim=SGD',
  'seed=42', 'random', 'shuffle',
  'normalize', 'scale', 'transform',
  'fit', 'predict', 'evaluate',
  'train_loss', 'val_loss', 'train_acc',
  'val_acc', 'F1', 'precision', 'recall',
  'ROC', 'AUC', 'PR', 'MSE', 'MAE','loss', 'accuracy', 'epoch', 'err#r', 'warning', '▲_delta', 'y_true', 
      'y_pred', 'dL/dW = Xᵀ', 'rate=0.5', '[SYSTEM_ALERT]', '0.001', '∞', 
      '(1 + e⁻ˣ)', 'x_i', 'ﾊ ﾐ ﾋ', 'ﾑ ﾕ ﾗ ｾ ﾈ ｽ', 'Y_prd ｾ', 'dL/dW ﾗ', 
      'ｾ ﾈ ｽ', 'SECURE', 'return', '0.999', 'Loading', '(Y - Ŷ)X', 
      '[■■■□□] 60%', '█ ▄ █ ▄', '[A•B]', '[||W||²]', 'λ_reg', 'eᶻⁱ', 'max(0,x)', 'sqrt(d_k)', '∑eᶻʲ'
    ];

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width;
      canvas.height = height;
    }

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Мощный стартовый разгон в случайном направлении (было 0.4)
        this.vx = (Math.random() - 0.5) * 1.8;
        this.vy = (Math.random() - 0.5) * 1.8;
      }
      update() {
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < MOUSE_RADIUS) {
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            this.vx += (dx / dist) * force * 0.08;
            this.vy += (dy / dist) * force * 0.08;
          }
        }

        // Эффект броуновского движения: хаотично бросает нейрон в стороны (было 0.015)
        this.vx += (Math.random() - 0.5) * 0.06;
        this.vy += (Math.random() - 0.5) * 0.06;

        // Демпфирование: снизили торможение, чтобы они двигались резвее (было 0.96)
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Speed Clamp (Ограничитель скорости)
        const currentSpeed = Math.hypot(this.vx, this.vy);
        if (currentSpeed > MAX_SPEED) {
          this.vx = (this.vx / currentSpeed) * MAX_SPEED;
          this.vy = (this.vy / currentSpeed) * MAX_SPEED;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Отскок от краев шапки
        if (this.x < 0) { this.x = 0; this.vx *= -1; }
        if (this.x > width) { this.x = width; this.vx *= -1; }
        if (this.y < 0) { this.y = 0; this.vy *= -1; }
        if (this.y > height) { this.y = height; this.vy *= -1; }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, PARTICLE_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 199, 255, 0.85)'; 
        ctx.fill();
      }
    }

    class TextParticle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.text = formulas[Math.floor(Math.random() * formulas.length)];
        this.life = 1.0;
        this.decay = 0.005 + Math.random() * 0.008; // Проявляются чуть дольше
        this.vy = -0.15 - Math.random() * 0.25;        
        this.size = 10 + Math.random() * 6;
        this.alpha = 0.6 + Math.random() * 0.4;
      }
      update() {
        this.y += this.vy;
        this.life -= this.decay;
        if (this.life < 0) this.life = 0;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.life * this.alpha;
        ctx.font = `${this.size}px 'Courier New', monospace`;
        ctx.fillStyle = '#F5C542'; 
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(245,197,66,0.3)';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
      }
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push(new Particle());
      }
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < CONNECTION_DIST) {
            const alpha = 1 - (dist / CONNECTION_DIST);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Прорисовываем цепочки чуть мягче, чтобы они не перегружали экран
            ctx.strokeStyle = `rgba(168, 199, 255, ${alpha * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => p.update());
      particles.forEach(p => p.draw());
      drawConnections();

      for (let i = textParticles.length - 1; i >= 0; i--) {
        const t = textParticles[i];
        t.update();
        if (t.life <= 0) {
          textParticles.splice(i, 1);
        } else {
          t.draw();
        }
      }

      requestAnimationFrame(animate);
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

      // Считаем, насколько сильно сдвинулась мышь с момента прошлого символа
      const movementDist = Math.hypot(mouse.x - lastTextX, mouse.y - lastTextY);

      // Символ появится ТОЛЬКО если мышь продвинулась на 15px И выпал редкий шанс 1.5%
      if (movementDist > 15 && Math.random() < 0.015) {
        const x = mouse.x + (Math.random() - 0.5) * 40;
        const y = mouse.y + (Math.random() - 0.5) * 20;
        textParticles.push(new TextParticle(x, y));
        
        // Фиксируем новую точку отсчета расстояния
        lastTextX = mouse.x;
        lastTextY = mouse.y;
      }
    }

    function onMouseLeave() {
      mouse.x = null;
      mouse.y = null;
    }

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    const headerElement = canvas.parentElement;
    if (headerElement) {
      headerElement.addEventListener('mousemove', onMouseMove);
      headerElement.addEventListener('mouseleave', onMouseLeave);
    }

    resize();
    initParticles();
    animate();
  });
})();
