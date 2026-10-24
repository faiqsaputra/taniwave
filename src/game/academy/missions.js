export const MISSIONS = [
  {
    id: 'rain-before-planting',
    number: '01',
    category: 'Farm Intelligence',
    title: 'Hujan Sebelum Tanam',
    subtitle: 'Apakah lahan sudah siap?',
    difficulty: 'Pemula',
    duration: '3 menit',
    xp: 30,
    boardTitle: 'AREA PERSIAPAN TANAM',
    boardMeta: 'HUJAN 3 HARI',
    situation:
      'Kamu akan menanam cabai minggu ini. Setelah hujan selama tiga hari, tanah masih lembap dan sebagian area tampak memiliki genangan.',

    objective:
      'Temukan informasi yang relevan sebelum menentukan tindakan.',

    context: [
      'Komoditas: Cabai',
      'Tahap: Persiapan tanam',
      'Kondisi: Setelah hujan',
    ],

    entities: [
      {
        id: 'plot-1',
        label: 'PETAK 01',
        subtitle: 'Tanah lembap',
        type: 'field',
        fill: 0xcbb184,
        metricLabel: 'Pengamatan',
        metric: 'Air masih terlihat di permukaan',
        detail:
          'Petak ini menunjukkan permukaan tanah yang masih sangat lembap. Belum ada informasi yang cukup untuk menyatakan seluruh zona perakaran sudah siap ditanami.',
      },
      {
        id: 'plot-2',
        label: 'PETAK 02',
        subtitle: 'Aliran air',
        type: 'field',
        fill: 0xb9c88a,
        metricLabel: 'Pengamatan',
        metric: 'Saluran perlu diperiksa',
        detail:
          'Periksa apakah air mengalir keluar dengan baik dan apakah ada bagian saluran yang tersumbat.',
      },
      {
        id: 'plot-3',
        label: 'PETAK 03',
        subtitle: 'Area rendah',
        type: 'field',
        fill: 0xc4ae86,
        metricLabel: 'Pengamatan',
        metric: 'Potensi genangan',
        detail:
          'Area yang lebih rendah dapat menahan air lebih lama. Lama genangan dan kondisi tanah perlu diamati sebelum mengambil keputusan.',
      },
      {
        id: 'plot-4',
        label: 'PETAK 04',
        subtitle: 'Tanaman muda',
        type: 'field',
        fill: 0xb7c58b,
        metricLabel: 'Pengamatan',
        metric: 'Periksa kondisi bibit',
        detail:
          'Bibit perlu diperiksa bersama kondisi tanah. Jangan menyimpulkan adanya penyakit hanya berdasarkan hujan atau tampilan daun.',
      },
      {
        id: 'plot-5',
        label: 'PETAK 05',
        subtitle: 'Tekstur tanah',
        type: 'field',
        fill: 0xd0b88d,
        metricLabel: 'Pengamatan',
        metric: 'Kondisi belum diketahui',
        detail:
          'Tekstur tanah, kelembapan, dan kemampuan drainase tidak dapat ditentukan secara pasti dari peta simulasi ini.',
      },
      {
        id: 'plot-6',
        label: 'PETAK 06',
        subtitle: 'Saluran keluar',
        type: 'field',
        fill: 0xc1cc91,
        metricLabel: 'Pengamatan',
        metric: 'Periksa jalur drainase',
        detail:
          'Pastikan jalur air keluar tidak terhambat. Pengamatan lapangan tetap diperlukan untuk menilai kondisi sebenarnya.',
      },
    ],

    choices: [
      {
        id: 'inspect-drainage',
        label: 'Periksa tanah dan drainase terlebih dahulu',
        description:
          'Kumpulkan informasi sebelum menentukan waktu tanam.',
        score: 100,
        xp: 30,
        outcome: 'safe',
        feedback:
          'Keputusan yang baik. Kamu tidak langsung mengasumsikan tanah siap ditanami hanya karena sebelumnya turun hujan.',

        consequences: [
          {
            label: 'Risiko keputusan',
            value: 'Lebih terukur',
          },
          {
            label: 'Waktu',
            value: 'Perlu pemeriksaan tambahan',
          },
          {
            label: 'Langkah berikutnya',
            value: 'Tentukan kesiapan lahan berdasarkan hasil pengamatan',
          },
        ],

        learning:
          'Kelembapan tanah tidak sama dengan genangan. Kondisi perakaran, kemampuan drainase, dan kebutuhan tanaman perlu dipertimbangkan bersama.',
      },
      {
        id: 'plant-now',
        label: 'Langsung menanam agar tidak kehilangan waktu',
        description:
          'Menanam segera tanpa pemeriksaan tambahan.',
        score: 30,
        xp: 12,
        outcome: 'risk',
        feedback:
          'Keputusan ini terlalu cepat karena kondisi lahan belum diperiksa. Hujan tidak otomatis membuat lahan siap ditanami.',

        consequences: [
          {
            label: 'Risiko keputusan',
            value: 'Kondisi lahan belum diketahui',
          },
          {
            label: 'Waktu',
            value: 'Tidak ada waktu pemeriksaan tambahan',
          },
          {
            label: 'Langkah berikutnya',
            value: 'Amati drainase dan kelembapan sebelum melanjutkan',
          },
        ],

        learning:
          'Kecepatan bukan satu-satunya pertimbangan. Menunda keputusan sebentar untuk mengumpulkan informasi dapat mencegah tindakan yang tidak sesuai.',
      },
      {
        id: 'fertilize-first',
        label: 'Menambahkan pupuk terlebih dahulu',
        description:
          'Memberikan input sebelum kondisi lahan dipahami.',
        score: 20,
        xp: 10,
        outcome: 'risk',
        feedback:
          'Pemupukan belum tentu menjawab masalah yang sedang dihadapi. Kondisi lahan perlu diperiksa dan kebutuhan nutrisi tidak seharusnya diasumsikan.',

        consequences: [
          {
            label: 'Risiko keputusan',
            value: 'Kebutuhan tanaman belum dipastikan',
          },
          {
            label: 'Biaya',
            value: 'Input dapat digunakan tanpa dasar yang cukup',
          },
          {
            label: 'Langkah berikutnya',
            value: 'Periksa kondisi tanah dan kebutuhan tanaman',
          },
        ],

        learning:
          'Intervensi sebaiknya mengikuti masalah yang telah diidentifikasi, bukan dilakukan secara otomatis sebagai respons terhadap hujan.',
      },
    ],
  },

  {
    id: 'budget-challenge',
    number: '02',
    category: 'Farm Business',
    title: 'Modal Tinggal Sejuta',
    subtitle: 'Susun prioritas biaya budidaya',
    difficulty: 'Menengah',
    duration: '4 menit',
    xp: 30,
    boardTitle: 'PETA ALOKASI MODAL',
    boardMeta: 'MODAL RP1 JUTA',
    situation:
      'Kamu memiliki modal Rp1.000.000 untuk mempersiapkan budidaya. Kebutuhan meliputi benih, nutrisi, tenaga kerja, pengelolaan air, alat, dan dana cadangan.',

    objective:
      'Bedakan kebutuhan utama dari pengeluaran yang masih dapat ditunda.',

    context: [
      'Modal: Rp1.000.000',
      'Fokus: Prioritas biaya',
      'Tujuan: Mengendalikan anggaran',
    ],

    entities: [
      {
        id: 'input-seed',
        label: 'BENIH',
        subtitle: 'Rp160 rb',
        type: 'resource',
        fill: 0xf4dfb9,
        metricLabel: 'Estimasi kebutuhan',
        metric: 'Rp160.000',
        detail:
          'Benih termasuk kebutuhan awal. Jumlah aktual harus disesuaikan dengan luas lahan, komoditas, dan rencana penanaman.',
      },
      {
        id: 'input-nutrients',
        label: 'NUTRISI',
        subtitle: 'Rp280 rb',
        type: 'resource',
        fill: 0xd5e4c7,
        metricLabel: 'Estimasi kebutuhan',
        metric: 'Rp280.000',
        detail:
          'Anggaran nutrisi pada simulasi adalah perkiraan biaya, bukan rekomendasi dosis. Kebutuhan dan jenis input harus ditentukan berdasarkan konteks budidaya.',
      },
      {
        id: 'input-labor',
        label: 'TENAGA KERJA',
        subtitle: 'Rp250 rb',
        type: 'resource',
        fill: 0xc8d8e4,
        metricLabel: 'Estimasi kebutuhan',
        metric: 'Rp250.000',
        detail:
          'Biaya tenaga kerja perlu mempertimbangkan pekerjaan yang benar-benar dibutuhkan, jadwal, serta ketersediaan tenaga.',
      },
      {
        id: 'input-water',
        label: 'AIR',
        subtitle: 'Rp120 rb',
        type: 'resource',
        fill: 0xc5e4e8,
        metricLabel: 'Estimasi kebutuhan',
        metric: 'Rp120.000',
        detail:
          'Anggaran pengelolaan air dalam misi ini merupakan simulasi. Kebutuhan aktual ditentukan berdasarkan lahan dan sistem budidaya.',
      },
      {
        id: 'input-tools',
        label: 'PERALATAN',
        subtitle: 'Rp90 rb',
        type: 'resource',
        fill: 0xe4d7c8,
        metricLabel: 'Estimasi kebutuhan',
        metric: 'Rp90.000',
        detail:
          'Peralatan perlu diprioritaskan berdasarkan urgensi. Periksa dahulu apakah alat yang tersedia masih dapat digunakan.',
      },
      {
        id: 'input-reserve',
        label: 'CADANGAN',
        subtitle: 'Rp100 rb',
        type: 'resource',
        fill: 0xe3dfb6,
        metricLabel: 'Alokasi simulasi',
        metric: 'Rp100.000',
        detail:
          'Dana cadangan dapat membantu menghadapi biaya yang tidak terduga. Besarnya perlu disesuaikan dengan risiko dan kebutuhan usaha.',
      },
    ],

    choices: [
      {
        id: 'budget-plan',
        label: 'Prioritaskan kebutuhan utama dan sisakan cadangan',
        description:
          'Periksa urgensi tiap pengeluaran sebelum membelanjakan seluruh modal.',
        score: 100,
        xp: 30,
        outcome: 'safe',
        feedback:
          'Bagus. Kamu mempertimbangkan kebutuhan inti dan risiko biaya tak terduga, bukan hanya membagi uang secara merata.',

        consequences: [
          {
            label: 'Anggaran',
            value: 'Kebutuhan utama diprioritaskan',
          },
          {
            label: 'Cadangan',
            value: 'Dana tidak langsung dihabiskan',
          },
          {
            label: 'Langkah berikutnya',
            value: 'Bandingkan rencana dengan biaya aktual',
          },
        ],

        learning:
          'Perencanaan usaha tani membandingkan kebutuhan, urgensi, dan kemampuan modal. Nilai biaya dalam misi ini bersifat simulasi.',
      },
      {
        id: 'budget-spend-all',
        label: 'Belanjakan seluruh modal untuk input sebanyak mungkin',
        description:
          'Membeli semua kebutuhan tanpa menyisakan anggaran cadangan.',
        score: 25,
        xp: 12,
        outcome: 'risk',
        feedback:
          'Menggunakan seluruh modal sekaligus dapat menyisakan sedikit ruang untuk biaya tak terduga. Setiap pembelian perlu dinilai urgensinya.',

        consequences: [
          {
            label: 'Anggaran',
            value: 'Cadangan berkurang',
          },
          {
            label: 'Risiko',
            value: 'Pengeluaran mendadak lebih sulit ditangani',
          },
          {
            label: 'Langkah berikutnya',
            value: 'Tinjau kebutuhan yang benar-benar mendesak',
          },
        ],

        learning:
          'Modal perlu dikelola mengikuti kebutuhan dan ketidakpastian usaha, bukan hanya dihabiskan karena anggaran tersedia.',
      },
      {
        id: 'budget-equal',
        label: 'Bagi modal sama rata ke semua kategori',
        description:
          'Setiap kebutuhan mendapat bagian uang yang sama.',
        score: 45,
        xp: 18,
        outcome: 'caution',
        feedback:
          'Pembagian yang sama rata terlihat sederhana, tetapi tiap kebutuhan belum tentu sama penting atau memiliki biaya yang sama.',

        consequences: [
          {
            label: 'Anggaran',
            value: 'Belum tentu sesuai kebutuhan',
          },
          {
            label: 'Risiko',
            value: 'Input penting dapat kekurangan dana',
          },
          {
            label: 'Langkah berikutnya',
            value: 'Susun prioritas berdasarkan fungsi dan urgensi',
          },
        ],

        learning:
          'Alokasi anggaran perlu mencerminkan kebutuhan aktual, bukan semata-mata pemerataan nominal.',
      },
    ],
  },

  {
    id: 'harvest-grading',
    number: '03',
    category: 'Smart Marketing',
    title: 'Panen 30 Kilogram',
    subtitle: 'Kualitas menentukan pasar',
    difficulty: 'Menengah',
    duration: '4 menit',
    xp: 30,
    boardTitle: 'AREA SORTIR HASIL PANEN',
    boardMeta: 'HASIL 30 KG',
    situation:
      'Kamu baru memanen 30 kg cabai. Sebuah UMKM membutuhkan 15 kg cabai Grade B untuk produksi sambal setiap Jumat. Hasil panenmu terdiri dari beberapa tingkat kualitas.',

    objective:
      'Cocokkan kualitas hasil panen dengan kebutuhan pembeli.',

    context: [
      'Total panen: 30 kg',
      'Permintaan: 15 kg Grade B',
      'Fokus: Grading dan pasar',
    ],

    entities: [
      {
        id: 'grade-a',
        label: 'GRADE A',
        subtitle: '8 kg',
        type: 'produce',
        fill: 0xdce9c9,
        metricLabel: 'Stok simulasi',
        metric: '8 kg',
        detail:
          'Hasil yang masuk Grade A pada simulasi berjumlah 8 kg. Kriteria mutu sebenarnya perlu ditetapkan sesuai komoditas dan persyaratan pembeli.',
      },
      {
        id: 'grade-b',
        label: 'GRADE B',
        subtitle: '15 kg',
        type: 'produce',
        fill: 0xf1e4b7,
        metricLabel: 'Stok simulasi',
        metric: '15 kg',
        detail:
          'Jumlah Grade B cocok dengan volume permintaan UMKM dalam skenario ini, selama kriteria mutu dan jadwal penyerahan juga terpenuhi.',
      },
      {
        id: 'grade-c',
        label: 'GRADE C',
        subtitle: '5 kg',
        type: 'produce',
        fill: 0xf1d2bd,
        metricLabel: 'Stok simulasi',
        metric: '5 kg',
        detail:
          'Hasil Grade C dapat memiliki peluang pasar lain, misalnya pengolahan, apabila kualitasnya masih sesuai dengan standar keamanan dan kebutuhan produk.',
      },
      {
        id: 'grade-reject',
        label: 'RUSAK',
        subtitle: '2 kg',
        type: 'produce',
        fill: 0xe9c6c1,
        metricLabel: 'Stok simulasi',
        metric: '2 kg',
        detail:
          'Hasil rusak harus dipisahkan dan diperiksa. Hasil yang tidak layak tidak boleh dicampurkan begitu saja ke produk yang akan dijual untuk konsumsi.',
      },
      {
        id: 'buyer-umkm',
        label: 'UMKM',
        subtitle: 'Butuh 15 kg',
        type: 'resource',
        fill: 0xc6dce7,
        metricLabel: 'Kebutuhan pembeli',
        metric: '15 kg Grade B',
        detail:
          'UMKM dalam skenario membutuhkan 15 kg Grade B setiap Jumat. Spesifikasi dan jadwal tetap harus disepakati sebelum pesanan diterima.',
      },
      {
        id: 'mixed-harvest',
        label: 'BELUM SORTIR',
        subtitle: '30 kg campuran',
        type: 'produce',
        fill: 0xe2d8c8,
        metricLabel: 'Status hasil',
        metric: 'Belum dipisahkan',
        detail:
          'Menjual semua hasil sebagai satu tingkat kualitas menghilangkan informasi grade dan dapat membuat penawaran tidak sesuai kebutuhan pembeli.',
      },
    ],

    choices: [
      {
        id: 'sort-by-grade',
        label: 'Pisahkan grade dan tawarkan 15 kg Grade B ke UMKM',
        description:
          'Simpan Grade A dan C untuk pembeli yang sesuai, serta pisahkan hasil rusak.',
        score: 100,
        xp: 30,
        outcome: 'safe',
        feedback:
          'Tepat. Kamu mencocokkan volume dan kualitas dengan kebutuhan pembeli, tanpa menganggap seluruh hasil panen memiliki mutu yang sama.',

        consequences: [
          {
            label: 'Permintaan UMKM',
            value: '15 kg Grade B dapat ditawarkan',
          },
          {
            label: 'Kualitas',
            value: 'Setiap grade tetap dipisahkan',
          },
          {
            label: 'Langkah berikutnya',
            value: 'Konfirmasi harga, spesifikasi, dan jadwal',
          },
        ],

        learning:
          'Grading membantu mengelompokkan hasil berdasarkan kriteria mutu. Kriteria Grade A/B/C tidak universal dan harus mengikuti kesepakatan komoditas atau pembeli.',
      },
      {
        id: 'mix-harvest',
        label: 'Campurkan semua hasil agar cepat terjual',
        description:
          'Menjual hasil panen sebagai satu kelompok tanpa pemisahan mutu.',
        score: 20,
        xp: 10,
        outcome: 'risk',
        feedback:
          'Keputusan ini mengabaikan spesifikasi pembeli dan perbedaan mutu hasil. Produk yang tidak sesuai bisa ditolak atau dihargai berbeda.',

        consequences: [
          {
            label: 'Kualitas',
            value: 'Informasi grade hilang',
          },
          {
            label: 'Risiko transaksi',
            value: 'Penawaran dapat tidak sesuai permintaan',
          },
          {
            label: 'Langkah berikutnya',
            value: 'Lakukan sortir sebelum menawarkan produk',
          },
        ],

        learning:
          'Pemisahan mutu membuat kualitas dan tujuan pasar lebih jelas. Hasil rusak juga perlu ditangani secara terpisah.',
      },
      {
        id: 'wait-premium',
        label: 'Tunggu pembeli yang mau membeli seluruh hasil',
        description:
          'Menunda penawaran sampai ditemukan satu pembeli untuk semua grade.',
        score: 45,
        xp: 18,
        outcome: 'caution',
        feedback:
          'Menunggu satu pembeli dapat menyederhanakan transaksi, tetapi juga bisa membuat hasil yang sudah siap tidak segera memiliki saluran penjualan.',

        consequences: [
          {
            label: 'Peluang pasar',
            value: 'Permintaan yang sudah sesuai bisa terlewat',
          },
          {
            label: 'Waktu',
            value: 'Sebagian hasil menunggu pembeli',
          },
          {
            label: 'Langkah berikutnya',
            value: 'Cocokkan setiap grade dengan pasar yang sesuai',
          },
        ],

        learning:
          'Menghubungkan grade dengan segmen pasar dapat membantu memperluas peluang penjualan. Keputusan akhir tetap mempertimbangkan biaya logistik dan kesepakatan pembeli.',
      },
    ],
  },
];

export const getMissionById = (missionId) =>
  MISSIONS.find((mission) => mission.id === missionId) || MISSIONS[0];