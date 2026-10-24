import { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CloudRain,
  FileImage,
  ImagePlus,
  Leaf,
  MessageCircle,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  Trash2,
  X,
} from 'lucide-react';

import '../css/Assistant.css';

const STORAGE_KEY = 'taniwave-ai-assistant-v1';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const QUICK_PROMPTS = [
  {
    icon: Leaf,
    label: 'Periksa gejala tanaman',
    prompt: 'Daun cabai saya menguning setelah hujan selama tiga hari. Apa yang harus saya periksa?',
  },
  {
    icon: Sprout,
    label: 'Panduan budidaya',
    prompt: 'Apa saja yang perlu saya perhatikan untuk merawat tanaman cabai?',
  },
  {
    icon: CloudRain,
    label: 'Dampak cuaca',
    prompt: 'Apa yang perlu diperiksa pada tanaman setelah hujan berkepanjangan?',
  },
  {
    icon: BookOpen,
    label: 'Belajar pertanian',
    prompt: 'Jelaskan cara mengamati gejala tanaman dengan sistematis.',
  },
];

const CROPS = [
  'Cabai',
  'Jagung',
  'Tomat',
  'Padi',
  'Bawang merah',
  'Sayuran lainnya',
  'Belum ditentukan',
];

const GROWTH_STAGES = [
  'Persemaian',
  'Vegetatif',
  'Berbunga',
  'Berbuah',
  'Panen',
  'Belum diketahui',
];

const DEMO_SOURCES = {
  observation: {
    id: 'source-observation',
    reference: 'S1',
    title: 'Panduan Pengamatan Gejala Tanaman',
    publisher: 'Knowledge Base TANIWAVE',
    category: 'Observasi tanaman',
    description:
      'Contoh dokumen mengenai pencatatan gejala, pola penyebaran, dan pengumpulan informasi awal.',
    sourceType: 'Dokumen simulasi',
  },
  drainage: {
    id: 'source-drainage',
    reference: 'S2',
    title: 'Panduan Pengelolaan Air dan Drainase',
    publisher: 'Knowledge Base TANIWAVE',
    category: 'Pengelolaan air',
    description:
      'Contoh materi mengenai pengamatan kondisi tanah, genangan, dan drainase area perakaran.',
    sourceType: 'Dokumen simulasi',
  },
};

/* =========================================
   UTILITIES
========================================= */

