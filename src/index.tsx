import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from '@pages/App'
const container = document.getElementById('app')
if (!container) {
  throw new Error('Failed to find the root element')
}
const root = createRoot(container)
// const root = createRoot(container!) !是强制断言，表示container一定有值
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)