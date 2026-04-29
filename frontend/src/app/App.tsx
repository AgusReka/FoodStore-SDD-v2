import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import HomePage from '@pages/HomePage'
import LoginPage from '@pages/LoginPage'
import RegisterPage from '@pages/RegisterPage'
import NotFound from '@pages/NotFound'

// Example of code splitting with React.lazy + Suspense for future routes:
// const LazyPage = React.lazy(() => import('@pages/LazyPage'))
// <Suspense fallback={<div>Loading...</div>}>
//   <LazyPage />
// </Suspense>

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