function createId(prefix = 'assistant') {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function formatTime(date = new Date()) {
  return new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('id-ID')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function createMessage(role, content, extra = {}) {
  return {
    id: createId('message'),
    role,
    content,
    createdAt: new Date().toISOString(),
    ...extra,
  };
}

/* =========================================
   DEMO RESPONSE ADAPTER
========================================= */

/**
 * Kontrak respons ini dipakai oleh UI, baik untuk data dummy
 * maupun respons backend di masa depan.
 *
 * Backend RAG nantinya dapat mengembalikan struktur:
 * {
 *   summary,
 *   observations,
 *   nextSteps,
 *   caveat,
 *   verification,
 *   sources
 * }
 *
 * Fungsi ini hanya membuat contoh respons lokal.
 * Tidak ada panggilan Gemini, retrieval, atau verifikasi nyata.
 */
async function requestAssistantReply({ text, attachment, context }) {
  // Simulasi waktu respons, bukan request ke model AI.
  await new Promise((resolve) => setTimeout(resolve, 650));

  const query = normalizeText(text);
  const hasImage = Boolean(attachment);

  const mentionsDose =
    /\b(dosis|takaran|berapa ml|berapa gram|berapa cc|berapa liter|berapa sendok|campuran pestisida|dosis pestisida)\b/i.test(
      query
    );

  if (mentionsDose) {
    return {
      kind: 'answer',
      summary:
        'Saya belum dapat menetapkan dosis pupuk atau pestisida dari informasi yang tersedia. Dosis bergantung pada produk, formulasi, komoditas, cara penggunaan, dan ketentuan pada label resmi.',
      observations: [
        'Nama produk dan bahan aktif belum diketahui secara lengkap.',
        'Konsentrasi formulasi serta petunjuk penggunaan perlu diperiksa.',
        'Sumber produk yang terverifikasi belum tersedia pada demo ini.',
      ],
      nextSteps: [
        'Periksa label resmi produk dan pastikan produk memang ditujukan untuk komoditas serta penggunaan yang dimaksud.',
        'Siapkan nama produk, formulasi, komoditas, dan informasi label yang relevan.',
        'Jangan mencampur atau menentukan takaran hanya berdasarkan perkiraan.',
      ],
      caveat:
        'Dosis belum dapat dipastikan. Demo ini tidak mengakses basis data registrasi produk, label resmi, atau sumber dosis yang tervalidasi.',
      verification: {
        status: 'insufficient',
        label: 'Bukti belum cukup',
        detail:
          'Tidak ada sumber dosis resmi yang terhubung dan diperiksa pada simulasi ini.',
        supportedClaims: 0,
        totalClaims: 0,
      },
      sources: [],
    };
  }

  const mentionsSymptoms =
    /(cabai|daun|kuning|menguning|hujan|layu|bercak|busuk|akar|tanaman|gejala)/i.test(
      query
    );

  if (mentionsSymptoms || hasImage) {
    return {
      kind: 'answer',
      summary:
        'Penguningan setelah hujan berkepanjangan belum cukup untuk menentukan satu penyebab. Kondisi terlalu basah di area perakaran merupakan salah satu hal yang perlu diperiksa. Gangguan nutrisi dan penyakit juga dapat memiliki gejala yang mirip.',
      summaryReferences: ['S1', 'S2'],
      observations: [
        'Amati apakah penguningan terjadi pada daun tua, daun muda, satu bagian tanaman, atau menyebar ke banyak tanaman.',
        'Periksa apakah tanah masih tergenang atau terlalu basah setelah hujan.',
        hasImage
          ? 'Foto yang diunggah dapat membantu pengamatan visual, tetapi tidak cukup untuk memastikan penyebab tanpa konteks tambahan.'
          : 'Informasi foto, usia tanaman, dan pola penyebaran gejala belum tersedia.',
      ],
      nextSteps: [
        'Periksa aliran air di sekitar tanaman dan amati apakah genangan bertahan setelah hujan berhenti.',
        'Ambil foto seluruh tanaman serta foto dekat bagian daun yang terdampak.',
        'Catat usia tanaman, kapan gejala dimulai, dan apakah gejala bertambah setelah hujan.',
        'Periksa kondisi pangkal batang dan sisi bawah daun tanpa langsung memberikan perlakuan berdasarkan satu gejala.',
      ],
      caveat:
        'Ini panduan pengamatan awal, bukan diagnosis penyakit. Penyebabnya belum dapat dipastikan dari deskripsi singkat saja.',
      verification: {
        status: 'demo-supported',
        label: 'Referensi demo tersedia',
        detail:
          'Jawaban contoh menghubungkan langkah pengamatan dengan sumber internal simulasi. Belum dilakukan verifikasi agronomis terhadap sumber resmi.',
        supportedClaims: null,
        totalClaims: null,
      },
      sources: [
        { ...DEMO_SOURCES.observation },
        { ...DEMO_SOURCES.drainage },
      ],
    };
  }

  return {
    kind: 'answer',
    summary:
      'Saya bisa membantu menyusun langkah pemeriksaan, tetapi informasi dalam pertanyaan ini belum cukup untuk memberikan rekomendasi yang spesifik.',
    observations: [
      'Komoditas dan tahap pertumbuhan belum diketahui secara pasti.',
      'Kondisi lapangan, gejala, atau tujuan tindakan belum dijelaskan secara lengkap.',
      'Belum ada dokumen relevan yang bisa dipastikan mendukung jawaban khusus untuk pertanyaan ini.',
    ],
    nextSteps: [
      'Sebutkan komoditas dan tahap pertumbuhannya.',
      'Jelaskan kondisi yang sedang diamati atau hasil yang ingin dicapai.',
      'Tambahkan foto atau informasi lapangan bila relevan.',
    ],
    caveat:
      'Jawaban spesifik belum dapat dipastikan. Menambahkan informasi kontekstual akan membantu menentukan sumber dan langkah yang tepat.',
    verification: {
      status: 'insufficient',
      label: 'Bukti belum cukup',
      detail:
        'Respons belum memiliki sumber relevan yang cukup untuk mendukung rekomendasi spesifik.',
      supportedClaims: 0,
      totalClaims: 0,
    },
    sources: [],
  };
}

/* =========================================
   INITIAL CONVERSATIONS
========================================= */

function createWelcomeMessage() {
  return createMessage('assistant', {
    kind: 'welcome',
    summary:
      'Saya siap membantu memahami kondisi tanaman, mencari informasi budidaya, dan menelusuri sumber pengetahuan pertanian.',
    caveat:
      'Demo ini belum terhubung ke Gemini API atau knowledge base resmi. Jawaban dan referensi yang ditampilkan merupakan simulasi.',
  });
}

function createEmptyConversation() {
  return {
    id: createId('conversation'),
    title: 'Percakapan baru',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [createWelcomeMessage()],
  };
}

function loadInitialState() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const data = JSON.parse(saved);

        if (
          Array.isArray(data.conversations) &&
          data.conversations.length > 0
        ) {
          const activeExists = data.conversations.some(
            (conversation) => conversation.id === data.activeConversationId
          );

          return {
            conversations: data.conversations,
            activeConversationId: activeExists
              ? data.activeConversationId
              : data.conversations[0].id,
          };
        }
      }
    } catch (error) {
      console.error('Gagal membaca riwayat AI Assistant:', error);
    }
  }

  const fresh = createEmptyConversation();

  return {
    conversations: [fresh],
    activeConversationId: fresh.id,
  };
}

