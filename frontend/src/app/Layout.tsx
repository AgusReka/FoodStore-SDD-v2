import { Outlet } from 'react-router-dom'
import Header from '@widgets/Header'
import { CartDrawer } from '@widgets/CartDrawer'
import { Footer } from '@widgets/Footer'
import { ProductDetailModal } from '@widgets/ProductDetailModal'
import { useBreakpoint } from '@shared/hooks/useBreakpoint'
import { useUiStore } from '@shared/stores/uiStore'

const Layout = () => {
  const { isMobile } = useBreakpoint()
  const selectedProductId = useUiStore((s) => s.selectedProductId)
  const closeProductModal = useUiStore((s) => s.closeProductModal)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="ambient" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
        {/* CartDrawer: desktop overlay from any page */}
        {!isMobile && <CartDrawer />}
      </div>
      <ProductDetailModal
        productId={selectedProductId}
        onClose={closeProductModal}
      />
    </div>
  )
}

export default Layout
