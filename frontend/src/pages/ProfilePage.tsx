import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@shared/hooks/useAuth'
import ChangePasswordForm from '@features/auth/ChangePasswordForm'
import { useBreakpoint } from '@shared/hooks/useBreakpoint'
import { useAddressesList, useDeleteAddress } from '@shared/hooks/useAddresses'
import { AddressForm } from '@entities/address/AddressForm'

const TABS = [
  { id: 'orders', label: 'Mis pedidos', icon: '📦' },
  { id: 'addresses', label: 'Direcciones', icon: '📍' },
  { id: 'settings', label: 'Ajustes', icon: '⚙️' },
  { id: 'password', label: 'Contraseña', icon: '🔒' },
] as const

type TabId = (typeof TABS)[number]['id']

function UserAvatar({ name, email }: { name: string; email: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 'var(--r-lg)',
          background: 'linear-gradient(135deg, #FF9933, #FF7A00)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(255,122,0,0.3)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--ff-display)',
            fontWeight: 700,
            fontSize: 28,
            color: 'white',
            letterSpacing: '-0.02em',
          }}
        >
          {initials}
        </span>
      </div>
      <h2
        style={{
          fontFamily: 'var(--ff-display)',
          fontWeight: 600,
          fontSize: 20,
          margin: 0,
          color: 'var(--ink-1)',
        }}
      >
        {name}
      </h2>
      <p style={{ fontSize: 13.5, color: 'var(--ink-3)', margin: '4px 0 0' }}>{email}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <span style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-1)' }}>{value}</span>
    </div>
  )
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const { isMobile } = useBreakpoint()
  const [activeTab, setActiveTab] = useState<TabId>('orders')
  const {
    user,
    isLoading,
    isSendingVerification,
    sendVerification,
    sendVerificationData,
    logout,
  } = useAuth()

  const queryClient = useQueryClient()
  const { data: addresses, isLoading: addressesLoading } = useAddressesList()
  const deleteAddress = useDeleteAddress()

  const [showAddressForm, setShowAddressForm] = useState(false)

  const handleAddressCreated = () => {
    setShowAddressForm(false)
    queryClient.invalidateQueries({ queryKey: ['addresses'] })
  }

  const handleLogout = async () => {
    await logout()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  if (isLoading || !user) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '4px solid var(--surface)',
            borderTopColor: 'var(--brand)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    )
  }

  const fullName = `${user.first_name} ${user.last_name}`

  // Sidebar tabs (desktop)
  const sidebar = (
    <nav
      style={{
        width: 240,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '12px 16px',
            borderRadius: 'var(--r-sm)',
            background: activeTab === tab.id ? 'var(--brand-soft)' : 'transparent',
            color: activeTab === tab.id ? 'var(--brand-ink)' : 'var(--ink-2)',
            fontWeight: activeTab === tab.id ? 600 : 500,
            fontSize: 14,
            textAlign: 'left',
            transition: 'all 180ms',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.background = 'var(--surface)'
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          <span style={{ fontSize: 16 }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )

  // Mobile tabs
  const mobileTabs = (
    <div
      style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        padding: '4px 0',
        marginBottom: 24,
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            height: 38,
            padding: '0 14px',
            borderRadius: 999,
            background: activeTab === tab.id ? 'var(--ink-1)' : 'var(--bg-elevated)',
            color: activeTab === tab.id ? 'white' : 'var(--ink-1)',
            border:
              activeTab === tab.id
                ? '1px solid var(--ink-1)'
                : '1px solid var(--line)',
            fontSize: 13,
            fontWeight: 500,
            transition: 'all 180ms',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 14 }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  )

  // Tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--r-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--ff-display)',
                fontWeight: 600,
                fontSize: 18,
                margin: '0 0 8px',
                color: 'var(--ink-1)',
              }}
            >
              Historial de pedidos
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--ink-3)', margin: '0 0 20px' }}>
              Revisá el estado de todos tus pedidos
            </p>
            <Link
              to="/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 999,
                background: 'var(--brand)',
                color: 'white',
                fontWeight: 500,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: 'var(--shadow-brand)',
                transition: 'all 180ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--brand-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--brand)'
              }}
            >
              Ver mis pedidos
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
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )

      case 'addresses':
        return (
          <div
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--r-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--ff-display)',
                    fontWeight: 600,
                    fontSize: 18,
                    margin: 0,
                    color: 'var(--ink-1)',
                  }}
                >
                  Direcciones de entrega
                </h3>
                <p
                  style={{
                    fontSize: 13.5,
                    color: 'var(--ink-3)',
                    margin: '4px 0 0',
                  }}
                >
                  Gestioná tus direcciones para recibir pedidos
                </p>
              </div>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 999,
                    border: '1.5px dashed var(--brand)',
                    background: 'transparent',
                    color: 'var(--brand)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 180ms',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--brand-soft)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
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
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Agregar
                </button>
              )}
            </div>

            {/* Address form */}
            {showAddressForm && (
              <div
                style={{
                  padding: 16,
                  marginBottom: 16,
                  borderRadius: 'var(--r-md)',
                  background: 'var(--surface)',
                }}
              >
                <AddressForm
                  onSuccess={handleAddressCreated}
                  onCancel={() => setShowAddressForm(false)}
                />
              </div>
            )}

            {/* Addresses list */}
            {addressesLoading && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 32,
                  color: 'var(--ink-3)',
                  fontSize: 13.5,
                }}
              >
                Cargando direcciones...
              </div>
            )}

            {!addressesLoading && (!addresses || addresses.length === 0) && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '40px 16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--r-md)',
                    background: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ink-3)',
                    marginBottom: 12,
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--ink-2)',
                    margin: '0 0 4px',
                  }}
                >
                  No tenés direcciones guardadas
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--ink-3)',
                    margin: 0,
                  }}
                >
                  Agregá una dirección para recibir tus pedidos
                </p>
              </div>
            )}

            {addresses &&
              addresses.length > 0 &&
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '14px 0',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--r-sm)',
                      background: addr.is_primary
                        ? 'var(--brand-soft)'
                        : 'var(--surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: addr.is_primary
                        ? 'var(--brand)'
                        : 'var(--ink-3)',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'var(--ink-1)',
                        }}
                      >
                        {addr.street} {addr.street_number}
                      </span>
                      {addr.is_primary && (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: 'var(--brand-soft)',
                            color: 'var(--brand-ink)',
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          Principal
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: 'var(--ink-3)',
                        margin: 0,
                      }}
                    >
                      {addr.city}
                      {addr.postal_code && ` · CP ${addr.postal_code}`}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAddress.mutate(addr.id)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--ink-3)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 180ms',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(230,57,70,0.1)'
                      e.currentTarget.style.color = 'var(--warm-red)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--ink-3)'
                    }}
                    aria-label="Eliminar dirección"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
        )

      case 'settings':
        return (
          <div
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--r-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--ff-display)',
                fontWeight: 600,
                fontSize: 18,
                margin: '0 0 20px',
                color: 'var(--ink-1)',
              }}
            >
              Información personal
            </h3>
            <div>
              <InfoRow label="Nombre" value={fullName} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Usuario" value={user.username} />
              <InfoRow
                label="Rol"
                value={user.role === 'admin' ? 'Administrador' : 'Cliente'}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                }}
              >
                <span style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>
                  Email verificado
                </span>
                <span>
                  {user.is_verified ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: 'rgba(94,138,58,0.12)',
                        color: 'var(--leaf)',
                        fontSize: 11.5,
                        fontWeight: 600,
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 12l5 5L20 6" />
                      </svg>
                      Verificado
                    </span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: 'rgba(255,201,58,0.2)',
                          color: '#7A5500',
                          fontSize: 11.5,
                          fontWeight: 600,
                        }}
                      >
                        Pendiente
                      </span>
                      <button
                        onClick={() =>
                          sendVerification({ email: user.email })
                        }
                        disabled={isSendingVerification}
                        style={{
                          fontSize: 12.5,
                          fontWeight: 500,
                          color: 'var(--brand)',
                          background: 'none',
                          border: 'none',
                          cursor: isSendingVerification
                            ? 'not-allowed'
                            : 'pointer',
                          opacity: isSendingVerification ? 0.6 : 1,
                          transition: 'color 180ms',
                        }}
                      >
                        {isSendingVerification
                          ? 'Enviando...'
                          : 'Verificar email'}
                      </button>
                    </div>
                  )}
                </span>
              </div>
              {sendVerificationData && (
                <p
                  style={{
                    fontSize: 12.5,
                    color: 'var(--leaf)',
                    margin: '8px 0 0',
                  }}
                >
                  {sendVerificationData.message}
                </p>
              )}
            </div>
          </div>
        )

      case 'password':
        return (
          <div
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--r-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <ChangePasswordForm />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
      {/* Page title */}
      <h1
        style={{
          fontFamily: 'var(--ff-display)',
          fontWeight: 600,
          fontSize: 'clamp(28px, 3vw, 36px)',
          color: 'var(--ink-1)',
          margin: '0 0 32px',
        }}
      >
        Mi Perfil
      </h1>

      {/* Avatar card */}
      <div
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--r-lg)',
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 24,
        }}
      >
        <UserAvatar name={fullName} email={user.email} />
      </div>

      {/* Mobile tabs */}
      {isMobile && mobileTabs}

      {/* Content area */}
      <div
        style={{
          display: 'flex',
          gap: 32,
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        {/* Desktop sidebar */}
        {!isMobile && sidebar}

        {/* Tab content */}
        <div style={{ flex: 1, minWidth: 0 }}>{renderTabContent()}</div>
      </div>

      {/* Logout */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 40,
          paddingTop: 24,
          borderTop: '1px solid var(--line)',
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 24px',
            borderRadius: 999,
            border: '1.5px solid var(--warm-red)',
            background: 'transparent',
            color: 'var(--warm-red)',
            fontWeight: 500,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 180ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--warm-red)'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--warm-red)'
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
