/* 
==============================
Some useful stylish console messages!

Documentation about console logs styling:
https://developer.mozilla.org/en-US/docs/Web/API/console#Styling_console_output


==== Import this file in your React projects:

import log from './custom_log.jsx' 


==== Usage once imported:

// green bold text

    log.ok("Some informational message")


// red bold text + 2 line returns

    log.error("Some error message")


// blue bold variable name + ": "
// grey variable type between parenthesis
// green variable value

    let myVariable = "hello World"
    log.var("A description", myVariable) 


// If the variable type is object or array, it gets stingified.
// ;)


==== LICENCE:

It is under the "Unlicence": https://choosealicense.com/licenses/unlicense/
So it's totally up to you to use and modify.

Enjoy!


2019-10-30
==============================
*/

let custom_log = class{
    constructor(){

        this.red = "color:red; "
        this.green = "color:green; "
        this.blue = "color:blue; "
        this.grey = "color:grey; "
        this.orange = "color:orange; "
        this.bold = "font-weight:bold; "

        this.error = (text)=> {
            console.log("%c"+text+"\n\n", this.red+this.bold)
        }

        this.ok = (text)=> {
            console.log("%c"+text, this.green+this.bold)
        }

        this.render = (text)=> {
            console.log("\n\n%c"+text+" renders...", this.orange+this.bold)
        }

        this.var = (description,variable)=> {

            let type = typeof(variable)
            if(type === "object" || type === "array"){
                variable = JSON.stringify(variable)
            }
            if(type === "function"){
                variable = "f{...}"     // Personally... I prefer not to console that! ;)
            }

            console.log("%c"+description+":%c ("+type+") "+"%c"+variable,
                this.blue+this.bold,
                this.grey,
                this.green)
        }
    }
}

let log = new custom_log

export default log