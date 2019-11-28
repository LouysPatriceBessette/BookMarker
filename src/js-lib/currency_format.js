/* 
==============================
Easy formatting of currencies!

Usage:
currency(10000,"fr-CA","CAD")   // integer, language-country, currency

If no arguments are passed to the function, the default are: 0, fr-CA, CAD... Which will outputthe string: 0.00$

*/

// Number formating function
  let currency = (number=0,format="fr-CA",currency="CAD") =>{
    let numberFormatted = new Intl.NumberFormat(format, { style: 'currency', currency: currency }).format(number)
    return numberFormatted
  }

  export default currency