import React, { Component } from 'react'
import { connect } from "react-redux" 
import rsg from './js-lib/random_string_gen.js'
import log from './js-lib/custom_log.js'
import Categories from './Categories.jsx'
import BookmarkDetails from './BookmarkDetails.jsx'
import key from 'weak-key'
import {getRealType,map_O_spread} from './js-lib/map_O_spread.js'

class U_Page extends Component {
    constructor(props){
        super(props)
    }

    render = () => {
        log.render("Page")

        // Categories listing
        if(this.props.logged){
            return (
                <>
                    <div className="categoryTree">
                        <Categories/>
                    </div>
                    <div className="categoryDisplay">
                        <BookmarkDetails/>
                    </div>
                </>
            )
        }else{
            let pageClass = (this.props.overlay) ? "blurred" : ""
            
            return (
                <div className={pageClass}>
                    <div><h1>Access your bookmarks from anywhere!</h1></div>
                    <div>
                        <p>This website allows you to store your favorite web links in a new parctical way.</p>
                    </div>

                    <div><h2>Share them!</h2></div>
                    <div>
                        <p>This website allows you to store your favorite web links in a new practical way.</p>
                        <p>You can have all your links classified as you want and you can share them with your friends.</p>
                        <p><b>Features:</b></p>
                        <ul>
                            <li>Category sharing</li>
                            <li>Drag and drop classification</li>
                            <li>Easy edit</li>
                            <li>Easy search</li>
                            <li>Comments</li>
                            <li>Automatic check for broken links</li>
                            
                        </ul>
                        
                    </div>

                    <div><h2>One month free trial.</h2></div>
                    <div>
                        <p>After a month, if you like the service and want to continue using it, you will be asked to upgrade to a paid account. That is to help us maintain and improve the site.</p>
                    </div>

                    <div><h6>===============</h6></div>
                    <div>
                        <p className="legal">* {rsg(3)}</p>
                    </div>
                </div>
            )
        }
    }
}


let stp = state => {
    log.var("state",map_O_spread(state))
    return {logged:state.logged,overlay:state.overlay}
}
let Page = connect(stp)(U_Page)

export default Page