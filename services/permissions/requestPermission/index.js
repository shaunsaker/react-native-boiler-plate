import Permissions from 'react-native-permissions';

import utils from '../../../utils';

export default function requestPermission(permission) {
  return new Promise((resolve, reject) => {
    if (permission) {
      Permissions.request(permission)
        .then((message) => {
          const response = message && { message };
          resolve(response);
        })
        .catch((error) => {
          reject(utils.app.createError(error));
        });
    } else {
      reject(new Error('Permission type is required'));
    }
  });
}
