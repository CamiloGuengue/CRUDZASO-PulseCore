const DEFAULT_INVENTORY = [
  { blood_type:'A+',  units:450, max_units:600 },
  { blood_type:'A-',  units:42,  max_units:200 },
  { blood_type:'B+',  units:310, max_units:520 },
  { blood_type:'B-',  units:15,  max_units:200 },
  { blood_type:'AB+', units:120, max_units:220 },
  { blood_type:'AB-', units:8,   max_units:150 },
  { blood_type:'O+',  units:600, max_units:650 },
  { blood_type:'O-',  units:55,  max_units:220 },
];

const DEFAULT_DONATIONS = [
  { id:1, donor_id:'#DN-9284', blood_type:'A+',  units:2, status:'processed', donation_date: new Date().toISOString() },
  { id:2, donor_id:'#DN-9285', blood_type:'O-',  units:1, status:'testing',   donation_date: new Date().toISOString() },
  { id:3, donor_id:'#DN-9286', blood_type:'B+',  units:3, status:'processed', donation_date: new Date(Date.now()-86400000).toISOString() },
];

// ============================================================
// STORAGE — guardar y leer de localStorage
// ============================================================
function getInventory() {
  const raw = localStorage.getItem('bb_inventory');
  return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
}
function saveInventory(data) { localStorage.setItem('bb_inventory', JSON.stringify(data)); }

function getDonations() {
  const raw = localStorage.getItem('bb_donations');
  return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_DONATIONS));
}
function saveDonations(data) { localStorage.setItem('bb_donations', JSON.stringify(data)); }

// Inicializar si es la primera vez
if (!localStorage.getItem('bb_inventory')) saveInventory(DEFAULT_INVENTORY);
if (!localStorage.getItem('bb_donations'))  saveDonations(DEFAULT_DONATIONS);

// ============================================================
// USUARIO (viene del login.html o datos por defecto)
// ============================================================
const currentUser = JSON.parse(localStorage.getItem('user') || '{"name":"Dr. Julian Reed","role":"admin"}');
document.getElementById('sidebarName').textContent = currentUser.name || 'Usuario';
document.getElementById('sidebarRole').textContent = currentUser.role || 'Staff';
const initials = (currentUser.name || 'U').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
document.getElementById('userInitials').textContent = initials;

