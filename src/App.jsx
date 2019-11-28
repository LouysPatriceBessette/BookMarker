import React, { Component } from 'react'
import Nav from './Nav.jsx'
import Page from './Page.jsx'
import Modal from './Modal.jsx'


class App extends Component {
    render = () => {
        return (
            <>
                <Nav/>
                <div className="page">
                    <Page/>
                    <Modal/> 
                </div>
            </>
        )
    }
}


export default App
