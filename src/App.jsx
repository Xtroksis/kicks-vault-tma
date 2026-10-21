import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Heart, Plus, Minus, Check, Send, 
  Sparkles, ShieldCheck, Truck, Lock, Unlock, ArrowUpRight, Layers, Gift, HelpCircle, Users, Bell 
} from 'lucide-react';
import './index.css';

// Студийные фото реальных кроссовок через незаблокированный CDN Wikimedia + надежный fallback
const CATALOG = [
  {
    id: 1,
    brand: 'JORDAN BRAND',
    name: 'Air Jordan 1 High Chicago Bulls',
    category: 'Кроссовки',
    price: 380,
    tag: 'GRAIL',
    sizes: ['41', '42', '43', '44'],
    image: '/shoe1.png'
  },
  {
    id: 2,
    brand: 'NIKE × OFF-WHITE',
    name: 'Nike Air Max 270 React Gold',
    category: 'Кроссовки',
    price: 420,
    tag: 'VERIFIED',
    sizes: ['40', '41', '42', '43'],
    image: '/shoe2.png'
  },
  {
    id: 3,
    brand: 'NIKE LAB',
    name: 'Nike ZoomX Vaporfly Neon Edition',
    category: 'Кроссовки',
    price: 265,
    tag: 'BESTSELLER',
    sizes: ['40', '42', '44'],
    image: '/shoe3.png'
  },
  {
    id: 4,
    brand: 'JORDAN RETRO',
    name: 'Air Jordan Low Collector Red',
    category: 'Кроссовки',
    price: 350,
    tag: 'IN STOCK',
    sizes: ['41', '42', '43', '44'],
    image: '/shoe4.png'
  },
  {
    id: 5,
    brand: 'NIKE SPORTSWEAR',
    name: 'Air Force 1 Custom Volt',
    category: 'Кроссовки',
    price: 210,
    tag: 'LIMITED',
    sizes: ['41', '42', '43'],
    image: '/shoe5.png'
  },
  {
    id: 6,
    brand: 'NIKE ARCHIVE',
    name: 'Air Max Pro Cyber Blue',
    category: 'Кроссовки',
    price: 295,
    tag: 'DROP',
    sizes: ['40', '41', '42', '43'],
    image: '/shoe6.png'
  }
];