// ============================================================
// TOAST
// ============================================================
let toastTimer;
function showToast(msg, type='success') {
  const toast = document.getElementById('toast');
  const colors = { success:'bg-green-600', error:'bg-red-600', warning:'bg-orange-500', info:'bg-blue-600' };
  const icons  = { success:'check_circle',  error:'error',     warning:'warning',       info:'info' };
  toast.className = `fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 slide-in min-w-[260px] ${colors[type]}`;
  document.getElementById('toastIcon').textContent = icons[type];
  document.getElementById('toastText').textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ============================================================
// MÉTRICAS
// ============================================================
function renderMetrics() {
  const inv = getInventory();
  const don = getDonations();
  const today = new Date().toDateString();

  const total    = inv.reduce((s, b) => s + b.units, 0);
  const critical = inv.filter(b => b.units / b.max_units <= 0.10).length;
  const todayUnits = don
    .filter(d => new Date(d.donation_date).toDateString() === today && d.status === 'processed')
    .reduce((s,d) => s + d.units, 0);

  document.getElementById('metricTotal').textContent    = total.toLocaleString();
  document.getElementById('metricCritical').textContent = critical;
  document.getElementById('metricToday').textContent    = todayUnits;

  const badge = document.getElementById('criticalBadge');
  badge.textContent  = critical > 0 ? `${critical} Crítico` : 'OK';
  badge.className = `px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${critical > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`;
}

// ============================================================
// BLOOD TYPE CARDS
// ============================================================
function getStatusCfg(units, max) {
  const pct = units / max;
  if (pct <= 0.10) return {
    label:'Critical', labelCls:'bg-red-600 text-white',
    barCls:'bg-primary', cardCls:'border-primary/30 bg-primary/5',
    btnLabel:'Emergency Restock', btnCls:'bg-primary text-white hover:bg-primary/90',
    valueCls:'text-primary font-bold'
  };
  if (pct <= 0.30) return {
    label:'Low', labelCls:'bg-orange-100 text-orange-700',
    barCls:'bg-orange-500', cardCls:'',
    btnLabel:'Quick Entry', btnCls:'bg-slate-50 border border-slate-200 hover:bg-primary hover:text-white hover:border-primary',
    valueCls:'font-bold'
  };
  return {
    label:'Stable', labelCls:'bg-green-100 text-green-700',
    barCls:'bg-green-500', cardCls:'',
    btnLabel:'Quick Entry', btnCls:'bg-slate-50 border border-slate-200 hover:bg-primary hover:text-white hover:border-primary',
    valueCls:'font-bold'
  };
}

function renderBloodGrid() {
  const inv  = getInventory();
  const grid = document.getElementById('bloodGrid');
  grid.innerHTML = '';

  inv.forEach((bt, i) => {
    const pct = Math.min((bt.units / bt.max_units) * 100, 100).toFixed(1);
    const cfg = getStatusCfg(bt.units, bt.max_units);

    const card = document.createElement('div');
    card.className = `bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow fade-in ${cfg.cardCls}`;
    card.style.animationDelay = `${i * 50}ms`;
    card.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <span class="text-2xl font-black text-primary">${bt.blood_type}</span>
        <div class="flex items-center gap-2">
          <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.labelCls}">${cfg.label}</span>
          <button onclick="openStockModal('${bt.blood_type}')" class="text-slate-300 hover:text-slate-600 transition-colors" title="Editar stock">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>
      </div>
      <div class="mb-4">
        <div class="flex justify-between text-sm mb-1">
          <span class="text-slate-500">Stock actual</span>
          <span class="${cfg.valueCls}">${bt.units} / ${bt.max_units}</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div class="${cfg.barCls} h-2 rounded-full bar-fill" style="width:0%" data-target="${pct}"></div>
        </div>
        <p class="text-right text-[11px] text-slate-400 mt-1">${pct}%</p>
      </div>
      <button onclick="openDonationModal('${bt.blood_type}')"
        class="w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${cfg.btnCls}">
        <span class="material-symbols-outlined text-[18px]">add_box</span>
        ${cfg.btnLabel}
      </button>`;
    grid.appendChild(card);
  });

  // Animar barras después de renderizar
  setTimeout(() => {
    document.querySelectorAll('.bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.target + '%';
    });
  }, 100);
}

// ============================================================
// ACTIVITIES TABLE
// ============================================================
const STATUS_CFG = {
  processed: { dot:'bg-green-500', text:'text-green-600', label:'Processed' },
  testing:   { dot:'bg-blue-500',  text:'text-blue-600',  label:'Testing'   },
  rejected:  { dot:'bg-red-500',   text:'text-red-600',   label:'Rejected'  },
};

function renderActivities() {
  const donations = getDonations().slice().reverse(); // más recientes primero
  const tbody = document.getElementById('activitiesBody');
  tbody.innerHTML = '';

  if (!donations.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-10 text-center text-slate-400">No hay actividades registradas</td></tr>';
    return;
  }

  donations.forEach(d => {
    const s    = STATUS_CFG[d.status] || STATUS_CFG.testing;
    const date = new Date(d.donation_date).toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' });
    const tr   = document.createElement('tr');
    tr.className = 'fade-in hover:bg-slate-50 transition-colors';
    tr.innerHTML = `
      <td class="px-6 py-4 text-sm font-medium">${d.donor_id}</td>
      <td class="px-6 py-4 text-sm"><span class="font-bold text-primary">${d.blood_type}</span></td>
      <td class="px-6 py-4 text-sm text-slate-500">${date}</td>
      <td class="px-6 py-4 text-sm font-bold">${d.units}</td>
      <td class="px-6 py-4 text-sm">
        <select onchange="changeStatus(${d.id}, this.value)"
          class="text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary/30 bg-white font-medium ${s.text}">
          <option value="testing"   ${d.status==='testing'   ?'selected':''}>Testing</option>
          <option value="processed" ${d.status==='processed' ?'selected':''}>Processed</option>
          <option value="rejected"  ${d.status==='rejected'  ?'selected':''}>Rejected</option>
        </select>
      </td>
      <td class="px-6 py-4 text-sm">
        <button onclick="openDeleteModal(${d.id})" class="text-slate-300 hover:text-red-500 transition-colors" title="Eliminar">
          <span class="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function changeStatus(id, newStatus) {
  const donations = getDonations();
  const idx = donations.findIndex(d => d.id === id);
  if (idx === -1) return;

  const old = donations[idx];

  // Si cambia a processed, sumar al inventario
  if (newStatus === 'processed' && old.status !== 'processed') {
    const inv = getInventory();
    const bt  = inv.find(b => b.blood_type === old.blood_type);
    if (bt) { bt.units = Math.min(bt.units + old.units, bt.max_units); saveInventory(inv); }
  }
  // Si sale de processed, restar del inventario
  if (old.status === 'processed' && newStatus !== 'processed') {
    const inv = getInventory();
    const bt  = inv.find(b => b.blood_type === old.blood_type);
    if (bt) { bt.units = Math.max(bt.units - old.units, 0); saveInventory(inv); }
  }

  donations[idx].status = newStatus;
  saveDonations(donations);
  renderAll();
  showToast(`Estado actualizado a ${newStatus}`, 'info');
}

// ============================================================
// MODAL: Nueva Donación
// ============================================================
function openDonationModal(preselect = '') {
  document.getElementById('donationForm').reset();
  if (preselect) document.getElementById('fBloodType').value = preselect;
  document.getElementById('donationModal').classList.remove('hidden');
}
function closeDonationModal() { document.getElementById('donationModal').classList.add('hidden'); }

function saveDonation(e) {
  e.preventDefault();
  const donor_id   = document.getElementById('fDonorId').value.trim();
  const blood_type = document.getElementById('fBloodType').value;
  const units      = parseInt(document.getElementById('fUnits').value);
  const status     = document.getElementById('fStatus').value;

  if (!donor_id || !blood_type || !units) return;

  const donations = getDonations();
  const newId = donations.length ? Math.max(...donations.map(d=>d.id)) + 1 : 1;
  const entry = { id: newId, donor_id, blood_type, units, status, donation_date: new Date().toISOString() };

  donations.push(entry);
  saveDonations(donations);

  // Si es processed, sumar al inventario
  if (status === 'processed') {
    const inv = getInventory();
    const bt  = inv.find(b => b.blood_type === blood_type);
    if (bt) { bt.units = Math.min(bt.units + units, bt.max_units); saveInventory(inv); }
  }

  closeDonationModal();
  renderAll();
  showToast(`Donación de ${blood_type} registrada (${units} ud.)`, 'success');
}

// ============================================================
// MODAL: Editar Stock
// ============================================================
let editingBloodType = null;
function openStockModal(bloodType) {
  editingBloodType = bloodType;
  const bt = getInventory().find(b => b.blood_type === bloodType);
  document.getElementById('stockModalType').textContent = bloodType;
  document.getElementById('stockUnits').value = bt.units;
  document.getElementById('stockMax').value   = bt.max_units;
  document.getElementById('stockModal').classList.remove('hidden');
}
function closeStockModal() { document.getElementById('stockModal').classList.add('hidden'); editingBloodType = null; }
function saveStock() {
  if (!editingBloodType) return;
  const units = parseInt(document.getElementById('stockUnits').value);
  const max   = parseInt(document.getElementById('stockMax').value);
  if (isNaN(units) || isNaN(max) || units < 0 || max < 1) { showToast('Valores inválidos', 'error'); return; }

  const inv = getInventory();
  const bt  = inv.find(b => b.blood_type === editingBloodType);
  if (bt) { bt.units = Math.min(units, max); bt.max_units = max; saveInventory(inv); }

  closeStockModal();
  renderAll();
  showToast(`Stock de ${editingBloodType} actualizado`, 'success');
}

// ============================================================
// MODAL: Eliminar Actividad
// ============================================================
let deletingId = null;
function openDeleteModal(id)  { deletingId = id; document.getElementById('deleteModal').classList.remove('hidden'); }
function closeDeleteModal()   { deletingId = null; document.getElementById('deleteModal').classList.add('hidden'); }
function confirmDelete() {
  if (!deletingId) return;
  const donations = getDonations();
  const d = donations.find(x => x.id === deletingId);
  if (d && d.status === 'processed') {
    const inv = getInventory();
    const bt  = inv.find(b => b.blood_type === d.blood_type);
    if (bt) { bt.units = Math.max(bt.units - d.units, 0); saveInventory(inv); }
  }
  saveDonations(donations.filter(x => x.id !== deletingId));
  closeDeleteModal();
  renderAll();
  showToast('Actividad eliminada', 'warning');
}

// ============================================================
// EXPORT CSV
// ============================================================
function exportCSV() {
  const donations = getDonations();
  if (!donations.length) { showToast('No hay datos para exportar', 'warning'); return; }

  const rows = [
    ['Donor ID', 'Blood Type', 'Units', 'Status', 'Date'],
    ...donations.map(d => [
      d.donor_id, d.blood_type, d.units, d.status,
      new Date(d.donation_date).toLocaleDateString('es-CO')
    ])
  ].map(r => r.join(',')).join('\n');

  const blob = new Blob([rows], { type:'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `bloodbank_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exportado correctamente', 'success');
}

// ============================================================
// SIDEBAR — sección futura
// ============================================================
function showSection(name) {
  showToast(`Sección "${name}" próximamente`, 'info');
}

// ============================================================
// LOGOUT
// ============================================================
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  window.location.href = 'login.html';
}

// ============================================================
// RENDER GLOBAL
// ============================================================
function renderAll() {
  renderMetrics();
  renderBloodGrid();
  renderActivities();
}

// Cerrar modales al hacer clic fuera
['donationModal','stockModal','deleteModal'].forEach(id => {
  document.getElementById(id).addEventListener('click', function(e) {
    if (e.target === this) this.classList.add('hidden');
  });
});

// INICIAR
renderAll();