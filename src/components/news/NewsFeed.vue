<template lang="pug">
    node-list(:source="news" @begin="prependNews" @end="appendNews")
</template>

<script>
// import { mapGetters } from 'vuex'
import NodeList from '../NodeList';
import NewsProvider, { DIRECTION_BACKWARD } from '../../store/api/NewsProvider';

const AUTOLOAD_STEP = 20;

export default {
    name: 'NewsFeed',
    components: { NodeList },
    props: {},
    data() {
        return {
            news: [],
            provider: null,
        };
    },
    computed: {
    // ...mapGetters([''])
    },
    beforeMount() {
        this.provider = new NewsProvider(this);
        this.appendNews();
    },
    methods: {
        load(data) {
            // вставляем пока ТОЛЬКО В КОНЕЦ ленты, тк вставка в начало дорогая, требуется математика
            if (this.provider.direction !== DIRECTION_BACKWARD) {
                const self = this;

                data.forEach(el => {
                    this.news.push(el);
                    this.provider.getInfo(el.oid).then(response => {
                        self.onGetInfo(el, response[0]);
                    });
                });
            }
        },
        onGetInfo(node, data) {
          // console.log('Подгрузка информации о ядре', node, data);
            Object.keys(data).forEach(prop => {
                node[prop] = data[prop];
            })
        },
        prependNews(oid) {
            // подгрузка новостей сверху
            // this.provider.request(oid, AUTOLOAD_STEP, DIRECTION_BACKWARD);
            // вставляем пока ТОЛЬКО В КОНЕЦ ленты, тк вставка в начало дорогая, требуется математика
        },
        appendNews(oid) {
            // подгрузка новостей снизу
            this.provider.request(oid, AUTOLOAD_STEP)
                .then(this.load);
        },
    },
}
</script>

<style lang="stylus">

</style>
