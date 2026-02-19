// ===================================================
//  LOADER
// ===================================================
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 2600);
});

// ===================================================
//  MATRIX RAIN
// ===================================================
(function () {
  const canvas = document.getElementById('matrix-canvas');
  const ctx    = canvas.getContext('2d');
  const chars  = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ<>{}[]|/\\'.split('');
  let W, H, cols, drops;

  function init() {
    W     = canvas.width  = window.innerWidth;
    H     = canvas.height = window.innerHeight;
    cols  = Math.floor(W / 18);
    drops = Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(2,12,7,0.05)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = '14px Space Mono, monospace';
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = y * 18 < H * 0.3 ? '#00ff88' : '#00e5ff';
      ctx.fillText(char, i * 18, y * 18);
      if (y * 18 > H && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }

  init();
  setInterval(draw, 55);
  window.addEventListener('resize', init);
})();

// ===================================================
//  CUSTOM CURSOR
// ===================================================
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = 0, my = 0, fx = 0, fy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx - 5 + 'px';
  cursor.style.top  = my - 5 + 'px';
});

(function animateFollower() {
  fx += (mx - fx) * 0.12;
  fy += (my - fy) * 0.12;
  follower.style.left = fx - 18 + 'px';
  follower.style.top  = fy - 18 + 'px';
  requestAnimationFrame(animateFollower);
})();

document.querySelectorAll('a, button, .btn, .project-row, .ctf-card, .skill-block, .writeup-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform     = 'scale(2.5)';
    follower.style.transform   = 'scale(1.6)';
    follower.style.borderColor = 'var(--accent)';
    follower.style.boxShadow   = '0 0 14px var(--accent)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform     = 'scale(1)';
    follower.style.transform   = 'scale(1)';
    follower.style.borderColor = 'var(--accent2)';
    follower.style.boxShadow   = '0 0 8px var(--accent2)';
  });
});

// ===================================================
//  MOBILE MENU
// ===================================================
function toggleMobile() { document.getElementById('mobileMenu').classList.toggle('open'); }
function closeMobile()  { document.getElementById('mobileMenu').classList.remove('open'); }

// ===================================================
//  REVEAL ON SCROLL
// ===================================================
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ===================================================
//  COUNTER ANIMATION
// ===================================================
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-num[data-target]').forEach(el => {
        const target = +el.dataset.target;
        let cur = 0;
        const step = target / 90;
        const t = setInterval(() => {
          cur += step;
          if (cur >= target) { cur = target; clearInterval(t); }
          el.textContent = Math.floor(cur) + (target === 100 ? '%' : '+');
        }, 16);
      });
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.about-stats').forEach(el => counterObs.observe(el));

// ===================================================
//  GITHUB PROJECTS
// ===================================================
async function loadProjects() {
  const list = document.getElementById('projectsList');
  try {
    const res   = await fetch('https://api.github.com/users/khalilja/repos?sort=updated&per_page=8');
    const repos = await res.json();
    const items = repos.filter(r => !r.fork).slice(0, 7);
    list.innerHTML = '';
    items.forEach((repo, i) => {
      const row = document.createElement('a');
      row.href   = repo.html_url;
      row.target = '_blank';
      row.classList.add('project-row', 'reveal');
      row.innerHTML = `
        <span class="project-num">0${i + 1}</span>
        <div class="project-info">
          <h3>${repo.name.replace(/-/g, ' ')}</h3>
          <p>${repo.description || 'No description available.'}</p>
        </div>
        <span class="project-lang">${repo.language || '—'}</span>
        <i class="fas fa-arrow-up-right project-arrow"></i>
      `;
      list.appendChild(row);
      revealObs.observe(row);
    });
  } catch {
    list.innerHTML = `<div class="projects-loading">Could not load projects —
      <a href="https://github.com/khalilja" target="_blank" style="color:var(--accent)">
        View on GitHub
      </a>
    </div>`;
  }
}
loadProjects();

