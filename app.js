/* =========================================================
   拉了吗？ · Did You Poop Today
   app.js — 数据层 / 常量 / 图形 / 路由
   ========================================================= */

/* ---------------- 小工具 ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const pad2 = (n) => String(n).padStart(2, '0');
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];
const fmtDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const todayKey = () => fmtDate(new Date());
const keyToDate = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d, n) => {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
};
const diffDays = (a, b) => Math.round((keyToDate(b) - keyToDate(a)) / 86400000);
const uid = () => Math.random().toString(36).slice(2, 9);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isToday = (k) => k === todayKey();

/* ---------------- 常量定义 ---------------- */
const BRISTOL = [
  { t: 1, name: '硬球', level: 'bad', desc: '一颗颗分开的硬球，像羊粪蛋。典型的便秘信号——水喝少了、纤维不够，肠道把水分吸得太干净。' },
  { t: 2, name: '硬结', level: 'warn', desc: '香肠状但表面凹凸成块。还是偏干，蹲的时间估计不短。多喝水，多吃点粗粮和绿叶菜。' },
  { t: 3, name: '裂纹', level: 'ok', desc: '香肠形状，表面带裂纹。在正常范围内，稍微偏干一点点，够用但不算完美。' },
  { t: 4, name: '顺滑', level: 'best', desc: '光滑柔软、一整条，一次顺畅到底。教科书级别的完美便便，肠道状态在线。' },
  { t: 5, name: '软块', level: 'ok', desc: '柔软的小块，边缘还算清晰。属于正常范围，蔬菜吃得少一点就可能这样。' },
  { t: 6, name: '糊状', level: 'warn', desc: '蓬松的糊状，边缘不清晰。偏稀了，肠道通过速度有点快，注意是不是吃坏东西了。' },
  { t: 7, name: '水样', level: 'bad', desc: '完全是水，没有固体。这是腹泻。记得补水和电解质，持续超过两天建议就医。' },
];

const SMOOTH = [
  { v: 1, label: '憋爆了', sub: '半天出不来' },
  { v: 2, label: '有点费劲', sub: '得使劲' },
  { v: 3, label: '还行', sub: '正常发挥' },
  { v: 4, label: '很顺畅', sub: '一气呵成' },
  { v: 5, label: '一泻千里', sub: '根本刹不住' },
];

const AMOUNTS = [
  { v: 1, label: '一点点' },
  { v: 2, label: '正常' },
  { v: 3, label: '很多' },
];

const COLORS = [
  { v: 'brown', name: '棕色', css: '#9C6B43' },
  { v: 'dark', name: '深棕', css: '#6B4426' },
  { v: 'yellow', name: '黄色', css: '#D9A62E' },
  { v: 'green', name: '绿色', css: '#6E9E4A' },
  { v: 'black', name: '发黑', css: '#2A2320', warn: true },
  { v: 'red', name: '带血', css: '#B23A3A', warn: true },
];

const MOODS = [
  { v: 1, emo: '😫', name: '很糟' },
  { v: 2, emo: '😕', name: '有点丧' },
  { v: 3, emo: '😐', name: '一般' },
  { v: 4, emo: '🙂', name: '还不错' },
  { v: 5, emo: '🤩', name: '超棒' },
];

/* =========================================================
   扭蛋内容物：食物残渣
   便便只是个包装，真正抽的是「没消化的那帮家伙」。
   ========================================================= */
const RELICS = [
  /* ---- N ---- */
  { id: 'corn', name: '玉米粒', rarity: 'N', art: 'corn', desc: '金黄的一颗，肠道界的老朋友。嚼不烂，也化不掉，就这么原样穿过来了。' },
  { id: 'sesame', name: '白芝麻', rarity: 'N', art: 'sesame', desc: '小到几乎看不见，但它确实在。八成来自某个面包或一碗拌面。' },
  { id: 'rice', name: '米饭粒', rarity: 'N', art: 'rice', desc: '完整的一粒。说明刚才那顿饭，你嚼的次数是个位数。' },
  { id: 'dragon', name: '火龙果籽', rarity: 'N', art: 'dragon', desc: '黑黑的小点，一出现就是几百颗。白心火龙果的指纹。' },
  { id: 'leaf', name: '菜叶碎', rarity: 'N', art: 'leaf', desc: '一片绿。至少证明你吃了蔬菜，虽然它本人不太想被消化。' },

  /* ---- R ---- */
  { id: 'enoki', name: '金针菇', rarity: 'R', art: 'enoki', desc: 'see you tomorrow。进得去、出得来，全程保持原样，敬业得让人敬佩。' },
  { id: 'chive', name: '韭菜段', rarity: 'R', art: 'chive', desc: '一段翠绿，带着昨天晚饭全部的气味记忆。' },
  { id: 'chili', name: '辣椒皮', rarity: 'R', art: 'chili', desc: '红油火锅的遗物。它已经完成了使命，只剩下一层形状。' },
  { id: 'kelp', name: '海带结', rarity: 'R', art: 'kelp', desc: '滑溜溜地打了个结，然后一路滑到了终点，全程没被拆开。' },
  { id: 'fungus', name: '木耳片', rarity: 'R', art: 'fungus', desc: '黑色的耳朵，柔软又固执，对胃酸毫无敬意。' },

  /* ---- SR ---- */
  { id: 'ring', name: '完整辣椒圈', rarity: 'SR', art: 'ring', desc: '居然一整个圈都还在。那顿饭你到底嚼了几口？' },
  { id: 'star', name: '八角', rarity: 'SR', art: 'star', desc: '一整颗香料，八个角齐全。它本来是调味的，不是给你吃的。' },
  { id: 'cabbage', name: '紫甘蓝丝', rarity: 'SR', art: 'cabbage', desc: '紫色的染色师。它走过的地方，都会留下一点颜色。' },
  { id: 'mint', name: '薄荷叶', rarity: 'SR', art: 'mint', desc: '一片完整的薄荷。清凉感在出口处重新上线，有点荒诞。' },

  /* ---- SSR ---- */
  { id: 'king', name: '金针菇之王', rarity: 'SSR', art: 'king', desc: '一整把金针菇，从头到尾零损耗。传说级 see you tomorrow，肠胃界的活化石。' },
  { id: 'tomato', name: '番茄皮', rarity: 'SSR', art: 'tomato', desc: '一整张番茄皮，像一件被脱下来的红色外套，完整得可以再穿一次。' },
];

/* 老版本便便精灵 → 新残渣，抽过的收藏不白抽 */
const LEGACY_MAP = {
  pip: 'corn', bean: 'sesame', pudding: 'rice', cat: 'dragon', rabbit: 'leaf',
  monkey: 'chive', gold: 'ring', rainbow: 'cabbage', ghost: 'mint',
  diamond: 'king', god: 'tomato',
};

const RARITY_WEIGHT = { N: 56, R: 30, SR: 11, SSR: 3 };
const RARITY_ORDER = { N: 0, R: 1, SR: 2, SSR: 3 };

/* 残渣档位：普通 → 白银（3 个）→ 黄金（8 个）。攒够后去图鉴「合成」升档，合成送扭蛋券 */
const TIERS = [
  { name: '普通', at: 0, reward: 0 },
  { name: '白银', at: 3, reward: 1 },
  { name: '黄金', at: 8, reward: 2 },
];
/* 按累计数量能到的最高档 */
const tierByN = (n) => ((n || 0) >= TIERS[2].at ? 2 : (n || 0) >= TIERS[1].at ? 1 : 0);
/* 距下一档还差几个；黄金档返回 0 */
const nextTierAt = (n) => ((n || 0) < TIERS[1].at ? TIERS[1].at : (n || 0) < TIERS[2].at ? TIERS[2].at : 0);
/* 当前档位下的进度（0~100），黄金档满格 */
const tierProgress = (n, tier) => {
  const t = tier == null ? tierByN(n) : tier;
  if (t >= 2) return 100;
  const from = TIERS[t].at;
  const to = TIERS[t + 1].at;
  return Math.min(100, Math.round((((n || 0) - from) / (to - from)) * 100));
};
/* 档位星：普通 1 颗灰星、白银 2 银星、黄金 3 金星 */
const tierStars = (t) => '★'.repeat(t + 1);

/* 成就 */
const ACHIEVEMENTS = [
  { id: 'first', ico: '🎉', name: '初次见面', desc: '完成第一次记录', test: (s) => Object.keys(s.days).length >= 1 },
  { id: 'streak3', ico: '🔥', name: '三日不断', desc: '连续记录 3 天', test: (s) => S.streak() >= 3 },
  { id: 'streak7', ico: '🏅', name: '一周通畅', desc: '连续记录 7 天', test: (s) => S.streak() >= 7 },
  { id: 'streak30', ico: '👑', name: '铁肠传说', desc: '连续记录 30 天', test: (s) => S.streak() >= 30 },
  { id: 'perfect', ico: '💎', name: '完美形态', desc: '记录一次第 4 型', test: (s) => allEntries(s).some((e) => e.bristol === 4) },
  { id: 'gacha5', ico: '🎰', name: '扭蛋新手', desc: '抽 5 次扭蛋', test: (s) => (s.gacha.pulls || 0) >= 5 },
  { id: 'gacha20', ico: '🎡', name: '扭蛋老手', desc: '抽 20 次扭蛋', test: (s) => (s.gacha.pulls || 0) >= 20 },
  { id: 'ssr', ico: '🌟', name: '欧皇附体', desc: '抽到任意 SSR', test: (s) => Object.keys(s.gacha.collection || {}).some((id) => (RELICS.find((x) => x.id === id) || {}).rarity === 'SSR') },
  { id: 'twice', ico: '🚽', name: '一日两趟', desc: '同一天记录 2 次以上', test: (s) => Object.values(s.days).some((d) => d.entries && d.entries.length >= 2) },
  { id: 'sr', ico: '💜', name: '紫气东来', desc: '抽到任意 SR 残渣', test: (s) => Object.keys(s.gacha.collection || {}).some((id) => (RELICS.find((x) => x.id === id) || {}).rarity === 'SR') },
  { id: 'diary5', ico: '📔', name: '日记作者', desc: '写 5 篇日记', test: (s) => Object.values(s.days).filter((d) => d.diary && d.diary.trim()).length >= 5 },
  { id: 'dex8', ico: '📖', name: '扭蛋图鉴者', desc: '收集 8 种残渣', test: (s) => Object.keys(s.gacha.collection || {}).length >= 8 },
  { id: 'lv5', ico: '⭐', name: '黄金图鉴', desc: '把某个残渣合成到黄金档', test: (s) => Object.values(s.gacha.tiers || {}).some((t) => t >= 2) },
];

/* ---------------- 图形生成 ---------------- */
let _svgId = 0;

/* 布里斯托七型小图标 */
function bristolSVG(t, opts = {}) {
  const c = 'currentColor';
  const s = `fill="${c}"`;
  const gap = opts.gap || 'var(--bg-card)';
  switch (t) {
    case 1:
      return `<svg viewBox="0 0 64 40" style="color:var(--poop)"><g ${s}><circle cx="12" cy="26" r="6"/><circle cx="26" cy="19" r="5.2"/><circle cx="40" cy="26" r="6"/><circle cx="52" cy="17" r="4.4"/></g></svg>`;
    case 2:
      return `<svg viewBox="0 0 64 40" style="color:var(--poop)"><g ${s}><circle cx="14" cy="22" r="8"/><circle cx="27" cy="20" r="8"/><circle cx="40" cy="22" r="8"/><circle cx="51" cy="21" r="6.5"/></g></svg>`;
    case 3:
      return `<svg viewBox="0 0 64 40" style="color:var(--poop)"><rect x="7" y="12" width="50" height="17" rx="8.5" ${s}/><g stroke="${gap}" stroke-width="1.8" stroke-linecap="round"><path d="M22 13.5v14"/><path d="M35 13v15"/><path d="M47 14v13"/></g></svg>`;
    case 4:
      return `<svg viewBox="0 0 64 40" style="color:var(--poop)"><rect x="6" y="11" width="52" height="19" rx="9.5" ${s}/><ellipse cx="26" cy="17.5" rx="12" ry="3.4" fill="rgba(255,255,255,.4)"/></svg>`;
    case 5:
      return `<svg viewBox="0 0 64 40" style="color:var(--poop)"><g ${s}><ellipse cx="18" cy="24" rx="11" ry="8"/><ellipse cx="34" cy="19" rx="10" ry="7.5"/><ellipse cx="48" cy="25" rx="10" ry="7.5"/></g></svg>`;
    case 6:
      return `<svg viewBox="0 0 64 40" style="color:var(--poop)"><path d="M12 27c-4-2-5-8 0-10 2-6 9-8 13-4 3-5 11-5 13 1 5-1 9 3 8 8-1 4-5 5-8 5H18c-2 0-4 0-6 0z" ${s}/></svg>`;
    case 7:
    default:
      return `<svg viewBox="0 0 64 40" style="color:var(--poop)"><path d="M6 24c4-7 8 4 13-2s8 4 13-2 8 6 13 1 8-1 13-1" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round" style="color:var(--poop)"/></svg>`;
  }
}

