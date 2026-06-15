/* ======================================
   DELIVERY TRACKING SEDERHANA
   KELOMPOK 13
   Multi Page Version
   Tanpa Data Dummy
   Database: Google Sheets
====================================== */

const API_URL = "https://script.google.com/macros/s/AKfycbz-aqsQeKcmZS_1n4b9mGdX3Ycf8SmohD35_IS7DLBDZrLdjzHoSra28iinY-6_UNQ2xw/exec";

let tb_delivery = JSON.parse(localStorage.getItem("tb_delivery")) || [];

/* ===============================
   LOCAL STORAGE
================================ */
function saveToLocalStorage() {
  localStorage.setItem("tb_delivery", JSON.stringify(tb_delivery));
}

/* ===============================
   HELPER STATUS
================================ */
function getStatusClass(status) {
  const statusLower = String(status || "").toLowerCase();

  if (statusLower === "diproses") return "status-diproses";
  if (statusLower === "dikirim") return "status-dikirim";
  if (statusLower === "dalam perjalanan") return "status-dalam-perjalanan";
  if (statusLower === "sampai") return "status-sampai";
  if (statusLower === "dibatalkan") return "status-dibatalkan";

  return "";
}

/* ===============================
   VALIDASI ID DELIVERY
================================ */
function isDuplicateId(id_delivery) {
  return tb_delivery.some(item => {
    return String(item.id_delivery).toLowerCase() === String(id_delivery).toLowerCase();
  });
}

/* ===============================
   SUMMARY DASHBOARD
================================ */
function updateSummary() {
  const totalDelivery = document.getElementById("totalDelivery");
  const totalDiproses = document.getElementById("totalDiproses");
  const totalPerjalanan = document.getElementById("totalPerjalanan");
  const totalSampai = document.getElementById("totalSampai");

  if (!totalDelivery || !totalDiproses || !totalPerjalanan || !totalSampai) return;

  totalDelivery.textContent = tb_delivery.length;
  totalDiproses.textContent = tb_delivery.filter(item => item.status_delivery === "Diproses").length;
  totalPerjalanan.textContent = tb_delivery.filter(item => item.status_delivery === "Dalam Perjalanan").length;
  totalSampai.textContent = tb_delivery.filter(item => item.status_delivery === "Sampai").length;
}

/* ===============================
   AMBIL DATA FORM
================================ */
function getFormData() {
  return {
    id_delivery: document.getElementById("id_delivery").value.trim(),

    nama_barang: document.getElementById("nama_barang").value.trim(),
    berat_barang: document.getElementById("berat_barang").value.trim(),
    tanggal_kirim: document.getElementById("tanggal_kirim").value,
    estimasi_sampai: document.getElementById("estimasi_sampai").value,
    status_delivery: document.getElementById("status_delivery").value,
    lokasi_terakhir: document.getElementById("lokasi_terakhir").value.trim(),

    nama_pengirim: document.getElementById("nama_pengirim").value.trim(),
    no_hp_pengirim: document.getElementById("no_hp_pengirim").value.trim(),
    alamat_pengirim: document.getElementById("alamat_pengirim").value.trim(),

    kurir: document.getElementById("kurir").value,
    no_hp_kurir: document.getElementById("no_hp_kurir").value.trim(),
    catatan: document.getElementById("catatan").value.trim(),

    nama_penerima: document.getElementById("nama_penerima").value.trim(),
    no_hp_penerima: document.getElementById("no_hp_penerima").value.trim(),
    alamat_penerima: document.getElementById("alamat_penerima").value.trim()
  };
}

/* ===============================
   RESET FORM
================================ */
function resetForm() {
  const deliveryForm = document.getElementById("deliveryForm");
  if (!deliveryForm) return;

  deliveryForm.reset();

  const submitButton = deliveryForm.querySelector(".btn-submit");
  if (submitButton) {
    submitButton.textContent = "Simpan Data Delivery";
  }
}

