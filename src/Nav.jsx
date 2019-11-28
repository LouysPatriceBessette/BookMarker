import React, { Component } from 'react'
import { connect } from "react-redux" 
import log from './js-lib/custom_log.js'

class U_Nav extends Component {
    constructor(props){
        super(props)
    }

    // ===================================================================== event handlers
    signin = () => {
        log.ok("Signing in.\n\n")
        this.props.dispatch({type:"modal", content:{
            fetchPath: "signin",
            title: "Sign in"
        }})
    }
    login = () => {
        log.ok("Logging in.\n\n")
        this.props.dispatch({type:"modal", content:{
            fetchPath: "login",
            title: "Log in"
        }})
    }
    logout = () => {
        log.ok("Logging out.\n\n")
        this.props.dispatch({type:"logout"})
    }

    // ===================================================================== render component
    render = () => {
        log.render("Nav")

        // If user is NOT logged in
        log.var("logged?",this.props.logged)
        if(typeof(this.props.logged)!=="boolean"){
            log.error("Nav props.logged is a problem in Nav.jsx")
        }
        if(!this.props.logged){
            return (
                <>
                    <nav>
                        <button className="logBtn" onClick={this.login}>Log in</button>
                        <button className="logBtn" onClick={this.signin}>Sign in</button>
                        <h1 className="homepage">BookMarker.Club</h1>
                        <img className="logo" src="/book.png" />
                    </nav>
                </>
            )
        }else{
            return (
                <>
                    <nav>
                        <div><button className="logBtn" onClick={this.logout}>Log out</button></div>
                        <div className="fctGroup">
                            <button className="fctBtn">Function #1</button>
                            <button className="fctBtn">Function #2</button>
                            <button className="fctBtn">Function #3</button>
                        </div>
                        <div className="user">Logged as: <span>{this.props.username}</span></div>
                        <img className="logo" src="/book.png" />
                    </nav>
                </>
            )
        }
    }
}

let stp = state => {
    return {logged:state.logged,username:state.username}
}
let Nav = connect(stp)(U_Nav)

export default Nav