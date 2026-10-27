export const caseStudy = {
  id: 'cabai-hujan-01',
  category: 'SMART FARMING · MISI 01',
  title: 'Cabai setelah hujan',
  subtitle: 'Ambil keputusan pertamamu sebagai petani muda.',
  context: 'Hujan turun selama 3 hari berturut-turut. Tanah di sekitar tanaman cabai masih becek dan beberapa daun mulai menguning.',
  facts: [
    { icon: '🌧️', label: 'Hujan', value: '3 hari' },
    { icon: '💧', label: 'Kelembapan', value: 'Tinggi' },
    { icon: '🌶️', label: 'Usia cabai', value: '14 hari' }
  ],
  question: 'Apa tindakan pertama yang paling masuk akal?',
  options: [
    {
      id: 'drainage',
      marker: 'A',
      title: 'Periksa drainase dan kondisi tanah',
      description: 'Pastikan air tidak menggenang dan amati kondisi akar.',
      correct: true,
      gardenCondition: 'healthy',
      feedbackTitle: 'Keputusan yang tepat!',
      feedback: 'Mulai dari pengamatan. Tanah yang terlalu basah perlu diperiksa sebelum kamu menambah air atau pupuk. Pastikan saluran air berfungsi, lalu amati kembali kondisi tanaman.',
      impact: [
        { icon: '🌱', label: 'Kondisi tanaman', value: 'Lebih terpantau', good: true },
        { icon: '🛡️', label: 'Risiko', value: 'Lebih terkendali', good: true }
      ],
      lesson: 'Petani yang baik mengamati kondisi sebelum bertindak. Gejala daun menguning punya beberapa kemungkinan penyebab, jadi hindari menyimpulkan hanya dari satu gejala.'
    },
    {
      id: 'fertilizer',
      marker: 'B',
      title: 'Langsung tambahkan pupuk',
      description: 'Berikan nutrisi tambahan agar daun segera hijau.',
      correct: false,
      gardenCondition: 'stressed',
      feedbackTitle: 'Belum waktunya menambah input',
      feedback: 'Daun menguning tidak selalu berarti tanaman kekurangan nutrisi. Saat tanah terlalu basah, menambah pupuk tanpa pemeriksaan bisa membuang biaya dan tidak menyelesaikan penyebab masalah.',
      impact: [
        { icon: '💸', label: 'Biaya', value: 'Berpotensi bertambah', good: false },
        { icon: '🔎', label: 'Penyebab masalah', value: 'Belum diketahui', good: false }
      ],
      lesson: 'Lakukan pemeriksaan dasar terlebih dahulu. Hindari menggunakan pupuk atau pestisida hanya berdasarkan dugaan.'
    },
    {
      id: 'watering',
      marker: 'C',
      title: 'Tambah frekuensi penyiraman',
      description: 'Siram lebih sering agar tanaman tetap segar.',
      correct: false,
      gardenCondition: 'stressed',
      feedbackTitle: 'Perhatikan kondisi tanah dulu',
      feedback: 'Tanah sudah becek setelah hujan. Menambah air bisa membuat kondisi terlalu basah bertahan lebih lama. Periksa kelembapan dan drainase sebelum menentukan kebutuhan air berikutnya.',
      impact: [
        { icon: '💧', label: 'Kelembapan', value: 'Bisa makin tinggi', good: false },
        { icon: '🌱', label: 'Langkah berikutnya', value: 'Perlu observasi', good: false }
      ],
      lesson: 'Jadwal penyiraman tidak sebaiknya hanya mengikuti jam. Kondisi tanah, cuaca, jenis tanaman, dan fase pertumbuhan juga perlu dipertimbangkan.'
    }
  ],
  fieldPractice: [
    'Amati apakah ada air yang menggenang di sekitar tanaman.',
    'Periksa kelembapan tanah dengan cara sederhana yang aman.',
    'Amati daun dan batang, lalu catat gejala yang terlihat.',
    'Foto kondisi tanaman sebagai catatan awal.'
  ]
};
