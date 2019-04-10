import * as store from '../store/store';

export default function(to, from, next) {
    if (store.store.isAuth) {
        next();
    } else {
        next();
    }
}