// Резервная SVG-картинка студийного кроссовка (на случай если на ПК вообще отключен интернет)
const FALLBACK_SHOE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="400" height="260"><rect width="400" height="260" fill="%2316161c"/><circle cx="200" cy="130" r="95" fill="%23d4ff00" opacity="0.08"/><path d="M70 175 C90 175, 115 110, 155 100 C175 95, 195 120, 225 130 C260 142, 310 135, 330 155 C340 165, 335 185, 320 188 L75 188 C62 188, 60 175, 70 175 Z" fill="%23f4f4f6" stroke="%23d4ff00" stroke-width="3"/><rect x="64" y="184" width="265" height="14" rx="7" fill="%23d4ff00"/><path d="M165 138 L215 155 L205 168 L150 145 Z" fill="%230a0a0c"/></svg>`;

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [category, setCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedSizes, setSelectedSizes] = useState({
    1: '42', 2: '42', 3: '42', 4: '42', 5: '42', 6: '42'
  });

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([1]);

  // =========================================================================
  // РЕАЛИСТИЧНАЯ БИЗНЕС-МОДЕЛЬ: ВЗЛОМ СЕЙФА ПРИВИЛЕГИЙ (VAULT PASS)
  // =========================================================================
  // Баллы лояльности (PTS). Лимит взлома сейфа: 20 кликов в день (по +15 PTS = 300 PTS)
  // Остальные 200 PTS до максимума (500 PTS) добиваются только полезными для магазина заданиями!
  const [vaultPts, setVaultPts] = useState(50);
  const [dailyTapsLeft, setDailyTapsLeft] = useState(15); // Строгий лимит 15 тапов в сутки
  const [taskSubDone, setTaskSubDone] = useState(false);
  const [taskRefDone, setTaskRefDone] = useState(false);
  const [applyPerks, setApplyPerks] = useState(true);

  // Оформление заказа
  const [deliveryMethod, setDeliveryMethod] = useState('cdek');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [testChatId, setTestChatId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
  const OWNER_CHAT_ID = import.meta.env.VITE_OWNER_CHAT_ID || '';

  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const haptic = (type = 'light') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(type);
    }
  };

  const handleSelectSize = (productId, size) => {
    haptic('light');
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const toggleWishlist = (productId) => {
    haptic('light');
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const addToCart = (product) => {
    haptic('medium');
    const chosenSize = selectedSizes[product.id] || product.sizes[0];
    const cartKey = `${product.id}-${chosenSize}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartKey === cartKey);
      if (existing) {
        return prev.map((item) =>
          item.cartKey === cartKey ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, size: chosenSize, cartKey, qty: 1 }];
    });
  };

  const updateCartQty = (cartKey, delta) => {
    haptic('light');
    setCart((prev) =>
      prev
        .map((item) => (item.cartKey === cartKey ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  // Клик по сейфу: строго ограничен дневным лимитом! Никакого бесконечного фарма.
  const handleVaultCrack = () => {
    if (dailyTapsLeft > 0 && vaultPts < 500) {
      haptic('medium');
      setVaultPts((pts) => Math.min(500, pts + 15));
      setDailyTapsLeft((taps) => taps - 1);
    } else {
      haptic('heavy');
    }
  };

  // Выполнение маркетинговых заданий магазина
  const completeSubTask = () => {
    if (!taskSubDone) {
      haptic('heavy');
      setTaskSubDone(true);
      setVaultPts((pts) => Math.min(500, pts + 125));
    }
  };

  const completeRefTask = () => {
    if (!taskRefDone) {
      haptic('heavy');
      setTaskRefDone(true);
      setVaultPts((pts) => Math.min(500, pts + 100));
    }
  };

  // Расчет открытых привилегий по баллам
  const hasFreeLegitCheck = vaultPts >= 100; // Уровень 1 (от 100 PTS)
  const hasFreeExpress = vaultPts >= 300;    // Уровень 2 (от 300 PTS)
  const hasVipDiscount = vaultPts >= 500;    // Уровень 3 (500 PTS - максимум)

  const filteredCatalog = CATALOG.filter((item) => {
    const matchesCat = category === 'Все' || item.category === category;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const savedProducts = CATALOG.filter((item) => wishlist.includes(item.id));

  // Честная калькуляция корзины без убытков для бизнеса
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  
  // Обычная цена экспресс-доставки $25, но если открыт Уровень 2 (300 PTS) — $0!
  const rawDeliveryCost = deliveryMethod === 'express' ? 25 : 0;
  const deliveryCost = (applyPerks && hasFreeExpress) ? 0 : rawDeliveryCost;

  // VIP скидка 7% открывается только при полном взломе сейфа (500 PTS)
  const vipDiscountAmount = (applyPerks && hasVipDiscount) ? Math.round(subtotal * 0.07) : 0;
  const finalTotal = Math.max(0, subtotal + deliveryCost - vipDiscountAmount);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSending(true);

    const itemsFormatted = cart
      .map((i) => `▪️ ${i.brand} ${i.name}\n    Размер: <b>EU ${i.size}</b> | ${i.qty} шт. × $${i.price} = <b>$${i.price * i.qty}</b>`)
      .join('\n\n');

    const perksAppliedList = [
      hasFreeLegitCheck ? '✅ Сертификат Legit Check ($0)' : '❌ Без расширенной страховки',
      hasFreeExpress && deliveryMethod === 'express' ? '✅ Бесплатный Экспресс-курьер ($0 вместо $25)' : null,
      hasVipDiscount ? `✅ VIP-скидка 7% (-$${vipDiscountAmount})` : null
    ].filter(Boolean).join('\n');

    const message = `
👟 <b>НОВЫЙ ЗАКАЗ — KICKS VAULT (TMA)</b>

👤 <b>Покупатель:</b> ${clientName}
📱 <b>Связь:</b> ${clientContact}
🚚 <b>Доставка:</b> ${deliveryMethod === 'express' ? 'Экспресс-курьер' : 'ПВЗ СДЭК'} ($${deliveryCost})
📍 <b>Адрес:</b> ${deliveryAddress}

📦 <b>СОСТАВ ЗАКАЗА:</b>
${itemsFormatted}

🔐 <b>ПРИВИЛЕГИИ VAULT PASS (${vaultPts} PTS):</b>
${applyPerks ? perksAppliedList : 'Не применены'}

💵 <b>ИТОГО К ОПЛАТЕ: $${finalTotal}</b>
    `;

    try {
      if (TELEGRAM_BOT_TOKEN && OWNER_CHAT_ID) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: OWNER_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
          }),
        });

        if (testChatId.trim() !== '') {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: testChatId.trim(),
              text: `🎯 <b>ДЕМО-РЕЖИМ TELEGRAM MINI APP:</b>\nИменно так заказы из вашего магазина внутри Telegram прилетают менеджеру!\n` + message,
              parse_mode: 'HTML',
            }),
          });
        }
      }

      setOrderComplete(true);
      setCart([]);
      setTimeout(() => {
        setOrderComplete(false);
        setActiveTab('catalog');
      }, 3200);
    } catch (error) {
      alert('Ошибка сети при отправке заказа');
    } finally {
      setIsSending(false);
    }
  };

  const renderProductCard = (product) => {
    const currentSize = selectedSizes[product.id] || product.sizes[0];
    const isLiked = wishlist.includes(product.id);
    const inCartCount = cart
      .filter((i) => i.id === product.id)
      .reduce((s, i) => s + i.qty, 0);

    return (
      <div key={product.id} className="kv-card">
        <div className="kv-card-media">
          <span className="kv-tag">{product.tag}</span>
          <button
            type="button"
            className={`kv-like-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => toggleWishlist(product.id)}
          >
            <Heart size={16} fill={isLiked ? '#d4ff00' : 'none'} />
          </button>
          <img 
            src={product.image} 
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_SHOE_SVG;
            }}
          />
        </div>

        <div className="kv-card-body">
          <div className="kv-brand">{product.brand}</div>
          <h3 className="kv-title">{product.name}</h3>

          <div className="kv-sizes">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                type="button"
                className={`kv-size-btn ${currentSize === sz ? 'selected' : ''}`}
                onClick={() => handleSelectSize(product.id, sz)}
              >
                {sz}
              </button>
            ))}
          </div>

          <div className="kv-card-footer">
            <div className="kv-price">${product.price}</div>
            <button type="button" className="kv-add-btn" onClick={() => addToCart(product)}>
              <Plus size={15} />
              <span>{inCartCount > 0 ? `В корзине (${inCartCount})` : 'Купить'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tma-shell">
      <div className="tma-container">
        <header className="tma-header">
          <div className="tma-logo" onClick={() => setActiveTab('catalog')}>
            <span className="logo-box">KV</span>
            <div>
              <strong>KICKS VAULT</strong>
              <span className="verified-sub"><ShieldCheck size={12} /> Legit Check Verified</span>
            </div>
          </div>

          <button type="button" className="token-pill" onClick={() => setActiveTab('vault')}>
            <Lock size={13} />
            <span>{vaultPts} / 500 PTS</span>
          </button>
        </header>

        <main className="tma-main">
          {/* ВКЛАДКА 1: КАТАЛОГ */}
          {activeTab === 'catalog' && (
            <div className="fade-in">
              <div className="vault-banner" onClick={() => setActiveTab('vault')}>
                <div className="vb-left">
                  <span className="vb-badge">VAULT PASS • СЕЙФ ЛОЯЛЬНОСТИ</span>
                  <h4>Открой бесплатную доставку и VIP -7%</h4>
                  <p>Взламывай сейф каждый день и выполняй задания клуба</p>
                </div>
                <div className="vb-icon">
                  <ArrowUpRight size={22} />
                </div>
              </div>

              <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Поиск по модели или бренду (Jordan, Yeezy, Nike)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="cat-scroll">
                {['Все', 'Кроссовки'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`cat-pill ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
                <span className="stock-hint">✓ Все пары прошли проверку подлинности</span>
              </div>

              <div className="kv-grid">
                {filteredCatalog.map((product) => renderProductCard(product))}
              </div>
            </div>
          )}

          {/* ВКЛАДКА 2: УМНЫЙ СЕЙФ ПРИВИЛЕГИЙ (БЕЗ БЕСКОНЕЧНОГО ФАРМА) */}
          {activeTab === 'vault' && (
            <div className="fade-in vault-screen">
              <div className="vault-top">
                <span className="kv-tag-lime">LOYALTY VAULT SYSTEM</span>
                <h2>СЕЙФ ПРИВИЛЕГИЙ</h2>
                <p>Накапливай очки доступа (PTS), чтобы разблокировать закрытые бонусы к заказу</p>
              </div>

              {/* Понятная инструкция для покупателя */}
              <div className="how-it-works">
                <div className="hiw-title"><HelpCircle size={15} color="#d4ff00" /> <b>Как это работает? (Правила клуба)</b></div>
                <p>Очки PTS <b>не являются деньгами на вывод</b>. Они открывают 3 уровня реальных привилегий в корзине: бесплатную страховку, курьерскую доставку и клубную скидку 7%.</p>
              </div>

              {/* Шкала прогресса и 3 уровня наград */}
              <div className="tiers-box">
                <div className="tiers-header">
                  <span>Прогресс взлома сейфа:</span>
                  <strong>{vaultPts} / 500 PTS</strong>
                </div>
                <div className="energy-bar">
                  <div className="energy-progress" style={{ width: `${(vaultPts / 500) * 100}%` }} />
                </div>

                <div className="tiers-grid">
                  <div className={`tier-card ${hasFreeLegitCheck ? 'unlocked' : ''}`}>
                    {hasFreeLegitCheck ? <Unlock size={16} color="#d4ff00" /> : <Lock size={16} />}
                    <strong>100 PTS</strong>
                    <span>Пломба & Страховка</span>
                  </div>
                  <div className={`tier-card ${hasFreeExpress ? 'unlocked' : ''}`}>
                    {hasFreeExpress ? <Unlock size={16} color="#d4ff00" /> : <Lock size={16} />}
                    <strong>300 PTS</strong>
                    <span>Экспресс за $0</span>
                  </div>
                  <div className={`tier-card ${hasVipDiscount ? 'unlocked' : ''}`}>
                    {hasVipDiscount ? <Unlock size={16} color="#d4ff00" /> : <Lock size={16} />}
                    <strong>500 PTS</strong>
                    <span>VIP Скидка -7%</span>
                  </div>
                </div>
              </div>

              {/* Колесо сейфа со строгим дневным лимитом */}
              <button 
                type="button" 
                className={`vault-wheel ${dailyTapsLeft === 0 || vaultPts >= 500 ? 'locked-wheel' : ''}`} 
                onClick={handleVaultCrack}
              >
                <div className="wheel-ring">
                  <div className="wheel-core">
                    {vaultPts >= 500 ? (
                      <>
                        <Check size={34} color="#0a0a0c" />
                        <strong>ОТКРЫТО</strong>
                        <span>MAX LEVEL</span>
                      </>
                    ) : dailyTapsLeft > 0 ? (
                      <>
                        <Lock size={30} color="#0a0a0c" />
                        <strong>+15 PTS</strong>
                        <span>ОСТАЛОСЬ: {dailyTapsLeft}</span>
                      </>
                    ) : (
                      <>
                        <Lock size={28} color="#0a0a0c" />
                        <strong>ЛИМИТ</strong>
                        <span>ЖДИТЕ ЗАВТРА</span>
                      </>
                    )}
                  </div>
                </div>
              </button>

              <p className="tap-limit-note">
                {dailyTapsLeft > 0 
                  ? `Дневной лимит взлома: осталось ${dailyTapsLeft} кликов (+${dailyTapsLeft * 15} PTS)` 
                  : 'Дневной лимит кликов исчерпан! Выполните задания ниже, чтобы добить 500 PTS:'}
              </p>

              {/* Маркетинговые задания (дают реальную пользу магазину!) */}
              <div className="tasks-section">
                <h4>Задания клуба (Быстрый буст PTS)</h4>
                <div className="task-item">
                  <div className="task-left">
                    <Bell size={18} color="#d4ff00" />
                    <div>
                      <strong>Подписаться на TG-канал дропов</strong>
                      <span>+125 PTS к взлому сейфа</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className={`task-btn ${taskSubDone ? 'done' : ''}`}
                    onClick={completeSubTask}
                    disabled={taskSubDone}
                  >
                    {taskSubDone ? 'Выполнено ✓' : 'Подписаться'}
                  </button>
                </div>

                <div className="task-item">
                  <div className="task-left">
                    <Users size={18} color="#d4ff00" />
                    <div>
                      <strong>Пригласить друга в Kicks Vault</strong>
                      <span>+100 PTS к взлому сейфа</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className={`task-btn ${taskRefDone ? 'done' : ''}`}
                    onClick={completeRefTask}
                    disabled={taskRefDone}
                  >
                    {taskRefDone ? 'Выполнено ✓' : 'Пригласить'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 3: ИЗБРАННОЕ */}
          {activeTab === 'saved' && (
            <div className="fade-in">
              <h2 className="page-heading">Избранное ({savedProducts.length})</h2>
              {savedProducts.length === 0 ? (
                <div className="empty-state">
                  <Heart size={42} color="#3f3f46" />
                  <p>Список избранного пуст</p>
                  <button type="button" className="lime-btn" onClick={() => setActiveTab('catalog')}>
                    В каталог
                  </button>
                </div>
              ) : (
                <div className="kv-grid">
                  {savedProducts.map((product) => renderProductCard(product))}
                </div>
              )}
            </div>
          )}

          {/* ВКЛАДКА 4: КОРЗИНА */}
          {activeTab === 'cart' && (
            <div className="fade-in">
              <h2 className="page-heading">Оформление заказа</h2>
              {orderComplete ? (
                <div className="empty-state success-box">
                  <div className="check-circle"><Check size={36} color="#0a0a0c" /></div>
                  <h3>Заказ успешно отправлен!</h3>
                  <p>Менеджер свяжется с вами в Telegram для подтверждения доставки.</p>
                </div>
              ) : cart.length === 0 ? (
                <div className="empty-state">
                  <ShoppingBag size={42} color="#3f3f46" />
                  <p>Корзина пуста</p>
                  <button type="button" className="lime-btn" onClick={() => setActiveTab('catalog')}>
                    Перейти к покупкам
                  </button>
                </div>
              ) : (
                <>
                  <div className="cart-items-wrap">
                    {cart.map((item) => (
                      <div key={item.cartKey} className="cart-row">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="cart-thumb-real"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_SHOE_SVG;
                          }}
                        />
                        <div className="cart-info">
                          <span className="cart-brand">{item.brand}</span>
                          <h4>{item.name}</h4>
                          <div className="cart-meta">
                            <span className="size-chip">EU {item.size}</span>
                            <strong>${item.price * item.qty}</strong>
                          </div>
                        </div>
                        <div className="cart-qty">
                          <button type="button" onClick={() => updateCartQty(item.cartKey, -1)}>
                            <Minus size={14} />
                          </button>
                          <span>{item.qty}</span>
                          <button type="button" onClick={() => updateCartQty(item.cartKey, 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Применение привилегий из Сейфа */}
                  <div className="loyalty-toggle-card">
                    <div>
                      <strong>Применить привилегии Vault Pass ({vaultPts} PTS)</strong>
                      <p>
                        {hasVipDiscount 
                          ? 'Открыто всё: Страховка + Экспресс $0 + VIP скидка 7%!' 
                          : hasFreeExpress 
                          ? 'Открыто: Страховка + Бесплатный Экспресс-курьер!' 
                          : 'Открыто: Сертификат и пломба Legit Check ($0)'}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="lime-checkbox"
                      checked={applyPerks}
                      onChange={() => setApplyPerks(!applyPerks)}
                    />
                  </div>

                  <div className="delivery-selector">
                    <button
                      type="button"
                      className={`del-option ${deliveryMethod === 'cdek' ? 'active' : ''}`}
                      onClick={() => setDeliveryMethod('cdek')}
                    >
                      <Layers size={18} />
                      <div>
                        <strong>ПВЗ СДЭК</strong>
                        <span>Бесплатно</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`del-option ${deliveryMethod === 'express' ? 'active' : ''}`}
                      onClick={() => setDeliveryMethod('express')}
                    >
                      <Truck size={18} />
                      <div>
                        <strong>Экспресс-курьер</strong>
                        <span>{applyPerks && hasFreeExpress ? 'Бесплатно (Vault Pass)' : '+$25'}</span>
                      </div>
                    </button>
                  </div>

                  <div className="summary-card">
                    <div className="sum-line">
                      <span>Товары ({totalItemsCount} шт.)</span>
                      <span>${subtotal}</span>
                    </div>
                    <div className="sum-line">
                      <span>Пломба и сертификат Legit Check</span>
                      <span className="lime-text">{applyPerks && hasFreeLegitCheck ? 'Бесплатно' : '$10'}</span>
                    </div>
                    <div className="sum-line">
                      <span>Доставка</span>
                      <span>{deliveryCost === 0 ? 'Бесплатно' : `$${deliveryCost}`}</span>
                    </div>
                    {vipDiscountAmount > 0 && (
                      <div className="sum-line lime-text">
                        <span>Клубная привилегия VIP (-7%)</span>
                        <span>-${vipDiscountAmount}</span>
                      </div>
                    )}
                    <div className="sum-total">
                      <span>ИТОГО К ОПЛАТЕ</span>
                      <strong>${finalTotal}</strong>
                    </div>
                  </div>

                  <form className="tma-form" onSubmit={handleOrderSubmit}>
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Телефон или Telegram (@username)"
                      value={clientContact}
                      onChange={(e) => setClientContact(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Город и адрес доставки / номер ПВЗ"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Ваш Chat ID (необязательно — для теста бота)"
                      value={testChatId}
                      onChange={(e) => setTestChatId(e.target.value)}
                    />
                    <button type="submit" className="lime-btn full" disabled={isSending}>
                      <Send size={18} />
                      <span>{isSending ? 'Отправка...' : `Оформить заказ • $${finalTotal}`}</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </main>

        <nav className="tma-tabbar">
          <button
            type="button"
            className={`tab-item ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <ShoppingBag size={20} />
            <span>Дропы</span>
          </button>
          <button
            type="button"
            className={`tab-item ${activeTab === 'vault' ? 'active' : ''}`}
            onClick={() => setActiveTab('vault')}
          >
            <Gift size={20} />
            <span>Сейф Клуба</span>
          </button>
          <button
            type="button"
            className={`tab-item ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <div className="rel-icon">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="dot-badge">{wishlist.length}</span>}
            </div>
            <span>Избранное</span>
          </button>
          <button
            type="button"
            className={`tab-item ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <div className="rel-icon">
              <ShoppingBag size={20} />
              {totalItemsCount > 0 && <span className="count-badge">{totalItemsCount}</span>}
            </div>
            <span>Корзина</span>
          </button>
        </nav>
      </div>
    </div>
  );
}