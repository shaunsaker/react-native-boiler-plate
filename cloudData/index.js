import firebase from "react-native-firebase";

import utilities from "../utilities";

const response = {
    success: null,
    message: null,
};

export default class CloudData {
    static listenForData(node, callback) {
        if (__DEV__) {
            console.log("Listening at " + node);
        }

        firebase
            .database()
            .ref(node)
            .on(
                "value",
                snapshot => {
                    callback(snapshot.val());
                },
                error => {
                    // Do nothing - silent error
                },
            );
    }

    static getData(action) {
        if (__DEV__) {
            console.log("Dispatching get at " + action.node);
        }

        return new Promise(resolve => {
            firebase
                .database()
                .ref(action.node)
                .once("value")
                .then(snapshot => {
                    response.success = true;
                    response.message = snapshot.val();
                    resolve(response);
                })
                .catch(error => {
                    response.success = false;
                    response.message = error.message;
                    resolve(response);
                });
        });
    }

    static setData(action) {
        if (__DEV__) {
            console.log("Dispatching set at " + action.node);
        }

        return new Promise(resolve => {
            firebase
                .database()
                .ref(action.node)
                .set(action.data)
                .then(() => {
                    response.success = true;
                    response.message = action.data;
                    resolve(response);
                })
                .catch(error => {
                    response.success = false;
                    response.message = error.message;
                    resolve(response);
                });
        });
    }

    static updateData(action) {
        const nodeRef = action.node + "/" + action.uid + "/" + action.subNode;

        console.log("Dispatching update at " + nodeRef);

        return new Promise(resolve => {
            firebase
                .database()
                .ref(nodeRef)
                .update({
                    ...action.data,
                })
                .then(() => {
                    response.success = true;
                    response.message = action.data;
                    resolve(response);
                })
                .catch(error => {
                    response.success = false;
                    response.message = error.message;
                    resolve(response);
                });
        });
    }

    static pushData(action) {
        const nodeRef = action.node + "/" + action.uid + "/" + action.subNode;

        console.log("Dispatching push at " + nodeRef);

        return new Promise(resolve => {
            firebase
                .database()
                .ref(nodeRef)
                .push({
                    ...action.data,
                })
                .then(() => {
                    response.success = true;
                    response.message = action.data;
                    resolve(response);
                })
                .catch(error => {
                    response.success = false;
                    response.message = error.message;
                    resolve(response);
                });
        });
    }

    static deleteData(action) {
        const nodeRef = action.node + "/" + action.uid + "/" + action.subNode;

        console.log("Dispatching delete at " + nodeRef);

        return new Promise(resolve => {
            firebase
                .database()
                .ref(nodeRef)
                .set(null)
                .then(() => {
                    response.success = true;
                    response.message = null;
                    resolve(response);
                })
                .catch(error => {
                    response.success = false;
                    response.message = error.message;
                    resolve(response);
                });
        });
    }
}
