import {
    HTTP_METHOD_POST,
    LOGIN_TOKEN,
    REQUEST_URL,
    HTTP_STATUS_OK,
    setCredentialCookie,
    TOKEN_EXPIRE_HOURS
} from "../../global/constants/constants";

export async function login(username: string, password: string) {
    let formdata = new FormData();
    formdata.append("username", username);
    formdata.append("password", password);
    return fetch(REQUEST_URL + LOGIN_TOKEN, {method: HTTP_METHOD_POST, body: formdata})
        .then(response => {
            if (response.status !== HTTP_STATUS_OK) {
                console.log("Could not login")
                return 403;
            }
            return response.json();
        })
        .then((data) => {
            if (data) {
                setCredentialCookie(data.access_token, TOKEN_EXPIRE_HOURS);
                console.log("Cookie setted")
                window.location.replace(window.location.origin);
                return 200;
            }
        })
        .catch(rejected => {
            console.log(rejected)
            return 404;
        });
}

