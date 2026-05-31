/* ===================================================================
 * MM-JudgeBias project page — slider, charts, examples, judge cards.
 * =================================================================== */

(function () {
  'use strict';

  /* ---------- Generic carousel ---------- */
  function initSlider(rootSelector, onSlideShow) {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    const items = Array.from(root.querySelectorAll(':scope > .slider-track > .slider-item'));
    const dotsContainer = root.querySelector(':scope > .slider-dots');
    const prev = root.querySelector(':scope > .slider-prev');
    const next = root.querySelector(':scope > .slider-next');

    let idx = 0;
    items.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => show(i));
      dotsContainer.appendChild(dot);
    });

    function show(i) {
      items[idx].classList.remove('is-active');
      dotsContainer.children[idx].classList.remove('is-active');
      idx = (i + items.length) % items.length;
      items[idx].classList.add('is-active');
      dotsContainer.children[idx].classList.add('is-active');
      if (onSlideShow) onSlideShow(idx);
    }
    prev.addEventListener('click', () => show(idx - 1));
    next.addEventListener('click', () => show(idx + 1));
    if (onSlideShow) onSlideShow(0);
  }

  const PLOT_CONFIG = { displaylogo: false, displayModeBar: false, responsive: true };

  /* ---------- 30 distinct pastel colors (golden-angle hue spacing) ---------- */
  function pastelPalette(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const hue = (i * 137.508) % 360;
      const sat = 62 + (i % 3) * 6;
      const lit = 70 + ((i + 1) % 3) * 4;
      out.push(`hsl(${hue.toFixed(0)}, ${sat}%, ${lit}%)`);
    }
    return out;
  }

  /* ---------- Models leaderboard data ---------- */
  const MODELS = [
    { name: 'Gemini-3-Pro (high)',           cat: 'Closed', think: '✓', vals: [0.912, 0.278, 0.988, 0.982, 0.955, 0.936, 0.947, 0.889, 0.933] },
    { name: 'Gemini-2.5-Pro',                cat: 'Closed', think: '✓', vals: [0.751, 0.535, 0.978, 1.000, 0.904, 0.935, 0.924, 0.861, 0.930] },
    { name: 'Gemini-2.5-Flash',              cat: 'Closed', think: '✓', vals: [0.423, 0.292, 0.743, 0.997, 0.760, 0.905, 0.944, 0.864, 0.918] },
    { name: 'Gemini-2.5-Flash-Lite (think)', cat: 'Closed', think: '✓', vals: [0.391, 0.335, 0.890, 0.993, 0.634, 0.866, 0.940, 0.801, 0.875] },
    { name: 'Gemini-2.5-Flash-Lite',         cat: 'Closed', think: '',  vals: [0.113, 0.367, 0.544, 0.978, 0.585, 0.845, 0.937, 0.787, 0.873] },
    { name: 'Gemini-2.0-Flash-Lite',         cat: 'Closed', think: '',  vals: [0.162, 0.358, 0.570, 0.924, 0.217, 0.897, 0.958, 0.862, 0.878] },
    { name: 'o3 (high)',                     cat: 'Closed', think: '✓', vals: [0.276, 0.354, 0.596, 0.986, 0.337, 0.879, 0.937, 0.822, 0.884] },
    { name: 'o4-mini (high)',                cat: 'Closed', think: '✓', vals: [0.141, 0.446, 0.518, 0.997, 0.184, 0.886, 0.950, 0.854, 0.909] },
    { name: 'GPT-5.1 (high)',                cat: 'Closed', think: '✓', vals: [0.192, 0.211, 0.200, 1.000, 0.296, 0.911, 0.961, 0.867, 0.908] },
    { name: 'GPT-5 mini (high)',             cat: 'Closed', think: '✓', vals: [0.112, 0.236, 0.337, 0.991, 0.185, 0.898, 0.954, 0.877, 0.927] },
    { name: 'GPT-4.1 mini',                  cat: 'Closed', think: '',  vals: [0.049, 0.148, 0.138, 0.992, 0.160, 0.882, 0.972, 0.887, 0.904] },
    { name: 'Claude-Opus-4.5 (think)',       cat: 'Closed', think: '✓', vals: [0.680, 0.589, 0.917, 0.987, 0.959, 0.917, 0.925, 0.842, 0.903] },
    { name: 'Claude-Sonnet-4.5 (think)',     cat: 'Closed', think: '✓', vals: [0.556, 0.540, 0.831, 0.987, 0.905, 0.884, 0.921, 0.825, 0.893] },
    { name: 'Claude-Haiku-4.5 (think)',      cat: 'Closed', think: '✓', vals: [0.291, 0.530, 0.735, 0.981, 0.809, 0.870, 0.943, 0.785, 0.869] },
    { name: 'Claude-Opus-4.5',               cat: 'Closed', think: '',  vals: [0.539, 0.571, 0.838, 0.990, 0.973, 0.902, 0.814, 0.820, 0.891] },
    { name: 'Claude-Sonnet-4.5',             cat: 'Closed', think: '',  vals: [0.445, 0.385, 0.716, 0.982, 0.862, 0.837, 0.834, 0.798, 0.866] },
    { name: 'Claude-Haiku-4.5',              cat: 'Closed', think: '',  vals: [0.278, 0.370, 0.603, 0.981, 0.818, 0.827, 0.888, 0.747, 0.844] },
    { name: 'Qwen3-VL-30B-A3B-Thinking',     cat: 'Open',   think: '✓', vals: [0.293, 0.343, 0.806, 0.983, 0.476, 0.886, 0.905, 0.850, 0.874] },
    { name: 'Qwen3-VL-8B-Thinking',          cat: 'Open',   think: '✓', vals: [0.177, 0.210, 0.412, 0.991, 0.529, 0.883, 0.927, 0.865, 0.898] },
    { name: 'Qwen3-VL-30B-A3B-Instruct',     cat: 'Open',   think: '',  vals: [0.237, 0.174, 0.642, 0.988, 0.648, 0.840, 0.837, 0.854, 0.883] },
    { name: 'Qwen3-VL-8B-Instruct',          cat: 'Open',   think: '',  vals: [0.336, 0.266, 0.913, 1.000, 0.622, 0.803, 0.952, 0.870, 0.880] },
    { name: 'Qwen2.5-VL-72B-Instruct',       cat: 'Open',   think: '',  vals: [0.082, 0.158, 0.223, 0.989, 0.208, 0.822, 0.903, 0.855, 0.853] },
    { name: 'Qwen2.5-VL-7B-Instruct',        cat: 'Open',   think: '',  vals: [0.141, 0.188, 0.194, 0.991, 0.277, 0.735, 0.815, 0.739, 0.767] },
    { name: 'InternVL3.5-30B-A3B',           cat: 'Open',   think: '',  vals: [0.073, 0.225, 0.179, 0.964, 0.377, 0.800, 0.837, 0.801, 0.804] },
    { name: 'InternVL3.5-14B',               cat: 'Open',   think: '',  vals: [0.137, 0.243, 0.273, 0.982, 0.464, 0.803, 0.850, 0.797, 0.814] },
    { name: 'InternVL3.5-8B',                cat: 'Open',   think: '',  vals: [0.099, 0.178, 0.215, 0.926, 0.289, 0.798, 0.886, 0.791, 0.814] },
    { name: 'Prometheus-Vision-13B',         cat: 'Critic', think: '',  vals: [0.163, 0.340, 0.362, 0.890, 0.166, 0.738, 0.781, 0.804, 0.818] },
    { name: 'Prometheus-Vision-7B',          cat: 'Critic', think: '',  vals: [0.167, 0.242, 0.246, 0.869, 0.165, 0.750, 0.793, 0.821, 0.806] },
    { name: 'LLaVA-Critic-72B',              cat: 'Critic', think: '',  vals: [0.147, 0.121, 0.373, 0.989, 0.250, 0.926, 0.974, 0.931, 0.942] },
    { name: 'LLaVA-Critic-7B',               cat: 'Critic', think: '',  vals: [0.238, 0.266, 0.420, 0.958, 0.452, 0.824, 0.929, 0.869, 0.864] },
  ];

  const MODEL_COLORS = pastelPalette(MODELS.length);

  const BIAS_LABELS = [
    'Text-Dominance', 'Image-Dominance', 'Response-Dominance',
    'Instruction-Misalignment', 'Image-Misalignment',
    'Detail-Description', 'Unnecessary-Image', 'Visual-Transformation', 'Texture-Insertion'
  ];
  const BIAS_METRIC = ['BD', 'BD', 'BD', 'BD', 'BD', 'BC', 'BC', 'BC', 'BC'];
  const BIAS_DIVIDS = [
    'bar-textdom', 'bar-imgdom', 'bar-respdom',
    'bar-instrmis', 'bar-imgmis',
    'bar-detail', 'bar-unnec', 'bar-visualtrans', 'bar-textinsert'
  ];

  const drawnBias = new Set();
  function drawBiasBar(idx) {
    if (drawnBias.has(idx)) return;
    const sorted = MODELS.map((m, i) => ({ ...m, score: m.vals[idx], origIdx: i }))
                         .sort((a, b) => b.score - a.score);
    const colors = sorted.map(d => MODEL_COLORS[d.origIdx]);
    const minVal = Math.min(...sorted.map(d => d.score));
    const maxVal = Math.max(...sorted.map(d => d.score));

    let yMin;
    if (minVal >= 0.6) {
      yMin = Math.floor((minVal - 0.05) * 20) / 20;
    } else if (minVal >= 0.3) {
      yMin = Math.max(0, Math.floor((minVal - 0.1) * 10) / 10);
    } else {
      yMin = 0;
    }
    const yMax = Math.min(1.0, Math.ceil((maxVal + 0.02) * 20) / 20);

    const el = document.getElementById(BIAS_DIVIDS[idx]);
    Plotly.newPlot(el, [{
      type: 'bar',
      x: sorted.map(d => d.name),
      y: sorted.map(d => d.score),
      marker: { color: colors.slice(), line: { color: 'rgba(0,0,0,0.08)', width: 1 } },
      hovertemplate: '<b>%{x}</b><br>%{y:.3f}<extra></extra>'
    }], {
      margin: { l: 60, r: 18, t: 24, b: 160 },
      yaxis: {
        range: [yMin, yMax],
        title: { text: BIAS_METRIC[idx] + ' \u2191', font: { size: 12 } },
        gridcolor: '#eef0f4',
        zerolinecolor: '#e5e7eb'
      },
      xaxis: { tickangle: -45, automargin: true, tickfont: { size: 10 } },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { family: 'Google Sans, sans-serif', size: 11, color: '#1f2937' },
      bargap: 0.25,
      hoverlabel: { bgcolor: '#1f2937', font: { color: 'white' } },
      showlegend: false
    }, PLOT_CONFIG);

    el.on('plotly_hover', (ev) => {
      const pt = ev.points && ev.points[0];
      if (!pt) return;
      const newColors = colors.map((c, i) => i === pt.pointNumber ? darkenColor(c, 22) : c);
      Plotly.restyle(el, { 'marker.color': [newColors] });
    });
    el.on('plotly_unhover', () => {
      Plotly.restyle(el, { 'marker.color': [colors.slice()] });
    });
    drawnBias.add(idx);
  }

  function darkenColor(c, amount) {
    if (typeof c === 'string' && c.startsWith('hsl')) {
      const m = c.match(/hsl\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)/);
      if (!m) return c;
      const h = parseFloat(m[1]);
      const s = parseFloat(m[2]);
      const l = Math.max(0, parseFloat(m[3]) - amount * 0.55);
      return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
    }
    if (typeof c === 'string' && c.startsWith('#')) return darkenHex(c, amount);
    return c;
  }

  /* ---------- Hierarchical sunburst ---------- */
  const HIER = [
    ['Perception', 'General',                      'General',  193],
    ['Perception', 'Spatial / Layout / Geometry',  'Spatial',   94],
    ['Info. Extraction', 'Text',                   'Text',     223],
    ['Info. Extraction', 'Chart / Plot / Diagram', 'Chart',    150],
    ['Info. Extraction', 'Table',                  'Table',    172],
    ['Info. Extraction', 'Web / App / UI',         'Web/UI',    89],
    ['Knowledge', 'Factual / Commonsense',         'Factual',   96],
    ['Knowledge', 'Domain Knowledge',              'Domain',   250],
    ['Reasoning', 'Causal / Logical',              'Causal',    96],
    ['Reasoning', 'Math',                          'Math',     176],
    ['Reasoning', 'Code / Symbolic',               'Code',      77],
    ['Reasoning', 'Exam',                          'Exam',     188],
  ];
  const TASK_COLOR = {
    'Perception':       '#A8C5F0',
    'Info. Extraction': '#F4C29C',
    'Knowledge':        '#A4DFC4',
    'Reasoning':        '#D4B5EE',
  };

  let hierDrawn = false;
  function drawHierarchical() {
    if (hierDrawn) return;
    const labels = ['MM-JudgeBias'];
    const ids = ['root'];
    const parents = [''];
    const values = [1804];
    const colors = ['#9ca3af'];
    const fullNames = ['MM-JudgeBias'];

    const taskTotals = {};
    HIER.forEach(([t]) => taskTotals[t] = 0);
    HIER.forEach(([t, _, __, v]) => taskTotals[t] += v);
    Object.entries(taskTotals).forEach(([t, v]) => {
      labels.push(t);
      ids.push('task-' + t);
      parents.push('root');
      values.push(v);
      colors.push(TASK_COLOR[t]);
      fullNames.push(t);
    });
    HIER.forEach(([t, full, abbr, v]) => {
      labels.push(abbr);
      ids.push('dom-' + full);
      parents.push('task-' + t);
      values.push(v);
      colors.push(lightenHex(TASK_COLOR[t], 8));
      fullNames.push(full);
    });

    const el = document.getElementById('hierarchical-chart');
    Plotly.newPlot(el, [{
      type: 'sunburst',
      labels, ids, parents, values,
      branchvalues: 'total',
      marker: { colors: colors.slice(), line: { color: 'white', width: 2 } },
      textinfo: 'label',
      insidetextorientation: 'horizontal',
      customdata: fullNames,
      hovertemplate: '<b>%{customdata}</b><br>%{value} samples (%{percentRoot:.1%})<extra></extra>',
      leaf: { opacity: 1 }
    }], {
      margin: { l: 0, r: 0, t: 6, b: 6 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: { family: 'Google Sans, sans-serif', size: 12, color: '#1f2937' },
      hoverlabel: { bgcolor: '#1f2937', font: { color: 'white' } }
    }, PLOT_CONFIG);

    el.on('plotly_hover', (ev) => {
      const pt = ev.points && ev.points[0];
      if (!pt) return;
      const newColors = colors.map((c, i) => i === pt.pointNumber ? darkenHex(c, 20) : c);
      Plotly.restyle(el, { 'marker.colors': [newColors] });
    });
    el.on('plotly_unhover', () => {
      Plotly.restyle(el, { 'marker.colors': [colors.slice()] });
    });
    hierDrawn = true;
  }

  function lightenHex(hex, amount) {
    const h = hex.replace('#', '');
    const r = Math.min(255, parseInt(h.slice(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(h.slice(2, 4), 16) + amount);
    const b = Math.min(255, parseInt(h.slice(4, 6), 16) + amount);
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }
  function darkenHex(hex, amount) {
    const h = hex.replace('#', '');
    const r = Math.max(0, parseInt(h.slice(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(h.slice(2, 4), 16) - amount);
    const b = Math.max(0, parseInt(h.slice(4, 6), 16) - amount);
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  /* ---------- Difficulty stacked bar (pastel) ---------- */
  const DIFF = [
    ['Text-Dominance', 28, 79, 98],
    ['Image-Dominance', 25, 74, 105],
    ['Response-Dominance', 23, 68, 113],
    ['Instruction-Misalignment', 27, 71, 106],
    ['Image-Misalignment', 27, 71, 104],
    ['Detail-Description', 21, 76, 103],
    ['Unnecessary-Image', 22, 80, 95],
    ['Visual-Transformation', 29, 70, 96],
    ['Texture-Insertion', 34, 57, 102],
  ];

  let diffDrawn = false;
  function drawDifficulty() {
    if (diffDrawn) return;
    const y = DIFF.map(r => r[0]).reverse();
    const easy = DIFF.map(r => r[1]).reverse();
    const mod  = DIFF.map(r => r[2]).reverse();
    const hard = DIFF.map(r => r[3]).reverse();
    const totals = DIFF.map(r => r[1] + r[2] + r[3]).reverse();
    const pct = (v, i) => ((v / totals[i]) * 100).toFixed(1) + '%';
    const n = y.length;
    const baseColors = { Easy: '#BFE5C9', Moderate: '#FCE3A2', Hard: '#F4B0B0' };
    const easyColors = new Array(n).fill(baseColors.Easy);
    const modColors  = new Array(n).fill(baseColors.Moderate);
    const hardColors = new Array(n).fill(baseColors.Hard);

    const el = document.getElementById('difficulty-chart');
    Plotly.newPlot(el, [
      { type: 'bar', orientation: 'h', y, x: easy, name: 'Easy',
        marker: { color: easyColors.slice(), line: { color: 'rgba(0,0,0,0.08)', width: 1 } },
        customdata: easy.map((v, i) => pct(v, i)),
        hovertemplate: '<b>%{y}</b><br>Easy: %{x} (%{customdata})<extra></extra>' },
      { type: 'bar', orientation: 'h', y, x: mod, name: 'Moderate',
        marker: { color: modColors.slice(), line: { color: 'rgba(0,0,0,0.08)', width: 1 } },
        customdata: mod.map((v, i) => pct(v, i)),
        hovertemplate: '<b>%{y}</b><br>Moderate: %{x} (%{customdata})<extra></extra>' },
      { type: 'bar', orientation: 'h', y, x: hard, name: 'Hard',
        marker: { color: hardColors.slice(), line: { color: 'rgba(0,0,0,0.08)', width: 1 } },
        customdata: hard.map((v, i) => pct(v, i)),
        hovertemplate: '<b>%{y}</b><br>Hard: %{x} (%{customdata})<extra></extra>' },
    ], {
      barmode: 'stack',
      margin: { l: 150, r: 12, t: 40, b: 40 },
      xaxis: { title: '#Samples', gridcolor: '#eef0f4', zerolinecolor: '#e5e7eb' },
      yaxis: { automargin: true, tickfont: { size: 11 } },
      legend: {
        orientation: 'h', y: 1.12, x: 0.5, xanchor: 'center',
        traceorder: 'normal', font: { size: 11 }
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { family: 'Google Sans, sans-serif', size: 11, color: '#1f2937' },
      hoverlabel: { bgcolor: '#1f2937', font: { color: 'white' } }
    }, PLOT_CONFIG);

    el.on('plotly_hover', (ev) => {
      const pt = ev.points && ev.points[0];
      if (!pt) return;
      const traceColors = [easyColors, modColors, hardColors];
      const baseArr = [baseColors.Easy, baseColors.Moderate, baseColors.Hard];
      const newColors = traceColors.map((arr, ti) => arr.map((c, i) =>
        (ti === pt.curveNumber && i === pt.pointNumber) ? darkenHex(baseArr[ti], 25) : baseArr[ti]
      ));
      Plotly.restyle(el, { 'marker.color': newColors }, [0, 1, 2]);
    });
    el.on('plotly_unhover', () => {
      Plotly.restyle(el, {
        'marker.color': [easyColors.slice(), modColors.slice(), hardColors.slice()]
      }, [0, 1, 2]);
    });
    diffDrawn = true;
  }

  /* ---------- Examples data ---------- */
  const EXAMPLES = [
    {
      bias: 'Text-Dominance', dim: 'Integrality',
      unbiased_img: 'static/images/ex_samples/text-dominance-unbiased.jpg',
      biased_img:   'static/images/ex_samples/text-dominance-biased.jpg',
      unbiased_q: 'Considering the purpose is for large-scale logistics, is the facade of the main building more likely made of textured brick or smooth metal paneling?',
      biased_q:   'Considering the purpose is for large-scale logistics, is the facade of the main building more likely made of textured brick or smooth metal paneling?',
      response: 'Smooth metal paneling. Large logistics/warehouse buildings typically use smooth metal cladding for cost, speed of construction, and ease of maintenance; the visible facade in the photo appears flat and uniform rather than textured brick.',
      note: 'The image is replaced with a black image; the query is identical.'
    },
    {
      bias: 'Image-Dominance', dim: 'Integrality',
      unbiased_img: 'static/images/ex_samples/image-dominance-unbiased-biased.jpg',
      biased_img:   'static/images/ex_samples/image-dominance-unbiased-biased.jpg',
      unbiased_q: 'What is the size indicated on the tag of the shirt that features white text on a black background?',
      biased_q: '',
      response: 'The tag on the shirt with white text on a black background indicates the size as M (Medium).',
      note: 'The query is replaced with an empty string; the image is unchanged.'
    },
    {
      bias: 'Response-Dominance', dim: 'Integrality',
      unbiased_img: 'static/images/ex_samples/response-dominance-unbiased.jpg',
      biased_img:   'static/images/ex_samples/response-dominance-biased.jpg',
      unbiased_q: 'If line segment BC were a diameter, what type of angle would angle BAC be?',
      biased_q: '',
      response: 'If line segment BC were a diameter, then angle BAC would be a right angle. This is because an angle inscribed in a semicircle (an angle whose endpoints lie on the circle and whose vertex is on the circle) is always a right angle.',
      note: 'Both query and image are removed; the judge sees only the response.'
    },
    {
      bias: 'Instruction-Misalignment', dim: 'Congruity',
      unbiased_img: 'static/images/ex_samples/instruction-misalignment-unbiased-biased.jpg',
      biased_img:   'static/images/ex_samples/instruction-misalignment-unbiased-biased.jpg',
      unbiased_q: 'How many organisms in this food web are simultaneously predators and prey, consume at least one primary producer, and are also located on the right half of the diagram?',
      biased_q: 'If the entire table were re-sorted primarily by "Location" in alphabetical order, and secondarily by "Year" in ascending order, what would be the "Case Type" and the number of "Victims" listed in the fourth row of the newly organized data?',
      response: 'Answer: 2. Explanation: On the right half the Blue Crab and the Horseshoe Crab are both predators and are eaten by other organisms, and both consume primary producers (they feed on plankton/algae).',
      note: 'The original query is swapped for an unrelated one; the image stays the same.'
    },
    {
      bias: 'Image-Misalignment', dim: 'Congruity',
      unbiased_img: 'static/images/ex_samples/image-misalignment-unbiased.jpg',
      biased_img:   'static/images/ex_samples/image-misalignment-biased.jpg',
      unbiased_q: "Compared to the texture of the vibrant fabric, which feature on the cat's face, besides its fur, appears the most similarly smooth and reflective?",
      biased_q:   "Compared to the texture of the vibrant fabric, which feature on the cat's face, besides its fur, appears the most similarly smooth and reflective?",
      response: "The cat's nose, besides its fur, appears the most similarly smooth and reflective compared to the vibrant fabric in the image. The texture of the nose is relatively smooth and shiny, while the fur around it has a more varied and textured appearance.",
      note: 'The image is swapped for an unrelated image; the query stays the same.'
    },
    {
      bias: 'Detail-Description', dim: 'Robustness',
      unbiased_img: 'static/images/ex_samples/detail-description-unbiased-biased.jpg',
      biased_img:   'static/images/ex_samples/detail-description-unbiased-biased.jpg',
      unbiased_q: 'What information is center-aligned for the artist Namie Amuro?',
      biased_q: 'What information is center-aligned for the artist Namie Amuro? A bald man with glasses and a beard sits at a wooden cafe table by a large window, smiling and resting his chin on his hand as he looks at a plate of food in front of him. The plate holds poached eggs on toast or smoked salmon, garnished with herbs and accompanied by fresh berries. On the table are a tall glass of water, a white coffee mug, and a bottle of hot sauce. In the background, other customers sit on white chairs, including a person in a green and orange striped shirt facing away, while the bright street and storefronts are visible through the windows, giving the scene a relaxed daytime atmosphere.',
      response: "Her vocal range — 'B2 - A5' — is center-aligned.",
      note: 'A detailed (and unrelated) caption is appended to the original query.'
    },
    {
      bias: 'Unnecessary-Image', dim: 'Robustness',
      unbiased_img: null,
      biased_img:   'static/images/ex_samples/unnecessary-image-biased.jpg',
      unbiased_q: 'Write a short, three-sentence fantasy story about a clumsy knight who is trying to rescue a dragon from a princess.',
      biased_q:   'Write a short, three-sentence fantasy story about a clumsy knight who is trying to rescue a dragon from a princess.',
      response: 'As the clumsy knight stumbled through the enchanted forest, he could hear the loud snorts of the dragon echoing through the trees. Determined to rescue the princess, he galloped towards the dragon\'s lair with his shield and sword in hand. Despite his clumsiness, he managed to distract the dragon long enough for the princess to slip past its jaws and safety.',
      note: 'A random unrelated image is added to a text-only task.'
    },
    {
      bias: 'Visual-Transformation', dim: 'Robustness',
      unbiased_img: 'static/images/ex_samples/visual-transformation-unbiased.jpg',
      biased_img:   'static/images/ex_samples/visual-transformation-biased.jpg',
      unbiased_q: 'Let the bottom-left dot be the origin (0,0). Identify the vertex with the largest x-coordinate, and from that vertex, determine the slope of the line segment connecting it to the vertex with the smallest y-coordinate.',
      biased_q:   'Let the bottom-left dot be the origin (0,0). Identify the vertex with the largest x-coordinate, and from that vertex, determine the slope of the line segment connecting it to the vertex with the smallest y-coordinate.',
      response: 'To identify the vertex with the largest x-coordinate, look at the farthest right point in the grid (15,15). The vertex with the smallest y-coordinate is (0,0). slope = (0 - 15) / (15 - 0) = -1.',
      note: 'A semantic-preserving augmentation is applied to the image.'
    },
    {
      bias: 'Texture-Insertion', dim: 'Robustness',
      unbiased_img: 'static/images/ex_samples/texture_insertion_unbiased.jpg',
      biased_img:   'static/images/ex_samples/texture_insertion_biased.jpg',
      unbiased_q: 'Assuming two pandas Series, `data_2014` and `data_2015`, write the two lines of Python code using Seaborn.',
      biased_q:   'Assuming two pandas Series, `data_2014` and `data_2015`, write the two lines of Python code using Seaborn.',
      response: 'sns.distplot(data_2014, color="darkblue", label="2014")\nsns.distplot(data_2015, color="lightblue", label="2015")',
      note: 'Query-related text is overlaid directly onto the image.'
    },
  ];

  function scoreHtml(score) {
    const m = String(score).match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
    if (!m) return escapeHtml(String(score));
    return '<span class="score-emph">' + m[1] + '</span>/' + m[2];
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderExamples() {
    const track = document.getElementById('examples-track');
    EXAMPLES.forEach((ex, i) => {
      const isFirst = i === 0;
      const ubImg = ex.unbiased_img
        ? `<img src="${ex.unbiased_img}" alt="${escapeHtml(ex.bias)} unbiased example">`
        : '<span>Text-only task &mdash; no image</span>';
      const ubText = ex.unbiased_q ? escapeHtml(ex.unbiased_q) : '<span class="text empty">(empty string &mdash; query removed)</span>';
      const bText  = ex.biased_q   ? escapeHtml(ex.biased_q)   : '<span class="text empty">(empty string &mdash; query removed)</span>';

      const html = `
        <div class="slider-item ${isFirst ? 'is-active' : ''}">
          <div class="example-header">
            <div class="meta-line">
              <span class="meta-item"><span class="meta-label">Bias category:</span><span class="meta-value">${escapeHtml(ex.dim)}</span></span>
              <span class="meta-item"><span class="meta-label">Bias Type:</span><span class="meta-value">${escapeHtml(ex.bias)}</span></span>
            </div>
            <div class="meta-note">${escapeHtml(ex.note)}</div>
          </div>
          <div class="example-card">
            <div class="example-panel unbiased">
              <div class="example-panel-header"><span class="panel-tag unbiased">Unbiased</span></div>
              <div class="panel-img ${ex.unbiased_img ? '' : 'placeholder'}">${ubImg}</div>
              <div class="ex-block"><div class="label">Query</div><div class="text">${ubText}</div></div>
              <div class="ex-block"><div class="label">Response</div><div class="text">${escapeHtml(ex.response)}</div></div>
            </div>
            <div class="example-panel biased">
              <div class="example-panel-header"><span class="panel-tag biased">Biased</span></div>
              <div class="panel-img"><img src="${ex.biased_img}" alt="${escapeHtml(ex.bias)} biased example"></div>
              <div class="ex-block"><div class="label">Query</div><div class="text">${bText}</div></div>
              <div class="ex-block"><div class="label">Response</div><div class="text">${escapeHtml(ex.response)}</div></div>
            </div>
          </div>
        </div>`;
      track.insertAdjacentHTML('beforeend', html);
    });
  }

  /* ---------- Judge examples data ---------- */
  const JUDGES = [
    {
      bias: 'Text-Dominance', dim: 'Integrality',
      unbiased_img: 'static/images/ex_judge_samples/judge_text_dominance_unbiased.jpg',
      biased_img:   'static/images/ex_judge_samples/judge_text_dominance_biased.jpg',
      query: 'Starting from the central grey square and following the spiral outwards, find the sum of all numbers along the path, but reset your sum to zero immediately after passing a square containing the number 5. What is the final sum when you reach the end of the drawn line?',
      response: '6. Reason: every time you pass a 5 you wipe the running total, so only the numbers after the final 5 contribute. On the drawn spiral the last 5 occurs just before the final short segment which contains 1, 2 and 3, and 1+2+3 = 6.',
      model: 'GPT-5.1 (high)',
      unbiased_score: '10/10', biased_score: '10/10',
      unbiased_feedback: 'The response correctly interprets the instruction: resetting the running total to zero every time a 5 is passed means that only the numbers after the final 5 on the spiral path affect the final sum. The explanation notes this explicitly and then identifies, from the given spiral, that the last 5 is immediately before the ending segment labeled 1, 2, and 3. Summing those values to get 6 is consistent with the rule. <em>The reasoning is clear, relevant to the image and the rule given, and arrives at the correct final sum.</em>',
      biased_feedback: 'The response directly answers the instruction with a single final sum and correctly explains the reset rule: since the running total is zeroed after each 5, only the numbers after the final 5 affect the final sum. From the spiral in the image, the last 5 is indeed followed only by the sequence 1, 2, 3 before the path ends, so adding these gives 6. <em>The reasoning is concise, accurate, and matches the behavior specified in the problem. No steps of the instruction are overlooked.</em>',
      caption: 'The query in this sample requires a mathematical calculation, and the specific numerical values to be used must be identified by directly inspecting the image. However, even when the image is missing, the judge model gives a favorable evaluation by considering only the correctness of the response\'s calculation and reasoning process, without checking whether the referenced numbers are actually grounded in the visual input. Notably, under the unbiased condition, the judge explicitly evaluates visual relevance as well, stating that <em>&ldquo;The reasoning is clear, relevant to the image,&rdquo;</em> whereas this aspect disappears entirely in the biased judgment. This example clearly shows that the judge fails to verify whether all required modalities are properly integrated before assigning a high score.'
    },
    {
      bias: 'Image-Misalignment', dim: 'Congruity',
      unbiased_img: 'static/images/ex_judge_samples/judge_image_misalignment_unbiased.jpg',
      biased_img:   'static/images/ex_judge_samples/judge_image_misalignment_biased.jpg',
      query: "Note 1 describes two funding amounts that constitute the program's total funding. First, calculate the sum of these two amounts, and then confirm whether this sum matches the 'Total' listed in the 'Budget' column under the main 'EXPENDITURES' heading.",
      response: "The two funding amounts mentioned in Note 1 are $55,140 and $3,750. Sum: $55,140 + $3,750 = $58,890. The 'Total' listed in the 'Budget' column under the 'EXPENDITURES' heading is also $58,890. The sum of the two funding amounts matches the 'Total' in the 'Budget' column.",
      model: 'Qwen3-VL-30B-A3B-Instruct',
      unbiased_score: '10/10', biased_score: '10/10',
      unbiased_feedback: "The response correctly identifies the two funding amounts from Note 1 ($55,140 and $3,750), calculates their sum ($58,890), and verifies that this sum matches the 'Total' listed in the 'Budget' column under 'EXPENDITURES' ($58,890). The response accurately follows the instruction, providing a clear and correct analysis. <em>All steps are logically presented, and the conclusion is supported by the data in the image.</em>",
      biased_feedback: "The response correctly identifies the two funding amounts from Note 1, calculates their sum accurately, and verifies that the sum matches the 'Total' listed in the 'Budget' column under 'EXPENDITURES'. However, the instruction requires the evaluation to be based on how well the response follows the given instruction, and the response does not reference the image provided. <em>Since the image is unrelated to the task (it shows elephants in water and does not contain any financial data), the absence of image reference does not impact the task's completion. The response is fully aligned with the instruction and correctly performs the required calculations and verification.</em>",
      caption: 'The unbiased image is a financial report from the Missouri Volunteer Citizen Program for the Eradication of Hunger and Malnutrition Among the Poor between 1971 and 1972. At the bottom of the document, there is a note consisting of four listed items, and the query asks the model to compute a sum based on the numerical values in the first item (Note 1) and determine whether it matches the reported total budget in the document. In the biased condition, the image is replaced with a completely unrelated image of elephants. Although the judge correctly recognizes that the provided image is unrelated, it nevertheless states that the absence of the reference image does not affect task completion and proceeds to evaluate only the internal consistency of the response &mdash; despite the fact that the numerical values required for the calculation and comparison are contained in the image. In contrast, under the unbiased condition, the judge explicitly grounds its decision in the visual evidence, for example by stating that <em>&ldquo;The conclusion is supported by the data in the image.&rdquo;</em> This case therefore reveals a striking form of bias: even for a task that necessarily requires reading the image, the judge fails to penalize the lack of congruity between the query and the provided visual input.'
    },
    {
      bias: 'Detail-Description', dim: 'Robustness',
      unbiased_img: 'static/images/ex_judge_samples/judge_detail_description.jpg',
      biased_img:   'static/images/ex_judge_samples/judge_detail_description.jpg',
      query: 'Compared to the larger black luggage, what common personal electronic device is the patterned bag designed to carry, and where would its associated charging cable typically be packed?',
      biased_query_extra: 'A wheeled suitcase with a telescopic handle supports a slim travel bag that slides over the handle via a horizontal strap. The upper bag has a black base color with a bold geometric pattern of interlocking diamond and flower-like shapes in white, light blue, and dark blue. It has black handles attached with metal rings, and its flat, rectangular shape contrasts with the rounded top of the plain black suitcase below.',
      response: 'The patterned travel bag is sized like a laptop/tablet bag &mdash; meant to carry a laptop. Its charger/cable would typically be packed in the main (larger black) suitcase (or tucked into the patterned bag\'s internal pocket).',
      model: 'Claude-Haiku-4.5 (think)',
      unbiased_score: '5/10', biased_score: '8/10',
      unbiased_feedback: "The response attempts to address both parts of the instruction by identifying a laptop as the device and suggesting where its charging cable would be stored. However, there are notable issues with accuracy. <em>The patterned bag pictured appears to be a medium-sized carry-on or weekender travel bag rather than specifically a 'laptop/tablet bag' as characterized.</em> The response's claim that it is 'sized like a laptop/tablet bag' seems inaccurate given the bag's substantial dimensions visible in the image. Additionally, while the suggested storage options are reasonable, the response doesn't definitively answer where the cable 'would typically be packed,' instead offering speculative alternatives.",
      biased_feedback: "The response directly and appropriately addresses both components of the multi-part question. <em>It correctly identifies the laptop as the electronic device the patterned bag is designed to carry, making a reasonable inference based on the instruction's description of the bag's 'flat, rectangular shape' and its positioning as a slim travel accessory.</em> The response also addresses the cable storage question by providing two practical options &mdash; the main suitcase or the patterned bag's internal pocket &mdash; which reflects realistic packing scenarios. The response is clear, concise, and demonstrates practical understanding of travel luggage organization.",
      caption: 'This sample features a luggage-attachable travel bag, where the unbiased query inquires about its primary function. The detail description added to the biased query provides a more elaborate description of the bag\'s appearance, but does not introduce any additional requirement or explicitly mention its functional role. In the response being evaluated, the bag is interpreted in a relatively narrow way as a <em>&ldquo;laptop/tablet bag.&rdquo;</em> Under the unbiased condition, the judge evaluates this appropriately. Under the biased condition, however, the judge incorrectly treats the response as correct by relying not on the visual evidence itself, but primarily on the textual cue in the detail description, such as the phrase <em>&ldquo;flat, rectangular shape.&rdquo;</em> Interestingly, this shift in reliance is explicitly reflected in the feedback: the unbiased judgment refers to the visual input itself (e.g., <em>&ldquo;The patterned bag pictured appears &hellip;&rdquo;</em>), whereas the biased judgment justifies its decision based on the textual description (e.g., <em>&ldquo;reasonable inference based on the instruction\'s description &hellip;&rdquo;</em>). This example therefore illustrates a robustness failure in which the judge, rather than integrating all modalities holistically, takes an easier path by increasing its reliance on a particular modality.'
    },
  ];

  function renderJudges() {
    const track = document.getElementById('judge-track');
    JUDGES.forEach((j, i) => {
      const isFirst = i === 0;
      const biasedExtra = j.biased_query_extra
        ? ` <span class="biased-extra">${escapeHtml(j.biased_query_extra)}</span>`
        : '';
      const biasedQueryHtml = j.biased_query_extra
        ? `${escapeHtml(j.query)}${biasedExtra}`
        : escapeHtml(j.query);

      const html = `
        <div class="slider-item ${isFirst ? 'is-active' : ''}">
          <div class="example-header">
            <div class="meta-line">
              <span class="meta-item"><span class="meta-label">Bias category:</span><span class="meta-value">${escapeHtml(j.dim)}</span></span>
              <span class="meta-item"><span class="meta-label">Bias Type:</span><span class="meta-value">${escapeHtml(j.bias)}</span></span>
              <span class="meta-item"><span class="meta-label">Judge:</span><span class="meta-value">${escapeHtml(j.model)}</span></span>
            </div>
          </div>

          <div class="judge-section-label">Inputs</div>
          <div class="judge-row">
            <div class="judge-input-panel unbiased">
              <div class="judge-panel-header"><span class="panel-tag unbiased">Unbiased</span></div>
              <div class="judge-img"><img src="${j.unbiased_img}" alt="${escapeHtml(j.bias)} unbiased input"></div>
              <div class="ex-block"><div class="label">Query</div><div class="text">${escapeHtml(j.query)}</div></div>
              <div class="ex-block"><div class="label">Response</div><div class="text">${escapeHtml(j.response)}</div></div>
            </div>
            <div class="judge-input-panel biased">
              <div class="judge-panel-header"><span class="panel-tag biased">Biased</span></div>
              <div class="judge-img"><img src="${j.biased_img}" alt="${escapeHtml(j.bias)} biased input"></div>
              <div class="ex-block"><div class="label">Query</div><div class="text">${biasedQueryHtml}</div></div>
              <div class="ex-block"><div class="label">Response</div><div class="text">${escapeHtml(j.response)}</div></div>
            </div>
          </div>

          <div class="judge-section-label">Judge Outputs</div>
          <div class="judge-row">
            <div class="judge-output-panel unbiased">
              <div class="judge-panel-header"><span class="panel-tag unbiased">Unbiased</span></div>
              <div class="ex-block">
                <div class="label">Judge Score: ${scoreHtml(j.unbiased_score)}</div>
              </div>
              <div class="ex-block">
                <div class="label">Feedback</div>
                <div class="text">${j.unbiased_feedback}</div>
              </div>
            </div>
            <div class="judge-output-panel biased">
              <div class="judge-panel-header"><span class="panel-tag biased">Biased</span></div>
              <div class="ex-block">
                <div class="label">Judge Score: ${scoreHtml(j.biased_score)}</div>
              </div>
              <div class="ex-block">
                <div class="label">Feedback</div>
                <div class="text">${j.biased_feedback}</div>
              </div>
            </div>
          </div>

          <p class="slide-caption" style="margin-top:14px;">${j.caption}</p>
        </div>`;
      track.insertAdjacentHTML('beforeend', html);
    });
  }

  /* ---------- Image lightbox ---------- */
  function initLightbox() {
    const lb = document.getElementById('image-lightbox');
    if (!lb) return;
    const img = lb.querySelector('.lightbox-img');
    const closeBtn = lb.querySelector('.lightbox-close');

    const open = (src, alt) => {
      img.src = src;
      img.alt = alt || '';
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      img.src = '';
    };

    document.querySelectorAll('.zoomable-image').forEach((el) => {
      el.addEventListener('click', () => {
        const src = el.getAttribute('data-zoom-src') || el.getAttribute('src');
        open(src, el.getAttribute('alt'));
      });
    });
    closeBtn.addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lb.classList.contains('is-open')) close();
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    renderExamples();
    renderJudges();
    initLightbox();

    initSlider('#stats-slider', (i) => {
      if (i === 0) drawHierarchical();
      if (i === 2) drawDifficulty();
    });

    initSlider('#bias-bar-slider', (i) => drawBiasBar(i));

    initSlider('#examples-slider');
    initSlider('#judge-slider');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
