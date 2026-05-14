import { Link } from 'react-router-dom'
import { CONFIG } from '@shared/config/brand'

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/menu', label: 'Menú' },
  { to: '/orders', label: 'Mis pedidos' },
  { to: '/profile', label: 'Mi perfil' },
]

const COMPANY_LINKS = [
  { to: '/about', label: 'Sobre nosotros' },
  { to: '/terms', label: 'Términos' },
  { to: '/privacy', label: 'Privacidad' },
  { to: '/faq', label: 'Preguntas frecuentes' },
]

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--ink-1)',
        color: 'white',
        marginTop: 80,
        padding: '60px 0 32px',
      }}
    >
      <div className="container">
        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
            gap: 48,
            marginBottom: 48,
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9,
                  background: 'linear-gradient(135deg, #FF9933, #FF7A00)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(255,122,0,0.4)',
                }}
              >
                <span
                  style={{ width: 6, height: 6, borderRadius: 999, background: 'white' }}
                />
              </span>
              <span
                style={{
                  fontFamily: 'var(--ff-display)',
                  fontWeight: 600,
                  fontSize: 19,
                  letterSpacing: '-0.035em',
                }}
              >
                {CONFIG.brand}
              </span>
            </Link>

            <p
              style={{
                fontSize: 13.5,
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.6,
                margin: '0 0 20px',
                maxWidth: 280,
              }}
            >
              {CONFIG.brandTagline}
            </p>

            {/* Location badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                fontSize: 12.5,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Mendoza, Argentina
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                margin: '0 0 16px',
              }}
            >
              Navegación
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    fontSize: 13.5,
                    color: 'rgba(255,255,255,0.7)',
                    transition: 'color 180ms',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                margin: '0 0 16px',
              }}
            >
              Información
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COMPANY_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    fontSize: 13.5,
                    color: 'rgba(255,255,255,0.7)',
                    transition: 'color 180ms',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact / Social */}
          <div>
            <h4
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                margin: '0 0 16px',
              }}
            >
              Contacto
            </h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                fontSize: 13.5,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              <span>hola@foodstore.com.ar</span>
              <span>+54 261 555-0123</span>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {['Instagram', 'WhatsApp', 'Twitter'].map((s) => (
                  <span
                    key={s}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.08)',
                      fontSize: 11.5,
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.6)',
                      cursor: 'default',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: 'rgba(255,255,255,0.08)',
            marginBottom: 24,
          }}
        />

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
          }}
          className="footer-bottom"
        >
          <span>© {new Date().getFullYear()} {CONFIG.brand}. Todos los derechos reservados.</span>
          <span className="hide-mobile">
            Hecho con <span style={{ color: 'var(--brand)' }}>♥</span> en Mendoza
          </span>
        </div>
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 860px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            gap: 8px !important;
            text-align: center !important;
          }
        }
      `}</style>
    </footer>
  )
}