/* ===============================
   INPUT PAGE
================================ */
function initInputPage() {
  const deliveryForm = document.getElementById("deliveryForm");
  if (!deliveryForm) return;

  deliveryForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const data = getFormData();

    if (isDuplicateId(data.id_delivery)) {
      alert("ID Delivery sudah digunakan di tampilan web. Gunakan ID lain ya!");
      return;
    }

    if (!data.kurir) {
      alert("Pilih nama kurir terlebih dahulu!");
      return;
    }

    if (!data.no_hp_kurir) {
      alert("Nomor HP kurir wajib diisi!");
      return;
    }

    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(data)
      });

      tb_delivery.push(data);
      saveToLocalStorage();
      updateSummary();
      renderTable();
      resetForm();

      alert("Data berhasil dikirim ke Google Sheets!");

    } catch (error) {
      alert("Gagal mengirim data ke Google Sheets: " + error.message);
      console.error("Error:", error);
    }
  });
}

/* ===============================
   RENDER TABLE DATA PAGE
================================ */
function renderTable() {
  const deliveryTableBody = document.getElementById("deliveryTableBody");
  if (!deliveryTableBody) return;

  deliveryTableBody.innerHTML = "";

  if (tb_delivery.length === 0) {
    deliveryTableBody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align:center; padding: 30px;">
          Belum ada data delivery di tampilan web.
        </td>
      </tr>
    `;
    return;
  }

  tb_delivery.forEach((item, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.id_delivery || "-"}</td>

      <td>
        <strong>${item.nama_pengirim || "-"}</strong><br>
        <small>${item.no_hp_pengirim || ""}</small>
      </td>

      <td>
        <strong>${item.nama_penerima || "-"}</strong><br>
        <small>${item.no_hp_penerima || ""}</small>
      </td>

      <td>${item.nama_barang || "-"}</td>
      <td>${item.berat_barang || "-"}</td>
      <td>${item.tanggal_kirim || "-"}</td>
      <td>${item.estimasi_sampai || "-"}</td>

      <td>
        <span class="badge-status ${getStatusClass(item.status_delivery)}">
          ${item.status_delivery || "-"}
        </span>
      </td>

      <td>${item.lokasi_terakhir || "-"}</td>

      <td>
        <strong>${item.kurir || "-"}</strong><br>
        <small>${item.no_hp_kurir || ""}</small>
      </td>

      <td>
        <button class="action-btn btn-delete" onclick="deleteDelivery(${index})">
          Hapus
        </button>
      </td>
    `;

    deliveryTableBody.appendChild(row);
  });
}

/* ===============================
   HAPUS DATA DARI TAMPILAN WEB
================================ */
function deleteDelivery(index) {
  const confirmDelete = confirm("Yakin ingin menghapus data ini dari tampilan web?");

  if (!confirmDelete) return;

  tb_delivery.splice(index, 1);
  saveToLocalStorage();
  renderTable();
  updateSummary();

  alert("Data berhasil dihapus dari tampilan web.");
}

/* ===============================
   TRACKING PAGE
================================ */
function initTrackingPage() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  if (!searchInput || !searchBtn) return;

  searchBtn.addEventListener("click", searchDelivery);

  searchInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      searchDelivery();
    }
  });
}

/* ===============================
   TRACKING TIMELINE HELPER
================================ */
function getTrackingStep(status) {
  const statusLower = String(status || "").toLowerCase();

  if (statusLower === "diproses") return 1;
  if (statusLower === "dikirim") return 2;
  if (statusLower === "dalam perjalanan") return 3;
  if (statusLower === "sampai") return 4;
  if (statusLower === "dibatalkan") return 0;

  return 1;
}

function getTimelineClass(step, currentStep, status) {
  if (String(status || "").toLowerCase() === "dibatalkan") {
    return "";
  }

  if (step < currentStep) return "done";
  if (step === currentStep) return "active";

  return "";
}