/* 量：数量递进要一眼读懂 —— 一点点 = 迷你小坨+大片留白，正常 = 标准一坨，很多 = 六坨堆成山 */
function amountSVG(v) {
  const uid = 'am' + ++_svgId;
  const F = `url(#${uid})`;
  const B = `url(#${uid}b)`;
  const INK = '#5A3A16';

  const defs = `<defs>
    <linearGradient id="${uid}" gradientUnits="userSpaceOnUse" x1="0" y1="4" x2="0" y2="58">
      <stop offset="0" stop-color="#E9BC83"/><stop offset=".45" stop-color="#C48E56"/><stop offset="1" stop-color="#966B3B"/>
    </linearGradient>
    <linearGradient id="${uid}b" gradientUnits="userSpaceOnUse" x1="0" y1="4" x2="0" y2="58">
      <stop offset="0" stop-color="#D3A46C"/><stop offset=".45" stop-color="#A87B49"/><stop offset="1" stop-color="#875F34"/>
    </linearGradient>
  </defs>`;

  /* 一坨便便：尖头 + 三层，左上高光，底部落在 y=56 */
  const body = (f, hi = true) => `
    <path d="M32 6.6c3.3 4.6 5.2 8.2 5.2 11.1 0 3.5-2.3 6-5.2 6s-5.2-2.5-5.2-6c0-2.9 1.9-6.5 5.2-11.1z" fill="${f}"/>
    <ellipse cx="32" cy="24.4" rx="10.9" ry="7.9" fill="${f}"/>
    <ellipse cx="32" cy="34.8" rx="16.3" ry="9.2" fill="${f}"/>
    <ellipse cx="32" cy="47" rx="21" ry="9" fill="${f}"/>
    ${hi ? `<ellipse cx="20.8" cy="30.6" rx="4.6" ry="2.7" fill="rgba(255,255,255,.42)" transform="rotate(-22 20.8 30.6)"/>` : ''}`;

  /* 表情：两只带高光的眼睛 + 一个笑 */
  const eyes = (x1, x2, y, r = 2.6) => `
    <ellipse cx="${x1}" cy="${y}" rx="${r}" ry="${r * 1.16}" fill="${INK}"/>
    <ellipse cx="${x2}" cy="${y}" rx="${r}" ry="${r * 1.16}" fill="${INK}"/>
    <circle cx="${x1 - 0.7}" cy="${y - 1.1}" r="${r * 0.36}" fill="#FFFDF6"/>
    <circle cx="${x2 - 0.7}" cy="${y - 1.1}" r="${r * 0.36}" fill="#FFFDF6"/>`;
  const mouth = (y, w) => `<path d="M${32 - w} ${y}c1.6 2.5 ${2 * w - 3.2} 2.5 ${2 * w} 0" stroke="${INK}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;

  /* 放一坨：底部落在 ground 上 */
  const put = (s, dx, ground, f, face) => `
    <g transform="translate(${32 + dx} ${ground}) scale(${s}) translate(-32 -56)">
      ${body(f, !!face)}${face ? eyes(26.4, 37.6, 32.4, 2.5) + mouth(37.8, 3.6) : ''}
    </g>`;
  /* 地面阴影 */
  const ground = (rx, y) => `<ellipse cx="32" cy="${y}" rx="${rx}" ry="2.4" fill="rgba(90,58,22,.13)"/>`;

  /* 一点点：迷你小坨，周围全是留白——"就这么点儿" */
  if (v === 1) {
    return `<svg viewBox="0 0 64 64" class="amt-ico">${defs}
      ${ground(9.5, 61)}
      ${put(.55, 0, 61, F, true)}
    </svg>`;
  }

  /* 正常：标准一坨，稳稳当当 */
  if (v === 2) {
    return `<svg viewBox="0 0 64 64" class="amt-ico">${defs}
      ${ground(16, 61)}
      ${put(.95, 0, 61, F, true)}
    </svg>`;
  }

  /* 很多：后三前三堆成一座小山，左右拉开让每坨都露脸——"拉了这么多" */
  return `<svg viewBox="0 0 64 64" class="amt-ico">${defs}
    ${ground(27, 62)}
    ${put(.46, -18, 44, B)}${put(.46, 18, 44, B)}${put(.5, 0, 40, B)}
    ${put(.72, -14, 61, B)}${put(.72, 14, 61, B)}${put(.88, 0, 62, F, true)}
  </svg>`;
}

/* 通畅度：黄豆人风格的五只便便，表情就是状态；一泻千里那只直接坐火箭 */
function smoothSVG(v) {
  const uid = 'sg' + ++_svgId;
  const F = `url(#${uid})`;
  const ink = '#5A3A16';
  const cream = '#FFFDF6';

  const grad = `<defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFDE72"/><stop offset=".58" stop-color="#FFC63D"/><stop offset="1" stop-color="#EEA128"/>
    </linearGradient></defs>`;

  const body = `
    <path d="M32 6.6c3.3 4.6 5.2 8.2 5.2 11.1 0 3.5-2.3 6-5.2 6s-5.2-2.5-5.2-6c0-2.9 1.9-6.5 5.2-11.1z" fill="${F}"/>
    <ellipse cx="32" cy="24.4" rx="10.9" ry="7.9" fill="${F}"/>
    <ellipse cx="32" cy="34.8" rx="16.3" ry="9.2" fill="${F}"/>
    <ellipse cx="32" cy="47" rx="21" ry="9" fill="${F}"/>
    <ellipse cx="20.8" cy="30.6" rx="4.6" ry="2.7" fill="rgba(255,255,255,.45)" transform="rotate(-22 20.8 30.6)"/>`;

  const bodySmall = `
    <path d="M32 2.4c2.7 3.7 4.2 6.6 4.2 8.9 0 2.9-1.9 4.9-4.2 4.9s-4.2-2-4.2-4.9c0-2.3 1.5-5.2 4.2-8.9z" fill="${F}"/>
    <ellipse cx="32" cy="16.4" rx="8.7" ry="6.4" fill="${F}"/>
    <ellipse cx="32" cy="24.6" rx="12.9" ry="7.4" fill="${F}"/>
    <ellipse cx="32" cy="33.6" rx="16" ry="7.8" fill="${F}"/>
    <ellipse cx="23.4" cy="21" rx="3.6" ry="2.1" fill="rgba(255,255,255,.45)" transform="rotate(-22 23.4 21)"/>`;

  /* 横着飞的火箭，便便坐在箭身上 */
  const rocket = `
    <path d="M18 46.6c-7.4 0-11.8 2.6-15.2 5.2 3.4 2.6 7.8 5.2 15.2 5.2z" fill="#FF9F2E"/>
    <path d="M18 48.6c-4 0-6.8 1.5-9.2 3.2 2.4 1.7 5.2 3.2 9.2 3.2z" fill="#FFE07A"/>
    <path d="M22.5 41.4l-5.4-7.2h6.4l3.6 7.2z" fill="#C7453C"/>
    <path d="M22.5 52.6l-5.4 7.2h6.4l3.6-7.2z" fill="#C7453C"/>
    <path d="M16 41.4h33.6c5.6 0 9.4 2.6 11.4 5.2-2 2.6-5.8 5.2-11.4 5.2H16z" fill="#EF5B4F"/>
    <path d="M19.2 43.4h12.6c1.2 0 2 .8 2 2s-.8 2-2 2H19.2c-1.1 0-2-.9-2-2s.9-2 2-2z" fill="#FF8A7E" opacity=".85"/>
    <path d="M49 41.4h1.4c5 0 8.4 2.4 10.2 5.2-1.8 2.8-5.2 5.2-10.2 5.2H49z" fill="#FF8074" opacity=".92"/>
    <circle cx="35" cy="47.6" r="3.3" fill="#8FD3F4" stroke="#FFFDF6" stroke-width="1.5"/>
    <g stroke="#8FD3F4" stroke-width="1.8" stroke-linecap="round" opacity=".45">
      <path d="M3.6 36.2h6.6"/><path d="M2.4 57.4h5.8"/>
    </g>`;

  const sweat = (x, y) => `<path d="M${x} ${y}c1.5 2.5 2.3 4 2.3 5.2 0 1.6-1 2.6-2.3 2.6s-2.3-1-2.3-2.6c0-1.2.8-2.7 2.3-5.2z" fill="#8FD3F4"/>`;
  const blush = (y) => `<ellipse cx="19.4" cy="${y}" rx="3.4" ry="2.4" fill="rgba(240,100,80,.30)"/><ellipse cx="44.6" cy="${y}" rx="3.4" ry="2.4" fill="rgba(240,100,80,.30)"/>`;

  const faces = {
    /* 1 憋爆了：皱成一团的眉头、用力到眯起的 X 眼、咬紧的牙关、两滴汗 */
    1: `<g stroke="${ink}" stroke-width="2.3" stroke-linecap="round" fill="none">
          <path d="M23.4 27.2l5.6 2.6"/><path d="M40.6 27.2l-5.6 2.6"/>
          <path d="M21.6 32.8l6.4 6.2"/><path d="M28 32.8l-6.4 6.2"/>
          <path d="M36 32.8l6.4 6.2"/><path d="M42.4 32.8l-6.4 6.2"/>
        </g>
        <rect x="26.6" y="43.4" width="10.8" height="5.4" rx="2.2" fill="${ink}"/>
        <g stroke="${cream}" stroke-width="1.3"><path d="M30 43.9v4.5"/><path d="M34 43.9v4.5"/></g>
        ${sweat(46.6, 21.6)}${sweat(16.4, 21.6)}`,

    /* 2 有点费劲：眼皮抬不起来、嘴抿成一条波浪、额头一滴汗 */
    2: `<g stroke="${ink}" stroke-width="2.2" stroke-linecap="round"><path d="M21.4 33.2h7"/><path d="M35.6 33.2h7"/></g>
        <circle cx="24.4" cy="36.8" r="2.1" fill="${ink}"/><circle cx="39.6" cy="36.8" r="2.1" fill="${ink}"/>
        <path d="M27.2 44.8c1.6-1.9 3.2-1.9 4.8 0s3.2 1.9 4.8 0" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
        ${sweat(45.8, 23.4)}`,

    /* 3 还行：平平常常的一天 */
    3: `<ellipse cx="25.4" cy="35.6" rx="3.2" ry="3.7" fill="${cream}"/>
        <ellipse cx="38.6" cy="35.6" rx="3.2" ry="3.7" fill="${cream}"/>
        <circle cx="26" cy="36.2" r="1.8" fill="${ink}"/><circle cx="39.2" cy="36.2" r="1.8" fill="${ink}"/>
        <circle cx="24.9" cy="34.4" r=".9" fill="#fff"/><circle cx="38.1" cy="34.4" r=".9" fill="#fff"/>
        <path d="M27.8 43.8c1.6 1.8 6.8 1.8 8.4 0" fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round"/>`,

    /* 4 很顺畅：弯成两道桥的笑眼、张嘴大笑，旁边还冒星星 */
    4: `<g fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"><path d="M21.2 37c1.9-3.2 4.6-3.2 6.5 0"/><path d="M36.3 37c1.9-3.2 4.6-3.2 6.5 0"/></g>
        <path d="M26 42.6h12c.8 0 1.3.7 1.1 1.4-1 3.8-3.7 5.9-7.1 5.9s-6.1-2.1-7.1-5.9c-.2-.7.3-1.4 1.1-1.4z" fill="${ink}"/>
        <path d="M29.4 46.4c1.7 1 3.5 1 5.2 0" stroke="#F2798A" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M51.6 15.6l1.5 3.6 3.6 1.5-3.6 1.5-1.5 3.6-1.5-3.6-3.6-1.5 3.6-1.5z" fill="#FFD75E" stroke="#F0B93A" stroke-width=".8"/>
        <path d="M12.6 21.4l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#FFE08A"/>
        ${blush(42.6)}`,

    /* 5 一泻千里：坐在横着飞的火箭上，眼睛发亮，一路冲出去 */
    5: `<ellipse cx="28" cy="22.6" rx="2.7" ry="3.1" fill="${cream}"/><circle cx="28.4" cy="23.2" r="1.7" fill="${ink}"/>
        <ellipse cx="36" cy="22.6" rx="2.7" ry="3.1" fill="${cream}"/><circle cx="36.4" cy="23.2" r="1.7" fill="${ink}"/>
        <circle cx="27.6" cy="21.8" r=".8" fill="#fff"/><circle cx="35.6" cy="21.8" r=".8" fill="#fff"/>
        <ellipse cx="32" cy="29.8" rx="4.6" ry="3.8" fill="${ink}"/>
        <path d="M29.4 31.6c1.6.9 3.6.9 5.2 0" stroke="#F2798A" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  };

  if (v === 5) {
    return `<svg viewBox="0 0 64 64" class="smooth-ico">${grad}${rocket}
      <g transform="translate(32 41.4) scale(.74) translate(-32 -41.4)">${bodySmall}${faces[5]}</g></svg>`;
  }
  return `<svg viewBox="0 0 64 64" class="smooth-ico">${grad}${body}${faces[v] || faces[3]}</svg>`;
}

/* ---------- 食物残渣图形 ---------- */
const RELIC_ART = {
  corn: `<ellipse cx="32" cy="53.5" rx="11" ry="2.4" fill="rgba(120,80,40,.15)"/>
    <path d="M32 7.6c9.2 0 15.2 8.8 15.2 21.4 0 12-6.1 22.4-15.2 22.4S16.8 41 16.8 29C16.8 16.4 22.8 7.6 32 7.6z" fill="#F6C62F"/>
    <path d="M27.2 11.8c-3.2 9-3.2 19.6 0 28.4" stroke="#DDA016" stroke-width="2.6" fill="none" opacity=".5" stroke-linecap="round"/>
    <path d="M36.8 11.8c3.2 9 3.2 19.6 0 28.4" stroke="#DDA016" stroke-width="2.6" fill="none" opacity=".5" stroke-linecap="round"/>
    <ellipse cx="22.6" cy="20.6" rx="3.2" ry="6.2" fill="#FFF3A8" opacity=".9" transform="rotate(-14 22.6 20.6)"/>`,

  sesame: `<ellipse cx="32" cy="53" rx="8.4" ry="2.2" fill="rgba(120,80,40,.16)"/>
    <path d="M32 10.4c5.4 6.6 8.4 13.4 8.4 19.6 0 7.6-3.8 12.8-8.4 12.8s-8.4-5.2-8.4-12.8c0-6.2 3-13 8.4-19.6z" fill="#F8EBD2" stroke="#DDBF92" stroke-width="1.6"/>
    <ellipse cx="29" cy="25.5" rx="1.7" ry="4.2" fill="#FFFDF4" opacity=".95"/>`,

  rice: `<ellipse cx="32" cy="53" rx="14" ry="2.6" fill="rgba(120,80,40,.13)"/>
    <g fill="#FCF9F1" stroke="#E4DBC8" stroke-width="1.6">
      <ellipse cx="21.5" cy="25.5" rx="9" ry="5.3" transform="rotate(-24 21.5 25.5)"/>
      <ellipse cx="42" cy="29.5" rx="8.6" ry="5" transform="rotate(20 42 29.5)"/>
      <ellipse cx="27.5" cy="40" rx="9.4" ry="5.5" transform="rotate(-8 27.5 40)"/>
      <ellipse cx="44" cy="45" rx="7.4" ry="4.4" transform="rotate(30 44 45)"/>
    </g>
    <g fill="#fff" opacity=".9">
      <ellipse cx="18.6" cy="23.2" rx="3" ry="1.2" transform="rotate(-24 18.6 23.2)"/>
      <ellipse cx="39.4" cy="27.6" rx="2.6" ry="1.1" transform="rotate(20 39.4 27.6)"/>
    </g>`,

  dragon: `<circle cx="32" cy="33" r="21" fill="#FBE6EC" opacity=".5"/>
    <g fill="#3A2B2B">
      <ellipse cx="22" cy="22" rx="2.6" ry="3.6" transform="rotate(-24 22 22)"/>
      <ellipse cx="32" cy="18" rx="2.6" ry="3.6" transform="rotate(8 32 18)"/>
      <ellipse cx="42" cy="23" rx="2.6" ry="3.6" transform="rotate(30 42 23)"/>
      <ellipse cx="18" cy="34" rx="2.6" ry="3.6" transform="rotate(12 18 34)"/>
      <ellipse cx="29" cy="31" rx="2.6" ry="3.6" transform="rotate(-14 29 31)"/>
      <ellipse cx="40" cy="35" rx="2.6" ry="3.6" transform="rotate(-28 40 35)"/>
      <ellipse cx="24" cy="45" rx="2.6" ry="3.6" transform="rotate(20 24 45)"/>
      <ellipse cx="35" cy="46" rx="2.6" ry="3.6" transform="rotate(-6 35 46)"/>
      <ellipse cx="46" cy="45" rx="2.6" ry="3.6" transform="rotate(26 46 45)"/>
    </g>
    <circle cx="27.6" cy="20.4" r=".9" fill="#fff" opacity=".6"/>`,

  leaf: `<path d="M48 16C30 16 14 30 14 46c0 1 0 2 .2 3C31 48 48 34 48 16z" fill="#78B654"/>
    <path d="M17 47c8-10 18-18 29-26" stroke="#4E8536" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g stroke="#4E8536" stroke-width="1.3" opacity=".55" stroke-linecap="round"><path d="M25 39l-6 2"/><path d="M31 33l-5 1"/><path d="M37 27l-4 1"/></g>
    <path d="M23 41c4-6 10-11 16-15" stroke="#A6D688" stroke-width="1.5" opacity=".7" fill="none"/>`,

  enoki: `<ellipse cx="32" cy="56" rx="13" ry="2.4" fill="rgba(120,80,40,.16)"/>
    <g stroke="#FCF7E6" stroke-width="4.4" stroke-linecap="round"><path d="M22 30v23"/><path d="M32 27v26"/><path d="M42 30v23"/></g>
    <ellipse cx="22" cy="26" rx="6" ry="4.6" fill="#F0D79C"/>
    <ellipse cx="32" cy="23" rx="6.6" ry="5" fill="#F8E4B4"/>
    <ellipse cx="42" cy="26" rx="6" ry="4.6" fill="#F0D79C"/>`,

  chive: `<g transform="rotate(-8 25 33)">
      <rect x="19" y="16" width="12" height="33" rx="6" fill="#5AA84C"/>
      <ellipse cx="25" cy="16.8" rx="6" ry="2.2" fill="#8CD276"/>
      <ellipse cx="25" cy="16.8" rx="2.6" ry=".9" fill="#C8ECB8"/>
    </g>
    <g transform="rotate(12 41 37)">
      <rect x="35" y="24" width="11" height="29" rx="5.5" fill="#4B9440"/>
      <ellipse cx="40.5" cy="24.8" rx="5.5" ry="2" fill="#7FC96A"/>
      <ellipse cx="40.5" cy="24.8" rx="2.4" ry=".85" fill="#BCE7AC"/>
    </g>`,

  chili: `<path d="M15 34c2-11 13-19 25-19 9 0 14 5 12 11-2 5-8 5-13 6-7 1-12 5-14 10-2 5-11 2-10-8z" fill="#D9453C"/>
    <path d="M20 30c3-6 10-10 17-11" stroke="#F0796E" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M44 17c4-2 7-1 7 1.4s-4 3-7 1.6z" fill="#6E9E4A"/>`,

  kelp: `<path d="M22 13c9 2 6 12 1 17-5 5-3 14 6 17" stroke="#2E5C43" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M42 13c-9 2-6 12-1 17 5 5 3 14-6 17" stroke="#37694D" stroke-width="9" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="31" r="4" fill="#487A5C"/>`,

  fungus: `<path d="M16 22.5c8-8.5 22-8.5 29 .5 6 8.5 3 20-7 23-9 3-19-2-22-11-1.6-5-1-9 0-12.5z" fill="#453734"/>
    <path d="M17 22c8-7.6 21-7.6 28 .5" stroke="#75625B" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".9"/>
    <g stroke="#5E4C46" stroke-width="2" fill="none" stroke-linecap="round" opacity=".75">
      <path d="M21 30c2 6.4 7.4 9.6 13.6 9.6"/>
      <path d="M26 24.4c1 8 5.6 13 12.6 15"/>
    </g>
    <ellipse cx="25" cy="24.6" rx="4.6" ry="2.2" fill="#8C7970" opacity=".45"/>`,

  ring: `<circle cx="32" cy="32" r="15.5" fill="none" stroke="#D9453C" stroke-width="8"/>
    <circle cx="32" cy="32" r="15.5" fill="none" stroke="#B33A32" stroke-width="1.4" opacity=".3"/>
    <path d="M21.4 24.4a13.4 13.4 0 0 1 8.6-5" stroke="#F0796E" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="30" cy="36.6" rx="2.4" ry="1.6" fill="#F2C230"/>
    <ellipse cx="38" cy="30" rx="1.8" ry="1.2" fill="#F2C230"/>`,

  star: `<circle cx="32" cy="32" r="8" fill="#A56D36"/>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M32 8.4c2.9 6.2 2.5 11.6 0 15.4-2.5-3.8-2.9-9.2 0-15.4z" fill="#8C5A2C" transform="rotate(${i * 45} 32 32)"/>`).join('')}
    <circle cx="32" cy="32" r="8" fill="none" stroke="#7A4C22" stroke-width="1.2" opacity=".5"/>
    <circle cx="29.4" cy="29.6" r="2.6" fill="#C08A4E" opacity=".7"/>`,

  cabbage: `<g fill="none" stroke-linecap="round">
      <path d="M12 42c9-15 22-20 38-16" stroke="#7E4F9C" stroke-width="5"/>
      <path d="M14 31c11-11 24-13 36-7" stroke="#9B67B8" stroke-width="4.4"/>
      <path d="M18 49c10-6 21-8 30-6" stroke="#6C4387" stroke-width="4"/>
      <path d="M22 22c8-5 17-6 25-3" stroke="#B27FD0" stroke-width="3.4"/>
    </g>`,

  mint: `<path d="M47 15C47 33 33 47 15 47 15 29 29 15 47 15z" fill="#5AB86C"/>
    <path d="M19 43C28 34 36 26 43 19" stroke="#3E8F4F" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g stroke="#3E8F4F" stroke-width="1.4" opacity=".6" stroke-linecap="round"><path d="M25 37l-2 7"/><path d="M31 31l-1 7"/><path d="M37 25l0 7"/></g>
    <path d="M20 42C29 33 37 25 44 18" stroke="#9FE0A8" stroke-width="1.4" opacity=".65" fill="none"/>
    <path d="M51 29l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z" fill="#FFF3B0"/>`,

  king: `<ellipse cx="32" cy="11.5" rx="14" ry="4.4" fill="none" stroke="#FFD86B" stroke-width="2.6" opacity=".95"/>
    <g stroke="#FCF7E6" stroke-width="4.2" stroke-linecap="round">
      <path d="M16 28v24"/><path d="M24 24v28"/><path d="M32 22v30"/><path d="M40 24v28"/><path d="M48 28v24"/>
    </g>
    <ellipse cx="16" cy="24" rx="5.6" ry="4.2" fill="#EFD59A"/>
    <ellipse cx="24" cy="20" rx="6" ry="4.6" fill="#F5DFAE"/>
    <ellipse cx="32" cy="18" rx="6.6" ry="5" fill="#FBE8BC"/>
    <ellipse cx="40" cy="20" rx="6" ry="4.6" fill="#F5DFAE"/>
    <ellipse cx="48" cy="24" rx="5.6" ry="4.2" fill="#EFD59A"/>
    <path d="M55 36l1.4 3.2 3.2 1.4-3.2 1.4-1.4 3.2-1.4-3.2-3.2-1.4 3.2-1.4z" fill="#FFF3B0"/>`,

  tomato: `<path d="M17 19c13-7 27-2 31 9 3 9-4 16-13 14-7-2-11-8-17-9-6-1-8-10-1-14z" fill="#DB4A40"/>
    <path d="M22 21c7-3 14-2 19 2" stroke="#F28077" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85"/>
    <path d="M18 30c6 1 10 6 15 8" stroke="#B23A32" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".45"/>
    <ellipse cx="43" cy="41" rx="4" ry="2" fill="#8E2C25" opacity=".22"/>`,
};

function relicSVG(item, opts = {}) {
  const art = (item && RELIC_ART[item.art]) || RELIC_ART.corn;
  const d = opts.size ? ` width="${opts.size}" height="${opts.size}"` : '';
  return `<svg viewBox="0 0 64 64"${d}>${art}</svg>`;
}

/* 便便精灵 */
function poopSVG(sp, opts = {}) {
  const id = 'g' + ++_svgId;
  const color = sp && sp.color ? sp.color : '#B47B4E';
  const deco = (sp && sp.deco) || 'none';
  const isRainbow = deco === 'rainbow';
  const fill = isRainbow ? `url(#${id})` : color;
  const eye = 'rgba(255,255,255,.95)';
  const pupil = '#2B1A12';

  const decos = {
    none: '',
    leaf: `<path d="M32 17c0-5-4-8-9-8 0 5 4 8 9 8z" fill="#5FD3A8"/><path d="M32 17c0-4 3-7 7-7 0 4-3 7-7 7z" fill="#3FC9AC"/>`,
    ears: `<path d="M20 24l-5-9 10 5z" fill="${fill}"/><path d="M44 24l5-9-10 5z" fill="${fill}"/>`,
    longears: `<ellipse cx="24" cy="12" rx="3.4" ry="9" fill="${fill}" transform="rotate(-12 24 12)"/><ellipse cx="40" cy="12" rx="3.4" ry="9" fill="${fill}" transform="rotate(12 40 12)"/>`,
    monkey: `<circle cx="32" cy="38" r="12" fill="rgba(255,255,255,.25)"/><circle cx="18" cy="34" r="5.5" fill="${fill}"/><circle cx="46" cy="34" r="5.5" fill="${fill}"/>`,
    crown: `<path d="M22 20l2 7h16l2-7-5 4-4-6-4 6z" fill="#FFC93C" stroke="#E0A21F" stroke-width="1"/>`,
    halo: `<ellipse cx="32" cy="13" rx="12" ry="4" fill="none" stroke="#FFD86B" stroke-width="2.6" opacity=".95"/>`,
    sparkle: `<g fill="#FFF3B0"><path d="M50 14l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z"/><path d="M14 22l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z"/></g>`,
    ghost: `<path d="M32 20c-11 0-18 7-18 16 0 4 3 6 6 6 2 0 3-1 4-2 1 2 2 3 4 3s3-1 4-3c1 1 2 2 4 2 3 0 6-2 6-6 0-9-7-16-10-16z" fill="rgba(255,255,255,.18)"/>`,
    rainbow: `<path d="M12 26a20 20 0 0 1 40 0" fill="none" stroke="#FF7BA9" stroke-width="3.2" stroke-linecap="round"/><path d="M17 26a15 15 0 0 1 30 0" fill="none" stroke="#FFC93C" stroke-width="3.2" stroke-linecap="round"/><path d="M22 26a10 10 0 0 1 20 0" fill="none" stroke="#5FD3C8" stroke-width="3.2" stroke-linecap="round"/>`,
  };

  return `<svg viewBox="0 0 64 64" ${opts.size ? `width="${opts.size}" height="${opts.size}"` : ''}>
    ${isRainbow ? `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF9BC4"/><stop offset="35%" stop-color="#FFD86B"/>
      <stop offset="70%" stop-color="#6EE7C8"/><stop offset="100%" stop-color="#8C9CFF"/>
    </linearGradient></defs>` : ''}
    <g>
      <ellipse cx="32" cy="50" rx="21" ry="10" fill="${fill}"/>
      <ellipse cx="32" cy="40" rx="16" ry="9" fill="${fill}"/>
      <ellipse cx="32" cy="31" rx="11" ry="7.6" fill="${fill}"/>
      <path d="M32 17c1.7 3.6 2.6 6.4 2.6 8.8 0 3-1.2 4.9-2.6 4.9s-2.6-1.9-2.6-4.9c0-2.4.9-5.2 2.6-8.8z" fill="${fill}"/>
      <ellipse cx="24" cy="29" rx="4.4" ry="2.6" fill="rgba(255,255,255,.28)" transform="rotate(-18 24 29)"/>
    </g>
    ${decos[deco] || ''}
    <g>
      <ellipse cx="26.5" cy="38" rx="3.3" ry="3.7" fill="${eye}"/>
      <ellipse cx="37.5" cy="38" rx="3.3" ry="3.7" fill="${eye}"/>
      <circle cx="27.2" cy="38.6" r="1.7" fill="${pupil}"/>
      <circle cx="38.2" cy="38.6" r="1.7" fill="${pupil}"/>
      <ellipse cx="32" cy="45" rx="2.6" ry="1.9" fill="rgba(60,30,15,.45)"/>
    </g>
  </svg>`;
}

/* 路由图标 */
const TABS = [
  {
    id: 'today', label: '今日',
    icon: '<svg viewBox="0 0 24 24"><path d="M3.5 10.6 12 3.5l8.5 7.1"/><path d="M5.8 9.6V20h12.4V9.6"/><path d="M9.8 20v-5.2h4.4V20"/></svg>',
  },
  {
    id: 'cal', label: '日历',
    icon: '<svg viewBox="0 0 24 24"><rect x="3.6" y="5.6" width="16.8" height="14.8" rx="2.6"/><path d="M3.6 10.2h16.8"/><path d="M8.2 3.4v4.2"/><path d="M15.8 3.4v4.2"/><path d="M8.4 14.2h2.2"/><path d="M13.4 14.2h2.2"/><path d="M8.4 17.4h2.2"/></svg>',
  },
  {
    id: 'gacha', label: '扭蛋',
    icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.4"/><path d="M3.7 13.8h16.6"/></svg>',
  },
  {
    id: 'stats', label: '统计',
    icon: '<svg viewBox="0 0 24 24"><path d="M4.5 20V12.5"/><path d="M10 20V4.8"/><path d="M15.5 20v-5.4"/><path d="M21 20h-3"/><path d="M3 20h1.5"/></svg>',
  },
  {
    id: 'me', label: '设置',
    icon: '<svg viewBox="0 0 24 24"><path d="M4 7h8.6"/><path d="M17.4 7H20"/><circle cx="15" cy="7" r="2.1"/><path d="M4 12h3.6"/><path d="M11.8 12H20"/><circle cx="9.4" cy="12" r="2.1"/><path d="M4 17h8.6"/><path d="M17.4 17H20"/><circle cx="15" cy="17" r="2.1"/></svg>',
  },
];

/* ---------------- 小红书小工具容器适配层 ----------------
   容器注入 window.xhs.miniTool（离线包，不能联网）。
   平台能力按在线文档优先：saveImageToPhotosAlbum / postNote / vibrateShort / setStorage；
   网页环境（无 window.xhs）全部走原有 Web 路径，两种环境共用一份代码。 */
const ENV = {
  xhs: !!(window.xhs && window.xhs.miniTool),
};

/* 客户端版本：buildVersion 末 3 位是编译序号（9462004 → 9.46.2 → 9462） */
function xhsClientVersion() {
  const lo = window.xhs && window.xhs.launchOptions;
  const bv = Number(lo && lo.miniToolEnv && lo.miniToolEnv.buildVersion) || 0;
  return Math.floor(bv / 1000);
}

const XHS = {
  get mt() { return window.xhs && window.xhs.miniTool; },

  /* 图片存相册：容器内 data URI 直传（在线文档：filePath 接受 data: base64） */
  async saveImage(dataUrl) {
    const mt = this.mt;
    if (!mt || typeof mt.saveImageToPhotosAlbum !== 'function') return false;
    await mt.saveImageToPhotosAlbum({ filePath: dataUrl });
    return true;
  },

  /* 分享图直发小红书笔记：先 writeTempFile 换文件句柄（大 base64 的推荐姿势），失败再退 data URI */
  async postNote(title, content, dataUrl) {
    const mt = this.mt;
    if (!mt || typeof mt.postNote !== 'function') return false;
    let img = dataUrl;
    try {
      if (typeof mt.writeTempFile === 'function') {
        const r = await mt.writeTempFile({ data: dataUrl });
        if (r && r.filePath) img = r.filePath;
      }
    } catch (e) { /* 退回 data URI */ }
    await mt.postNote({
      title: String(title || '').slice(0, 20),
      content: String(content || '').slice(0, 1000),
      pageType: 'photo_publish',
      mediaInfo: { image_resources: [{ url: img }] },
    });
    return true;
  },

  /* 抽卡振动反馈（9.50+）：方法存在性即能力检测，静默失败 */
  vibrate(type) {
    try {
      const mt = this.mt;
      if (mt && typeof mt.vibrateShort === 'function') mt.vibrateShort({ type: type || 'medium' });
    } catch (e) { /* 振动失败不影响玩法 */ }
  },

  /* 平台 Storage（9.46+）：写入，返回是否成功 */
  async setStore(key, jsonStr) {
    const mt = this.mt;
    if (!mt || typeof mt.setStorage !== 'function') return false;
    try {
      await mt.setStorage({ key, data: jsonStr });
      return true;
    } catch (e) { return false; }
  },

  /* 平台 Storage 读取：无能力 / 无数据返回 null */
  async getStore(key) {
    const mt = this.mt;
    if (!mt || typeof mt.getStorage !== 'function') return null;
    try {
      const r = await mt.getStorage({ key });
      return r && r.data != null ? String(r.data) : null;
    } catch (e) { return null; }
  },
};

/* Chrome 61 无 Flex gap：行为检测（创建真实 Flex 容器测量间距，语法检测不可信） */
function supportsFlexGap() {
  const d = document.createElement('div');
  d.style.cssText = 'position:absolute;visibility:hidden;display:flex;flex-direction:column;row-gap:1px';
  d.appendChild(document.createElement('div'));
  d.appendChild(document.createElement('div'));
  document.body.appendChild(d);
  const ok = d.scrollHeight === 1;
  if (d.parentNode) d.parentNode.removeChild(d);
  return ok;
}

/* 无 Flex gap 时的 margin 补偿：读 computed gap，按方向给后续子元素加 margin。
   每次 DOM 重渲染（UI.render / 弹层）后调用；幂等，值相同重复设置无害。 */
function fixFlexGap(root) {
  if (!document.documentElement.classList.contains('no-flex-gap')) return;
  const scope = root || document;
  const all = scope.querySelectorAll('*');
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    const cs = getComputedStyle(el);
    if (cs.display !== 'flex' && cs.display !== 'inline-flex') continue;
    const dir = cs.flexDirection || 'row';
    if (dir.indexOf('reverse') >= 0) continue; /* reverse 布局罕见，跳过保平安 */
    const col = dir === 'column';
    const gap = parseFloat(col ? cs.rowGap : cs.columnGap) || 0;
    if (!gap) continue;
    let prev = null;
    for (let k = el.firstElementChild; k; k = k.nextElementSibling) {
      if (prev) {
        if (col) prev.style.marginBottom = gap + 'px';
        else prev.style.marginRight = gap + 'px';
      }
      prev = k;
    }
  }
}

