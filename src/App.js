import { Routes, Route } from "react-router-dom";
import Home1 from "./components/Home1.jsx"
import Setting from "./components/Settings.jsx"
import Dashboardv2 from "./components/Dashboardv2.jsx"
import Page from "./components/Newpage.jsx"
import Page3 from "./components/Page.jsx"
import Home from "./components/Home.jsx"

function App() {
  return (
    <div>
        <Routes>
        <Route path="/" element={<Home />} />
       {/*  <Route path="/page4" element={<Home />} /> 
          <Route path="/setting" element={<Setting />} />
          <Route path="/dashboardv2" element={<Dashboardv2 />} />
          <Route path="/page" element={<Page />} />
          <Route path="/" element={<Home />} />
          <Route path="/page3" element={<Page3 />} /> */}
        </Routes>
      
    </div>
  );
}

export default App;
