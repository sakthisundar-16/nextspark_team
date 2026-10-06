import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { NSApp } from './NSApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NSApp />
  </StrictMode>,
)
