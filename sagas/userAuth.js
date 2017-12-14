import { call, put, all } from "redux-saga/effects";
import firebase from "../firebase";

import UserAuth from "../userAuth/index";

export function* getUserAuth() {
    const getUserAuthResponse = yield call(UserAuth.getUserAuth);
    console.log("getUserAuthResponse", getUserAuthResponse);

    if (getUserAuthResponse.authenticated) {
        yield put({
            type: "SIGN_IN_USER",
            uid: getUserAuthResponse.message.uid,
            userName: getUserAuthResponse.message.userName,
            userEmail: getUserAuthResponse.message.userEmail,
            userPhotoURL: getUserAuthResponse.message.userPhotoURL,
            authenticated: true,
            anonymous: getUserAuthResponse.message.anonymous,

            lastAccessed: Date.now,
        });
    } else {
        yield put({
            type: "signInUserAnonymously",
        });
    }
}

export function* signInUserAnonymously() {
    const signInUserAnonymouslyResponse = yield call(
        UserAuth.signInUserAnonymously
    );
    console.log("signInUserAnonymouslyResponse", signInUserAnonymouslyResponse);

    if (signInUserAnonymouslyResponse.authenticated) {
        yield put({
            type: "SIGN_IN_USER",
            uid: signInUserAnonymouslyResponse.message.uid,
            anonymous: true,
        });
    } else {
        yield put({
            type: "SET_ERROR",
            errorType: "AUTH",
            message: "Oh dear, network error. Please try again.",
            retryAction: {
                type: "signInUserAnonymously",
            },
        });
    }
}

export function* getUserCredentialFromEmail(action) {
    const getUserCredentialFromEmailResponse = yield call(
        UserAuth.getUserCredentialFromEmail,
        action
    );
    console.log(
        "getUserCredentialFromEmailResponse",
        getUserCredentialFromEmailResponse
    );

    if (getUserCredentialFromEmailResponse.success) {
        yield all([
            put({
                type: "TOGGLE_LOADING",
            }),
            put({
                type: "linkUserWithCredential",
                credential:
                    getUserCredentialFromEmailResponse.message.credential,
                userName: action.userName,
                userEmail: action.email,
            }),
        ]);
    } else {
        yield put({
            type: "SET_ERROR",
            errorType: "AUTH",
            message:
                "Something's not right. Please check your connection and try again.",
            retryAction: {
                type: "getUserCredentialFromEmail",
                data: {
                    userEmail: action.userEmail,
                    userPassword: action.userPassword,
                    userName: action.userName,
                },
            },
        });
    }
}

export function* getUserCredentialFromFacebook() {
    const getUserCredentialFromFacebookResponse = yield call(
        UserAuth.getUserCredentialFromFacebook
    );
    console.log(
        "getUserCredentialFromFacebookResponse",
        getUserCredentialFromFacebookResponse
    );

    if (getUserCredentialFromFacebookResponse.success) {
        yield all([
            put({
                type: "TOGGLE_LOADING",
            }),
            put({
                type: "linkUserWithCredential",
                credential:
                    getUserCredentialFromFacebookResponse.message.credential,
            }),
        ]);
    } else {
        yield put({
            type: "SET_ERROR",
            errorType: "AUTH",
            message:
                "Can't connect to Facebook. Please check your connection and try again.",
            retryAction: {
                type: "getUserCredentialFromFacebook",
            },
        });
    }
}

export function* getUserCredentialFromGoogle() {
    const getUserCredentialFromGoogleResponse = yield call(
        UserAuth.getUserCredentialFromGoogle
    );
    console.log(
        "getUserCredentialFromGoogleResponse",
        getUserCredentialFromGoogleResponse
    );

    if (getUserCredentialFromGoogleResponse.success) {
        yield all([
            put({
                type: "TOGGLE_LOADING",
            }),
            put({
                type: "linkUserWithCredential",
                credential:
                    getUserCredentialFromGoogleResponse.message.credential,
            }),
        ]);
    } else {
        yield put({
            type: "SET_ERROR",
            errorType: "AUTH",
            message:
                "Can't connect to Google. Please check your connection and try again.",
            retryAction: {
                type: "getUserCredentialFromGoogle",
            },
        });
    }
}