/* ---------------- 存储层 ---------------- */
const STORE_KEY = 'pooplog.v1';

function blankState() {
  return {
    v: 1,
    theme: 'macaron',
    machineSkin: 'toilet',
    profile: { name: '' },
    days: {},
    gacha: { tickets: 3, collection: {}, tiers: {}, pulls: 0 },
    firstRun: todayKey(),
    seenAch: {},
  };
}

const S = {
  state: blankState(),

  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = Object.assign(blankState(), parsed);
        this.state.gacha = Object.assign({ tickets: 3, collection: {}, pulls: 0 }, parsed.gacha || {});
        this.state.profile = Object.assign({ name: '' }, parsed.profile || {});
        /* 老版本抽到的便便精灵，按映射表换成新残渣，收藏不清零 */
        const rawCols = this.state.gacha.collection || {};
        const cols = {};
        Object.keys(rawCols).forEach((k) => {
          const nid = RELICS.some((r) => r.id === k) ? k : LEGACY_MAP[k];
          if (nid) cols[nid] = (cols[nid] || 0) + rawCols[k];
        });
        this.state.gacha.collection = cols;
        /* 旧版本（有农场）留下的字段，读进来直接丢掉并回写一次 */
        if (parsed.farm) {
          delete this.state.farm;
          this.save();
        }
      } else {
        this.state = blankState();
      }
    } catch (e) {
      console.warn('读取失败，使用默认数据', e);
      this.state = blankState();
    }
  },

  save() {
    /* 小红书容器：平台 Storage 优先（9.46+，单 key 上限 1MB，超限剥音频重试一次） */
    if (ENV.xhs) {
      const json = JSON.stringify(this.state);
      XHS.setStore(STORE_KEY, json).then((ok) => {
        if (!ok && json.length > 900000) {
          const slim = JSON.stringify(this.state, (k, v) => {
            if (k === 'audio' && typeof v === 'string' && v.length > 500) return '';
            return v;
          });
          return XHS.setStore(STORE_KEY, slim);
        }
        return ok;
      }).catch(() => {});
    }
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
      this.storageDead = false;
    } catch (e) {
      console.warn('保存失败', e);
      /* 配额满：先把录音这类大对象剥掉重试一次（数据本体比语音重要） */
      let stripped = 0;
      try {
        const slim = JSON.stringify(this.state, (k, v) => {
          if (k === 'audio' && typeof v === 'string' && v.length > 500) { stripped++; return ''; }
          return v;
        });
        localStorage.setItem(STORE_KEY, slim);
      } catch (e2) { this.storageDead = true; }
      if (typeof UI !== 'undefined' && UI.toast) {
        if (!this.storageDead && stripped) UI.toast('本地空间不足，已清掉 ' + stripped + ' 条语音保住记录');
        else if (this.storageDead && !this.quotaWarned) {
          this.quotaWarned = true;
          UI.toast('当前环境存不进本地，改动刷新后会丢');
        }
        /* storageDead 后续保存全部静默（内存态照常工作），不再骚扰 */
      }
    }
  },

  day(key = todayKey(), create = false) {
    let d = this.state.days[key];
    if (!d && create) {
      d = { entries: [], mood: 0, diary: '' };
      this.state.days[key] = d;
    }
    return d;
  },

  hasPooped(key = todayKey()) {
    const d = this.state.days[key];
    return !!(d && d.entries && d.entries.length);
  },

  /* 连续记录天数（今天没记则从昨天往前数） */
  streak() {
    let n = 0;
    let cur = new Date();
    if (!this.hasPooped(fmtDate(cur))) cur = addDays(cur, -1);
    for (let i = 0; i < 400; i++) {
      if (this.hasPooped(fmtDate(cur))) {
        n++;
        cur = addDays(cur, -1);
      } else break;
    }
    return n;
  },

  longestStreak() {
    const keys = Object.keys(this.state.days).filter((k) => this.hasPooped(k)).sort();
    let best = 0, run = 0, prev = null;
    keys.forEach((k) => {
      if (prev && diffDays(prev, k) === 1) run++;
      else run = 1;
      prev = k;
      best = Math.max(best, run);
    });
    return best;
  },

  monthKeys(offset = 0) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + offset;
    const first = new Date(y, m, 1);
    const days = [];
    const total = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= total; i++) days.push(fmtDate(new Date(first.getFullYear(), first.getMonth(), i)));
    return { days, firstWeekday: first.getDay(), first };
  },
};

function allEntries(state) {
  const out = [];
  Object.keys(state.days || {}).forEach((k) => {
    (((state.days[k] || {}).entries) || []).forEach((e) => out.push(Object.assign({ date: k }, e)));
  });
  return out.sort((a, b) => (a.date < b.date ? -1 : 1));
}

