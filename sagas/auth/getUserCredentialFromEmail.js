import { call, put } from 'redux-saga/effects';
import { auth } from '../../services';

export default function* getUserCredentialFromEmail() {
  try {
    const response = yield call(auth.getUserCredentialFromEmail);

    if (__DEV__) {
      console.log('getUserCredentialFromEmail', response);
    }

    yield put({
      type: 'linkUserWithCredential',
      payload: response,
    });
  } catch (error) {
    yield put({
      type: 'SET_MESSAGE',
      payload: new Error(error),
      error: true,
    });
  }
}
