import NewsProvider from '../api/NewsProvider';
import NodeProvider from '../api/NodeProvider';
import BellProvider from '../api/BellProvider'
import SphereProvider from '../api/SphereProvider'

export function init(state, scope) {
    state.news = new NewsProvider(scope);
    state.bells = new BellProvider(scope);
    state.node = new NodeProvider(scope);
    state.sphere = new SphereProvider(scope);
    // state.notifications = new NewsProvider(scope);
}