function searchDelivery() {
  const searchInput = document.getElementById("searchInput");
  const trackingResult = document.getElementById("trackingResult");

  if (!searchInput || !trackingResult) return;

  const keyword = searchInput.value.trim().toLowerCase();

  if (keyword === "") {
    trackingResult.innerHTML = `
      <div class="empty-tracking">
        <div class="empty-icon">🔎</div>
        <h3>ID Delivery belum diisi</h3>
        <p>Masukkan ID Delivery terlebih dahulu untuk melihat status paket.</p>
      </div>
    `;
    return;
  }

  const result = tb_delivery.find(item => {
    return String(item.id_delivery).toLowerCase() === keyword;
  });

  if (!result) {
    trackingResult.innerHTML = `
      <div class="not-found-card">
        <h3>Data tidak ditemukan</h3>
        <p>
          Data dengan ID Delivery <strong>${searchInput.value}</strong>
          tidak ditemukan di tampilan web.
        </p>
      </div>
    `;
    return;
  }

  const currentStep = getTrackingStep(result.status_delivery);

  trackingResult.innerHTML = `
    <div class="tracking-card">
      <div class="tracking-card-top">
        <div>
          <h3>Hasil Tracking Paket</h3>
          <p>Informasi status dan perjalanan pengiriman barang.</p>
        </div>

        <div class="tracking-id-badge">
          ${result.id_delivery || "-"}
        </div>
      </div>

      <div class="tracking-timeline">
        <div class="timeline-step ${getTimelineClass(1, currentStep, result.status_delivery)}">
          <div class="timeline-icon">1</div>
          <div>
            <h4>Diproses</h4>
            <p>Paket masuk sistem</p>
          </div>
        </div>

        <div class="timeline-step ${getTimelineClass(2, currentStep, result.status_delivery)}">
          <div class="timeline-icon">2</div>
          <div>
            <h4>Dikirim</h4>
            <p>Paket keluar gudang</p>
          </div>
        </div>

        <div class="timeline-step ${getTimelineClass(3, currentStep, result.status_delivery)}">
          <div class="timeline-icon">3</div>
          <div>
            <h4>Dalam Perjalanan</h4>
            <p>Paket menuju tujuan</p>
          </div>
        </div>

        <div class="timeline-step ${getTimelineClass(4, currentStep, result.status_delivery)}">
          <div class="timeline-icon">4</div>
          <div>
            <h4>Sampai</h4>
            <p>Paket diterima</p>
          </div>
        </div>
      </div>

      <div class="tracking-detail-grid">
        <div class="tracking-detail-item">
          <span>Status Delivery</span>
          <strong>
            <span class="badge-status ${getStatusClass(result.status_delivery)}">
              ${result.status_delivery || "-"}
            </span>
          </strong>
        </div>

        <div class="tracking-detail-item">
          <span>Lokasi Terakhir</span>
          <strong>${result.lokasi_terakhir || "-"}</strong>
        </div>

        <div class="tracking-detail-item">
          <span>Kurir</span>
          <strong>${result.kurir || "-"}</strong>
        </div>

        <div class="tracking-detail-item">
          <span>No HP Kurir</span>
          <strong>${result.no_hp_kurir || "-"}</strong>
        </div>

        <div class="tracking-detail-item">
          <span>Nama Barang</span>
          <strong>${result.nama_barang || "-"}</strong>
        </div>

        <div class="tracking-detail-item">
          <span>Berat Barang</span>
          <strong>${result.berat_barang || "-"}</strong>
        </div>

        <div class="tracking-detail-item">
          <span>Pengirim</span>
          <strong>${result.nama_pengirim || "-"}</strong>
        </div>

        <div class="tracking-detail-item">
          <span>No HP Pengirim</span>
          <strong>${result.no_hp_pengirim || "-"}</strong>
        </div>

        <div class="tracking-detail-item">
          <span>Penerima</span>
          <strong>${result.nama_penerima || "-"}</strong>
        </div>

        <div class="tracking-detail-item">
          <span>No HP Penerima</span>
          <strong>${result.no_hp_penerima || "-"}</strong>
        </div>

        <div class="tracking-detail-item">
          <span>Alamat Penerima</span>
          <strong>${result.alamat_penerima || "-"}</strong>
        </div>

        <div class="tracking-detail-item">
          <span>Tanggal Kirim</span>
          <strong>${result.tanggal_kirim || "-"}</strong>
        </div>

        <div class="tracking-detail-item">
          <span>Estimasi Sampai</span>
          <strong>${result.estimasi_sampai || "-"}</strong>
        </div>

        <div class="tracking-detail-item">
          <span>Catatan</span>
          <strong>${result.catatan || "-"}</strong>
        </div>
      </div>
    </div>
  `;
}

