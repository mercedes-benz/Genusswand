import {
    doUtcDate,
    HTTP_JSON_HEADERS,
    HTTP_METHOD_POST, HTTP_STATUS_CREATED,
    REQUEST_URL,
    USER_CREATE_URL
} from "../../global/constants/constants";

export function register(
    first_name: string,
    last_name: string,
    birthdate: string,
    username: string,
    email: string,
    password: string,
    profile_image_id: string
) {


    const data = {
        username: username,
        email: email,
        password: password,
        vorname: first_name,
        nachname: last_name,
        geburtstag: birthdate,
        profilbild_id: profile_image_id,
    };



    const body = JSON.stringify(data);

    return fetch(REQUEST_URL + USER_CREATE_URL, {
        method: HTTP_METHOD_POST,
        headers: HTTP_JSON_HEADERS,
        body: body
    })
        .then(response => {
            if (response.status !== HTTP_STATUS_CREATED) {
                console.log("Could not register")
                return 403;
            }
            console.log("Registered")
            window.location.replace(window.location.origin);
            return response.json();
        })
        .then((data) => {
            if (data) {
                console.log(data)
                return 200;
            }
        })
        .catch(rejected => {
            console.log(rejected)
            return 404;
        });
}