/**
 * Preview gambar tidak dipersist sebagai base64 agar localStorage
 * tidak membesar. Nama dan metadata file tetap tersimpan.
 */
function serializeConversations(conversations) {
  return conversations.map((conversation) => ({
    ...conversation,
    messages: conversation.messages.map((message) => {
      const attachment = message.attachment;

      if (!attachment) return message;

      const { previewData, ...safeAttachment } = attachment;

      return {
        ...message,
        attachment: safeAttachment,
      };
    }),
  }));
}

function getConversationTitle(text) {
  const cleaned = String(text || '').trim();

  if (!cleaned) return 'Konsultasi foto tanaman';

  return cleaned.split(/\s+/).slice(0, 7).join(' ');
}

/* =========================================
   PRESENTATION COMPONENTS
   Semua komponen tetap berada di Assistant.jsx.
========================================= */

function VerificationBadge({ verification }) {
  const status = verification?.status || 'insufficient';
  const isSupported = status === 'demo-supported';
  const Icon = isSupported ? ShieldCheck : AlertTriangle;

  return (
    <span className={`as-verification-badge ${isSupported ? 'is-supported' : 'is-warning'}`}>
      <Icon size={13} />
      {verification?.label || 'Belum diverifikasi'}
    </span>
  );
}

function SourceReferences({ sources, messageId }) {
  if (!sources?.length) {
    return (
      <div className="as-no-sources">
        <BookOpen size={15} />
        <span>Belum ada sumber terverifikasi yang cukup untuk mendukung jawaban spesifik ini.</span>
      </div>
    );
  }

  return (
    <details className="as-sources-details">
      <summary>
        <span className="as-source-summary-title"><BookOpen size={15} /> Sumber referensi</span>
        <span className="as-source-count">{sources.length}</span>
        <ChevronDown className="as-source-chevron" size={15} />
      </summary>
      <div className="as-source-list">
        {sources.map((source) => (
          <article className="as-source-item" key={`${messageId}-${source.id}`}>
            <span className="as-source-reference">{source.reference}</span>
            <div className="as-source-copy">
              <strong>{source.title}</strong>
              <span>{source.publisher} · {source.category}</span>
              <p>{source.description}</p>
              <small>{source.sourceType || 'Sumber simulasi'}</small>
            </div>
          </article>
        ))}
      </div>
      <p className="as-source-disclaimer">
        Referensi ini merupakan data simulasi. Belum ada dokumen resmi atau sumber eksternal yang diambil dan diverifikasi.
      </p>
    </details>
  );
}

