let qf = async (endpoint = null, method = "GET", body = null) => {
    if (endpoint === null) {
        console.log("---------------------- NO ENDPOINT! ----------------------")
        return
    }
    console.log("---------------------- ASYNC REQUEST TO " + endpoint + " ----------------------")
    let response = JSON.parse(
        await (await fetch(endpoint, {
            method: method,
            body: body
        })).text()
    )
    console.log("---------------------- ASYNC RESPONSE FROM " + endpoint + " ----------------------")
    console.log(JSON.stringify(response))
    return response
}
export default qf