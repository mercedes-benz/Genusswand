import Cookies from "universal-cookie";

const REQUEST_URL_1 = window.location.protocol + "//" + "api." + window.location.hostname + ":" + window.location.port,
    REQUEST_URL_2 = window.location.protocol + "//" +  window.location.hostname + ":" + 8000,
    USER_URL = '/person',
    LOGIN_TOKEN = "/token",
    TOKEN_EXPIRE_HOURS = 10,
    USER_CREATE_URL = USER_URL + '/create',
    USER_INFO = USER_URL + '/me',
    USER_UPDATE = USER_URL + '/update',
    USER_GET_USER = USER_URL + '/get_person',
    USER_PROFILE_IMAGE = USER_URL + '/profile_image',
    USER_PROFILE_IMAGE_SMALL = USER_PROFILE_IMAGE + '/small',
    USER_PROFILE_IMAGE_MEDIUM = USER_PROFILE_IMAGE + '/medium',
    USER_PROFILE_IMAGE_LARGE = USER_PROFILE_IMAGE + '/large',

    IMAGE_URL = '/foto',
    IMAGE_UPLOAD_URL = IMAGE_URL + "/add_image",
    IMAGE_UPLOAD_URL_USER = IMAGE_UPLOAD_URL + "/profile-pictures",
    IMAGE_UPLOAD_URL_LIST = IMAGE_UPLOAD_URL + "/list-pictures",
    IMAGE_UPLOAD_URL_STRICH_REASON = IMAGE_UPLOAD_URL + "/reason-pictures",
    IMAGE_UPLOAD_URL_STRICH_DONE = IMAGE_UPLOAD_URL + "/done-pictures",
    IMAGE_UPDATE_URL = IMAGE_URL + "/update_image",


    LIST_URL = '/list',
    LIST_CREATE_URL = LIST_URL + '/create',
    LIST_ADD_USER_URL = LIST_URL + '/add_person',
    LIST_GET_ADDED_LISTS = LIST_URL + '/get_added_lists',
    LIST_GET_SPECIFIC_LIST = LIST_URL + '/get_list',
    LIST_GET_SPECIFIC_LIST_NAME = LIST_URL + '/get_list_name',
    LIST_GET_CREATED_LISTS = LIST_URL + '/get_created_lists',
    LIST_GET_IMAGE = LIST_URL + '/list_image',
    LIST_GET_IMAGE_SMALL = LIST_GET_IMAGE + '/small',
    LIST_GET_IMAGE_MEDIUM = LIST_GET_IMAGE + '/medium',
    LIST_GET_IMAGE_LARGE = LIST_GET_IMAGE + '/large',

    STRICH_URL = '/strich',
    STRICH_CREATE_URL = STRICH_URL + '/create',
    STRICH_GET_STRICHE_FROM_LIST = STRICH_URL + '/get_striche',
    STRICH_GET_IMAGE = STRICH_URL + '/strich_image',
    STRICH_GET_IMAGE_SMALL = STRICH_GET_IMAGE + '/small',
    STRICH_GET_IMAGE_MEDIUM = STRICH_GET_IMAGE + '/medium',
    STRICH_GET_IMAGE_LARGE = STRICH_GET_IMAGE + '/large',
    STRICH_SET_DONE = STRICH_URL + '/done'



const HTTP_STATUS_OK = 200,
    HTTP_STATUS_CREATED = 201,
    HTTP_METHOD_POST = "POST",
    HTTP_METHOD_PUT = "PUT",
    HTTP_METHOD_DELETE = "DELETE",
    HTTP_METHOD_GET = "GET";

const HTTP_JSON_HEADERS = {
    'Accept': '*/*',
    'Content-Type': 'application/json'
};

const HTTP_JSON_HEADERS_WITH_AUTH = (auth_token: string) => {
    return {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + auth_token
    };
};

