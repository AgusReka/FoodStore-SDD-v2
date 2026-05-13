import { Outlet } from 'react-router-dom'
import Header from '@widgets/Header'

const Layout = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />
      <Outlet />
    </div>
  )
}

export default Layout
