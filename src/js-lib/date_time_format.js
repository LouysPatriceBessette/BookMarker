let date_time = unixTime => {

    // ======================================================================== INPUT
    if (unixTime === undefined || isNaN(parseInt(unixTime))) {
        unixTime = new Date().getTime()
    }

    // Formatting to basic local
    let local = new Date(unixTime).toLocaleString("en-ca", {
        hour12: false
    })

    // ======================================================================== OUTPUTS
    // The ISO display
    let iso = local.split(", ").join(" - ")

    // The date only
    let dateOnly = local.split(",")[0].trim()

    // The time only
    let timeOnly = local.split(",")[1].trim()

    // The filename prefix
    let filenamePrefixArr = local.split(", ").join("-").split(":")
    let filenamePrefix = filenamePrefixArr[0] + "h" + filenamePrefixArr[1] + "m" + filenamePrefixArr[2] + "s_"

    /*
    console.log(unixTime)
    console.log()

    console.log(local)
    console.log()

    console.log(iso)
    console.log(dateOnly)
    console.log(timeOnly)
    console.log(filenamePrefix)
    */

    return {
        iso: iso,
        date: dateOnly,
        time: timeOnly,
        filename: filenamePrefix,
        unix: unixTime
    }
}
export default date_time