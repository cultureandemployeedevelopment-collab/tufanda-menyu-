'use client'

import { useState, useEffect } from 'react'

// GOOGLE APPS SCRIPT URL - HƏR İKİSİNDƏ EYNİ OLACAQ
const API_URL = 'https://script.google.com/macros/s/AKfycbwOTOp6cr4ESevoJxY789mi--m2U18AODkAo2JT3gVWj-q-MXLFY69vWNAT5r4gIQt9Wg/exec'

export default function Menu() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState('az')
  const [activeCategory, setActiveCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    fetchMenu()
    const savedFavs = localStorage.getItem('panorama_favorites')
    if(savedFavs) setFavorites(JSON.parse(savedFavs))
  }, [])

  const fetchMenu = async () => {
    try {
      // Cache-i təmizləmək üçün timestamp əlavə et
      const timestamp = new Date().getTime()
      const res = await fetch(`${API_URL}?action=getMenu&t=${timestamp}`, {
        cache: 'no-store'
      })
      const result = await res.json()
      if(result.success) {
        setData(result)
        if(result.data.length > 0 && !activeCategory) {
          setActiveCategory(result.data[0].id)
        }
      }
    } catch(err) {
      console.error('Fetch error:', err)
    }
    setLoading(false)
  }

  // Hər 30 saniyədə bir yenilə (real-time effekti üçün)
  useEffect(() => {
    const interval = setInterval(fetchMenu, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleFavorite = (productId) => {
    const newFavs = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId]
    setFavorites(newFavs)
    localStorage.setItem('panorama_favorites', JSON.stringify(newFavs))
  }

  const t = (az, en) => lang === 'az' ? az : en

  if(loading) return (
    <div style={{
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      color: '#6c757d'
    }}>
      <div style={{textAlign: 'center'}}>
        <div style={{fontSize: '48px', marginBottom: '16px'}}>🍽️</div>
        <div>Menyu yüklənir...</div>
      </div>
    </div>
  )

  if(!data) return (
    <div style={{
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      color: '#ef4444'
    }}>
      Xəta baş verdi. Zəhmət olmasa səhifəni yeniləyin.
    </div>
  )

  const { settings, data: categories } = data

  // Filter products
  const filteredCategories = categories.map(cat => ({
    ...cat,
    subcategories: cat.subcategories.map(sub => ({
      ...sub,
      products: sub.products.filter(p => {
        const matchesSearch = !searchQuery || 
          p.nameAZ.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.nameEN.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !activeCategory || cat.id === activeCategory
        return matchesSearch && matchesCategory
      })
    })).filter(sub => sub.products.length > 0)
  })).filter(cat => cat.subcategories.length > 0)

  return (
    <div style={{display: 'flex', minHeight: '100vh'}}>
      {/* Mobile Header */}
      <div style={{
        display: 'none',
        '@media (max-width: 768px)': {
          display: 'block'
        }
      }}>
        {/* Mobile menu button */}
      </div>

      {/* Left Sidebar */}
      <aside style={{
        width: '280px',
        background: 'white',
        borderRight: '1px solid #e9ecef',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 100,
        left: 0,
        top: 0
      }}>
        {/* Logo */}
        <div style={{padding: '24px', borderBottom: '1px solid #e9ecef'}}>
          {settings.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt="Logo" 
              style={{height: '50px', marginBottom: '8px', objectFit: 'contain'}} 
            />
          ) : (
            <div style={{
              fontSize: '24px', 
              fontWeight: 800, 
              color: '#8B7355',
              marginBottom: '4px'
            }}>
              {settings.restaurant_name || 'Panorama'}
            </div>
          )}
          <div style={{fontSize: '14px', color: '#6c757d'}}>
            {settings.restaurant_subtitle || 'Restaurant'}
          </div>
        </div>

        {/* Here Button */}
        <div style={{padding: '16px'}}>
          <div style={{
            padding: '16px',
            background: 'white',
            border: '2px solid #8B7355',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{fontSize: '24px'}}>🍽️</span>
            <div>
              <div style={{fontWeight: 600, color: '#8B7355'}}>Here</div>
              <div style={{fontSize: '12px', color: '#6c757d'}}>
                {settings.working_hours || '07:00 - 24:00'}
              </div>
            </div>
          </div>
        </div>

        {/* Popular */}
        <div style={{padding: '0 16px 16px'}}>
          <button 
            onClick={() => {
              setActiveCategory('popular')
              document.getElementById('popular-section')?.scrollIntoView({behavior: 'smooth'})
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: activeCategory === 'popular' ? '#f8f9fa' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeCategory === 'popular' ? 600 : 400,
              color: activeCategory === 'popular' ? '#8B7355' : '#212529'
            }}
          >
            <span>⭐</span>
            <span>Popular</span>
          </button>
        </div>

        {/* Menu Title */}
        <div style={{
          padding: '16px', 
          fontSize: '12px', 
          textTransform: 'uppercase', 
          color: '#6c757d', 
          fontWeight: 600,
          letterSpacing: '0.5px'
        }}>
          Menu:
        </div>

        {/* Categories */}
        <nav style={{paddingBottom: '100px'}}>
          {categories.map(cat => (
            <div key={cat.id}>
              <button
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: activeCategory === cat.id ? '#f8f9fa' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '16px',
                  fontWeight: activeCategory === cat.id ? 600 : 400,
                  color: activeCategory === cat.id ? '#8B7355' : '#212529',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                <span>{t(cat.nameAZ, cat.nameEN)}</span>
                <span style={{
                  transform: activeCategory === cat.id ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}>▼</span>
              </button>
              
              {activeCategory === cat.id && cat.subcategories.map(sub => (
                <a
                  key={sub.id}
                  href={`#cat-${sub.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    const el = document.getElementById(`cat-${sub.id}`)
                    if(el) {
                      el.scrollIntoView({behavior: 'smooth', block: 'start'})
                    }
                  }}
                  style={{
                    display: 'block',
                    padding: '10px 16px 10px 40px',
                    color: '#6c757d',
                    textDecoration: 'none',
                    fontSize: '14px',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#8B7355'
                    e.target.style.borderLeftColor = '#8B7355'
                    e.target.style.background = '#f8f9fa'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#6c757d'
                    e.target.style.borderLeftColor = 'transparent'
                    e.target.style.background = 'transparent'
                  }}
                >
                  {t(sub.nameAZ, sub.nameEN)}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: '280px',
        marginRight: '320px',
        padding: '32px',
        minHeight: '100vh'
      }}>
        {/* Header with Category Title */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          paddingBottom: '16px',
          borderBottom: '2px solid #e9ecef'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px', 
              fontWeight: 700, 
              margin: '0 0 8px 0',
              color: '#212529'
            }}>
              {activeCategory === 'popular' ? 'Popular' : 
                activeCategory ? t(
                  categories.find(c => c.id === activeCategory)?.nameAZ,
                  categories.find(c => c.id === activeCategory)?.nameEN
                ) : t('Bütün menyu', 'Full Menu')}
            </h1>
            <p style={{color: '#6c757d', margin: 0}}>
              {filteredCategories.reduce((acc, cat) => 
                acc + cat.subcategories.reduce((sacc, sub) => sacc + sub.products.length, 0), 0
              )} {t('məhsul', 'products')}
            </p>
          </div>
        </div>

        {/* Popular Section */}
        {activeCategory === 'popular' && (
          <div id="popular-section" style={{marginBottom: '48px'}}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '24px',
              color: '#212529'
            }}>
              ⭐ {t('Populyar məhsullar', 'Popular Products')}
            </h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {categories.flatMap(c => c.subcategories).flatMap(s => s.products).filter(p => p.isPopular).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  settings={settings}
                  lang={lang}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Products by Category */}
        {activeCategory !== 'popular' && filteredCategories.map(cat => cat.subcategories.map(sub => (
          <div key={sub.id} id={`cat-${sub.id}`} style={{marginBottom: '48px'}}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e9ecef',
              color: '#212529'
            }}>
              {t(sub.nameAZ, sub.nameEN)}
            </h2>

            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {sub.products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  settings={settings}
                  lang={lang}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        )))}

        {filteredCategories.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '64px',
            color: '#6c757d'
          }}>
            <div style={{fontSize: '64px', marginBottom: '16px'}}>🔍</div>
            <h3>{t('Məhsul tapılmadı', 'No products found')}</h3>
            <p>{t('Baqa axtarış sözü yoxlayın', 'Try different search terms')}</p>
          </div>
        )}
      </main>

      {/* Right Sidebar */}
      <aside style={{
        width: '320px',
        background: 'white',
        borderLeft: '1px solid #e9ecef',
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        padding: '24px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        zIndex: 100
      }}>
        {/* Language Switcher */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          background: '#f8f9fa',
          padding: '4px',
          borderRadius: '12px'
        }}>
          <button
            onClick={() => setLang('az')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: lang === 'az' ? '#8B7355' : 'transparent',
              color: lang === 'az' ? 'white' : '#6c757d',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            AZ
          </button>
          <button
            onClick={() => setLang('en')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: lang === 'en' ? '#8B7355' : 'transparent',
              color: lang === 'en' ? 'white' : '#6c757d',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            EN
          </button>
        </div>

        {/* Search */}
        <div style={{marginBottom: '32px'}}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            background: '#f8f9fa',
            borderRadius: '12px',
            gap: '12px',
            border: '1px solid #e9ecef'
          }}>
            <span style={{color: '#6c757d'}}>🔍</span>
            <input
              type="text"
              placeholder={t('Axtar...', 'Search...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '16px',
                width: '100%',
                color: '#212529'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Venue Info */}
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            marginBottom: '20px',
            color: '#212529',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {t('Məkan məlumatı', 'Venue Information')}
          </h3>

          <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
              <span style={{
                fontSize: '20px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>🕐</span>
              <div>
                <div style={{fontWeight: 600, marginBottom: '4px', color: '#212529'}}>
                  {t('İş saatları:', 'Working hours:')}
                </div>
                <div style={{color: '#6c757d', fontSize: '14px'}}>
                  {settings.working_hours || '07:00 - 24:00'}
                </div>
              </div>
            </div>

            <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
              <span style={{
                fontSize: '20px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>📍</span>
              <div>
                <div style={{fontWeight: 600, marginBottom: '4px', color: '#212529'}}>
                  {t('Ünvan:', 'Address:')}
                </div>
                <div style={{color: '#6c757d', fontSize: '14px', lineHeight: 1.5}}>
                  {settings.address || 'Bakı, Azərbaycan'}
                </div>
              </div>
            </div>

            <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
              <span style={{
                fontSize: '20px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>📞</span>
              <div>
                <div style={{fontWeight: 600, marginBottom: '4px', color: '#212529'}}>
                  {t('Telefon:', 'Phone:')}
                </div>
                <a 
                  href={`tel:${settings.phone}`} 
                  style={{
                    color: '#8B7355', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  {settings.phone || '+994 50 123 45 67'}
                </a>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '28px',
            paddingTop: '24px',
            borderTop: '1px solid #e9ecef'
          }}>
            {settings.instagram && (
              <a 
                href={settings.instagram.startsWith('http') ? settings.instagram : `https://instagram.com/${settings.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #f77737)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  textDecoration: 'none',
                  color: 'white',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                📸
              </a>
            )}
            {settings.facebook && (
              <a 
                href={settings.facebook.startsWith('http') ? settings.facebook : `https://facebook.com/${settings.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#1877f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  textDecoration: 'none',
                  color: 'white',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                📘
              </a>
            )}
            {settings.whatsapp && (
              <a 
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#25d366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  textDecoration: 'none',
                  color: 'white',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                💬
              </a>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchMenu}
          style={{
            width: '100%',
            marginTop: '24px',
            padding: '12px',
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#6c757d',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🔄 {t('Yenilə', 'Refresh')}
        </button>

        {/* Admin Link */}
        <div style={{
          marginTop: '24px', 
          paddingTop: '24px', 
          borderTop: '1px solid #e9ecef'
        }}>
          <a 
            href="/admin" 
            onClick={(e) => {
              e.preventDefault()
              window.open('https://admin-panorama.vercel.app', '_blank')
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              background: '#212529',
              color: 'white',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#000'}
            onMouseLeave={(e) => e.target.style.background = '#212529'}
          >
            ⚙️ {t('Admin Panel', 'Admin Panel')}
          </a>
        </div>
      </aside>
    </div>
  )
}

// Product Card Component
function ProductCard({ product, settings, lang, favorites, toggleFavorite }) {
  const t = (az, en) => lang === 'az' ? az : en
  
  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      padding: '20px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid #e9ecef',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
      e.currentTarget.style.transform = 'translateY(-2px)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
      e.currentTarget.style.transform = 'translateY(0)'
    }}
    >
      {/* Badges */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        display: 'flex',
        gap: '8px',
        zIndex: 10
      }}>
        {product.isPopular && (
          <span style={{
            background: '#ef4444',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
          }}>
            🔥 {t('Populyar', 'Popular')}
          </span>
        )}
        {product.isNew && (
          <span style={{
            background: '#22c55e',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
          }}>
            ✨ {t('Yeni', 'New')}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px',
          gap: '16px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            margin: 0,
            color: '#212529',
            lineHeight: 1.3
          }}>
            {t(product.nameAZ, product.nameEN)}
          </h3>
          <span style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#8B7355',
            whiteSpace: 'nowrap'
          }}>
            {product.price} {settings.currency || 'AZN'}
          </span>
        </div>

        {(product.volume || product.prepTime) && (
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '12px',
            color: '#6c757d',
            fontSize: '13px',
            fontWeight: 500
          }}>
            {product.volume && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#f8f9fa',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                📏 {product.volume}
              </span>
            )}
            {product.prepTime && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#f8f9fa',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                ⏱️ {product.prepTime}
              </span>
            )}
          </div>
        )}

        {(product.descAZ || product.descEN) && (
          <p style={{
            color: '#6c757d',
            margin: '0 0 16px 0',
            lineHeight: 1.6,
            fontSize: '14px'
          }}>
            {t(product.descAZ, product.descEN)}
          </p>
        )}

        {/* Actions */}
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <button
            onClick={() => toggleFavorite(product.id)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: favorites.includes(product.id) ? 'none' : '1px solid #dee2e6',
              background: favorites.includes(product.id) ? '#fee2e2' : 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              transition: 'all 0.2s',
              boxShadow: favorites.includes(product.id) ? '0 2px 8px rgba(239, 68, 68, 0.2)' : 'none'
            }}
            title={favorites.includes(product.id) ? 'Favorilərdən çıxar' : 'Favorilərə əlavə et'}
          >
            {favorites.includes(product.id) ? '❤️' : '🤍'}
          </button>
          <span style={{
            color: '#6c757d',
            fontSize: '13px',
            fontWeight: 500
          }}>
            {favorites.includes(product.id) ? t('Favoridə', 'Favorited') : t('Favori et', 'Add to favorites')}
          </span>
        </div>
      </div>

      {/* Product Image */}
      {product.imageUrl && (
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '12px',
          overflow: 'hidden',
          flexShrink: 0,
          background: '#f8f9fa',
          border: '1px solid #e9ecef'
        }}>
          <img
            src={product.imageUrl}
            alt={t(product.nameAZ, product.nameEN)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s'
            }}
            onError={(e) => {
              e.target.parentElement.style.display = 'none'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          />
        </div>
      )}
    </div>
  )
}
