# 💸 QuickSplit - Base Mini App

<div align="center">

![QuickSplit Banner](https://mini-app-quickstart-template-woad.vercel.app/hero.png)

**Hesabı Anında Böl, Kripto ile Paylaş**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://mini-app-quickstart-template-woad.vercel.app)
[![Built on Base](https://img.shields.io/badge/Built%20on-Base-0052FF?style=for-the-badge&logo=coinbase)](https://base.org)
[![Farcaster Mini App](https://img.shields.io/badge/Farcaster-Mini%20App-8B5CF6?style=for-the-badge)](https://farcaster.xyz)

</div>

---

## 📖 Proje Hakkında

**QuickSplit**, Base blockchain üzerinde çalışan bir Farcaster Mini App'tir. Arkadaşlarınızla yemek, etkinlik veya herhangi bir ortak harcama yaptığınızda hesabı anında bölmenizi sağlar. Eşit paylaşım, yüzdelik dağılım, özel tutarlar veya bahşiş ekleme gibi farklı bölüşüm modları sunar. Oluşturulan ödeme linki ile herkes kendi payını tek tıkla Base üzerinden ödeyebilir - hızlı, ucuz ve sorunsuz.

---

## ✨ Özellikler

| Özellik | Açıklama |
|---------|----------|
| 🔄 **Eşit Bölüşüm** | Hesabı kişi sayısına eşit böl |
| 📊 **Yüzdelik Bölüşüm** | Her kişiye özel yüzde belirle |
| 💰 **Özel Tutarlar** | Herkesin ne ödeyeceğini ayrı ayrı gir |
| 🎁 **Bahşiş Modu** | %10, %15, %20 veya %25 bahşiş ekle |
| 🔗 **Ödeme Linki** | Paylaşılabilir tek kullanımlık link |
| 📱 **QR Kod** | Linki QR olarak paylaş |
| ⛓️ **On-Chain Ödeme** | Base üzerinde anlık transfer |
| 👛 **Cüzdan Entegrasyonu** | Coinbase Wallet ile kolay bağlantı |

---

## 🛠️ Teknoloji Stack

- **Frontend:** Next.js 16, React, TypeScript
- **Styling:** Tailwind CSS
- **Blockchain:** Base (Ethereum L2)
- **Wallet:** OnchainKit, Wagmi, Viem
- **Platform:** Farcaster Mini App SDK
- **Backend:** Redis (ödeme linkleri için)
- **Hosting:** Vercel

---

## 🚀 Kurulum

### 1. Repoyu Klonla

```bash
git clone https://github.com/atakilicov/mini-app-quickstart-template.git
cd mini-app-quickstart-template
npm install
```

### 2. Environment Değişkenleri

`.env.local` dosyası oluştur:

```env
NEXT_PUBLIC_PROJECT_NAME="QuickSplit"
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<CDP_API_KEY>
NEXT_PUBLIC_URL=http://localhost:3000
REDIS_URL=<REDIS_CONNECTION_URL>
NEXT_PUBLIC_RECIPIENT_ADDRESS=<YOUR_WALLET_ADDRESS>
```

### 3. Çalıştır

```bash
npm run dev
```

Tarayıcıda aç: [http://localhost:3000](http://localhost:3000)

---

## 📁 Proje Yapısı

```
├── app/
│   ├── page.tsx           # Ana sayfa - hesap bölme formu
│   ├── intro/page.tsx     # Tanıtım sayfası
│   ├── pay/[id]/          # Ödeme sayfası
│   │   ├── page.tsx       # Server component
│   │   └── PaymentClient.tsx  # Client component
│   └── api/
│       └── split/route.ts # Split API endpoint
├── lib/
│   └── redis.ts           # Redis client
├── minikit.config.ts      # Farcaster manifest config
└── public/
    ├── icon.png           # App ikonu
    ├── splash.png         # Splash ekran
    └── hero.png           # Hero görseli
```

---

## 🔧 Özelleştirme

### Manifest Ayarları

`minikit.config.ts` dosyasını düzenle:

```typescript
miniapp: {
  name: "QuickSplit",
  subtitle: "Split bills instantly on Base",
  description: "...",
  primaryCategory: "social",
  tags: ["social", "payments", "utility"],
}
```

### Ödeme Adresi

Ödemelerin geleceği cüzdan adresini `.env` dosyasında ayarla:

```env
NEXT_PUBLIC_RECIPIENT_ADDRESS=0xYourWalletAddress
```

---

## 🌐 Deploy

### Vercel'e Deploy

```bash
vercel --prod
```

### Environment Variables (Vercel)

- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
- `NEXT_PUBLIC_URL`
- `REDIS_URL`
- `NEXT_PUBLIC_RECIPIENT_ADDRESS`

---

## 📱 Farcaster'da Kullanım

1. [Warpcast](https://warpcast.com) uygulamasını aç
2. Arama: "QuickSplit"
3. Veya direkt: https://mini-app-quickstart-template-woad.vercel.app

---

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır!

1. Fork et
2. Feature branch oluştur (`git checkout -b feature/amazing`)
3. Commit et (`git commit -m 'Add amazing feature'`)
4. Push et (`git push origin feature/amazing`)
5. Pull Request aç

---

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

<div align="center">

**Built with ❤️ on [Base](https://base.org)**

</div>
