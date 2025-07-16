# API Klasifikasi Jenis Alpukat 🥑

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-2.x-green.svg)](https://flask.palletsprojects.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Sebuah layanan API RESTful yang dibangun menggunakan **Flask** untuk mengklasifikasikan jenis buah alpukat berdasarkan gambar yang diunggah. Proyek ini dilengkapi dengan panel manajemen admin berbasis web, autentikasi pengguna menggunakan JWT, dan dokumentasi API interaktif menggunakan Swagger UI.

## ✨ Fitur Utama

-   **Klasifikasi Gambar**: Unggah gambar buah alpukat dan dapatkan prediksi jenisnya secara *real-time* menggunakan model TensorFlow Lite.
-   **Panel Manajemen Admin**: Antarmuka web untuk admin guna mengelola (CRUD) data referensi jenis alpukat dan melihat riwayat klasifikasi.
-   **Autentikasi Aman**: Menggunakan JSON Web Tokens (JWT) untuk mengamankan endpoint API.
-   **Dokumentasi API Interaktif**: Dokumentasi lengkap yang dibangun dengan Swagger UI, memungkinkan developer untuk memahami dan mencoba setiap endpoint secara langsung dari browser.
-   **Struktur Proyek Profesional**: Kode diorganisir dengan baik menggunakan pola *Application Factory* dan *Blueprints* untuk skalabilitas dan kemudahan pemeliharaan.
-   **Konfigurasi Berbasis Lingkungan**: Pengelolaan konfigurasi yang mudah untuk pengembangan dan produksi menggunakan file `.env`.

---

## 🏛️ Struktur Proyek

Proyek ini disusun dengan struktur yang bersih dan modular:

```
.
├── api/                # Modul utama aplikasi
│   ├── __init__.py     # Application Factory (membuat instance Flask)
│   ├── models.py       # Model database (SQLAlchemy)
│   ├── routes.py       # Semua endpoint API (Blueprint)
│   └── utils.py        # Fungsi utilitas (otentikasi, pemrosesan gambar)
├── static/             # Aset statis (CSS, JS, swagger.json)
├── templates/          # Template HTML (untuk Panel Admin)
├── config.py           # Konfigurasi aplikasi
├── main.py             # Titik masuk untuk menjalankan aplikasi
├── model.tflite        # File model machine learning
├── labels.txt          # File label untuk kelas model
├── requirements.txt    # Daftar dependensi Python
└── .env                # File konfigurasi lingkungan (TIDAK ADA DI REPO)
```

---

## 🚀 Instalasi & Pengaturan

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di lingkungan lokal Anda.

### 1. Prasyarat

-   [Python 3.9+](https://www.python.org/downloads/)
-   `pip` (Python package installer)
-   Sebuah server database MySQL

### 2. Kloning Repositori

```bash
git clone [URL_REPOSITORI_ANDA]
cd [NAMA_FOLDER_PROYEK]
```

### 3. Buat dan Aktifkan Virtual Environment

Sangat disarankan untuk menggunakan *virtual environment* untuk mengisolasi dependensi proyek.

-   **Windows:**
    ```bash
    python -m venv venv
    .env\Scripts\activate
    ```
-   **macOS/Linux:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

### 4. Instal Dependensi

Instal semua pustaka Python yang dibutuhkan dari file `requirements.txt`.

```bash
pip install -r requirements.txt
```

### 5. Konfigurasi Lingkungan (`.env`)

Buat file baru bernama `.env` di direktori root proyek. Salin konten di bawah ini ke dalamnya dan sesuaikan nilainya.

```env
# URL Koneksi Database MySQL
# Format: mysql+pymysql://<user>:<password>@<host>/<db_name>
DATABASE_URL='mysql+pymysql://buildrmy_api-alpukat:passwordlo@localhost/buildrmy_api-alpukat'

# Kunci Rahasia untuk JWT (JSON Web Token)
# Ganti dengan string acak yang kuat!
SECRET_KEY='ganti-ini-dengan-kunci-rahasia-yang-sangat-aman'
```

> **Cara Membuat `SECRET_KEY` yang Kuat:**
> Anda dapat membuatnya dengan cepat menggunakan Python:
> ```bash
> python -c "import os, base64; print(base64.urlsafe_b64encode(os.urandom(32)).decode())"
> ```
> Salin hasilnya dan tempel sebagai nilai `SECRET_KEY`.

### 6. Tempatkan File Model

Pastikan file model `model.tflite` dan `labels.txt` Anda berada di **direktori root** proyek (sejajar dengan `main.py`).

### 7. Jalankan Aplikasi

Setelah semua konfigurasi selesai, jalankan aplikasi menggunakan perintah berikut:

```bash
python main.py
```

Aplikasi akan berjalan di `http://127.0.0.1:5000`. Saat pertama kali dijalankan, aplikasi akan secara otomatis membuat tabel yang diperlukan di database Anda dan membuat pengguna default:
-   **Admin**: `username: admin`, `password: adminpass`
-   **User**: `username: user1`, `password: userpass`

---

## 📖 Cara Menggunakan API

Anda dapat mengonsumsi API menggunakan *tools* seperti `curl`, Postman, atau langsung dari dokumentasi Swagger.

### 1. Registrasi Pengguna

Buat pengguna baru dengan mengirimkan request `POST`.

```bash
curl -X POST http://127.0.0.1:5000/register \
-H "Content-Type: application/json" \
-d '{
    "username": "pengguna_baru",
    "password": "kata_sandi_rahasia"
}'
```

### 2. Login & Dapatkan Token JWT

Login untuk mendapatkan token JWT yang akan digunakan untuk autentikasi pada *request* selanjutnya.

```bash
curl -X POST http://127.0.0.1:5000/login \
-H "Content-Type: application/json" \
-d '{
    "username": "pengguna_baru",
    "password": "kata_sandi_rahasia"
}'
```

**Respons Sukses:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
Simpan `token` ini untuk digunakan pada langkah berikutnya.

### 3. Klasifikasi Gambar

Kirimkan gambar untuk diklasifikasikan dengan menyertakan token JWT pada *header* `x-access-token`.

```bash
curl -X POST http://127.0.0.1:5000/classify \
-H "x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
-F "image=@/path/ke/gambar/alpukat.jpg"
```

**Respons Sukses:**
```json
{
  "classification_result": "Alpukat_Kendil",
  "filename": "alpukat.jpg",
  "message": "Image uploaded and classified"
}
```

---

## 🎛️ Panel Admin

Panel admin menyediakan antarmuka web untuk mengelola data aplikasi.

-   **URL**: `http://127.0.0.1:5000/admin_panel`
-   **Login**: Gunakan kredensial admin (`admin`/`adminpass` atau yang Anda buat sendiri).
-   **Fitur**:
    -   Manajemen Detail Jenis Alpukat (Tambah, Lihat, Edit, Hapus).
    -   Melihat riwayat semua klasifikasi yang dilakukan oleh pengguna.

##  Swagger UI

Dokumentasi API yang lengkap dan interaktif tersedia melalui Swagger UI.

-   **URL**: `http://127.0.0.1:5000/api/docs`
-   Anda dapat melihat semua *endpoint*, skema data, dan mencoba API secara langsung dari halaman ini.

---

## 🥑 Jenis Alpukat yang Dikenali

Model ini dilatih untuk mengenali beberapa jenis alpukat berikut:
- Alpukat Aligator
- Alpukat Kendil
- Alpukat Madu
- Alpukat SW01
- Alpukat Super

---

## ☁️ Deployment

Untuk deployment ke lingkungan produksi seperti **cPanel**:
1.  Unggah semua file proyek ke direktori aplikasi Anda.
2.  Gunakan fitur **"Setup Python App"** di cPanel.
3.  Pastikan *entry point* aplikasi mengarah ke `main.py` dan objek WSGI adalah `app`.
4.  Instal dependensi dari `requirements.txt` menggunakan terminal cPanel atau fitur yang tersedia.
5.  Atur *environment variables* (seperti `DATABASE_URL` dan `SECRET_KEY`) melalui antarmuka cPanel jika memungkinkan, atau tetap gunakan file `.env`.

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE).