// ===================================================
//  GITHUB STATS CARDS
// ===================================================
async function loadGHStats() {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch('https://api.github.com/users/khalilja'),
      fetch('https://api.github.com/users/khalilja/repos?per_page=100')
    ]);
    const user  = await userRes.json();
    const repos = await reposRes.json();

    // Card 1 — Profile
    document.getElementById('ghCard1').innerHTML = `
      <div class="gh-stat-label">Public Repos</div>
      <div class="gh-stat-value">${user.public_repos || 0}</div>
      <div class="gh-stat-sub">Followers: ${user.followers || 0} &nbsp;·&nbsp; Following: ${user.following || 0}</div>
    `;

    // Card 2 — Stars & Forks
    const totalStars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((a, r) => a + (r.forks_count      || 0), 0);
    document.getElementById('ghCard2').innerHTML = `
      <div class="gh-stat-label">Total Stars</div>
      <div class="gh-stat-value">${totalStars}</div>
      <div class="gh-stat-sub">Total Forks: ${totalForks}</div>
    `;

    // Card 3 — Top Languages
    const langCount = {};
    repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
    const total    = Object.values(langCount).reduce((a, b) => a + b, 0);
    const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const bars     = topLangs.map(([lang, count]) => {
      const pct = Math.round((count / total) * 100);
      return `
        <div class="gh-lang-row">
          <span class="gh-lang-name">${lang}</span>
          <div class="gh-lang-bar">
            <div class="gh-lang-fill" style="width:0" data-width="${pct}"></div>
          </div>
          <span class="gh-lang-pct">${pct}%</span>
        </div>`;
    }).join('');
    document.getElementById('ghCard3').innerHTML = `
      <div class="gh-stat-label">Top Languages</div>
      <div class="gh-stat-bar-wrap">${bars}</div>
    `;
    setTimeout(() => {
      document.querySelectorAll('.gh-lang-fill').forEach(b => { b.style.width = b.dataset.width + '%'; });
    }, 300);

    // Card 4 — Latest Repo
    const recent = [...repos]
      .filter(r => !r.fork)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
    document.getElementById('ghCard4').innerHTML = `
      <div class="gh-stat-label">Latest Active Repo</div>
      <div class="gh-stat-value" style="font-size:1.1rem;word-break:break-word;">
        <a href="${recent?.html_url}" target="_blank" style="color:var(--accent);text-decoration:none;">
          ${recent?.name || '—'}
        </a>
      </div>
      <div class="gh-stat-sub">
        ${recent?.language ? `Lang: ${recent.language}` : ''}
        &nbsp;·&nbsp;
        Updated: ${recent ? new Date(recent.updated_at).toLocaleDateString() : '—'}
      </div>
    `;
  } catch {
    ['ghCard1', 'ghCard2', 'ghCard3', 'ghCard4'].forEach(id => {
      document.getElementById(id).innerHTML = `
        <div class="gh-card-loader" style="color:var(--accent2)">
          <i class="fas fa-wifi"></i> API unavailable
        </div>`;
    });
  }
}
loadGHStats();

// ===================================================
//  WRITEUPS FILTER
// ===================================================
document.querySelectorAll('.wf-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.writeup-card').forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
        card.classList.remove('visible');
        setTimeout(() => revealObs.observe(card), 10);
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ===================================================
//  ACTIVE NAV HIGHLIGHT
// ===================================================
window.addEventListener('scroll', () => {
  let cur = '';
  document.querySelectorAll('section[id]').forEach(s => {
    if (window.scrollY >= s.offsetTop - 220) cur = s.id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    const active       = a.getAttribute('href') === '#' + cur;
    a.style.color      = active ? 'var(--accent)' : '';
    a.style.textShadow = active ? '0 0 8px var(--accent)' : '';
  });
});

// ===================================================
//  CONTACT FORM
// ===================================================
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const btn = this.querySelector('button');
  btn.innerHTML        = '<i class="fas fa-check"></i>&nbsp;Sent!';
  btn.style.background = 'linear-gradient(135deg,#00ff88,#00e5ff)';
  setTimeout(() => {
    btn.innerHTML        = 'Send Message <i class="fas fa-paper-plane"></i>';
    btn.style.background = '';
    this.reset();
  }, 3000);
});