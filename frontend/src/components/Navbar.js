import React, {useState} from 'react'
import PropTypes from 'prop-types'
//import imageSrc from './public/storm.png';
import { Link } from 'react-router-dom';
import logo from '../storm.png';

export default function Navbar(props) {
    const handleSearchClick = () => {
        console.log("Search was clicked")
    }

    return (
        <div className="navbar-div">
        <nav className="navbar sticky-top navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
            <div className="container-fluid">
            <Link className="navbar-brand" to="/">
                <img src={logo} alt="Logo" width="35" height="28" className="d-inline-block align-text-top me-2"/>
                {props.title}
            </Link>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                        <Link className="nav-link active" aria-current="page" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link active" to="/dashboard">Dashboard</Link>
                    </li>
                </ul>
            </div>
            </div>
        </nav>
     </div>
    )
}

Navbar.propTypes = {
    title: PropTypes.string.isRequired
};
Navbar.defaultProps = {
    title: "Insert title here"
};