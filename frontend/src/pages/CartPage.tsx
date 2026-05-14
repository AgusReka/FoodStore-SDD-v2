import { useEffect } from 'react'
import { useBreakpoint } from '@shared/hooks/useBreakpoint'
import { useUiStore } from '@shared/stores/uiStore'
import { CartDrawer } from '@widgets/CartDrawer'

/* ============================================================
   CartPage — Mesa mobile cart view
   Desktop: renders the CartDrawer as overlay
   Mobile: full-screen page matching CartDrawer content
   ============================================================ */

const CartPage = () => {
  const { isMobile } = useBreakpoint()
  const cartOpen = useUiStore((s) => s.cartOpen)
  const setCartOpen = useUiStore((s) => s.setCartOpen)

  // On mobile, force cart drawer open as page
  useEffect(() => {
    if (isMobile) {
      setCartOpen(true)
    }
  }, [isMobile, setCartOpen])

  // On desktop, if cart isn't open, open it (user navigated to /cart)
  useEffect(() => {
    if (!isMobile && !cartOpen) {
      setCartOpen(true)
    }
  }, [isMobile, cartOpen, setCartOpen])

  return <CartDrawer />
}

export default CartPage
