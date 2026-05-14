import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBreakpoint } from '@shared/hooks/useBreakpoint'
import { useUiStore } from '@shared/stores/uiStore'
import { CartDrawer } from '@widgets/CartDrawer'

const CartPage = () => {
  const navigate = useNavigate()
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

  // Navigate away when cart is closed (user clicked X or Escape on the cart page)
  // Small delay to avoid interfering with checkout navigation (which also closes cart)
  const wasOpen = useRef(cartOpen)
  useEffect(() => {
    if (wasOpen.current && !cartOpen) {
      const timer = setTimeout(() => navigate('/', { replace: true }), 50)
      return () => clearTimeout(timer)
    }
    wasOpen.current = cartOpen
  }, [cartOpen, navigate])

  return <CartDrawer />
}

export default CartPage
