import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Table from './components/Table';
import Dashboard from './components/Dashboard';
import YourComponent from './components/Table';

function App() {
  //document.body.style.backgroundColor = "#777B7E"
  document.body.style.backgroundColor = "#ffffff "

  return (
    <>
      <BrowserRouter>
          <Navbar title="Delhi Bijli Vitran Nigam" component={YourComponent}/>
            <Routes>
              <Route exact path="/" element={<Table />}></Route>
            </Routes>
            <Routes>
              <Route exact path="/dashboard" element={<Dashboard />}></Route>
            </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