function AssistantMessage({ message }) {
  const response = message.content;
  const verification = response?.verification;
  const sources = response?.sources || [];

  return (
    <article className="as-message as-message-assistant">
      <div className="as-ai-mark" aria-hidden="true"><Sprout size={17} /></div>
      <div className="as-message-body">
        <div className="as-message-meta">
          <strong>TANIWAVE</strong>
          <span className="as-meta-separator">·</span>
          <time>{formatTime(message.createdAt)}</time>
          {!response?.kind?.includes('welcome') && verification && (
            <VerificationBadge verification={verification} />
          )}
        </div>

        <div className="as-answer-content">
          {response?.summary && <p className="as-answer-summary">{response.summary}</p>}

          {response?.observations?.length > 0 && (
            <section className="as-answer-section">
              <h3><Search size={15} /> Yang perlu diperhatikan</h3>
              <ul>
                {response.observations.map((item, index) => (
                  <li key={`${message.id}-observation-${index}`}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {response?.nextSteps?.length > 0 && (
            <section className="as-answer-section">
              <h3><CheckCircle2 size={15} /> Langkah selanjutnya</h3>
              <ol>
                {response.nextSteps.map((item, index) => (
                  <li key={`${message.id}-step-${index}`}>
                    <span className="as-step-number">{index + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {response?.caveat && (
            <div className="as-answer-caveat">
              <AlertCircle size={16} />
              <p>{response.caveat}</p>
            </div>
          )}

          {verification && (
            <details className="as-verification-details">
              <summary>
                {verification.status === 'demo-supported' ? <ShieldCheck size={15} /> : <AlertTriangle size={15} />}
                <span>{verification.status === 'demo-supported' ? 'Tentang referensi jawaban' : 'Mengapa informasi ini belum cukup?'}</span>
                <ChevronDown className="as-details-chevron" size={14} />
              </summary>
              <p>{verification.detail}</p>
            </details>
          )}

          <SourceReferences sources={sources} messageId={message.id} />
        </div>
      </div>
    </article>
  );
}

function UserMessage({ message }) {
  return (
    <article className="as-message as-message-user">
      <div className="as-user-message-content">
        {message.context && (
          <div className="as-message-context">
            <Leaf size={12} />
            <span>{message.context.crop}</span>
            <span className="as-context-dot">·</span>
            <span>{message.context.stage}</span>
          </div>
        )}
        {message.content && <p className="as-user-text">{message.content}</p>}
        {message.attachment && (
          <div className="as-user-attachment">
            {message.attachment.previewData ? (
              <img src={message.attachment.previewData} alt="Foto tanaman yang diunggah" />
            ) : (
              <div className="as-attachment-restored"><FileImage size={22} /><span>Foto terlampir</span></div>
            )}
            <div className="as-attachment-caption"><FileImage size={14} /><span>{message.attachment.name}</span></div>
          </div>
        )}
        <time className="as-user-time">{formatTime(message.createdAt)}</time>
      </div>
    </article>
  );
}

function WelcomeScreen({ onSuggestion }) {
  return (
    <div className="as-welcome-screen">
      <div className="as-welcome-mark"><Sparkles size={22} /></div>
      <p className="as-welcome-eyebrow">TANIWAVE ASSISTANT</p>
      <h1>Apa yang ingin kamu<br className="as-welcome-break" /> pahami tentang tanaman?</h1>
      <p className="as-welcome-description">
        Teman diskusi untuk mengamati gejala, memahami budidaya, dan menentukan langkah pemeriksaan yang tepat.
      </p>

      <div className="as-quick-prompts">
        {QUICK_PROMPTS.map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" className="as-prompt-card" key={item.label} onClick={() => onSuggestion(item.prompt)}>
              <span className="as-prompt-icon"><Icon size={18} /></span>
              <span className="as-prompt-copy"><strong>{item.label}</strong><small>{item.prompt}</small></span>
              <ArrowUpRight className="as-prompt-arrow" size={16} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="as-typing-row">
      <div className="as-ai-mark" aria-hidden="true"><Sprout size={17} /></div>
      <div className="as-typing-content">
        <strong>TANIWAVE</strong>
        <span className="as-typing-dots"><i /><i /><i /></span>
        <span className="as-typing-label">Menyiapkan respons demo</span>
      </div>
    </div>
  );
}

export default function Assistant() {
  const initialState = useMemo(() => loadInitialState(), []);

  const [conversations, setConversations] = useState(
    initialState.conversations
  );

  const [activeConversationId, setActiveConversationId] = useState(
    initialState.activeConversationId
  );

  const [draft, setDraft] = useState('');
  const [pendingImage, setPendingImage] = useState(null);

  const [selectedCrop, setSelectedCrop] = useState('Cabai');
  const [selectedStage, setSelectedStage] = useState('Vegetatif');

  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState('');

  const [historySearch, setHistorySearch] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showContext, setShowContext] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentRequestRef = useRef(0);

  const activeConversation =
    conversations.find(
      (conversation) => conversation.id === activeConversationId
    ) || conversations[0];

  const isInitialWelcome =
    activeConversation?.messages?.length === 1 &&
    activeConversation?.messages?.[0]?.content?.kind === 'welcome';

  const filteredConversations = conversations
    .filter((conversation) =>
      normalizeText(conversation.title).includes(
        normalizeText(historySearch)
      )
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );

  useEffect(() => {
    try {
      const safeConversations = serializeConversations(conversations);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          conversations: safeConversations,
          activeConversationId,
        })
      );
    } catch (error) {
      console.error('Gagal menyimpan riwayat AI Assistant:', error);
    }
  }, [conversations, activeConversationId]);

  useEffect(() => {
    if (isInitialWelcome && !isGenerating) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: isGenerating ? 'auto' : 'smooth',
      block: 'end',
    });
  }, [activeConversation?.id, activeConversation?.messages?.length, isGenerating, isInitialWelcome]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(''), 4500);

    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    return () => {
      currentRequestRef.current += 1;
    };
  }, []);

  const addNotice = (message) => {
    setNotice(message);
  };

  const updateConversation = (conversationId, updater) => {
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === conversationId
          ? updater(conversation)
          : conversation
      )
    );
  };

  const newConversation = () => {
    currentRequestRef.current += 1;
    setIsGenerating(false);

    const conversation = createEmptyConversation();

    setConversations((previous) => [
      conversation,
      ...previous,
    ]);

    setActiveConversationId(conversation.id);
    setDraft('');
    setPendingImage(null);
    setShowHistory(false);
  };

  const openConversation = (conversationId) => {
    currentRequestRef.current += 1;
    setIsGenerating(false);
    setActiveConversationId(conversationId);
    setDraft('');
    setPendingImage(null);
    setShowHistory(false);
  };

  const deleteConversation = (event, conversationId) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      'Hapus percakapan ini dari riwayat browser?'
    );

    if (!confirmed) return;

    const remaining = conversations.filter(
      (conversation) => conversation.id !== conversationId
    );

    if (remaining.length === 0) {
      const fresh = createEmptyConversation();

      setConversations([fresh]);
      setActiveConversationId(fresh.id);
    } else {
      setConversations(remaining);

      if (activeConversationId === conversationId) {
        setActiveConversationId(remaining[0].id);
      }
    }

    addNotice('Percakapan dihapus dari riwayat lokal.');
  };

  const handleSelectImage = (event) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addNotice('File yang dipilih harus berupa gambar.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      addNotice('Ukuran foto maksimal 5 MB untuk demo ini.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPendingImage({
        name: file.name,
        size: file.size,
        type: file.type,
        previewData: String(reader.result || ''),
      });
    };

    reader.onerror = () => {
      addNotice('Foto tidak dapat dibaca. Silakan coba gambar lain.');
    };

    reader.readAsDataURL(file);
  };

  const removePendingImage = () => {
    setPendingImage(null);
  };

  const handleSuggestion = (prompt) => {
    setDraft(prompt);
    textareaRef.current?.focus();
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();

    const text = draft.trim();
    const image = pendingImage;

    if (!text && !image) return;
    if (!activeConversation || isGenerating) return;

    const targetConversationId = activeConversation.id;
    const requestId = ++currentRequestRef.current;

    const userMessage = createMessage(
      'user',
      text || 'Tolong bantu amati gejala pada foto ini.',
      {
        attachment: image
          ? {
              name: image.name,
              size: image.size,
              type: image.type,
              previewData: image.previewData,
            }
          : null,
        context: {
          crop: selectedCrop,
          stage: selectedStage,
        },
      }
    );

    const nextTitle =
      activeConversation.messages.some(
        (message) => message.role === 'user'
      )
        ? activeConversation.title
        : getConversationTitle(userMessage.content);

    updateConversation(targetConversationId, (conversation) => ({
      ...conversation,
      title: nextTitle,
      updatedAt: new Date().toISOString(),
      messages: [...conversation.messages, userMessage],
    }));

    setDraft('');
    setPendingImage(null);
    setIsGenerating(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await requestAssistantReply({
        text: userMessage.content,
        attachment: image,
        context: {
          crop: selectedCrop,
          stage: selectedStage,
        },
      });

      if (requestId !== currentRequestRef.current) return;

      const assistantMessage = createMessage('assistant', response);

      updateConversation(targetConversationId, (conversation) => ({
        ...conversation,
        updatedAt: new Date().toISOString(),
        messages: [...conversation.messages, assistantMessage],
      }));
    } catch (error) {
      console.error('Gagal membuat respons demo:', error);

      if (requestId === currentRequestRef.current) {
        addNotice('Respons gagal disiapkan. Silakan coba kembali.');
      }
    } finally {
      if (requestId === currentRequestRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleTextareaChange = (event) => {
    setDraft(event.target.value);

    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  const activeMessages = activeConversation?.messages || [];

  const visibleMessages = activeMessages.filter(
    (message) => !(message.role === 'assistant' && message.content?.kind === 'welcome')
  );
  const isWelcomeState = visibleMessages.length === 0;

  return (
    <div className="as-page">
      <Navbar />

      <div className="as-workspace">
        {showHistory && (
          <button
            type="button"
            className="as-sidebar-backdrop"
            onClick={() => setShowHistory(false)}
            aria-label="Tutup riwayat percakapan"
          />
        )}

        <aside className={`as-sidebar ${showHistory ? 'as-sidebar-open' : ''}`}>
          <div className="as-sidebar-top">
            <div className="as-brand-lockup">
              <span className="as-brand-symbol"><Sprout size={19} /></span>
              <span className="as-brand-wordmark">TANIWAVE</span>
            </div>
            <button type="button" className="as-icon-button as-sidebar-new" onClick={newConversation} aria-label="Percakapan baru" title="Percakapan baru">
              <Plus size={18} />
            </button>
          </div>

          <button type="button" className="as-new-chat-button" onClick={newConversation}>
            <Plus size={16} />
            <span>Percakapan baru</span>
            <span className="as-new-chat-shortcut">⌘ K</span>
          </button>

          <label className="as-history-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Cari percakapan"
              value={historySearch}
              onChange={(event) => setHistorySearch(event.target.value)}
            />
          </label>

          <div className="as-history-label">RIWAYAT</div>
          <div className="as-history-list">
            {filteredConversations.length === 0 ? (
              <div className="as-history-empty"><MessageCircle size={18} /><span>Riwayat tidak ditemukan.</span></div>
            ) : (
              filteredConversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                const lastUserMessage = [...conversation.messages].reverse().find((message) => message.role === 'user');
                return (
                  <div className={`as-history-item ${isActive ? 'is-active' : ''}`} key={conversation.id}>
                    <button type="button" className="as-history-open" onClick={() => openConversation(conversation.id)}>
                      <MessageCircle size={16} />
                      <span className="as-history-copy">
                        <strong>{conversation.title}</strong>
                        <small>{lastUserMessage ? lastUserMessage.content.slice(0, 54) : 'Mulai konsultasi baru'}</small>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="as-history-delete"
                      title="Hapus percakapan"
                      aria-label={`Hapus ${conversation.title}`}
                      onClick={(event) => deleteConversation(event, conversation.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="as-sidebar-bottom">
            <div className="as-context-block">
              <button type="button" className={`as-context-trigger ${showContext ? 'is-open' : ''}`} onClick={() => setShowContext((value) => !value)}>
                <span className="as-context-icon"><Leaf size={17} /></span>
                <span className="as-context-trigger-copy"><strong>Konteks tanaman</strong><small>{selectedCrop} · {selectedStage}</small></span>
                <ChevronDown className={showContext ? 'is-rotated' : ''} size={15} />
              </button>
              {showContext && (
                <div className="as-context-fields">
                  <label className="as-field">
                    <span>Komoditas</span>
                    <span className="as-select-wrap">
                      <select value={selectedCrop} onChange={(event) => setSelectedCrop(event.target.value)}>
                        {CROPS.map((crop) => <option key={crop}>{crop}</option>)}
                      </select>
                      <ChevronDown size={14} />
                    </span>
                  </label>
                  <label className="as-field">
                    <span>Tahap pertumbuhan</span>
                    <span className="as-select-wrap">
                      <select value={selectedStage} onChange={(event) => setSelectedStage(event.target.value)}>
                        {GROWTH_STAGES.map((stage) => <option key={stage}>{stage}</option>)}
                      </select>
                      <ChevronDown size={14} />
                    </span>
                  </label>
                  <p>Informasi ini akan disertakan pada pesan berikutnya.</p>
                </div>
              )}
            </div>
            <div className="as-sidebar-disclaimer"><ShieldCheck size={14} /><span>Periksa kembali informasi sebelum diterapkan.</span></div>
          </div>
        </aside>

        <main className="as-main">
          <header className="as-topbar">
            <div className="as-topbar-left">
              <button type="button" className="as-mobile-history-toggle as-icon-button" onClick={() => setShowHistory((value) => !value)} aria-label="Tampilkan riwayat">
                <Clock3 size={18} />
              </button>
              <div className="as-topbar-avatar"><Sparkles size={17} /></div>
              <div className="as-topbar-titles">
                <div className="as-topbar-title-line"><strong>TANIWAVE Assistant</strong><span className="as-demo-pill"><i /> Demo</span></div>
                <span>Pendamping pertanian</span>
              </div>
            </div>
            <div className="as-topbar-actions">
              <button type="button" className="as-context-quick-button" onClick={() => { setShowContext(true); if (window.matchMedia('(max-width: 820px)').matches) setShowHistory(true); }}>
                <Leaf size={15} /><span>{selectedCrop}</span><ChevronDown size={13} />
              </button>
              <button type="button" className="as-icon-button as-reset-button" onClick={() => { setDraft(''); setPendingImage(null); textareaRef.current?.focus(); }} title="Bersihkan input" aria-label="Bersihkan input">
                <RotateCcw size={16} />
              </button>
              <button type="button" className="as-topbar-new-chat" onClick={newConversation}><Plus size={16} /><span>Chat baru</span></button>
            </div>
          </header>

          <section className="as-chat-area">
            <div className={`as-messages ${isWelcomeState ? 'as-messages-welcome' : 'as-messages-thread'}`}>
              {isWelcomeState ? (
                <WelcomeScreen onSuggestion={handleSuggestion} />
              ) : (
                <div className="as-thread">
                  {visibleMessages.map((message) => message.role === 'user'
                    ? <UserMessage key={message.id} message={message} />
                    : <AssistantMessage key={message.id} message={message} />
                  )}
                </div>
              )}
              {isGenerating && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <form className="as-composer-wrap" onSubmit={handleSubmit}>
              {pendingImage && (
                <div className="as-pending-attachment">
                  <img src={pendingImage.previewData} alt="Pratinjau foto tanaman" />
                  <div className="as-pending-file-copy"><strong>{pendingImage.name}</strong><small>{(pendingImage.size / (1024 * 1024)).toFixed(2)} MB · Siap dilampirkan</small></div>
                  <button type="button" onClick={removePendingImage} aria-label="Hapus foto"><X size={16} /></button>
                </div>
              )}

              <div className="as-composer-box">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={draft}
                  onChange={handleTextareaChange}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Tanyakan sesuatu tentang tanaman..."
                  aria-label="Tulis pertanyaan"
                  disabled={isGenerating}
                />
                <div className="as-composer-toolbar">
                  <div className="as-composer-tools">
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleSelectImage} />
                    <button type="button" className="as-attach-button" onClick={() => fileInputRef.current?.click()} disabled={isGenerating}>
                      <ImagePlus size={17} /><span>Foto tanaman</span>
                    </button>
                    <span className="as-composer-separator" />
                    <span className="as-composer-context"><Leaf size={13} /> {selectedCrop}</span>
                  </div>
                  <button type="submit" className="as-send-button" disabled={isGenerating || (!draft.trim() && !pendingImage)} aria-label="Kirim pesan" title="Kirim pesan">
                    {isGenerating ? <MoreHorizontal size={20} /> : <Send size={17} />}
                  </button>
                </div>
              </div>
              <div className="as-composer-bottom">
                <span>Enter untuk mengirim · Shift + Enter untuk baris baru</span>
                <span>Demo lokal · Belum terhubung ke model AI/RAG.</span>
              </div>
            </form>
          </section>
        </main>
      </div>

      {notice && (
        <div className="as-toast" role="status">
          <AlertCircle size={17} /><span>{notice}</span>
          <button type="button" aria-label="Tutup notifikasi" onClick={() => setNotice('')}><X size={15} /></button>
        </div>
      )}
    </div>
  );
}