/* ---------------- UI 基础设施 ---------------- */
const UI = {
  view: null,
  tabbar: null,
  current: 'today',

  init() {
    this.view = $('#view');
    this.tabbar = $('#tabbar');
    this.renderTabs();
    this.applyTheme(S.state.theme);

    this.tabbar.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.tab');
      if (btn) this.go(btn.dataset.tab);
    });

    this.view.addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-act]');
      if (el) Actions.handle(el.dataset.act, el, ev);
    });
    this.view.addEventListener('input', (ev) => {
      if (ev.target.id === 'diaryBox') Actions.onDiaryInput(ev.target.value);
      if (ev.target.id === 'noteBox') Actions.onNoteInput(ev.target.value);
    });
    this.view.addEventListener('change', (ev) => {
      if (ev.target.id === 'nameInput') Actions.onNameInput(ev.target.value);
    });
  },

  applyTheme(name) {
    S.state.theme = name;
    document.documentElement.setAttribute('data-theme', name);
    const meta = document.querySelector('meta[name="theme-color"]');
    const map = { macaron: '#FFF4EC', pixel: '#1B1038', cosmos: '#0A0E1C' };
    if (meta) meta.setAttribute('content', map[name] || '#FFF4EC');
  },

  go(tab) {
    if (!TABS.some((t) => t.id === tab)) tab = 'today';
    /* 今日页永远对着今天：从日历切回来时把选中的日期收回今天 */
    if (tab === 'today' && Cal.sel !== todayKey()) {
      Draft.flush();
      Cal.sel = todayKey();
      Cal.offset = 0;
      Draft.sync(true);
    }
    this.current = tab;
    this.renderTabs();
    this.render();
    this.view.scrollTop = 0;
  },

  renderTabs() {
    this.tabbar.innerHTML = TABS.map((t) => {
      const sel = t.id === this.current;
      let badge = '';
      if (t.id === 'gacha' && S.state.gacha.tickets > 0) badge = `<span class="badge">${S.state.gacha.tickets}</span>`;
      return `<button class="tab" role="tab" data-tab="${t.id}" aria-selected="${sel}" type="button">${t.icon}<span>${t.label}</span>${badge}</button>`;
    }).join('');
  },

  render() {
    const fn = {
      today: Views.today,
      cal: Views.calendar,
      gacha: Views.gacha,
      stats: Views.stats,
      me: Views.me,
    }[this.current];
    this.view.innerHTML = `<div class="page">${fn.call(Views)}</div>`;
    this.updateTopbar();
    this.renderTabs();
    fixFlexGap(this.view);
  },

  /* 日历页切日期：只更新选中态和下方三个区块，日历格子 DOM 不重建——画面不闪 */
  updateCalSelection() {
    const k = Cal.sel;
    document.querySelectorAll('[data-act="cal-pick"]').forEach((c) => {
      const on = c.dataset.k === k;
      c.classList.toggle('is-sel', on);
      c.setAttribute('aria-pressed', on);
    });
    const area = document.getElementById('calSelArea');
    if (area) area.outerHTML = Views.calSelArea();
    const mood = document.getElementById('moodCard');
    if (mood) mood.innerHTML = Views.moodCardInner();
    const list = document.getElementById('calEntryList');
    if (list) {
      const ents = (S.state.days[k] || {}).entries || [];
      list.innerHTML = ents.length ? Views.entryList(ents, k) : '';
    }
  },

  updateTopbar() {
    const st = S.streak();
    $('#streakNum').textContent = st;
    $('#brandMark').innerHTML = poopSVG({ color: '#B47B4E' });
    $('#brandTitle').textContent = '拉了吗？';
    const subs = {
      today: '今天，通畅了吗？',
      cal: '每一天都记在这儿',
      gacha: '冲出便便盲盒，看看能开出什么',
      stats: '你的肠道，有数据了',
      me: '调成你喜欢的样子',
    };
    $('#brandSub').textContent = subs[this.current] || '';
    $('#streakChip').style.display = st > 0 ? '' : 'none';
  },

  toast(msg, ms = 2000) {
    /* 同一条提示 4 秒内不重复弹（存储异常等场景不再连环轰炸） */
    const now = Date.now();
    if (this._lastToastMsg === msg && now - (this._lastToastAt || 0) < 4000) return;
    this._lastToastMsg = msg;
    this._lastToastAt = now;
    const wrap = $('#toastWrap');
    while (wrap.children.length >= 2) wrap.firstElementChild.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .25s, transform .25s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-6px)';
      setTimeout(() => el.remove(), 280);
    }, ms);
  },

  sheet(html) {
    const wrap = $('#sheetWrap');
    wrap.innerHTML = `<div class="sheet-mask" data-close="1"></div><div class="sheet"><div class="sheet-grip"></div>${html}</div>`;
    wrap.classList.add('open');
    wrap.onclick = (ev) => {
      if (ev.target.dataset.close || ev.target.closest('[data-close-sheet]')) UI.closeSheet();
    };
    const inner = wrap.querySelector('.sheet');
    if (inner) {
      inner.addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-act]');
        if (b) Actions.handle(b.dataset.act, b, ev);
      });
      inner.addEventListener('input', (ev) => {
        /* 补记弹层的感悟框：打字实时存进草稿，弹层重渲染不丢内容 */
        if (ev.target.id === 'bfNoteBox') Backfill.note = ev.target.value;
      });
    }
    fixFlexGap(wrap);
  },

  closeSheet() {
    const wrap = $('#sheetWrap');
    wrap.classList.remove('open');
    wrap.innerHTML = '';
  },

  confetti() {
    const wrap = $('#confettiWrap');
    const colors = ['#FF8C6B', '#FFC857', '#3FC9AC', '#7C6CF7', '#FF6E8E', '#59D8FF'];
    for (let i = 0; i < 26; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + '%';
      c.style.top = Math.random() * 36 + '%';
      c.style.background = pick(colors);
      c.style.animationDelay = Math.random() * 0.25 + 's';
      c.style.transform = `rotate(${rand(360)}deg)`;
      if (Math.random() > 0.6) c.style.borderRadius = '50%';
      wrap.appendChild(c);
      setTimeout(() => c.remove(), 1900);
    }
  },
};

/* ---------------- 抽奖逻辑 ---------------- */
const Gacha = {
  rollRarity() {
    const total = Object.values(RARITY_WEIGHT).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (const k of ['SSR', 'SR', 'R', 'N']) {
      r -= RARITY_WEIGHT[k];
      if (r <= 0) return k;
    }
    return 'N';
  },

  pull() {
    const rarity = this.rollRarity();
    const pool = RELICS.filter((s) => s.rarity === rarity);
    return pick(pool);
  },
};

/* =========================================================
   今日页草稿状态
   ========================================================= */
const Cal = { offset: 0, sel: todayKey() };

const Draft = {
  key: null,
  bristol: 4,
  smooth: 3,
  amount: 2,
  color: 'brown',
  mood: 0,
  diary: '',
  note: '',
  audio: '',
  timer: null,

  /* 跟随日历选中的那一天 */
  sync(force = false) {
    const k = Cal.sel;
    if (this.key === k && !force) return;
    this.key = k;
    const d = S.day(k);
    this.mood = (d && d.mood) || 0;
    this.diary = (d && d.diary) || '';
  },

  persist() {
    const d = S.day(Cal.sel, true);
    d.mood = this.mood;
    d.diary = this.diary;
    S.save();
  },

  queuePersist() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 350);
  },

  /* 今天写了心情或日记 → 送 1 张券，一天只送一次，补记历史日期不送 */
  grantMoodTicket() {
    if (Cal.sel !== todayKey()) return 0;
    const d = S.day(Cal.sel, true);
    if (d.moodGiven) return 0;
    if (!d.mood && !(d.diary && d.diary.trim())) return 0;
    d.moodGiven = true;
    S.state.gacha.tickets = (S.state.gacha.tickets || 0) + 1;
    S.save();
    return 1;
  },

  /* 切日期 / 切页面前把没落盘的日记写回正确的日期 */
  flush() {
    clearTimeout(this.timer);
    if (this.key !== Cal.sel) return;
    const d = S.day(Cal.sel, true);
    d.diary = this.diary;
    S.save();
    if (this.grantMoodTicket()) {
      UI.toast('心情记下了 · 扭蛋券 +1 🎫');
      UI.renderTabs();
    }
  },
};

/* 日历补记：给过去的某一天补一条便便记录。
   独立草稿，不与今日页的 Draft 混用；补记不发券，但计入统计与连续天数 */
const Backfill = {
  key: null,
  bristol: 4,
  smooth: 3,
  amount: 2,
  color: 'brown',
  note: '',

  reset(key) {
    this.key = key;
    this.bristol = 4;
    this.smooth = 3;
    this.amount = 2;
    this.color = 'brown';
    this.note = '';
  },

  html() {
    const k = this.key;
    if (!k) return '';
    const dt = keyToDate(k);
    const bi = bristolInfo(this.bristol);
    const grid = BRISTOL.map((b) => `
      <button class="bristol-item ${b.t === 4 ? 'best' : ''}" data-act="bf-set-bristol" data-v="${b.t}" aria-pressed="${this.bristol === b.t}" type="button">
        ${bristolSVG(b.t)}
        <span class="bnum">${b.t} 型</span>
        <span class="bname">${b.name}</span>
      </button>`).join('');
    const smooth = SMOOTH.map((s) => `
      <button class="seg-smooth" data-act="bf-set-smooth" data-v="${s.v}" aria-pressed="${this.smooth === s.v}" title="${s.sub}" type="button">
        <span class="seg-ico">${smoothSVG(s.v)}</span>
        <span class="seg-tx">${s.label}</span>
      </button>`).join('');
    const amount = AMOUNTS.map((a) => `
      <button class="seg-amt" data-act="bf-set-amount" data-v="${a.v}" aria-pressed="${this.amount === a.v}" type="button">
        <span class="seg-ico">${amountSVG(a.v)}</span>
        <span class="seg-tx">${a.label}</span>
      </button>`).join('');
    const colors = COLORS.map((c) => `
      <button class="color-dot ${c.warn ? 'warn' : ''}" style="--c:${c.css}" data-act="bf-set-color" data-v="${c.v}" aria-pressed="${this.color === c.v}" title="${c.name}" type="button"></button>`).join('');

    return `
      <h3>补记便便</h3>
      <p class="sheet-sub">${dt.getMonth() + 1} 月 ${dt.getDate()} 日 · 星期${WEEKDAY[dt.getDay()]}<br>补记不发券，但次数、形态都会算进统计和连续天数</p>

      <div class="sub-label">便便形状<em>${bi.t} 型 · ${bi.name}</em></div>
      <div class="bf-card"><div class="bristol-grid">${grid}</div></div>

      <div class="sub-label">通畅程度<em>${(SMOOTH.find((s) => s.v === this.smooth) || SMOOTH[2]).sub}</em></div>
      <div class="bf-card"><div class="seg seg-smooths">${smooth}</div></div>

      <div class="sub-label">量</div>
      <div class="bf-card"><div class="seg seg-amts">${amount}</div></div>

      <div class="sub-label">颜色</div>
      <div class="bf-card"><div class="color-row">${colors}</div></div>

      <div class="sub-label">拉屎感悟<em>可以留空</em></div>
      <div class="bf-card">
        <textarea class="diary note-box" id="bfNoteBox" placeholder="那天什么感觉、吃了什么…">${esc(this.note)}</textarea>
      </div>

      <button class="btn btn-primary btn-block" data-act="bf-submit" style="margin-top:14px">补上这一笔</button>
      <button class="btn btn-ghost btn-block" data-close-sheet style="margin-top:8px">算了</button>`;
  },
};

/* =========================================================
   视图渲染
   ========================================================= */
const WEEKDAY = ['日', '一', '二', '三', '四', '五', '六'];
const BRISTOL_COLOR = { 1: '#6B4426', 2: '#7D5230', 3: '#8F6139', 4: '#A5713F', 5: '#C08A55', 6: '#D6A26A', 7: '#E8BE86' };

function bristolInfo(t) {
  return BRISTOL.find((b) => b.t === t) || BRISTOL[3];
}
function colorInfo(v) {
  return COLORS.find((c) => c.v === v) || COLORS[0];
}

