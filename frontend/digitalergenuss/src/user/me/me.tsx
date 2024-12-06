import {
    HTTP_METHOD_GET,
    REQUEST_URL,
    USER_INFO,
    HTTP_JSON_HEADERS_WITH_AUTH,
    HTTP_AUTH_HEADERS,
    getCredentialCookie,
    HTTP_STATUS_OK
} from "../../global/constants/constants";

export async function getUserInfo() {
    return fetch(REQUEST_URL + USER_INFO, {
        method: HTTP_METHOD_GET,
        headers: HTTP_AUTH_HEADERS(getCredentialCookie())
    })
        .then(response => {
            if (response.status !== HTTP_STATUS_OK) {
                console.log("Could not login")
                return 403;
            }
            return response.json();
        })
        .catch(rejected => {
            console.log(rejected)
            return 404;
        });
}

