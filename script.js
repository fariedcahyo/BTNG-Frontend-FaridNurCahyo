const apiUrl = 'https://api-web.dnccudinus.org/api/mobil';

const carContainer = document.getElementById('car-container');
const resultCount = document.getElementById('result-count');
const inputNama = document.getElementById('filter-nama');
const selBrand = document.getElementById('filter-brand');
const selTransmisi = document.getElementById('filter-transmisi');
const selBahanBakar = document.getElementById('filter-bahan-bakar');
const selSort = document.getElementById('sort-harga');
const btnSearch = document.getElementById('btn-search-action');
const btnReset = document.getElementById('btn-reset');

const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180">' +
    '<rect width="100%" height="100%" fill="#2a2d3a"/>' +
    '<text x="50%" y="50%" fill="#aaaaaa" font-family="sans-serif" font-size="16" ' +
    'text-anchor="middle" dominant-baseline="middle">Gambar belum tersedia</text></svg>'
);

let semuaDataMobil = [];

function escapeHTML(teks) {
    return String(teks ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function tampilkanPesan(teks, jenis = '') {
    carContainer.innerHTML = `<p class="grid-message ${jenis}">${teks}</p>`;
}

function tampilkanMobil(dataArray) {
    resultCount.textContent = semuaDataMobil.length
        ? `${dataArray.length} dari ${semuaDataMobil.length} mobil ditemukan`
        : '';

    if (dataArray.length === 0) {
        tampilkanPesan('Mobil yang kamu cari tidak ditemukan. Coba ubah filter atau klik Reset.');
        return;
    }

    carContainer.innerHTML = dataArray.map(mobil => {
        const harga = Number(mobil.harga) || 0;
        const hargaFormat = harga ? 'Rp ' + harga.toLocaleString('id-ID') : 'Harga hubungi penjual';
        const foto = mobil.foto ? escapeHTML(mobil.foto) : PLACEHOLDER;
        const nama = escapeHTML(mobil.nama);

        return `
            <div class="car-card">
                <img src="${foto}" alt="${nama}" loading="lazy"
                     onerror="this.onerror=null; this.src='${PLACEHOLDER}'">
                <div class="car-info">
                    <h3>${nama}</h3>
                    <p class="car-meta">${escapeHTML(mobil.brand)} &bull; ${escapeHTML(mobil.tahun)}</p>
                    <div class="car-badges">
                        <span class="badge">${escapeHTML(mobil.transmisi)}</span>
                        <span class="badge">${escapeHTML(mobil.bahan_bakar)}</span>
                    </div>
                    <p class="car-price">${hargaFormat}</p>
                    <a href="#footer" class="btn-detail">Hubungi Penjual</a>
                </div>
            </div>`;
    }).join('');
}

function isiDropdown(select, field, labelSemua) {
    const nilai = [...new Set(semuaDataMobil.map(m => m[field]).filter(Boolean))].sort();
    select.innerHTML = `<option value="">${labelSemua}</option>` +
        nilai.map(n => `<option value="${escapeHTML(n)}">${escapeHTML(n)}</option>`).join('');
}

async function getMobil() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Status ' + response.status);
        const data = await response.json();

        semuaDataMobil = data.data || data;

        isiDropdown(selBrand, 'brand', 'Semua Brand');
        isiDropdown(selTransmisi, 'transmisi', 'Semua Transmisi');
        isiDropdown(selBahanBakar, 'bahan_bakar', 'Semua Mesin');

        tampilkanMobil(semuaDataMobil);
    } catch (error) {
        console.error('Gagal mengambil data API:', error);
        tampilkanPesan('Gagal memuat data mobil. Periksa koneksi internet lalu muat ulang halaman.', 'error');
    }
}

function terapkanFilter() {
    const kataKunci = inputNama.value.trim().toLowerCase();
    const brand = selBrand.value.toLowerCase();
    const transmisi = selTransmisi.value.toLowerCase();
    const bahanBakar = selBahanBakar.value.toLowerCase();

    const hasil = semuaDataMobil.filter(m => {
        const cocokNama = !kataKunci || (m.nama || '').toLowerCase().includes(kataKunci);
        const cocokBrand = !brand || (m.brand || '').toLowerCase() === brand;
        const cocokTransmisi = !transmisi || (m.transmisi || '').toLowerCase() === transmisi;
        const cocokBahanBakar = !bahanBakar || (m.bahan_bakar || '').toLowerCase() === bahanBakar;
        return cocokNama && cocokBrand && cocokTransmisi && cocokBahanBakar;
    });

    if (selSort.value === 'asc') hasil.sort((a, b) => (Number(a.harga) || 0) - (Number(b.harga) || 0));
    if (selSort.value === 'desc') hasil.sort((a, b) => (Number(b.harga) || 0) - (Number(a.harga) || 0));

    tampilkanMobil(hasil);
}

function resetFilter() {
    inputNama.value = '';
    selBrand.value = '';
    selTransmisi.value = '';
    selBahanBakar.value = '';
    selSort.value = '';
    tampilkanMobil(semuaDataMobil);
}

[selBrand, selTransmisi, selBahanBakar, selSort].forEach(el => el.addEventListener('change', terapkanFilter));
inputNama.addEventListener('input', terapkanFilter);
inputNama.addEventListener('keydown', e => { if (e.key === 'Enter') terapkanFilter(); });

btnSearch.addEventListener('click', () => {
    terapkanFilter();
    document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
});
btnReset.addEventListener('click', resetFilter);

getMobil();

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const navButtons = document.getElementById('nav-buttons');

function setMenu(buka) {
    navLinks.classList.toggle('active', buka);
    navButtons.classList.toggle('active', buka);
    hamburger.classList.toggle('active', buka);
    hamburger.setAttribute('aria-expanded', String(buka));
    hamburger.setAttribute('aria-label', buka ? 'Tutup menu' : 'Buka menu');
}

hamburger.addEventListener('click', () => setMenu(!navLinks.classList.contains('active')));

navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

document.querySelectorAll('.btn-login, .btn-signup').forEach(btn => {
    btn.addEventListener('click', e => {
        e.preventDefault();
        alert('Fitur ini belum tersedia.');
    });
});