const Views = {
  /* ---------------- 今日 ---------------- */
  today() {
    Draft.sync();
    const key = todayKey();
    const d = S.day(key);
    const entries = (d && d.entries) || [];
    const recorded = entries.length > 0;
    const now = new Date();
    const dateStr = `${now.getMonth() + 1} 月 ${now.getDate()} 日 · 星期${WEEKDAY[now.getDay()]}`;
    const name = (S.state.profile.name || '').trim();
    const who = name ? `，${esc(name)}` : '';
    const tickets = S.state.gacha.tickets || 0;

    const heroInner = recorded
      ? `<div class="hero-date">${dateStr}</div>
         <p class="hero-q">今天已经记了 ${entries.length} 次 ✅</p>
         <p class="hero-sub">连续 ${S.streak()} 天 · 扭蛋券 ${tickets} 张</p>
         <div class="hero-actions">
           <button class="hero-btn solid" data-act="start-yes">再记一笔</button>
           <button class="hero-btn ghosty" data-act="go-gacha">去扭蛋 →</button>
         </div>`
      : `<div class="hero-date">${dateStr}</div>
         <p class="hero-q">今天拉了吗${who}？</p>
         <div class="hero-actions">
           <button class="hero-btn solid" data-act="start-yes">✅ 拉了</button>
           <button class="hero-btn ghosty" data-act="start-no">❌ 还没</button>
         </div>`;

    const monthN = S.monthKeys().days.filter((k) => S.hasPooped(k)).length;

    return `
      <section class="hero">${heroInner}</section>
      <p class="hero-foot">本月已记 <b>${monthN}</b> 天 · 连续 <b>${S.streak()}</b> 天
        <button class="link-btn" data-act="go-cal" type="button">看日历 →</button>
      </p>
      ${this.poopForm()}`;
  },

  /* ---------------- 日历（便便日历 + 心情日记） ---------------- */
  calendar() {
    Draft.sync();
    const selEnts = (S.state.days[Cal.sel] || {}).entries || [];
    const list = selEnts.length ? this.entryList(selEnts, Cal.sel) : '';
    return `
      ${this.calCard()}
      <div id="moodCard">${this.moodCardInner()}</div>
      <div id="calEntryList">${list}</div>`;
  },

  poopForm() {
    const bi = bristolInfo(Draft.bristol);
    const grid = BRISTOL.map((b) => `
      <button class="bristol-item ${b.t === 4 ? 'best' : ''}" data-act="set-bristol" data-v="${b.t}" aria-pressed="${Draft.bristol === b.t}" type="button">
        ${bristolSVG(b.t)}
        <span class="bnum">${b.t} 型</span>
        <span class="bname">${b.name}</span>
      </button>`).join('');

    const smooth = SMOOTH.map((s) => `
      <button class="seg-smooth" data-act="set-smooth" data-v="${s.v}" aria-pressed="${Draft.smooth === s.v}" title="${s.sub}" type="button">
        <span class="seg-ico">${smoothSVG(s.v)}</span>
        <span class="seg-tx">${s.label}</span>
      </button>`).join('');

    const amount = AMOUNTS.map((a) => `
      <button class="seg-amt" data-act="set-amount" data-v="${a.v}" aria-pressed="${Draft.amount === a.v}" type="button">
        <span class="seg-ico">${amountSVG(a.v)}</span>
        <span class="seg-tx">${a.label}</span>
      </button>`).join('');

    const colors = COLORS.map((c) => `
      <button class="color-dot ${c.warn ? 'warn' : ''}" style="--c:${c.css}" data-act="set-color" data-v="${c.v}" aria-pressed="${Draft.color === c.v}" title="${c.name}" type="button"></button>`).join('');

    const todayD = S.day(todayKey()) || {};
    const gotTicket = !!todayD.ticketGiven;
    const smoothSub = (SMOOTH.find((s) => s.v === Draft.smooth) || SMOOTH[2]).sub;

    return `
      <div class="sec-head"><h2>便便形状</h2><span class="hint">布里斯托分类</span></div>
      <div class="card">
        <div class="bristol-grid">${grid}</div>
        <p class="bristol-desc"><b>${bi.t} 型 · ${bi.name}</b> — ${bi.desc}</p>
      </div>

      <div class="sec-head"><h2>细节</h2><span class="hint">通畅 · 量 · 颜色</span></div>
      <div class="card">
        <div class="sub-label">通畅程度<em>${smoothSub}</em></div>
        <div class="seg seg-smooths">${smooth}</div>

        <div class="sub-label">量</div>
        <div class="seg seg-amts">${amount}</div>

        <div class="sub-label">颜色</div>
        <div class="color-row">${colors}</div>
        <p class="field-tip">颜色只是参考，吃的东西会直接影响。如果出现发黑或带血，建议留意并咨询医生。</p>
      </div>

      <div class="sec-head"><h2>拉屎感悟</h2><span class="hint">写一段，或者录一段</span></div>
      <div class="card">
        <textarea class="diary note-box" id="noteBox" placeholder="这一趟什么感觉、吃了什么、哪儿不舒服…">${esc(Draft.note || '')}</textarea>
        <div class="note-bar">
          <button class="mic-btn${Rec.mr ? ' rec' : ''}" data-act="voice-note" id="micBtn" type="button" aria-pressed="${Rec.mr ? 'true' : 'false'}">
            <span class="mic-ico">${Rec.mr ? '⏹' : (Draft.audio ? '🎧' : '🎙')}</span>
            <span class="mic-tx">${Rec.mr ? '录音中 0:00' : (Draft.audio ? '重新录' : '录音')}</span>
          </button>
          <span class="note-tip">${Rec.mr ? `最长 ${Rec.max} 秒，点一下停` : '录下来，回头还能听'}</span>
        </div>
        ${Draft.audio ? `<div class="audio-chip">
          <audio controls preload="metadata" src="${Draft.audio}"></audio>
          <button class="audio-del" data-act="del-audio" type="button">删掉</button>
        </div>` : ''}
      </div>

      <button class="btn btn-primary btn-block" data-act="submit-poop" style="margin-top:14px">记录</button>
      ${gotTicket ? '<p class="auto-save" style="text-align:center;margin-top:8px">今天的券已经领过，这一笔算补记</p>' : ''}
      <button class="share-entry" data-act="share" type="button">
        <span class="se-ico">📸</span>
        <span class="se-tx"><b>生成今天的分享图</b><em>把今天的每一趟便便情况拼成一张长图</em></span>
        <span class="se-go">→</span>
      </button>`;
  },

  /* 便便日历：一格一天，能看拉没拉，也能记心情 */
  calCard() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth() + Cal.offset, 1);
    const y = first.getFullYear();
    const m = first.getMonth();
    const total = new Date(y, m + 1, 0).getDate();
    const tk = todayKey();

    const cells = [];
    for (let i = 0; i < first.getDay(); i++) cells.push('<div class="calx-cell blank"></div>');
    for (let i = 1; i <= total; i++) {
      const k = fmtDate(new Date(y, m, i));
      const day = S.state.days[k];
      const ents = (day && day.entries) || [];
      const mood = day && day.mood ? MOODS.find((x) => x.v === day.mood) : null;
      const future = k > tk;
      const cls = ['calx-cell'];
      if (ents.length) cls.push('has');
      if (mood) cls.push('has-mood');
      if (k === tk) cls.push('is-today');
      if (k === Cal.sel) cls.push('is-sel');
      if (future) cls.push('future');
      /* 当天的形态用最后一条记录，浅底 + 图标，不用屎色背景 */
      const lastB = ents.length ? ents[ents.length - 1].bristol : 0;
      cells.push(`<button class="${cls.join(' ')}" data-act="cal-pick" data-k="${k}" ${future ? 'disabled' : ''} type="button" aria-pressed="${k === Cal.sel}" aria-label="${m + 1}月${i}日${ents.length ? '，已记录' : '，没记录'}${mood ? '，心情' + mood.name : ''}">
        <span class="calx-d">${i}</span>
        ${lastB ? `<span class="calx-shape">${bristolSVG(lastB, { gap: 'var(--bg-soft)' })}</span>` : ''}
        ${mood ? `<span class="calx-m">${mood.emo}</span>` : ''}
        ${ents.length > 1 ? `<span class="calx-n">×${ents.length}</span>` : ''}
      </button>`);
    }
    const dow = WEEKDAY.map((w) => `<div class="calx-dow">${w}</div>`).join('');

    return `
      <div class="sec-head"><h2>便便日历</h2><span class="hint">点日期看那天</span></div>
      <div class="card">
        <div class="calx-head">
          <button class="calx-nav" data-act="cal-month" data-d="-1" type="button" aria-label="上个月">‹</button>
          <span class="calx-title">${y} 年 ${m + 1} 月</span>
          <button class="calx-nav" data-act="cal-month" data-d="1" type="button" aria-label="下个月" ${Cal.offset >= 0 ? 'disabled' : ''}>›</button>
        </div>
        <div class="calx">${dow}${cells.join('')}</div>
        <div class="calx-legend">
          <span class="ln"><i class="lg-has"></i>有记录</span>
          <span class="ln"><i class="lg-today"></i>今天</span>
          <span class="ln"><i class="lg-empty"></i>没记</span>
        </div>
        <p class="calx-note">格子里是当天最后一次的形态，右上角 ×N 是当天几次，右下角是那天的心情。点开可以看每一趟。</p>
        ${this.calSelArea()}
      </div>`;
  },

  /* 选中栏 + 补记按钮：切换日期时只替换这一块，日历格子不重建（画面不闪） */
  calSelArea() {
    const selDay = S.state.days[Cal.sel];
    const selEnts = (selDay && selDay.entries) || [];
    const isSelToday = Cal.sel === todayKey();
    const selDate = keyToDate(Cal.sel);
    let sum = '';
    if (selEnts.length) {
      const avg = selEnts.reduce((a, e) => a + (e.smooth || 0), 0) / selEnts.length;
      const kinds = [...new Set(selEnts.map((e) => e.bristol))].map((t) => `${t} 型`).join(' / ');
      sum = `${selEnts.length} 次 · ${kinds} · 通畅 ${avg.toFixed(1)}`;
    } else {
      sum = isSelToday ? '还没记录' : '这天没有记录，可以补一记';
    }
    return `
      <div id="calSelArea">
        <div class="calx-selbar">
          <b>${isSelToday ? '今天' : `${selDate.getMonth() + 1} 月 ${selDate.getDate()} 日 · 周${WEEKDAY[selDate.getDay()]}`}</b>
          <span>${sum}</span>
        </div>
        ${isSelToday ? '' : `
        <button class="bf-open-btn" data-act="bf-open" type="button">
          <span class="bf-open-ico">➕</span>补记便便情况
        </button>`}
      </div>`;
  },

  /* 心情与日记：跟着日历选中的那一天走，便便记录留在上面。
     moodCardInner 供整页渲染与局部替换共用，外层由调用方包 #moodCard */
  moodCardInner() {
    const isSelToday = Cal.sel === todayKey();
    const selDate = keyToDate(Cal.sel);
    const when = isSelToday ? '今天' : `${selDate.getMonth() + 1} 月 ${selDate.getDate()} 日`;
    const cur = MOODS.find((x) => x.v === Draft.mood);

    const moods = MOODS.map((mo) => `
      <button class="mood-btn" data-act="set-mood" data-v="${mo.v}" aria-pressed="${Draft.mood === mo.v}" title="${mo.name}" type="button">${mo.emo}</button>`).join('');

    return `
      <div class="sec-head"><h2>${when}的心情</h2><span class="hint">${cur ? cur.name : '选一个'}</span></div>
      <div class="card">
        <div class="mood-row">${moods}</div>
        <div class="tip-line">想说的话</div>
        <textarea class="diary" id="diaryBox" placeholder="${isSelToday ? '今天肚子怎么样，吃了什么，心情如何…' : '回想一下这一天…'}">${esc(Draft.diary)}</textarea>
        <p class="auto-save">自动保存</p>
      </div>`;
  },

  entryList(entries, key) {
    const k = key || todayKey();
    const dt = keyToDate(k);
    const title = k === todayKey() ? '今天的时间线' : `${dt.getMonth() + 1} 月 ${dt.getDate()} 日的时间线`;
    const items = entries.map((e) => {
      const b = bristolInfo(e.bristol);
      const c = colorInfo(e.color);
      return `<div style="display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid var(--line)">
        <div style="width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:12px;background:var(--bg-soft)">
          ${bristolSVG(e.bristol)}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:800">${b.t} 型 · ${b.name}</div>
          <div style="font-size:11px;color:var(--text-2);margin-top:2px">
            ${e.time || ''} · 通畅 ${e.smooth}/5 · ${(AMOUNTS.find((a) => a.v === e.amount) || AMOUNTS[1]).label}
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c.css};margin-left:4px;vertical-align:middle"></span>
          </div>
          ${e.note ? `<p class="et-note">${esc(e.note)}</p>` : ''}
          ${e.audio ? `<audio class="et-audio" controls preload="none" src="${e.audio}"></audio>` : ''}
        </div>
        <button class="mini-btn" style="background:var(--bg-soft);color:var(--text-2)" data-act="del-entry" data-id="${e.id}" type="button">删</button>
      </div>`;
    }).join('');
    return `
      <div class="sec-head"><h2>${title}</h2><span class="hint">${entries.length} 条</span></div>
      <div class="card" style="padding:4px 16px">${items}</div>`;
  },

  /* ---------------- 扭蛋 ---------------- */
  gacha() {
    const g = S.state.gacha;
    const cols = g.collection || {};
    const owned = Object.keys(cols).length;
    const tickets = g.tickets || 0;

    const PIPS = 8;
    const pips = Array.from({ length: PIPS }, (_, i) => `<i class="pip ${i < Math.min(tickets, PIPS) ? '' : 'off'}"></i>`).join('');

    const dex = RELICS.map((sp) => {
      const n = cols[sp.id] || 0;
      const tier = (g.tiers || {})[sp.id] || 0;
      const canSynth = n ? tier < tierByN(n) : false;
      /* 档位靠设计区别：星级 + 银/金托座边框 + 黄金皇冠 */
      const stars = n ? `<span class="stars t${tier}">${tierStars(tier)}</span>` : '';
      const crown = tier >= 2 ? CROWN_SVG : '';
      const pct = tierProgress(n, tier);
      const bar = n ? `<span class="mini-bar${tier >= 2 ? ' full' : canSynth ? ' ready' : pct >= 60 ? ' near' : ''}"><i style="width:${pct}%"></i></span>` : '';
      const synthTag = canSynth ? '<span class="synth-tag">⚒ 可合成</span>' : '';
      return `<button class="dex-item ${n ? '' : 'locked'}${n && tier ? ' tier' + tier : ''}${canSynth ? ' ready' : ''}" data-act="dex" data-id="${sp.id}" aria-pressed="false" type="button">
        ${n ? `<span class="count">${n}</span>` : ''}
        ${synthTag}
        <span class="sprite-wrap">${relicSVG(sp)}${crown}</span>
        ${stars}
        <span class="dn">${n ? sp.name : '???'}</span>
        ${bar}
      </button>`;
    }).join('');

    /* 玻璃罩里堆着的便便 */
    const capsHTML = DOME_CAPS.map((c) => `<span class="poop-cap" style="left:${c.x}px;top:${c.y}px"><b class="pc-in" style="font-size:${c.s}px;--d:${c.d}s;--r:${c.r}deg">💩</b></span>`).join('');

    const skin = S.state.machineSkin === 'ball' ? 'ball' : 'toilet';
    const tip = tickets > 0
      ? (skin === 'ball' ? '转一下机器上的摇把 ↑' : '拨一下水箱右边的冲水杆，冲出便便扭蛋 →')
      : '没有券了，先去记一笔';

    let machineHTML = '';
    if (skin === 'ball') {
      machineHTML = `
        <div class="machine${tickets <= 0 ? ' no-ticket' : ''}" id="machine">
          <div class="machine-shadow"></div>
          <div class="dome">
            <div class="caps" id="caps">${capsHTML}</div>
            <div class="dome-glow"></div>
            <div class="dome-shine"></div>
          </div>
          <div class="dome-collar"></div>
          <div class="machine-body">
            <div class="machine-plate"></div>
            <button class="knob-zone" id="knobZone" type="button" data-act="do-pull" aria-label="转动摇把，抽一颗扭蛋">
              <span class="knob" id="knob"><i class="knob-slot"></i></span>
            </button>
            <div class="body-side">
              <div class="machine-label">POOP GACHA</div>
              <div class="slot"><i class="slot-flap"></i></div>
            </div>
            <span class="screw s1"></span><span class="screw s2"></span>
          </div>
          <div class="drop-cap" id="dropCap">
            <div class="cap-halo" id="capHalo"></div>
            <svg class="cap-svg" viewBox="0 0 56 56" aria-hidden="true">
              <defs>
                <linearGradient id="capUpG" x1=".18" y1="0" x2=".82" y2="1">
                  <stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FBEEDA"/><stop offset="1" stop-color="#DEC08F"/>
                </linearGradient>
                <linearGradient id="capLoG" x1=".18" y1="0" x2=".82" y2="1">
                  <stop offset="0" stop-color="#F2A968"/><stop offset=".45" stop-color="#C4762E"/><stop offset="1" stop-color="#7B4316"/>
                </linearGradient>
              </defs>
              <g class="cap-top" id="capTop">
                <path d="M4 28.4a24 24 0 0 1 48 0z" fill="url(#capUpG)"/>
                <ellipse cx="18" cy="14.6" rx="7.6" ry="4.2" fill="#FFFFFF" opacity=".75" transform="rotate(-28 18 14.6)"/>
              </g>
              <g class="cap-btm" id="capBtm">
                <path d="M4 28.4a24 24 0 0 0 48 0z" fill="url(#capLoG)"/>
                <ellipse cx="17.5" cy="40" rx="6.4" ry="3" fill="#FFFFFF" opacity=".26"/>
              </g>
              <rect class="cap-seam" x="4" y="27.4" width="48" height="1.8" rx=".9" fill="#FFF6E4" opacity=".85"/>
            </svg>
          </div>
        </div>`;
    } else {
      machineHTML = toiletMachineHTML(tickets);
    }

    return `
      <div class="machine-wrap">${machineHTML}</div>
      ${skin === 'toilet' ? poopCineHTML() : ''}
      <p class="machine-tip">${tip}</p>

      <div class="ticket-bar">
        <div class="tb-main">
          <span class="tb-label">扭蛋券</span><b>${tickets}</b>
          <div class="ticket-pips">${pips}</div>
        </div>
        <p class="tb-hint">记一次便便 +1 · 写心情或日记 +1 · 形态健康（3/4 型）再 +1</p>
      </div>

      <div class="sec-head"><h2>扭蛋图鉴</h2><span class="hint">${owned} / ${RELICS.length}</span></div>
      <div class="dex-grid">${dex}</div>
      <p style="margin:10px 2px 0;font-size:10.5px;line-height:1.7;color:var(--text-3)">扭蛋可合成升级，升级会再送扭蛋券。</p>`;
  },

  /* ---------------- 统计 ---------------- */
  stats() {
    const all = allEntries(S.state);
    const month = S.monthKeys();
    const monthPooped = month.days.filter((k) => S.hasPooped(k)).length;
    const avgSmooth = all.length ? (all.reduce((a, e) => a + (e.smooth || 0), 0) / all.length) : 0;
    const totalDays = Object.keys(S.state.days).length;
    const recRate = month.days.length ? Math.round((monthPooped / Math.max(1, Math.min(month.days.length, new Date().getDate()))) * 100) : 0;

    /* 布里斯托分布 */
    const dist = BRISTOL.map((b) => ({ ...b, n: all.filter((e) => e.bristol === b.t).length }));
    const maxN = Math.max(1, ...dist.map((d) => d.n));
    const bars = dist.map((d) => `
      <div class="bar-item">
        <span class="bl">${d.t} 型 ${d.name}</span>
        <span class="bar-track"><span class="bar-fill" style="width:${(d.n / maxN) * 100}%;background:${BRISTOL_COLOR[d.t]}"></span></span>
        <span class="bv">${d.n}</span>
      </div>`).join('');

    /* 心情趋势 */
    const moodPts = [];
    month.days.forEach((k, i) => {
      const d = S.state.days[k];
      if (d && d.mood) moodPts.push([i, d.mood]);
    });
    let trend = '';
    if (moodPts.length >= 2) {
      const W = 300, H = 76, PD = 10;
      const stepX = W / Math.max(1, month.days.length - 1);
      const pts = moodPts.map(([i, m]) => `${(i * stepX).toFixed(1)},${(H - PD - ((m - 1) / 4) * (H - PD * 2)).toFixed(1)}`);
      trend = `<svg class="trend" viewBox="0 0 ${W} ${H + 14}" preserveAspectRatio="none">
        <polyline points="${pts.join(' ')}" fill="none" stroke="var(--primary)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        ${moodPts.map(([i, m]) => `<circle cx="${(i * stepX).toFixed(1)}" cy="${(H - PD - ((m - 1) / 4) * (H - PD * 2)).toFixed(1)}" r="3.4" fill="var(--bg-card)" stroke="var(--primary)" stroke-width="2.2"/>`).join('')}
      </svg>`;
    } else {
      trend = `<div class="empty" style="padding:22px 0"><span class="em-ico">📈</span>至少记录两天心情，这里才会画出曲线</div>`;
    }

    const ach = ACHIEVEMENTS.map((a) => {
      const on = !!S.state.seenAch[a.id] || a.test(S.state);
      return `<div class="ach ${on ? 'on' : ''}">
        <span class="ach-ico">${a.ico}</span>
        <span class="ach-tx"><b>${a.name}</b><span>${a.desc}</span></span>
      </div>`;
    }).join('');

    return `
      <div class="stat-grid">
        <div class="stat-box"><div class="sv">${monthPooped}<small>/ ${month.days.length}</small></div><div class="sl">本月打卡天数</div></div>
        <div class="stat-box"><div class="sv">${S.streak()}<small>天</small></div><div class="sl">当前连续</div></div>
        <div class="stat-box"><div class="sv">${avgSmooth.toFixed(1)}<small>/ 5</small></div><div class="sl">平均通畅度</div></div>
        <div class="stat-box"><div class="sv">${S.longestStreak()}<small>天</small></div><div class="sl">最长连续</div></div>
      </div>

      <div class="sec-head"><h2>形态分布</h2><span class="hint">共 ${all.length} 次</span></div>
      <div class="card"><div class="bar-list">${bars}</div></div>

      <div class="sec-head"><h2>心情曲线</h2><span class="hint">本月</span></div>
      <div class="card">${trend}</div>

      <div class="sec-head"><h2>成就</h2><span class="hint">${ACHIEVEMENTS.filter((a) => S.state.seenAch[a.id]).length} / ${ACHIEVEMENTS.length}</span></div>
      <div class="ach-grid">${ach}</div>

      <p style="margin:14px 2px 0;font-size:10.5px;line-height:1.7;color:var(--text-3)">
        累计记录 ${all.length} 次 · 记录天数 ${totalDays} 天 · 本月按时记录率约 ${recRate}%。
      </p>`;
  },

  /* ---------------- 设置 ---------------- */
  me() {
    const themes = [
      { id: 'macaron', name: '软糯马卡龙', desc: '奶油底 + 珊瑚橙，圆润可爱，最不挑人', bg: '#FFF4EC', dots: ['#FF8C6B', '#FFC857', '#3FC9AC'] },
      { id: 'pixel', name: '复古像素便利店', desc: '深紫霓虹 + 硬阴影，8-bit 游戏机质感', bg: '#1B1038', dots: ['#FFD93D', '#FF6B9D', '#4FFFB0'] },
      { id: 'cosmos', name: '暗黑宇宙扭蛋', desc: '星空紫青发光，夜猫子的深夜模式', bg: '#0A0E1C', dots: ['#7C6CF7', '#00E5C0', '#FFB86B'] },
    ];

    const themeCards = themes.map((t) => `
      <button class="theme-card" data-act="set-theme" data-id="${t.id}" aria-pressed="${S.state.theme === t.id}" type="button">
        <span class="theme-swatch" style="background:${t.bg};border:1px solid rgba(150,150,150,.22)">
          <span class="sw-dots">${t.dots.map((d) => `<i style="background:${d}"></i>`).join('')}</span>
        </span>
        <span class="theme-tx"><b>${t.name}</b><span>${t.desc}</span></span>
        <span class="theme-check">✓</span>
      </button>`).join('');

    return `
      <div class="sec-head"><h2>界面主题</h2><span class="hint">随时切换</span></div>
      <div class="theme-list">${themeCards}</div>

      <div class="sec-head"><h2>扭蛋机外观</h2><span class="hint">两种造型，抽奖效果不同</span></div>
      <div class="theme-list">
        <button class="theme-card" data-act="set-skin" data-id="toilet" aria-pressed="${S.state.machineSkin !== 'ball'}" type="button">
          <span class="theme-swatch" style="background:#EAF4FB;border:1px solid rgba(150,150,150,.22)">
            <span class="sw-dots"><i style="background:#8FC7EA"></i><i style="background:#B08052"></i><i style="background:#FFC857"></i></span>
          </span>
          <span class="theme-tx"><b>马桶冲冲乐</b></span>
          <span class="theme-check">✓</span>
        </button>
        <button class="theme-card" data-act="set-skin" data-id="ball" aria-pressed="${S.state.machineSkin === 'ball'}" type="button">
          <span class="theme-swatch" style="background:#FFF7E8;border:1px solid rgba(150,150,150,.22)">
            <span class="sw-dots"><i style="background:#FBEEDA"></i><i style="background:#C4762E"></i><i style="background:#FFC857"></i></span>
          </span>
          <span class="theme-tx"><b>经典玻璃球</b></span>
          <span class="theme-check">✓</span>
        </button>
      </div>

      <div class="sec-head"><h2>个人</h2></div>
      <div class="card" style="padding:6px 16px">
        <div class="set-row">
          <span class="sr-l">昵称</span>
          <input class="name-input" id="nameInput" placeholder="怎么称呼你" value="${esc(S.state.profile.name || '')}" maxlength="12">
        </div>
        <div class="set-row">
          <span class="sr-l">开始使用的日子</span>
          <span class="sr-r">${S.state.firstRun || todayKey()}</span>
        </div>
        <div class="set-row">
          <span class="sr-l">累计记录</span>
          <span class="sr-r">${allEntries(S.state).length} 次</span>
        </div>
        <div class="set-row">
          <span class="sr-l">抽过的扭蛋</span>
          <span class="sr-r">${S.state.gacha.pulls || 0} 次</span>
        </div>
        <div class="set-row">
          <span class="sr-l">残渣收集</span>
          <span class="sr-r">${Object.keys(S.state.gacha.collection || {}).length} / ${RELICS.length} 种</span>
        </div>
      </div>

      <div class="sec-head"><h2>数据</h2><span class="hint">${ENV.xhs ? '存在小工具本地缓存' : '全部存在本机'}</span></div>
      <div class="card" style="padding:6px 16px">
        ${ENV.xhs ? '' : `
        <div class="set-row">
          <span class="sr-l">导出备份</span>
          <button class="btn btn-sm" data-act="export-data" type="button">下载 JSON</button>
        </div>
        <div class="set-row">
          <span class="sr-l">导入备份</span>
          <button class="btn btn-sm" data-act="import-data" type="button">选择文件</button>
        </div>`}
        <div class="set-row">
          <span class="sr-l" style="color:var(--danger)">清空所有数据</span>
          <button class="btn btn-sm" data-act="wipe-data" type="button" style="color:var(--danger)">清空</button>
        </div>
      </div>

      <div class="card" style="margin-top:14px;background:var(--bg-soft-2)">
        <div style="font-size:12px;font-weight:800;margin-bottom:6px">关于</div>
        <p style="margin:0;font-size:11.5px;line-height:1.8;color:var(--text-2)">
          拉了吗？ v1.14 · 一个认真记录肠道健康小本子，你的屁屁由我守护<br>
          注意：这个工具只是自我观察工具，不能替代医生诊断。身体不适请及时就医。<br>
          制作者：芝士加倍
        </p>
      </div>

      <div style="height:6px"></div>`;
  },
};

