export const MISSIONS = [
  {
    id: "cabai-hujan",
    number: "01",

    category: "BUDIDAYA",
    title: "Cabai Setelah Hujan",

    shortDescription:
      "Tanamanmu baru 2 minggu. Hujan deras turun 3 hari berturut-turut.",

    question:
      "Hujan terus turun dan tanah terlihat terlalu basah. Apa langkah pertamamu?",

    objective:
      "Belajar mengumpulkan bukti sebelum memberikan perlakuan pada tanaman.",

    duration: 3,

    difficulty: "easy",
    difficultyLabel: "PEMULA",

    asset: "/assets/academy/case-cabai.svg",

    context: [
      {
        icon: "🌧️",
        label: "Curah hujan",
        value: "Tinggi",
      },
      {
        icon: "💧",
        label: "Kondisi tanah",
        value: "Terlalu basah",
      },
      {
        icon: "🌱",
        label: "Umur tanaman",
        value: "14 hari",
      },
    ],

    entities: [
      {
        id: "soil",

        label: "Tanah",
        subtitle: "Kelembapan",

        metric: "Terlalu basah",

        detail:
          "Permukaan tanah masih jenuh air dan belum kembali ke kondisi lembap yang ideal.",

        type: "soil",

        interactive: true,

        position: {
          x: 28,
          y: 68,
        },
      },

      {
        id: "leaf",

        label: "Daun cabai",
        subtitle: "Gejala",

        metric: "Mulai menguning",

        detail:
          "Beberapa daun bagian bawah tampak menguning. Ini adalah gejala yang perlu diamati, bukan diagnosis tunggal.",

        type: "plant",

        interactive: true,

        position: {
          x: 53,
          y: 43,
        },
      },

      {
        id: "drainage",

        label: "Drainase",
        subtitle: "Aliran air",

        metric: "Kurang lancar",

        detail:
          "Ada genangan kecil di sisi bedengan. Air perlu punya jalur keluar agar tidak terus mengendap.",

        type: "drainage",

        interactive: true,

        position: {
          x: 76,
          y: 66,
        },
      },
    ],

    choices: [
      {
        id: "drain",

        label: "Periksa dan buka jalur drainase",

        description:
          "Kurangi genangan sebelum memberi input tambahan.",

        score: 100,

        coins: 30,

        result: "excellent",

        feedback:
          "Kamu memprioritaskan kondisi lingkungan akar terlebih dahulu. Setelah air terkendali, observasi berikutnya menjadi lebih masuk akal.",

        learning:
          "Kenali penyebab masalah sebelum menambah pupuk atau air.",
      },

      {
        id: "fertilize",

        label: "Langsung tambah pupuk",

        description:
          "Berikan nutrisi agar daun cepat hijau.",

        score: 45,

        coins: 10,

        result: "partial",

        feedback:
          "Nutrisi bukan selalu jawaban pertama. Saat tanah terlalu basah, masalah air dan kondisi akar sebaiknya diperiksa lebih dulu.",

        learning:
          "Jangan menambah input sebelum memahami kondisi lahan.",
      },

      {
        id: "water",

        label: "Tambah penyiraman",

        description:
          "Sirami tanaman supaya tidak kekurangan air.",

        score: 20,

        coins: 5,

        result: "poor",

        feedback:
          "Kondisi tanah menunjukkan air sudah berlebih. Menambah air akan membuat kondisi yang sedang bermasalah semakin berat.",

        learning:
          "Gunakan kondisi tanah sebagai bukti sebelum menyiram.",
      },
    ],

    reward: {
      baseXp: 80,

      coins: {
        excellent: 30,
        partial: 10,
        poor: 5,
      },

      badge: {
        id: "water-observer",
        icon: "💧",
        name: "Pengamat Air",
        description:
          "Berhasil mengambil keputusan berdasarkan kondisi air dan tanah.",
      },
    },

    practice: {
      title: "Cek Tanamanmu",

      intro:
        "Sekarang cek satu tanaman di kebunmu. Jangan langsung memberi perlakuan. Amati dan catat dulu.",

      checklist: [
        "Periksa apakah ada genangan",
        "Rasakan kondisi lembap tanah",
        "Amati warna dan posisi daun",
        "Catat temuan sebelum mengambil tindakan",
      ],

      completionMessage:
        "Kamu sudah menyelesaikan simulasi. Sekarang waktunya membawa keputusanmu ke kebun nyata.",
    },

    unlock: {
      requiredMission: null,
      requiredScore: 0,
    },
  },

  // =====================================================
  // MISSION 02
  // =====================================================

  {
    id: "bibit-sehat",
    number: "02",

    category: "PEMBIBITAN",
    title: "Pilih Bibit yang Siap Tanam",

    shortDescription:
      "Kamu punya tiga pilihan bibit. Mana yang paling siap masuk lahan?",

    question:
      "Tiga bibit tersedia. Mana yang kamu pilih untuk dipindahkan ke lahan?",

    objective:
      "Mengenali ciri bibit yang sehat dan tidak hanya memilih berdasarkan ukuran.",

    duration: 3,

    difficulty: "easy",
    difficultyLabel: "PEMULA",

    asset: "/assets/academy/case-bibit.svg",

    context: [
      {
        icon: "🌱",
        label: "Pilihan bibit",
        value: "3 bibit",
      },
      {
        icon: "☀️",
        label: "Cuaca",
        value: "Cerah",
      },
      {
        icon: "🪴",
        label: "Tahap",
        value: "Siap pindah",
      },
    ],

    entities: [
      {
        id: "seedling-a",

        label: "Bibit A",
        subtitle: "Tinggi",

        metric: "Terlalu memanjang",

        detail:
          "Batang tinggi dan kurus dengan jarak antar daun cukup jauh.",

        type: "seedling",

        interactive: true,

        position: {
          x: 22,
          y: 52,
        },
      },

      {
        id: "seedling-b",

        label: "Bibit B",
        subtitle: "Kondisi",

        metric: "Kokoh & segar",

        detail:
          "Batang terlihat kokoh dan daun berwarna relatif seragam.",

        type: "seedling",

        interactive: true,

        position: {
          x: 50,
          y: 48,
        },
      },

      {
        id: "seedling-c",

        label: "Bibit C",
        subtitle: "Daun",

        metric: "Ada bercak",

        detail:
          "Terlihat bercak pada beberapa bagian daun sehingga perlu pemeriksaan lebih lanjut.",

        type: "seedling",

        interactive: true,

        position: {
          x: 78,
          y: 53,
        },
      },
    ],

    choices: [
      {
        id: "b",

        label: "Pilih Bibit B",

        description:
          "Utamakan bibit yang terlihat sehat dan kokoh.",

        score: 100,

        coins: 30,

        result: "excellent",

        feedback:
          "Kamu memilih berdasarkan kondisi tanaman, bukan sekadar tinggi atau ukuran.",

        learning:
          "Bibit sehat biasanya menjadi titik awal yang lebih baik untuk pertumbuhan.",
      },

      {
        id: "a",

        label: "Pilih Bibit A",

        description:
          "Pilih yang paling tinggi agar cepat besar.",

        score: 50,

        coins: 10,

        result: "partial",

        feedback:
          "Ukuran tinggi belum tentu berarti bibit lebih siap. Struktur batang dan kondisi keseluruhan perlu diperhatikan.",

        learning:
          "Jangan menyamakan tinggi tanaman dengan kualitas bibit.",
      },

      {
        id: "c",

        label: "Pilih Bibit C",

        description:
          "Coba saja karena daunnya masih banyak.",

        score: 35,

        coins: 5,

        result: "poor",

        feedback:
          "Bercak pada daun adalah sinyal untuk diperiksa lebih lanjut sebelum bibit dipindahkan.",

        learning:
          "Amati gejala tanaman sebelum memutuskan.",
      },
    ],

    reward: {
      baseXp: 80,

      coins: {
        excellent: 30,
        partial: 10,
        poor: 5,
      },

      badge: {
        id: "seedling-selector",
        icon: "🌱",
        name: "Pemilih Bibit",
        description:
          "Berhasil memilih bibit berdasarkan kondisi tanaman.",
      },
    },

    practice: {
      title: "Bandingkan Bibit di Sekitarmu",

      intro:
        "Cari tiga bibit di sekitar kamu dan bandingkan kondisinya dengan kriteria sederhana.",

      checklist: [
        "Bandingkan kekokohan batang",
        "Amati warna daun",
        "Periksa bercak atau kerusakan",
        "Pilih satu bibit dan tulis alasanmu",
      ],

      completionMessage:
        "Simulasi selesai. Sekarang coba gunakan cara pengamatan yang sama pada bibit nyata.",
    },

    unlock: {
      requiredMission: "cabai-hujan",
      requiredScore: 60,
    },
  },

  // =====================================================
  // MISSION 03
  // =====================================================

  {
    id: "harga-pasar",
    number: "03",

    category: "USAHA TANI",
    title: "Harga Turun, Panen Tetap Jalan",

    shortDescription:
      "Harga komoditas turun. Kamu harus memilih strategi agar usaha tidak rugi.",

    question:
      "Harga sedang turun. Apa keputusanmu agar hasil panen tetap punya nilai?",

    objective:
      "Belajar melihat keputusan budidaya dan pasar sebagai satu rangkaian.",

    duration: 4,

    difficulty: "medium",
    difficultyLabel: "MENENGAH",

    asset: "/assets/academy/case-market.svg",

    context: [
      {
        icon: "📉",
        label: "Harga",
        value: "-20%",
      },
      {
        icon: "💰",
        label: "Modal",
        value: "Terbatas",
      },
      {
        icon: "🧺",
        label: "Panen",
        value: "Dekat",
      },
    ],

    entities: [
      {
        id: "market",

        label: "Pasar",
        subtitle: "Harga",

        metric: "Turun 20%",

        detail:
          "Harga sedang melemah. Menjual semuanya pada satu waktu meningkatkan ketergantungan pada harga hari ini.",

        type: "market",

        interactive: true,

        position: {
          x: 24,
          y: 43,
        },
      },

      {
        id: "stock",

        label: "Hasil panen",
        subtitle: "Kualitas",

        metric: "Layak jual",

        detail:
          "Sebagian besar hasil panen masih berada dalam kondisi yang dapat dipasarkan.",

        type: "harvest",

        interactive: true,

        position: {
          x: 51,
          y: 59,
        },
      },

      {
        id: "cost",

        label: "Biaya",
        subtitle: "Operasional",

        metric: "Terbatas",

        detail:
          "Modal tambahan terbatas sehingga strategi baru harus memperhatikan biaya.",

        type: "cost",

        interactive: true,

        position: {
          x: 78,
          y: 45,
        },
      },
    ],

    choices: [
      {
        id: "grade",

        label: "Sortir dan cari beberapa kanal penjualan",

        description:
          "Pisahkan kualitas dan jangan bergantung pada satu pembeli.",

        score: 100,

        coins: 40,

        result: "excellent",

        feedback:
          "Kamu mengurangi ketergantungan pada satu harga dengan memperhatikan kualitas dan kanal penjualan.",

        learning:
          "Keputusan usaha tani tidak berhenti di produksi. Pasar dan kualitas juga perlu dibaca.",
      },

      {
        id: "hold",

        label: "Tahan seluruh panen",

        description:
          "Simpan semua sampai harga naik lagi.",

        score: 55,

        coins: 15,

        result: "partial",

        feedback:
          "Menahan panen dapat menjadi pilihan, tetapi ada biaya dan risiko kualitas yang perlu dihitung.",

        learning:
          "Setiap strategi pasar punya biaya, risiko, dan batas waktu.",
      },

      {
        id: "sell",

        label: "Jual semua ke pembeli pertama",

        description:
          "Yang penting cepat terjual.",

        score: 35,

        coins: 5,

        result: "poor",

        feedback:
          "Cepat terjual memang mengurangi waktu tunggu, tetapi kamu kehilangan kesempatan membandingkan kanal dan harga.",

        learning:
          "Bandingkan pilihan sebelum melepas hasil panen.",
      },
    ],

    reward: {
      baseXp: 100,

      coins: {
        excellent: 40,
        partial: 15,
        poor: 5,
      },

      badge: {
        id: "smart-trader",
        icon: "🧺",
        name: "Petani Cerdas Pasar",
        description:
          "Berhasil mempertimbangkan kualitas dan beberapa kanal penjualan.",
      },
    },

    practice: {
      title: "Cek Pasar Sekitarmu",

      intro:
        "Coba amati satu komoditas di pasar sekitar. Catat harga dan minimal dua tempat yang menjual atau membeli komoditas tersebut.",

      checklist: [
        "Catat harga hari ini",
        "Bandingkan dua kanal penjualan",
        "Catat kualitas atau grade yang diminta",
        "Tulis strategi yang paling masuk akal",
      ],

      completionMessage:
        "Kamu sudah menyelesaikan simulasi pasar. Sekarang coba validasi keputusanmu dengan kondisi pasar nyata.",
    },

    unlock: {
      requiredMission: "bibit-sehat",
      requiredScore: 70,
    },
  },
];