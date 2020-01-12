// THIS TIME AND DATE SUB FUNCTION CAN BE USED ON SERVER-SIDE AND ON CLIENT SIDE.
//
// ATTENTION: While there is absolutely no difference in the function itself...
//            The way to IMPORT or to REQUIRE differs on the server-side, compared to the client-side.
//
//            So there is need for having two files for that script
//            where only two line are different.


// ================================ FOR CLIENT-SIDE EXPORT
let date_time = unixTime => {

    // ================================ FOR SERVER-SIDE REQUIRE
    //module.exports = unixTime => {

    // ======================================================================== INPUT
    if (unixTime === undefined || isNaN(parseInt(unixTime))) {
        unixTime = new Date().getTime()
    }

    // Formatting to basic local
    let local = new Date(unixTime).toLocaleString("en-us", {
        hour12: false
    })

    // ISO Timezone
    let timezone_in_minutes = new Date().getTimezoneOffset()

    // Leading zero on the hour
    let GMT_timezone = timezone_in_minutes > 0 ? "-" : "+"

    // Check if there are minutes
    let GMT_timzone_in_hours = (timezone_in_minutes / 60)

    // Format it...
    GMT_timezone += GMT_timzone_in_hours < 10 ? "0" + GMT_timzone_in_hours : GMT_timzone_in_hours
    GMT_timezone += ":"
    GMT_timezone += (timezone_in_minutes % 60) === 0 ? "00" : timezone_in_minutes

    // ======================================================================== OUTPUTS

    // The date only - International Standard
    let dateOnly_Arr = local.split(",")[0].trim().split("/")
    let year = dateOnly_Arr[2];
    let month = (parseInt(dateOnly_Arr[0]) < 10 ? "0" : "") + dateOnly_Arr[0]
    let day = (parseInt(dateOnly_Arr[1]) < 10 ? "0" : "") + dateOnly_Arr[1]
    let dateOnly = year + "-" + month + "-" + day

    // The date only - US
    let dateOnly_us = local.split(",")[0].trim()

    // The time only
    let timeOnly = local.split(",")[1].trim()

    // The Local display
    let full_Local = dateOnly + " " + timeOnly

    // The ISO display
    let iso = dateOnly + "T" + timeOnly + GMT_timezone

    // The filename prefix
    let time_Arr = local.split(", ")[1].split(":")

    // Filename prefix formatted as I like: YYYY-MM-DD_HHhMMmSSs_
    let filenamePrefix = dateOnly + "_" + time_Arr[0] + "h" + time_Arr[1] + "m" + time_Arr[2] + "s_"

    // Uncomment to look at the ouput options...
    // console.log()
    // console.log()

    // console.log("full_Local:", full_Local)
    // console.log()

    // console.log("full_ISO:", iso)
    // console.log()

    // console.log("dateOnly:", dateOnly)
    // console.log("dateOnly_us:", dateOnly_us)
    // console.log()

    // console.log("timeOnly:", timeOnly)
    // console.log()

    // console.log("filenamePrefix:", filenamePrefix)
    // console.log()

    // console.log("unix:", unixTime)
    // console.log()

    return {
        // Full date AND time
        full_Local: full_Local,
        full_ISO: iso,

        // Date only (ISO and US)
        dateOnly: dateOnly,
        dateOnly_us: dateOnly_us,

        // Time only
        timeOnly: timeOnly,

        // Filename prefix
        filename: filenamePrefix,

        // Unix time epoch (Useful output if no argument was provided...)
        unix: unixTime
    }
}

// ================================ FOR CLIENT-SIDE EXPORT
export default date_time