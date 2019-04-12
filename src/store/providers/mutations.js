import NewsProvider from '../api/NewsProvider';
import NodeProvider from '../api/NodeProvider';
import AuthProvider from '../api/AuthProvider';
import BellProvider from '../api/BellProvider'
import SphereProvider from '../api/SphereProvider'

export function init(state, scope) {
    state.news = new NewsProvider(scope);
    state.node = new NodeProvider(scope);
    state.auth = new AuthProvider(scope);
    state.notifications = new BellProvider(scope);
    state.node = new NodeProvider(scope);
    state.sphere = new SphereProvider(scope);

    process.env.DEV && console.log('STORE INIT OK');
}