/* =========================================================
   交互动作
   ========================================================= */
let pulling = false;

/* 玻璃罩里堆着的便便，坐标为 190x186 球体内部 */
const DOME_CAPS = [
  { x: 70, y: 153, s: 24, d: 0, r: -9 },
  { x: 93, y: 156, s: 26, d: .6, r: 6 },
  { x: 116, y: 153, s: 24, d: 1.2, r: -4 },
  { x: 52, y: 143, s: 23, d: .3, r: 9 },
  { x: 77, y: 145, s: 24, d: 1.6, r: -7 },
  { x: 102, y: 145, s: 24, d: .9, r: 5 },
  { x: 127, y: 143, s: 23, d: 1.9, r: -10 },
  { x: 42, y: 130, s: 22, d: 1.4, r: 7 },
  { x: 66, y: 131, s: 23, d: .2, r: -6 },
  { x: 91, y: 132, s: 24, d: 1.1, r: 4 },
  { x: 116, y: 131, s: 23, d: .7, r: -8 },
  { x: 140, y: 130, s: 22, d: 1.7, r: 6 },
  { x: 54, y: 116, s: 20, d: .4, r: -3 },
  { x: 79, y: 117, s: 21, d: 1.3, r: 8 },
  { x: 104, y: 117, s: 21, d: 1.5, r: -7 },
  { x: 129, y: 116, s: 20, d: .1, r: 5 },
  { x: 68, y: 102, s: 18, d: 1.8, r: -4 },
  { x: 93, y: 100, s: 19, d: .5, r: 9 },
  { x: 117, y: 102, s: 18, d: 1.0, r: -5 },
  { x: 81, y: 87, s: 15, d: .8, r: 6 },
  { x: 105, y: 86, s: 16, d: 1.6, r: -8 },
];

/* ---------------- 马桶扭蛋机 ---------------- */
/* 分镜同款手绘软便便：三段叠椭圆 + 小尖尖（scale 1 时约 30 宽 × 34 高，原点在底层椭圆中心）
   withFace = true 时带上「^ ^」眼 + 圆嘴，就是分镜里朝你冲过来的那坨 */
function poopGlyph(withFace) {
  return `<g class="poop-glyph">
    <ellipse cx="0" cy="0" rx="14" ry="7.5" fill="#9C6B3F"/>
    <ellipse cx="-1.5" cy="-9" rx="11" ry="6" fill="#B08052"/>
    <ellipse cx="-3" cy="-17" rx="7.5" ry="4.5" fill="#9C6B3F"/>
    <circle cx="-5.5" cy="-23" r="3.2" fill="#B08052"/>
    ${withFace ? `<path d="M-9 -9 q3.5 -4 7 0" stroke="#444441" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M2 -9 q3.5 -4 7 0" stroke="#444441" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <circle cx="0" cy="2" r="2.6" fill="#444441"/>` : ''}
  </g>`;
}

/* 分镜第 4 格：啪叽砸扁的大饼——两侧甩出残渣、中间鼓个小包，
   「> <」眼 + 波浪嘴，晕乎乎（原点在大饼中心，约 94 宽 × 64 高） */
function poopSplatGlyph() {
  return `<g class="poop-splat-glyph">
    <circle cx="-40" cy="18" r="7" fill="#9C6B3F"/>
    <circle cx="0" cy="22" r="8" fill="#9C6B3F"/>
    <circle cx="40" cy="18" r="7" fill="#9C6B3F"/>
    <ellipse cx="0" cy="0" rx="56" ry="22" fill="#9C6B3F"/>
    <ellipse cx="-2" cy="-14" rx="34" ry="13" fill="#B08052"/>
    <circle cx="-8" cy="-28" r="6" fill="#9C6B3F"/>
    <path d="M-31 -8 l9 4.5 -9 4.5" stroke="#444441" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M31 -8 l-9 4.5 9 4.5" stroke="#444441" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-17 6 q5 4.5 10 0 t10 0 t10 0" stroke="#444441" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </g>`;
}

/* 图鉴 Lv.5 皇冠（小金冠，图鉴格和详情弹窗共用） */
const CROWN_SVG = '<svg class="crown" viewBox="0 0 24 12" aria-hidden="true"><path d="M3 10 L3 3 L8 7 L12 1 L16 7 L21 3 L21 10 Z" fill="#FFC93C" stroke="#D89A2B" stroke-width="1" stroke-linejoin="round"/></svg>';

/* 水箱里泡着的便便盲盒（手绘同款、无壳），坐标为 240x310 画布内、参考图同款大水箱的水域里。
   约束：顶部 y - 26.2*s ≥ 52（水箱顶边 y46 + 波浪线以下），左右不越箱壁（x29~186），底部不越过箱底 */
const TANK_POOPS = [
  { x: 56, y: 78, s: .62, d: 0, r: -8 },
  { x: 88, y: 71, s: .68, d: .7, r: 5 },
  { x: 122, y: 78, s: .6, d: 1.3, r: -5 },
  { x: 154, y: 71, s: .56, d: .4, r: 9 },
  { x: 68, y: 112, s: .64, d: 1.6, r: 7 },
  { x: 104, y: 118, s: .68, d: 1.0, r: -6 },
  { x: 140, y: 110, s: .62, d: .2, r: 4 },
  { x: 166, y: 122, s: .5, d: 1.9, r: -9 },
];

function toiletMachineHTML(tickets) {
  const poops = TANK_POOPS.map((p) => `<g transform="translate(${p.x} ${p.y})"><g class="tp-in" style="--d:${p.d}s;--r:${p.r}deg;--sx:${107 - p.x}px;--sy:${94 - p.y}px"><g class="tp-emoji" transform="scale(${p.s})">${poopGlyph(true)}</g></g></g>`).join('');
  const bubbles = [
    [52, 98, 2.2], [76, 126, 1.8], [116, 130, 2.4], [150, 128, 2], [96, 92, 1.6],
    [132, 92, 1.9], [162, 96, 2.1], [44, 116, 1.7],
  ].map(([x, y, r]) => `<circle class="tk-bubble" style="--bd:${((x % 7) * 0.3).toFixed(1)}s" cx="${x}" cy="${y}" r="${r}" fill="rgba(255,255,255,.8)"/>`).join('');

  return `
  <div class="machine toilet-machine${tickets <= 0 ? ' no-ticket' : ''}" id="machine">
    <svg class="toilet" viewBox="0 0 240 310" role="img" aria-label="马桶扭蛋机">
      <defs>
        <linearGradient id="tkWaterG" x1="0" y1="0" x2="0" y2="1">
          <stop class="stop-tw1" offset="0" stop-color="#DEE8F0"/><stop class="stop-tw2" offset="1" stop-color="#D5DFE3"/>
        </linearGradient>
        <linearGradient id="bowlG" x1="0" y1="0" x2="0" y2="1">
          <stop class="stop-bw1" offset="0" stop-color="#DEE8EF"/><stop class="stop-bw2" offset="1" stop-color="#D2DEE5"/>
        </linearGradient>
        <linearGradient id="leverG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#EFF1F1"/><stop offset="1" stop-color="#C3C7CB"/>
        </linearGradient>
        <radialGradient id="leverBallG" cx=".35" cy=".3" r="1">
          <stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#DCDFE1"/><stop offset="1" stop-color="#A9AEB3"/>
        </radialGradient>
        <clipPath id="bowlClip"><ellipse cx="111.6" cy="185.8" rx="52.8" ry="10.4"/></clipPath>
        <clipPath id="tkClip"><rect x="29.9" y="46.9" width="155.2" height="92.2" rx="12.1"/></clipPath>
      </defs>

      <!-- 地面阴影（参考图几乎没有，只留一线） -->
      <ellipse cx="108" cy="286" rx="62" ry="4.5" fill="rgba(140,128,115,.13)"/>

      <!-- 马桶本体：直接用参考图（toilet-ref.png = 原图抠背景 + 抹自带拉杆 + 补掉盖钮） -->
      <image href="toilet-ref.png" x="22.4" y="26.3" width="170.7" height="257.9" preserveAspectRatio="none"/>

      <!-- 碗里的水面：覆盖图片静态水的动画层（JS 量 #bowlWater 定 cine 起点） -->
      <g clip-path="url(#bowlClip)">
        <ellipse id="bowlWater" cx="111.6" cy="185.8" rx="52.8" ry="10.4" fill="url(#bowlG)" opacity=".92"/>
        <path class="bowl-wave w1" d="M50 178.5 q9 -2.2 18 0 t18 0 t18 0 t18 0 t18 0 t18 0 t18 0 t18 0 L230 200 L50 200 Z" fill="rgba(255,255,255,.5)"/>
        <path class="bowl-wave w2" d="M46 181.5 q11 -1.8 22 0 t22 0 t22 0 t22 0 t22 0 t22 0 t22 0 t22 0 L234 200 L46 200 Z" fill="rgba(210,228,238,.55)"/>
        <ellipse class="bowl-glint g1" cx="88" cy="188" rx="12" ry="1.6" fill="rgba(255,255,255,.65)"/>
        <ellipse class="bowl-glint g2" cx="130" cy="191" rx="9" ry="1.3" fill="rgba(255,255,255,.5)"/>
      </g>

      <!-- 水箱：我们的水箱（动效都在），比图内水箱各大 1px 盖住接缝 -->
      <rect x="29" y="46" width="157" height="94" rx="13" fill="url(#tkWaterG)" stroke="#9FB2BE" stroke-width="1.8"/>
      <g clip-path="url(#tkClip)">
        <path class="tk-wave tw1" d="M14 55 q14 -3.2 28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 L226 142 L14 142 Z" fill="rgba(255,255,255,.16)"/>
        <path class="tk-wave tw2" d="M-6 57.5 q14 -2.4 28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 L226 142 L-6 142 Z" fill="rgba(182,206,222,.2)"/>
      </g>
      <path d="M34 54 Q48 50 62 54 T90 54 T118 54 T146 54 T176 54" stroke="rgba(255,255,255,.8)" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path class="tank-splash" d="M33 45 q-4 -5 -2.5 -9" stroke="#9FC6DE" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path class="tank-splash" d="M182 45 q4 -5 2.5 -9" stroke="#9FC6DE" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="158" y="53" width="21" height="81" rx="10" fill="#C7D6DE" opacity=".4"/>
      <rect x="37" y="56" width="8" height="76" rx="4" fill="rgba(255,255,255,.55)"/>
      <ellipse cx="58" cy="56" rx="10" ry="3.5" fill="rgba(255,255,255,.6)" transform="rotate(-14 58 56)"/>
      ${bubbles}
      <g class="tank-poop">${poops}</g>
      <g id="tankSwirl" class="tank-swirl">
        <path d="M107 94 m-30 0 a30 12.5 0 1 1 60 0 a21 9 0 1 1 -42 0 a12 5.5 0 1 1 24 0" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M107 94 m-8 0 a8 3.6 0 1 0 16 0" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2.6" stroke-linecap="round"/>
      </g>

      <!-- 冲水拨杆：横臂 = 穿进水箱的固定轴（短臂），把手绕轴末端朝右下压 -->
      <g class="lever-zone${tickets <= 0 ? ' off' : ''}" id="leverZone" data-act="do-pull" role="button" tabindex="0" aria-label="拨动冲水杆，抽一颗盲盒">
        <!-- 固定件：水箱壁座 + 短横轴 -->
        <g class="lever" id="flushLever">
          <rect x="183" y="83" width="6" height="8" rx="2" fill="url(#leverG)" stroke="#7E7A74" stroke-width="1"/>
          <rect x="184" y="84.5" width="15" height="5" rx="2.5" fill="url(#leverG)" stroke="#7E7A74" stroke-width="1"/>
        </g>
        <!-- 活动件：把手（竖杆 + 球头），绕轴末端 (199, 87.5) 朝右下压 -->
        <g class="lever-handle" id="leverHandle">
          <rect x="196.5" y="56" width="5" height="32" rx="2.5" fill="url(#leverG)" stroke="#7E7A74" stroke-width="1"/>
          <circle class="lever-ball" cx="199" cy="56" r="8" fill="url(#leverBallG)" stroke="#7E7A74" stroke-width="1.1"/>
          <ellipse cx="196" cy="52.5" rx="3.2" ry="2" fill="rgba(255,255,255,.9)" transform="rotate(-24 196 52.5)"/>
        </g>
        <!-- 轴端固定环：压在把手之上，把手绕它旋转 -->
        <circle cx="199" cy="87.5" r="3.4" fill="url(#leverBallG)" stroke="#7E7A74" stroke-width="1"/>
        <circle cx="199" cy="87.5" r="1.2" fill="#8D9297"/>
        <circle class="lever-ring" cx="199" cy="56" r="18.5" fill="none" stroke="#FFC857" stroke-width="2.6" stroke-dasharray="3 6.5"/>
      </g>

      <!-- POOP GACHA 印在图片自带的盖子上（圆钮已用像素手术补掉） -->
      <text x="107.5" y="39.5" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="800" letter-spacing="3" fill="#8A8078">POOP GACHA</text>
    </svg>
  </div>`;
}

/* 冲出屏幕的便便盲盒（分镜同款手绘）：飞行 → 啪叽砸扁 → 裂开现残渣 */
function poopCineHTML() {
  const drops = [
    [-140, -104, 7], [-88, -160, 9], [-14, -186, 8], [58, -164, 10],
    [130, -116, 7], [168, -40, 9], [148, 52, 8], [88, 120, 9],
    [8, 150, 7], [-72, 138, 9],
  ].map(([dx, dy, r], i) => `<circle class="drop" style="--dx:${dx}px;--dy:${dy}px;--dd:${(i % 5) * 0.028}s" cx="120" cy="120" r="${r}" fill="#A6D8F2"/>`).join('');
  const lines = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 * Math.PI) / 180, r1 = 68, r2 = 108;
    return `<line class="bline" x1="${(120 + Math.cos(a) * r1).toFixed(1)}" y1="${(120 + Math.sin(a) * r1).toFixed(1)}" x2="${(120 + Math.cos(a) * r2).toFixed(1)}" y2="${(120 + Math.sin(a) * r2).toFixed(1)}" stroke="#FFC857" stroke-width="6" stroke-linecap="round"/>`;
  }).join('');
  /* 一个 svg 装下三个阶段：飞行体 / 砸扁体 / 裂开的两半，CSS 按阶段切换亮相 */
  return `
  <div class="poop-cine" id="poopCine" aria-hidden="true">
    <div class="cine-stage" id="flyPoop">
      <svg class="cine-poop" viewBox="0 0 240 240" aria-hidden="true">
        <g transform="translate(120 155) scale(4)"><g class="cp-body" id="cpBody">${poopGlyph(true)}</g></g>
        <g transform="translate(120 120) scale(1.9)"><g class="cp-splat" id="cpSplat">${poopSplatGlyph()}</g></g>
        <g transform="translate(120 120) scale(2)"><g class="cp-half h1" id="cpHalf1"><path d="M-38 0 Q-38 -22 -18 -22 Q0 -46 18 -22 Q38 -22 38 0 Z" fill="#9C6B3F"/></g></g>
        <g transform="translate(120 120) scale(2)"><g class="cp-half h2" id="cpHalf2"><path d="M-38 0 Q-38 22 -18 22 Q0 46 18 22 Q38 22 38 0 Z" fill="#B08052"/></g></g>
      </svg>
      <svg class="cine-fx" viewBox="0 0 240 240">
        <g id="cineLines">${lines}</g>
        <g id="cineDrops">${drops}</g>
      </svg>
      <div class="cine-halo" id="cineHalo"></div>
      <div class="cine-relic" id="cineRelic"></div>
    </div>
  </div>`;
}

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

