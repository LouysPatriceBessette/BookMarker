/* 
==============================
Here is a simple random string generator useful for web development.

==== Usage:
== All arguments are opttional
rsg( [phrase amount], [words per phrase], [word length])

== Syntax:
rsg( [int], {min:[int],max:[int]}, {min:[int],max:[int]} )  ==> string


==== LICENCE:

It is under the "Unlicence": https://choosealicense.com/licenses/unlicense/
So it's totally up to you to use and modify.

Enjoy!


2019-11-07
==============================
*/
let rsg = (phrase=4, wordPerPhrase=[6,3], wordLenght=[2,8] )=>{

  let words = Math.floor(wordPerPhrase[0]+Math.random()*wordPerPhrase[1])
  let punctuation = [".","!","?","..."]
  let alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
  let newText = ""

  for(let p=0;p<phrase;p++){
    for(let w=0;w<words;w++){
      for(let l=0;l<Math.floor(wordLenght[0]+Math.random()*wordLenght[1]);l++){
        let letter = alphabet[Math.floor(Math.random()*26)]
        if(w===0 && l===0){
          letter = letter.toUpperCase()
        }
        newText += letter
      }
      if(w<words-1)
      newText += " "
    }
    newText += punctuation[Math.floor(Math.random()*punctuation.length)]+" "
  }
  return newText
}

export default rsg
  