/* ===============================
   RESET DATA WEB MANUAL
   Jalankan di Console:
   resetDataWeb()
================================ */
function resetDataWeb() {
  localStorage.removeItem("tb_delivery");
  tb_delivery = [];
  renderTable();
  updateSummary();
  alert("Data tampilan web berhasil direset.");
}

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", function () {
  updateSummary();
  renderTable();
  initInputPage();
  initTrackingPage();
  initUpdateProgressPage();
});

function renderUpdatePreview(data) {
  const updatePreview = document.getElementById("updatePreview");
  if (!updatePreview) return;

  updatePreview.innerHTML = `
    <div class="update-preview-card">
      <div class="update-preview-top">
        <h3>Progress Berhasil Diperbarui</h3>
        <p>Status delivery sudah berubah dan akan tampil di halaman Tracking.</p>
      </div>

      <div class="update-info-list">
        <div class="update-info-item">
          <span>ID Delivery</span>
          <strong>${data.id_delivery || "-"}</strong>
        </div>

        <div class="update-info-item">
          <span>Status Baru</span>
          <strong>
            <span class="badge-status ${getStatusClass(data.status_delivery)}">
              ${data.status_delivery || "-"}
            </span>
          </strong>
        </div>

        <div class="update-info-item">
          <span>Lokasi Terakhir</span>
          <strong>${data.lokasi_terakhir || "-"}</strong>
        </div>

        <div class="update-info-item">
          <span>Kurir</span>
          <strong>${data.kurir || "-"}</strong>
        </div>

        <div class="update-info-item">
          <span>Waktu Update</span>
          <strong>${data.tanggal_update || "-"} ${data.waktu_update || ""}</strong>
        </div>

        <div class="update-info-item">
          <span>Catatan</span>
          <strong>${data.catatan || "-"}</strong>
        </div>
      </div>
    </div>
  `;
}
/* ===============================
   UPDATE PROGRESS PAGE
================================ */
function initUpdateProgressPage() {
  const updateForm = document.getElementById("updateProgressForm");
  if (!updateForm) return;

  updateForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const idDelivery = document.getElementById("update_id_delivery").value.trim();
    const statusBaru = document.getElementById("update_status_delivery").value;
    const lokasiBaru = document.getElementById("update_lokasi_terakhir").value.trim();
    const catatanBaru = document.getElementById("update_catatan").value.trim();

    const index = tb_delivery.findIndex(item => {
      return String(item.id_delivery).toLowerCase() === String(idDelivery).toLowerCase();
    });

    if (index === -1) {
      alert("ID Delivery tidak ditemukan di tampilan web!");
      return;
    }

    const updateData = {
      action: "update_progress",
      id_delivery: idDelivery,
      status_delivery: statusBaru,
      lokasi_terakhir: lokasiBaru,
      catatan: catatanBaru || "Progress delivery diperbarui"
    };

    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(updateData)
      });

      tb_delivery[index].status_delivery = statusBaru;
      tb_delivery[index].lokasi_terakhir = lokasiBaru;
      tb_delivery[index].catatan = catatanBaru || "Progress delivery diperbarui";
      tb_delivery[index].tanggal_update = new Date().toLocaleDateString("id-ID");
      tb_delivery[index].waktu_update = new Date().toLocaleTimeString("id-ID");

      saveToLocalStorage();
      updateSummary();
      renderTable();
      renderUpdatePreview(tb_delivery[index]);

      alert("Progress berhasil diperbarui di website dan dikirim ke Google Sheet!");
      updateForm.reset();

    } catch (error) {
      alert("Gagal update progress ke Google Sheet: " + error.message);
      console.error("Error:", error);
    }
  });
}