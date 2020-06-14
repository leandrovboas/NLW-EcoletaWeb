import React from 'react'
import { Link } from 'react-router-dom'

import { FiLogIn } from 'react-icons/fi'
import './styles.css'
import logo from '../../assets/logo.svg'

const Home = () => {
    return (
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="Ecoleta"></img>
                </header>
                <main>
                    <h1> Seu Marketplace de coleta de resíduo</h1>
                    <p>Ajudamos pessoas a encomtrarpontos de coletas de forma eficiente</p>
                    <Link to="/create-point">
                        <span><FiLogIn /></span>
                        <strong>Cadastro</strong>
                    </Link>
                </main>
            </div>
        </div>

    )
}


export default Home