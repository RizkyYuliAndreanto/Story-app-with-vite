// src/views/not-found-view.js
class NotFoundView {
  getTemplate() {
    return `
        <section class="not-found-hero">
          <div class="not-found-content">
            <h2>404 - Halaman Tidak Ditemukan</h2>
            <p>Maaf, halaman yang Anda cari tidak ada. Mungkin Anda salah alamat?</p>
            <a href="#/" class="back-home-button">Kembali ke Beranda</a>
          </div>
        </section>
        <style>
          .not-found-hero {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: calc(100vh - 120px); /* Adjust based on header/footer height */
            text-align: center;
            background-color: #f8f8f8;
            color: #333;
            padding: 20px;
          }
  
          .not-found-content {
            background-color: #fff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
  
          .not-found-content h2 {
            font-size: 2.5em;
            color: #d32f2f;
            margin-bottom: 20px;
          }
  
          .not-found-content p {
            font-size: 1.2em;
            margin-bottom: 30px;
          }
  
          .back-home-button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 25px;
            border-radius: 5px;
            text-decoration: none;
            font-size: 1.1em;
            transition: background-color 0.3s ease;
          }
  
          .back-home-button:hover {
            background-color: #45a049;
          }
        </style>
      `;
  }
}

export default NotFoundView;