export function* linkUserWithCredential(action) {
    if (firebase.auth().currentUser) {
        const linkUserWithCredentialResponse = yield call(
            UserAuth.linkUserWithCredential,
            action
        );
        console.log(
            "linkUserWithCredentialResponse",
            linkUserWithCredentialResponse
        );

        if (linkUserWithCredentialResponse.authenticated) {
            yield all([
                put({
                    type: "updateData",
                    node: "users/" + linkUserWithCredentialResponse.message.uid,
                    data: {
                        userName:
                            linkUserWithCredentialResponse.message.userName ||
                            action.userName,
                        userEmail:
                            linkUserWithCredentialResponse.message.userEmail ||
                            action.userEmail,
                        userPhotoURL:
                            linkUserWithCredentialResponse.message.userPhotoURL,
                        dateJoined: Date.now(),
                    },
                    nextActionType: null, // handle the next action here
                }),
                put({
                    type: "SIGN_IN_USER",
                    uid: linkUserWithCredentialResponse.message.uid,
                    userName:
                        linkUserWithCredentialResponse.message.userName ||
                        action.userName,
                    userEmail:
                        linkUserWithCredentialResponse.message.userEmail ||
                        action.userEmail,
                    userPhotoURL:
                        linkUserWithCredentialResponse.message.userPhotoURL,
                    anonymous: false,
                }),
            ]);
        } else if (
            linkUserWithCredentialResponse.message ===
                "auth/credential-already-in-use" ||
            linkUserWithCredentialResponse.message ===
                "auth/email-already-in-use"
        ) {
            // Sign in with provider instead
            yield put({
                type: "signInUserWithCredential",
                credential: action.credential,
            });
        } else {
            yield put({
                type: "SET_ERROR",
                errorType: "AUTH",
                message: "Oh dear, login error. Please try again.",
                retryAction: {
                    type: "linkUserWithCredential",
                    credential: action.credential,
                },
            });
        }
    } else {
        // sign in anonymously
        const signInUserAnonymouslyResponse = yield call(
            UserAuth.signInUserAnonymously,
            action
        );
        console.log(
            "signInUserAnonymouslyResponse",
            signInUserAnonymouslyResponse
        );

        if (signInUserAnonymouslyResponse.success) {
            yield put({
                type: "linkUserWithCredential",
                credential: action.credential,
            });
        } else {
            yield put({
                type: "SET_ERROR",
                errorType: "AUTH",
                message: "Oh dear, login error. Please try again.",
                retryAction: {
                    type: "signInUserAnonymously",
                },
            });
        }
    }
}

export function* signInUserWithCredential(action) {
    const signInUserWithCredentialResponse = yield call(
        UserAuth.signInUserWithCredential,
        action
    );
    console.log(
        "signInUserWithCredentialResponse",
        signInUserWithCredentialResponse
    );

    if (signInUserWithCredentialResponse.authenticated) {
        yield put({
            type: "SIGN_IN_USER",
            uid: signInUserWithCredentialResponse.message.uid,
            userName:
                signInUserWithCredentialResponse.message.userName ||
                action.userName,
            userEmail:
                signInUserWithCredentialResponse.message.userEmail ||
                action.userEmail,
            userPhotoURL: signInUserWithCredentialResponse.message.userPhotoURL,
            anonymous: false,
        });
    } else if (
        signInUserWithCredentialResponse.message.code ===
        "auth/account-exists-with-different-credential"
    ) {
        yield put({
            type: "SET_ERROR",
            errorType: "AUTH",
            message:
                "Hello! You've already signed in with someone else. Please try another option.",
        });
    } else {
        yield put({
            type: "SET_ERROR",
            errorType: "AUTH",
            message: "Oh dear, login error. Please try again.",
            retryAction: {
                type: "signInUserWithCredential",
                credential: action.credential,
            },
        });
    }
}

export function* sendPasswordResetEmail(action) {
    const passwordResetResponse = yield call(
        UserAuth.sendPasswordResetEmail,
        action
    );
    console.log("passwordResetResponse", passwordResetResponse);

    if (passwordResetResponse.success) {
        yield put({
            type: "SET_SUCCESS",
            errorType: "USER",
            message: "Email sent successfully",
        });
    } else {
        yield put({
            type: "SET_ERROR",
            errorType: "AUTH",
            message:
                passwordResetResponse.message.code === "auth/user-not-found"
                    ? "Email address not registered. Please sign up."
                    : "We were unable to send a password reset request. Check your connection and try again.",
            retryAction: {
                type: "sendPasswordResetEmail",
                data: {
                    userEmail: action.userEmail,
                },
            },
        });
    }
}

export function* signOutUser() {
    const signOutUserResponse = yield call(UserAuth.signOutUser);
    console.log("signOutUserResponse", signOutUserResponse);

    if (signOutUserResponse.success) {
        yield put({
            type: "SIGN_OUT_USER",
        });
    } else {
        yield put({
            type: "SET_ERROR",
            errorType: "AUTH",
            message: "We couldn't sign out. Please try again.",
            retryAction: {
                type: "signOutUser",
            },
        });
    }
}
