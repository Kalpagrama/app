import NewsProvider from '../api/NewsProvider';
import NodeProvider from '../api/NodeProvider';

export function init(state, scope) {
    console.log('STORE INIT');
    state.news = new NewsProvider(scope);
    state.node = new NodeProvider(scope);
    // state.sphere = new NewsProvider(scope);
    // state.notifications = new NewsProvider(scope);
}