function checkAch() {
  const newly = [];
  ACHIEVEMENTS.forEach((a) => {
    if (S.state.seenAch[a.id]) return;
    let ok = false;
    try { ok = !!a.test(S.state); } catch (e) { ok = false; }
    if (ok) {
      S.state.seenAch[a.id] = true;
      newly.push(a);
    }
  });
  if (!newly.length) return;
  S.save();
  newly.slice(0, 3).forEach((a, i) => {
    setTimeout(() => UI.toast(`🏆 解锁成就：${a.name}`), 620 + i * 1200);
  });
}

function rerenderKeepScroll() {
  const st = UI.view.scrollTop;
  UI.render();
  UI.view.scrollTop = st;
}

/* 补记弹层选形状/颜色后重渲染，保持弹层滚动位置 */
function resheet() {
  const sh = document.querySelector('.sheet');
  const st = sh ? sh.scrollTop : 0;
  UI.sheet(Backfill.html());
  const sh2 = document.querySelector('.sheet');
  if (sh2) sh2.scrollTop = st;
}

/* 录音：MediaRecorder 真录，存成 dataURL 放本地 */
const Rec = {
  mr: null,
  stream: null,
  chunks: [],
  t0: 0,
  tick: null,
  max: 20,

  supported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  },
  pickMime() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return '';
    const list = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
    for (const m of list) {
      try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (e) { /* 下一个 */ }
    }
    return '';
  },
  fmt(ms) {
    const sec = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  },

  async start() {
    if (this.mr) return;
    if (!this.supported()) {
      UI.toast('这个浏览器录不了音，先写字吧');
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      UI.toast('麦克风没权限。用 https 打开，或者允许一下麦克风');
      return;
    }
    const mime = this.pickMime();
    let mr;
    try {
      mr = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 24000 } : undefined);
    } catch (e) {
      stream.getTracks().forEach((t) => t.stop());
      UI.toast('这台设备录不了，先写字吧');
      return;
    }
    this.stream = stream;
    this.chunks = [];
    this.mr = mr;
    this.t0 = Date.now();
    mr.ondataavailable = (ev) => { if (ev.data && ev.data.size) this.chunks.push(ev.data); };
    mr.onstop = () => this.finish();
    try {
      mr.start();
    } catch (e) {
      this.mr = null;
      stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
      UI.toast('录音没启动成功');
      return;
    }
    this.paint(true);
    clearInterval(this.tick);
    this.tick = setInterval(() => {
      const ms = Date.now() - this.t0;
      const btn = $('#micBtn');
      const tx = btn && btn.querySelector('.mic-tx');
      if (tx) tx.textContent = `录音中 ${this.fmt(ms)}`;
      if (ms >= this.max * 1000) this.stop();
    }, 200);
  },

  stop() {
    if (!this.mr) return;
    try { this.mr.stop(); } catch (e) { /* 已经停了 */ }
  },

  finish() {
    clearInterval(this.tick);
    this.tick = null;
    const mr = this.mr;
    this.mr = null;
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    const type = (mr && mr.mimeType) || 'audio/webm';
    const blob = new Blob(this.chunks, { type });
    this.chunks = [];
    this.paint(false);
    if (blob.size < 1500) {
      UI.toast('太短啦，再录一次');
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      Draft.audio = String(fr.result || '');
      rerenderKeepScroll();
      UI.toast('录好了 · 点播放听听');
    };
    fr.readAsDataURL(blob);
  },

  paint(on) {
    const btn = $('#micBtn');
    if (!btn) return;
    btn.classList.toggle('rec', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    const ico = btn.querySelector('.mic-ico');
    const tx = btn.querySelector('.mic-tx');
    if (ico) ico.textContent = on ? '⏹' : (Draft.audio ? '🎧' : '🎙');
    if (tx) tx.textContent = on ? '录音中 0:00' : (Draft.audio ? '重新录' : '录音');
  },
};

const Actions = {
  async handle(act, el, ev) {
    switch (act) {
      /* ---- 今日 ---- */
      case 'start-yes':
        UI.render();
        setTimeout(() => {
          const grid = $('.bristol-grid');
          const card = grid ? grid.closest('.card') : null;
          if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          else {
            const box = $('.sec-head');
            if (box) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          /* 红框闪动：告诉你接下来选这儿 */
          if (card) {
            card.classList.add('flash-target');
            card.addEventListener('animationend', () => card.classList.remove('flash-target'), { once: true });
          }
        }, 60);
        break;
      case 'start-no':
        UI.toast('没事，明天会更好 🌙');
        break;
      case 'voice-note':
        Actions.toggleVoice();
        break;
      case 'del-audio':
        Draft.audio = '';
        rerenderKeepScroll();
        break;
      case 'set-bristol':
        Draft.bristol = Number(el.dataset.v);
        rerenderKeepScroll();
        break;
      case 'set-smooth':
        Draft.smooth = Number(el.dataset.v);
        rerenderKeepScroll();
        break;
      case 'set-amount':
        Draft.amount = Number(el.dataset.v);
        rerenderKeepScroll();
        break;
      case 'set-color':
        Draft.color = el.dataset.v;
        rerenderKeepScroll();
        break;
      case 'set-mood': {
        Draft.mood = Number(el.dataset.v);
        Draft.persist();
        const got = Draft.grantMoodTicket();
        rerenderKeepScroll();
        if (got) UI.toast('心情记下了 · 扭蛋券 +1 🎫');
        break;
      }
      case 'cal-pick': {
        const k = el.dataset.k;
        if (!k || k === Cal.sel) break;
        Draft.flush();          /* 先把这天没落盘的日记写回原日期 */
        Cal.sel = k;
        Draft.sync(true);
        UI.updateCalSelection(); /* 局部更新：格子不重建，画面不闪 */
        break;
      }
      case 'cal-month':
        Draft.flush();
        Cal.offset = clamp(Cal.offset + Number(el.dataset.d), -36, 0);
        UI.render();
        break;
      /* ---- 日历补记：给过去的某一天补一条便便 ---- */
      case 'bf-open': {
        const k = Cal.sel;
        if (!k || k >= todayKey()) break;   /* 只补过去，今天走今日页 */
        Backfill.reset(k);
        UI.sheet(Backfill.html());
        break;
      }
      case 'bf-set-bristol':
        Backfill.bristol = Number(el.dataset.v);
        resheet();
        break;
      case 'bf-set-smooth':
        Backfill.smooth = Number(el.dataset.v);
        resheet();
        break;
      case 'bf-set-amount':
        Backfill.amount = Number(el.dataset.v);
        resheet();
        break;
      case 'bf-set-color':
        Backfill.color = el.dataset.v;
        resheet();
        break;
      case 'bf-submit': {
        const k = Backfill.key;
        if (!k) { UI.closeSheet(); break; }
        const box = document.getElementById('bfNoteBox');
        if (box) Backfill.note = box.value;
        const d = S.day(k, true);
        d.entries = d.entries || [];
        d.entries.push({
          id: uid(),
          time: '补记',
          bristol: Backfill.bristol,
          smooth: Backfill.smooth,
          amount: Backfill.amount,
          color: Backfill.color,
          note: (Backfill.note || '').trim(),
        });
        S.save();
        Backfill.key = null;
        UI.closeSheet();
        UI.render();
        const dt = keyToDate(k);
        UI.toast(`补好了 · ${dt.getMonth() + 1} 月 ${dt.getDate()} 日 +1 次`);
        checkAch();
        break;
      }
      case 'submit-poop': {
        const tkey = todayKey();
        const d = S.day(tkey, true);
        d.entries = d.entries || [];
        const now = new Date();
        d.entries.push({
          id: uid(),
          time: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
          bristol: Draft.bristol,
          smooth: Draft.smooth,
          amount: Draft.amount,
          color: Draft.color,
          note: (Draft.note || '').trim(),
          audio: Draft.audio || '',
        });
        Draft.note = '';
        Draft.audio = '';
        /* 每天第一笔记才发券，健康形态（3/4 型）多给一张 */
        const firstOfDay = !d.ticketGiven;
        let tk = 0;
        if (firstOfDay) {
          tk = (Draft.bristol === 3 || Draft.bristol === 4) ? 2 : 1;
          d.ticketGiven = true;
          S.state.gacha.tickets = (S.state.gacha.tickets || 0) + tk;
        }
        if (Cal.sel === tkey) {
          d.mood = Draft.mood;
          d.diary = Draft.diary;
        }
        Draft.flush();
        Cal.sel = tkey;
        Cal.offset = 0;
        Draft.sync(true);
        S.save();
        UI.render();
        UI.confetti();
        UI.toast(firstOfDay ? `记录成功 · 今天的扭蛋券 +${tk}` : '记录成功 · 今天的券已经领过啦');
        checkAch();
        break;
      }
      case 'del-entry': {
        const d = S.day(Cal.sel);
        if (!d || !d.entries) break;
        d.entries = d.entries.filter((e) => e.id !== el.dataset.id);
        S.save();
        UI.render();
        UI.toast('删掉了');
        break;
      }
      case 'go-gacha':
        UI.go('gacha');
        break;
      case 'share':
        await Share.open();
        break;
      case 'share-save': {
        if (!Share.last) break;
        /* 容器内：平台相册能力（在线文档 saveImageToPhotosAlbum）；网页：a.download 回退 */
        if (ENV.xhs) {
          try {
            const ok = await XHS.saveImage(Share.last);
            UI.toast(ok ? '存好了，去相册看看' : '保存失败，再试一次');
          } catch (e) {
            UI.toast('保存失败：' + ((e && e.errMsg) || '请重试'));
          }
          break;
        }
        const a = document.createElement('a');
        a.href = Share.last;
        a.download = `拉了吗-${todayKey()}.png`;
        a.click();
        UI.toast('存好了，去相册看看');
        break;
      }
      case 'share-post': {
        /* 容器内专属：分享图 + 文案直发小红书笔记（平台能力 postNote） */
        if (!Share.last) break;
        UI.closeSheet();
        UI.toast('正在唤起发布页…', 1200);
        try {
          const cap = Share.caption().split('\n');
          const title = (cap[0] || '我的便便日记').slice(0, 20);
          await XHS.postNote(title, Share.caption(), Share.last);
        } catch (e) {
          UI.toast('唤起失败，稍后再试');
        }
        break;
      }
      case 'share-more': {
        /* 网页环境：Web Share / 剪贴板。容器内不会走到这里（弹窗按钮已换平台能力） */
        const txt = Share.caption();
        let done = false;
        try {
          if (navigator.share && Share.last) {
            const blob = await (await fetch(Share.last)).blob();
            const file = new File([blob], `拉了吗-${todayKey()}.png`, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], text: txt });
            } else {
              await navigator.share({ text: txt });
            }
            done = true;
          }
        } catch (e) { done = false; }
        if (!done) {
          try {
            await navigator.clipboard.writeText(txt);
            UI.toast('文案复制好了');
          } catch (e) {
            UI.toast('复制不了，长按上面的图存吧');
          }
        }
        break;
      }
      case 'go-cal':
        UI.go('cal');
        break;
      case 'go-streak':
        UI.go('stats');
        break;

      /* ---- 扭蛋 ---- */
      case 'do-pull':
        UI.closeSheet();
        XHS.vibrate('light'); /* 容器内拨杆触觉反馈（9.50+，无能力时静默） */
        GachaUI.pull();
        break;
      case 'dex': {
        const sp = RELICS.find((s) => s.id === el.dataset.id);
        if (!sp) break;
        const g = S.state.gacha;
        const n = (g.collection || {})[sp.id] || 0;
        if (!n) {
          UI.toast('这个还没挖到，继续攒券吧');
          break;
        }
        const tier = (g.tiers || {})[sp.id] || 0;
        const canSynth = tier < tierByN(n);
        const nextTier = TIERS[tier + 1];
        const pct = tierProgress(n, tier);
        UI.sheet(`
          <div class="pull-stage">
            <div class="pull-sprite ${tier >= 1 ? 'lit' : ''}"><div class="pull-halo on"></div>${relicSVG(sp)}${tier >= 2 ? CROWN_SVG : ''}</div>
            <span class="pull-from">从便便里淘到的</span>
            <span class="rar rar-${sp.rarity}">${sp.rarity}</span>
            <h3 class="pull-name">${sp.name}</h3>
            <p class="pull-desc">${sp.desc}</p>
            <div class="lv-row">
              <span class="tier-tag t${tier}">${TIERS[tier].name}</span>
              <span class="dex-stars t${tier}">${tierStars(tier)}</span>
              <span class="lv-num">已挖到 ${n} 个</span>
            </div>
            <div class="lvbar"><i style="width:${pct}%"></i></div>
            <p class="lv-tip">${nextTier ? `再攒 ${nextTier.at - n} 个可合成${nextTier.name}档` : '黄金档封顶，抽到你纯属真爱'}</p>
          </div>
          ${canSynth && nextTier ? `<button class="btn btn-primary btn-block synth-btn" data-act="do-synth" data-id="${sp.id}">⚒ 合成到${nextTier.name}档 · 送 ${nextTier.reward} 张券</button>` : ''}
          <button class="btn btn-block${canSynth ? '' : ' btn-primary'}" ${canSynth ? 'data-close-sheet' : ''} style="margin-top:${canSynth ? '8px' : '0'}">${canSynth ? '先不合' : '关闭'}</button>`);
        break;
      }
      case 'do-synth': {
        const sp = RELICS.find((s) => s.id === el.dataset.id);
        const g = S.state.gacha;
        if (!sp) break;
        const n = (g.collection || {})[sp.id] || 0;
        const tier = (g.tiers || {})[sp.id] || 0;
        const nt = TIERS[tier + 1];
        if (!nt || n < nt.at || tier >= tierByN(n)) break;
        g.tiers = g.tiers || {};
        g.tiers[sp.id] = tier + 1;
        g.tickets = (g.tickets || 0) + nt.reward;
        S.save();
        UI.confetti();
        UI.toast(`⚒ 合成成功 · ${sp.name} 升到${nt.name}档，券 +${nt.reward}`);
        UI.render();
        checkAch();
        /* 重开详情弹窗，展示新档位 */
        Actions.handle('dex', el);
        break;
      }

      /* ---- 设置 ---- */
      case 'set-theme':
        UI.applyTheme(el.dataset.id);
        S.save();
        UI.render();
        UI.toast('主题已切换');
        break;
      case 'set-skin':
        S.state.machineSkin = el.dataset.id === 'ball' ? 'ball' : 'toilet';
        S.save();
        UI.render();
        UI.toast(S.state.machineSkin === 'ball' ? '已换成玻璃球扭蛋机' : '已换成马桶扭蛋机');
        break;
      case 'export-data': {
        if (ENV.xhs) break; /* 容器禁 blob 下载，入口已隐藏，双保险 */
        const blob = new Blob([JSON.stringify(S.state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pooplog-backup-${todayKey()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1200);
        UI.toast('备份已导出');
        break;
      }
      case 'import-data': {
        if (ENV.xhs) break; /* 容器内文件选择仅支持图片/视频，JSON 导入入口已隐藏 */
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = () => {
          const f = input.files && input.files[0];
          if (!f) return;
          const fr = new FileReader();
          fr.onload = () => {
            try {
              const data = JSON.parse(String(fr.result));
              if (!data || typeof data !== 'object' || !data.days) throw new Error('bad');
              S.state = Object.assign(blankState(), data);
              S.ensurePlots();
              S.save();
              UI.applyTheme(S.state.theme || 'macaron');
              UI.render();
              UI.toast('导入成功');
            } catch (e) {
              UI.toast('文件读不出来，格式可能不对');
            }
          };
          fr.readAsText(f);
        };
        input.click();
        break;
      }
      case 'wipe-data':
        UI.sheet(`
          <h3>确定要清空吗</h3>
          <p class="sheet-sub">所有记录和扭蛋图鉴都会被删掉，而且没法恢复。建议先导出备份。</p>
          <button class="btn btn-block" data-act="wipe-confirm" style="background:var(--danger);color:#fff">我确定，全部清空</button>
          <button class="btn btn-ghost btn-block" data-close-sheet style="margin-top:8px">算了</button>`);
        break;
      case 'wipe-confirm':
        localStorage.removeItem(STORE_KEY);
        S.state = blankState();
        Draft.key = null;
        Draft.mood = 0;
        Draft.diary = '';
        Cal.sel = todayKey();
        Cal.offset = 0;
        S.save();
        UI.applyTheme('macaron');
        UI.closeSheet();
        UI.render();
        UI.toast('已恢复到初始状态');
        break;
      default:
        break;
    }
  },

  onDiaryInput(v) {
    Draft.diary = v;
    Draft.queuePersist();
  },

  onNoteInput(v) {
    Draft.note = String(v || '').slice(0, 600);
  },

  /* 录音：点一下开录，再点一下停 */
  toggleVoice() {
    if (Rec.mr) Rec.stop();
    else Rec.start();
  },

  onNameInput(v) {
    S.state.profile.name = String(v || '').slice(0, 12);
    S.save();
    UI.updateTopbar();
  },
};

/* ---------------- 音效（冲水 / 开蛋） ---------------- */
const Sfx = {
  ctx: null,
  ac() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!this.ctx) {
      try { this.ctx = new AC(); } catch (e) { return null; }
    }
    if (this.ctx.state === 'suspended') { try { this.ctx.resume(); } catch (e) { /* 忽略 */ } }
    return this.ctx;
  },
  noise(vol, from, to, dur, at = 0) {
    const ctx = this.ac();
    if (!ctx) return;
    try {
      const t0 = ctx.currentTime + at;
      const len = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(from, t0);
      lp.frequency.exponentialRampToValueAtTime(to, t0 + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.07);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(lp).connect(g).connect(ctx.destination);
      src.start(t0);
      src.stop(t0 + dur);
    } catch (e) { /* 静音就行 */ }
  },
  tone(f1, f2, dur, vol, type = 'sine', at = 0) {
    const ctx = this.ac();
    if (!ctx) return;
    try {
      const t = ctx.currentTime + at;
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(f1, t);
      o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch (e) { /* 静音就行 */ }
  },
  /* 马桶冲水三幕（照真实冲水时序合成）：
     ① 把手咔哒（金属机构）→ ② 漩涡卷水 2.3s（带通白噪声，涡流 LFO 忽明忽暗、
     越转越急，水位 60% 后被"抽干"）→ ③ 虹吸咕噜 glug-glug（降调气泡串）
     + 水箱补水的嘶嘶尾音（高频噪声 1.55s 后淡入） */
  flush() {
    this.tone(150, 90, 0.09, 0.055, 'square');   /* ① 机构咔哒 */
    this.noise(0.05, 3200, 900, 0.07);           /* ① 金属余音 */
    const ctx = this.ac();
    if (!ctx) return;
    try {
      const t = ctx.currentTime, dur = 2.3;
      const len = Math.floor(ctx.sampleRate * 2);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      /* ② 漩涡：循环白噪声过带通，双 LFO 调制 = 涡流打转的忽明忽暗、忽强忽弱 */
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.Q.value = 0.9;
      bp.frequency.setValueAtTime(420, t);
      bp.frequency.linearRampToValueAtTime(780, t + dur * 0.55);  /* 越转越急 */
      bp.frequency.linearRampToValueAtTime(480, t + dur);
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(2.6, t);
      lfo.frequency.linearRampToValueAtTime(4.4, t + dur);        /* 转速渐快 */
      const lfoG = ctx.createGain(); lfoG.gain.value = 190;
      lfo.connect(lfoG).connect(bp.frequency);
      const lfo2 = ctx.createOscillator();
      lfo2.frequency.value = 1.3;
      const lfo2G = ctx.createGain(); lfo2G.gain.value = 0.045;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.18);        /* 水涌上来 */
      g.gain.setValueAtTime(0.16, t + dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);       /* 被抽干 */
      lfo2.connect(lfo2G).connect(g.gain);
      src.connect(bp).connect(g).connect(ctx.destination);
      /* ③ 补水尾音：冲完水箱开始蓄水的高频嘶嘶 */
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 3400;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.setValueAtTime(0.0001, t + 1.55);
      g2.gain.exponentialRampToValueAtTime(0.028, t + 1.8);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 3.3);
      const src2 = ctx.createBufferSource();
      src2.buffer = buf; src2.loop = true;
      src2.connect(hp).connect(g2).connect(ctx.destination);
      [src, lfo, lfo2].forEach((n) => { n.start(t); n.stop(t + dur + 0.05); });
      src2.start(t); src2.stop(t + 3.35);
    } catch (e) { /* 静音就行 */ }
    /* ③ 虹吸咕噜：水位抽干时一串降调气泡 glug glug glug glug */
    for (let i = 0; i < 4; i++) {
      this.tone(225 - i * 26, 118 - i * 13, 0.1, 0.065 - i * 0.011, 'sine', 1.02 + i * 0.13);
    }
    this.noise(0.05, 1100, 300, 0.45, 1.1);      /* 抽空时气泡破裂的沙沙 */
  },
  whoosh() { this.tone(260, 940, 0.42, 0.035, 'sine'); },
  squish() { this.noise(0.1, 900, 180, 0.22); this.tone(160, 60, 0.18, 0.07, 'triangle'); },
  crank() {
    for (let i = 0; i < 4; i++) this.tone(210, 150, 0.055, 0.05, 'square', i * 0.15);
    this.tone(120, 260, 0.5, 0.03, 'triangle', 0.1);
  },
  pop() { this.tone(460, 880, 0.13, 0.06, 'triangle'); },
  tada() {
    this.tone(680, 700, 0.16, 0.05, 'sine', 0);
    this.tone(1020, 1040, 0.22, 0.045, 'sine', 0.1);
  },
};

