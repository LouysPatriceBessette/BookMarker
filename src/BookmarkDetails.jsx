import React, { Component } from 'react'
import { connect } from "react-redux" 
import rsg from './js-lib/random_string_gen.js'
import log from './js-lib/custom_log.js'
import key from 'weak-key'
import {getRealType,map_O_spread} from './js-lib/map_O_spread.js'

class U_BookmarkDetails extends Component {
    constructor(props){
        super(props)
    }

    render = () => {
        log.render("BookmarkDetails")

        if(this.props.activeLink!==-1){
            let link = this.props.links[parseInt(this.props.activeLink)]

            return (
                <>
                    <p>{link.name}</p>
                    <p>Star rating: {link.rating}</p>
                    <p>{link.href}</p>
                    <p>{link.comment}</p>
                </>
            )
        }else{
            return (
                <></>
            )
        }
    }
}

let stp = state => {
    return {activeLink:state.activeLink, links:state.bank.links}
}
let BookmarkDetails = connect(stp)(U_BookmarkDetails)

export default BookmarkDetails