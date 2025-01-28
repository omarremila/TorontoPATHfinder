import { useState } from 'react'
import './App.css'
import thepathLogo from './assets/the_path_logo.jpg'
import MapComponent from './MapComponent';

import './App.css';
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    
      <div className="the-path-logo">
        <img src={thepathLogo} alt="PATH logo" />
      </div>

      <div className="map-container">
        <MapComponent />
      </div>
    </>
  )
}

export default App