const REQUEST_URL_CREATOR = () => {
    if (window.location.hostname === "localhost") {
        return REQUEST_URL_2;
    } else {
        return REQUEST_URL_1;
    }
}

const REQUEST_URL = REQUEST_URL_CREATOR();

const HTTP_AUTH_HEADERS = (auth_token: string) => {
    return {
        'Authorization': 'Bearer ' + auth_token
    };
}

function setCredentialCookie(value: string, expires: number) {
    const cookies = new Cookies();
    let date = new Date();
    date.setTime(date.getTime() + (expires * 60 * 60 * 1000));
    cookies.set("token", value, {expires: date, path: '/'});
}

function getCredentialCookie() {
    const cookies = new Cookies();
    return cookies.get("token");
}

function logout() {
    const cookies = new Cookies();
    cookies.remove("token");
    window.location.replace(window.location.origin);
}

function doUtcDate(date: Date) {
    console.log(date.getDate())
    console.log(date.getMonth())
    console.log(date.getFullYear())
    let year = "" + date.getFullYear()
    let day = ""
    let month = ""
    let hour = ""
    let minute = ""
    let second = ""
    if (date.getDate() < 10) {
        day = "0" + date.getDate()
    } else {
        day = "" + date.getDate()
    }
    if (date.getMonth() < 10) {
        month = "0" + (date.getMonth() +1)
    } else {
        month = "" + (date.getMonth() +1)
    }
    if (date.getHours() < 10) {
        hour = "0" + date.getHours()
    } else {
        hour = "" + date.getHours()
    }
    if (date.getMinutes() < 10) {
        minute = "0" + date.getMinutes()
    } else {
        minute = "" + date.getMinutes()
    }
    if (date.getSeconds() < 10) {
        second = "0" + date.getSeconds()
    } else {
        second = "" + date.getSeconds()
    }


    let dateString = year + "-" + month + "-" + day
    let timeString = "T" + hour + ":" + minute + ":" + second
    let timeZoneString = "+00:00"
    let utcDateString = dateString + timeString + timeZoneString
    return new Date(utcDateString)
}

export {
    REQUEST_URL,
    LOGIN_TOKEN,
    USER_CREATE_URL,
    USER_INFO,
    USER_UPDATE,
    USER_PROFILE_IMAGE_SMALL,
    USER_PROFILE_IMAGE_MEDIUM,
    USER_PROFILE_IMAGE_LARGE,
    USER_GET_USER,
    IMAGE_UPLOAD_URL_USER,
    IMAGE_UPLOAD_URL_LIST,
    IMAGE_UPLOAD_URL_STRICH_REASON,
    IMAGE_UPLOAD_URL_STRICH_DONE,
    IMAGE_UPDATE_URL,
    LIST_CREATE_URL,
    LIST_ADD_USER_URL,
    LIST_GET_ADDED_LISTS,
    LIST_GET_CREATED_LISTS,
    LIST_GET_IMAGE_SMALL,
    LIST_GET_IMAGE_MEDIUM,
    LIST_GET_IMAGE_LARGE,
    LIST_GET_SPECIFIC_LIST,
    LIST_GET_SPECIFIC_LIST_NAME,
    STRICH_GET_STRICHE_FROM_LIST,
    STRICH_SET_DONE,
    STRICH_GET_IMAGE_SMALL,
    STRICH_GET_IMAGE_MEDIUM,
    STRICH_GET_IMAGE_LARGE,
    STRICH_CREATE_URL,
    HTTP_METHOD_POST,
    HTTP_METHOD_PUT,
    HTTP_STATUS_CREATED,
    HTTP_METHOD_GET,
    HTTP_AUTH_HEADERS,
    HTTP_JSON_HEADERS,
    HTTP_JSON_HEADERS_WITH_AUTH,
    HTTP_METHOD_DELETE,
    HTTP_STATUS_OK,
    TOKEN_EXPIRE_HOURS,
    doUtcDate,
    setCredentialCookie,
    getCredentialCookie,
    logout
}