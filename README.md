# 🧠 Mentis

**Mentis**, öğretmenlerin sınıf içi ölçme–değerlendirme süreçlerini **hızlı, sade ve güvenli** şekilde yürütebilmesi için geliştirilen,  
**Kahoot benzeri fakat okul odaklı** bir web tabanlı quiz ve yarışma platformudur.

> 🎯 Amaç:  
> Minimum kişisel veri, maksimum performans, yüksek ölçeklenebilirlik.

---

## ✨ Temel Özellikler

### 👩‍🎓 Öğrenci Tarafı
- Atama kodu + okul numarası ile giriş
- İsim-soyisim otomatik doğrulama (manuel giriş yok)
- Quiz’e tek seferlik katılım (attempt-based)
- Gerçek zamanlı soru akışı
- Anında doğru / yanlış geri bildirimi
- Sadece kendi sonucunu görme

### 👨‍🏫 Öğretmen Tarafı (Planlanan)
- Soru havuzu (kazanım bazlı)
- Quiz oluşturma ve atama
- Canlı yarışma / ödev modu
- Detaylı raporlama
- Anti-cheat mekanizmaları

---

## 🔐 Gizlilik & Güvenlik

Mentis, **KVKK / GDPR** uyumlu olacak şekilde tasarlanmıştır.

- Öğrenciden yalnızca **okul numarası** alınır
- İsim bilgisi backend’de doğrulanır
- Email / telefon / kullanıcı adı yok
- Attempt bazlı erişim (tekrar katılım engeli)
- Kişisel veri minimizasyonu temel ilkedir

Planlanan ek önlemler:
- IP / User-Agent kontrolü
- Tek sekme / tek cihaz kısıtı
- Rate limiting

---

## 🏗️ Mimari

### Backend
- Node.js + TypeScript
- Fastify
- Prisma ORM
- PostgreSQL
- WebSocket / Socket.IO (planlanan)

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Premium dark UI yaklaşımı

### Monorepo Yapısı
mentis/
├─ apps/
│  ├─ api/          # Backend
│  ├─ web-student/  # Öğrenci arayüzü
│  └─ web-teacher/  # Öğretmen arayüzü (planlanan)
└─ packages/

---

## 🚦 Proje Durumu (Şubat 2026)

### ✅ Tamamlananlar
- Proje konsepti ve isimlendirme
- Backend temel mimari
- Prisma schema
- Demo seed (öğretmen, sınıf, öğrenci, quiz)
- Öğrenci giriş akışı
- Attempt oluşturma
- Soru ekranı
- Doğru / yanlış geri bildirimi
- Health check endpoint

### 🟡 Devam Edenler
- UI tema ve kontrast düzenlemeleri
- Soru state yönetimi
- Soru ilerleme akışı

---

## 🗺️ Yol Haritası

### Phase 1 – MVP
- [x] Student join flow
- [x] Attempt bazlı quiz
- [ ] Soru timer
- [ ] Seçim kilidi
- [ ] UI animasyonları
- [ ] Tema standardizasyonu

### Phase 2 – Canlı Yarışma
- [ ] WebSocket altyapısı
- [ ] Gerçek zamanlı leaderboard
- [ ] Öğretmen canlı kontrol paneli

### Phase 3 – Öğretmen Paneli
- [ ] Quiz builder
- [ ] Soru bankası
- [ ] Kazanım etiketleme
- [ ] Raporlama ekranları

### Phase 4 – Güvenlik & Ölçek
- [ ] Anti-cheat mekanizmaları
- [ ] Load test
- [ ] Docker prod setup
- [ ] Domain + HTTPS

---

## 🤝 Katkı & Vizyon

Mentis, öğretmen ihtiyaçlarından doğmuş, **açık kaynaklı** bir eğitim teknolojisi projesidir.

Vizyon:
- Öğretmen odaklı
- Okul gerçeklerine uygun
- Veri güvenliğini önceleyen
- Ticarî baskılardan uzak

---

## 👨‍💻 Geliştirici

**Akif Aydın**  
Fen Bilimleri Öğretmeni & Geliştirici  
Türkiye 🇹🇷

---

## 📜 Lisans

Henüz belirlenmedi.  
(MIT veya Apache 2.0 değerlendirme aşamasında)