/* ---------------- 抽奖交互 ---------------- */
const GachaUI = {
  async pull() {
    if (pulling) return;
    if ((S.state.gacha.tickets || 0) <= 0) {
      UI.toast('没有扭蛋券了，先去记一笔');
      return;
    }
    pulling = true;

    S.state.gacha.tickets -= 1;
    S.state.gacha.pulls = (S.state.gacha.pulls || 0) + 1;

    const sp = Gacha.pull();
    const c = S.state.gacha.collection || (S.state.gacha.collection = {});
    const before = c[sp.id] || 0;
    const isNew = !before;
    c[sp.id] = before + 1;
    S.save();

    const machine = $('#machine');
    const skin = S.state.machineSkin === 'ball' ? 'ball' : 'toilet';

    if (skin === 'ball') {
      /* ---- 玻璃球机器：摇把 → 胶囊 → 裂开 ---- */
      const knob = $('#knob');
      const caps = $('#caps');
      const drop = $('#dropCap');
      const halo = $('#capHalo');
      if (knob) knob.classList.add('turn');
      if (machine) machine.classList.add('shake');
      if (caps) caps.classList.add('rolling');
      Sfx.crank();
      await wait(800);
      if (drop) drop.classList.add('fall');
      await wait(560);
      Sfx.pop();
      await wait(280);
      if (drop) drop.classList.add('crack');
      if (halo) halo.classList.add('go');
      Sfx.tada();
      await wait(720);
    } else {
      /* ---- 马桶：拨杆 → 漩涡卷走 → 冲出一坨 → 砸扁 → 裂开 ---- */
      const lever = $('#leverHandle');
      const zone = $('#leverZone');
      const swirl = $('#tankSwirl');
      const cine = $('#poopCine');
      /* cine 层是 fixed 全屏，但视图容器带 transform 会让 fixed 退化成相对定位——搬到 body 下保证真·全屏居中 */
      if (cine && cine.parentElement !== document.body) document.body.appendChild(cine);
      if (machine) machine.classList.add('shake');
      if (lever) lever.classList.add('press');
      if (zone) zone.classList.add('pressing');
      if (swirl) swirl.classList.add('go');
      $$('.tp-in').forEach((el) => el.classList.add('suck'));
      Sfx.flush();
      await wait(950);

      /* 盲盒从座圈口直飞屏幕中央 */
      if (cine) {
        const bw = $('#bowlWater');
        if (bw) {
          const r = bw.getBoundingClientRect();
          cine.style.setProperty('--fx', `${(r.x + r.width / 2 - innerWidth / 2).toFixed(0)}px`);
          cine.style.setProperty('--fy', `${(r.y + r.height / 2 - innerHeight / 2).toFixed(0)}px`);
        }
        const relic = $('#cineRelic');
        if (relic) relic.innerHTML = relicSVG(sp, { size: 96 });
        cine.classList.add('play', 'fly');
      }
      Sfx.whoosh();
      await wait(620);

      /* 啪叽！软胶式压扁，只飞干净水珠 */
      if (cine) cine.classList.add('splat');
      Sfx.squish();
      await wait(620);

      /* 裂开两半，金光乍现，残渣登场 */
      if (cine) cine.classList.add('crack');
      Sfx.tada();
      await wait(700);
      if (cine) cine.classList.remove('play', 'fly', 'splat', 'crack');
    }

    this.show({ sprite: sp, isNew, n: c[sp.id] });
    UI.render();
    pulling = false;
    checkAch();
  },

  show(r) {
    const sp = r.sprite;
    const g = S.state.gacha;
    const tier = ((g.tiers || {})[sp.id]) || 0;
    const nt = TIERS[tier + 1];
    /* 分镜第 6 格的排版：奶油圆底残渣 + 金角标 + 副标 + 图鉴 +1 */
    const subline = r.isNew ? '新入手 · 普通档' : `第 ${r.n} 个 · ${TIERS[tier].name}档`;
    const badge = r.isNew ? '<span class="pull-new">新</span>' : '';
    const tail = r.isNew
      ? '✨ 图鉴新成员，收进罐子里了'
      : `又是它 · 图鉴里默默累积着${nt ? `，攒到 ${nt.at} 个可合成${nt.name}档` : ''}`;
    UI.sheet(`
      <div class="pull-stage">
        <div class="pull-sprite pop ${tier >= 1 ? 'lit' : ''}">
          <div class="pull-halo on"></div>
          ${relicSVG(sp)}
          ${tier >= 2 ? CROWN_SVG : ''}
          ${badge}
        </div>
        <h3 class="pull-name">${sp.name}</h3>
        <div class="pull-meta">
          <span class="rar rar-${sp.rarity}">${sp.rarity}</span>
          <span class="pull-sub">${subline}</span>
        </div>
        <span class="pull-dex">图鉴 +1</span>
        <p class="pull-desc">${sp.desc}</p>
      </div>
      <p class="sheet-sub" style="margin-bottom:16px">${tail}</p>
      <button class="btn btn-primary btn-block" data-close-sheet>收下它</button>
      <button class="btn btn-ghost btn-block" data-act="do-pull" style="margin-top:8px">再抽一次</button>`);
    if (sp.rarity === 'SR' || sp.rarity === 'SSR') UI.confetti();
  },
};

/* ---------------- 分享长图 ---------------- */
/* 中文按 1 个字宽、英文按 0.55 折算，粗略断行 */
function wrapCJK(str, per) {
  const out = [];
  String(str || '').split(/\n+/).forEach((para) => {
    let line = '', w = 0;
    for (const ch of para) {
      const cw = /[\x00-\xff]/.test(ch) ? 0.55 : 1;
      if (w + cw > per && line) { out.push(line); line = ''; w = 0; }
      line += ch; w += cw;
    }
    if (line) out.push(line);
  });
  return out;
}

/* 把布里斯托小图标塞进外层的 SVG 里 */
function bristolInline(t, x, y, w, h, gap) {
  return bristolSVG(t, { gap: gap || '#FFFFFF' }).replace(
    '<svg viewBox="0 0 64 40" style="color:var(--poop)"',
    `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 64 40" style="color:#A5713F"`
  );
}

const Share = {
  last: '',

  data() {
    const k = todayKey();
    const d = S.state.days[k] || {};
    const ents = d.entries || [];
    const n = ents.length;
    const avg = n ? ents.reduce((a, e) => a + (e.smooth || 0), 0) / n : 0;
    const last = ents[n - 1] || null;
    return {
      k, d, ents, n, avg, last,
      mood: d.mood ? MOODS.find((m) => m.v === d.mood) : null,
      amt: last ? (AMOUNTS.find((a) => a.v === last.amount) || AMOUNTS[1]).label : '—',
      col: last ? colorInfo(last.color).name : '—',
    };
  },

  build() {
    const { ents, n, avg, mood } = this.data();
    const dt = keyToDate(todayKey());
    const dateStr = `${dt.getFullYear()}.${pad2(dt.getMonth() + 1)}.${pad2(dt.getDate())} 星期${WEEKDAY[dt.getDay()]}`;
    const FONT = `-apple-system,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif`;
    const W = 540;

    /* 每一趟一张行卡：形状图标 + 型号名 + 通畅/量/颜色明细 */
    const rowH = 62, rowGap = 8, listTop = 152;
    const shown = ents.slice(0, 6);
    const rows = shown.map((e, i) => {
      const y = listTop + i * (rowH + rowGap);
      const bi = bristolInfo(e.bristol);
      const amt = (AMOUNTS.find((a) => a.v === e.amount) || AMOUNTS[1]).label;
      const col = colorInfo(e.color).name;
      const when = e.time && e.time !== '补记' ? e.time : (e.time === '补记' ? '补记' : '');
      return `<g>
        <rect x="40" y="${y}" width="${W - 80}" height="${rowH}" rx="18" fill="#FFFFFF" opacity=".95"/>
        ${bristolInline(e.bristol, 56, y + 13, 54, 36, '#FFFFFF')}
        <text x="126" y="${y + 27}" font-family="${FONT}" font-size="15.5" font-weight="800" fill="#4A3527">第 ${i + 1} 趟 · ${bi.t} 型 ${bi.name}${when ? `<tspan font-size="11.5" font-weight="400" fill="#BCAB9C" dx="8">${when}</tspan>` : ''}</text>
        <text x="126" y="${y + 47}" font-family="${FONT}" font-size="12.5" fill="#8C7261">通畅 ${e.smooth}/5 · ${amt} · 颜色 ${col}</text>
      </g>`;
    }).join('');
    const listBottom = shown.length ? listTop + shown.length * rowH + (shown.length - 1) * rowGap : 0;

    const notes = ents.map((e) => (e.note || '').trim()).filter(Boolean);
    let lines = [];
    notes.forEach((t) => {
      const ls = wrapCJK(t, 19);
      if (ls.length) { ls[0] = `· ${ls[0]}`; lines = lines.concat(ls); }
    });
    lines = lines.slice(0, 6);

    const emptyList = shown.length
      ? ''
      : `<text x="270" y="190" text-anchor="middle" font-family="${FONT}" font-size="16" fill="#BCAB9C">今天还没记，去记一笔再分享吧</text>`;

    const noteTop = shown.length ? listBottom + 20 : 210;
    const cardH = lines.length ? Math.max(110, 62 + lines.length * 31) : 0;
    const noteCard = lines.length
      ? `<g>
          <rect x="40" y="${noteTop}" width="${W - 80}" height="${cardH}" rx="28" fill="#FFFFFF" opacity=".94"/>
          <text x="72" y="${noteTop + 42}" font-family="${FONT}" font-size="13" font-weight="700" letter-spacing="2.5" fill="#C79C77">拉屎感悟</text>
          ${lines.map((ln, i) => `<text x="72" y="${noteTop + 74 + i * 31}" font-family="${FONT}" font-size="20" fill="#5B4534">${esc(ln)}</text>`).join('')}
        </g>`
      : '';
    const cardBottom = lines.length ? noteTop + cardH : (shown.length ? listBottom : 230);
    const footY = cardBottom + 56;
    const H = footY + 46;
    this.h = H;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="pgbg" x1="0" y1="0" x2=".35" y2="1">
      <stop offset="0" stop-color="#FFF8F0"/><stop offset="1" stop-color="#FCEBDA"/>
    </linearGradient>
    <linearGradient id="pgnum" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#B57C46"/><stop offset="1" stop-color="#8A5C34"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#pgbg)"/>
  <circle cx="492" cy="46" r="118" fill="#FFE3C8" opacity=".55"/>
  <circle cx="24" cy="${H - 52}" r="130" fill="#DCF1ED" opacity=".55"/>
  <circle cx="474" cy="${H - 98}" r="74" fill="#FFE8D9" opacity=".75"/>

  <text x="44" y="66" font-family="${FONT}" font-size="25" font-weight="800" fill="#4A3527">拉了吗？</text>
  <text x="${W - 44}" y="66" text-anchor="end" font-family="${FONT}" font-size="13" fill="#B29B88">${dateStr}</text>
  <line x1="44" y1="90" x2="${W - 44}" y2="90" stroke="#EBD9C7" stroke-width="1.4"/>

  <text x="44" y="132" font-family="${FONT}" font-size="15" fill="#8C7261">今天</text>
  <text x="82" y="134" font-family="${FONT}" font-weight="800" fill="url(#pgnum)"><tspan font-size="26">${n}</tspan><tspan font-size="14" fill="#A98C74" dx="3">次</tspan></text>
  <text x="148" y="133" font-family="${FONT}" font-size="13.5" fill="#8C7261">通畅 ${avg ? avg.toFixed(1) : '—'} / 5</text>
  ${mood ? `<text x="256" y="139" font-family="${FONT}" font-size="26">${mood.emo}</text>` : ''}

  ${emptyList}
  ${rows}
  ${noteCard}

  <text x="44" y="${footY}" font-family="${FONT}" font-size="12.5" fill="#B7A290">拉了吗？ · 每天认真拉，认真记</text>
  <text x="${W - 44}" y="${footY + 2}" text-anchor="end" font-family="${FONT}" font-size="24">💩</text>
</svg>`;
  },

  async png() {
    const svg = this.build();
    const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const img = await new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error('svg 载入失败'));
      im.src = src;
    });
    const scale = 2;
    const c = document.createElement('canvas');
    c.width = 540 * scale;
    c.height = Math.round((this.h || 800) * scale);
    const g = c.getContext('2d');
    g.fillStyle = '#FFF8F0';
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  },

  caption() {
    const { ents, avg } = this.data();
    const notes = ents.map((e) => (e.note || '').trim()).filter(Boolean);
    return [
      `今天拉了 ${ents.length} 次 · 通畅 ${avg ? avg.toFixed(1) : '—'} / 5`,
      ...notes.map((t) => `「${t}」`),
      '—— 来自「拉了吗？」',
    ].join('\n');
  },

  async open() {
    UI.toast('正在拼图…', 1000);
    let url;
    try {
      url = await this.png();
    } catch (e) {
      console.warn('分享图生成失败', e);
      UI.toast('生成失败了，换个浏览器试试');
      return;
    }
    this.last = url;
    UI.sheet(`
      <div class="share-stage"><img src="${url}" alt="今天的分享图"></div>
      <p class="sheet-sub" style="margin-bottom:14px">${ENV.xhs ? '保存到相册，或直接发一篇小红书笔记' : '长按图片也能直接存到相册'}</p>
      ${ENV.xhs ? `
      <button class="btn btn-primary btn-block" data-act="share-post">发小红书笔记</button>
      <button class="btn btn-ghost btn-block" data-act="share-save" style="margin-top:8px">保存到相册</button>` : `
      <button class="btn btn-primary btn-block" data-act="share-save">保存图片</button>
      <button class="btn btn-ghost btn-block" data-act="share-more" style="margin-top:8px">分享 / 复制文案</button>`}`);
  },
};

/* ---------------- 启动 ---------------- */
function boot() {
  S.load();
  UI.init();
  UI.go('today');
  checkAch();
  /* 小红书容器：平台 Storage 的数据以它为准，异步取回后覆盖渲染（localStorage 在容器内只是降级） */
  if (ENV.xhs) {
    XHS.getStore(STORE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.days) {
          S.state = Object.assign(blankState(), parsed);
          S.state.gacha = Object.assign({ tickets: 3, collection: {}, pulls: 0 }, parsed.gacha || {});
          S.state.profile = Object.assign({ name: '' }, parsed.profile || {});
          UI.render();
          UI.updateTopbar();
        }
      } catch (e) { /* 平台数据损坏就沿用本地 */ }
    }).catch(() => {});
  }
  /* Chrome 61 无 Flex gap：行为检测，不支持时打标记，polyfill 用 margin 补偿 */
  if (!supportsFlexGap()) document.documentElement.classList.add('no-flex-gap');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
