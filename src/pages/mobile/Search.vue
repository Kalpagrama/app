<template lang="pug">
  q-page.flex.kp-search
    .kp-search__trends
        .kp-search__trend-list
            trend-item(v-for="(item,ix) in trends" :key="ix" :item="item" @click="openTrend")
    .kp-search__results
        .kp-search__node-list
            node(v-for="(item,ix) in trends" :key="ix" :item="item")

</template>

<style lang='stylus'>
    .kp-search
        &__trend
            &s
                display block
                position absolute
                top 0
                left 0
                right 0
                height 100px
                overflow-y hidden
                overflow-x auto

            &-list
                display inline-block
                white-space nowrap
                width auto
                max-height 100px
                padding 8px

        &__results
            //border 1px solid red
            position absolute
            top 100px
            left 0
            right 0
            bottom 0
            overflow-x hidden
            overflow-y auto

        &__node-list
            background silver

</style>

<script>
import TrendItem from '../../components/TrendItem';
import node from '../../components/node/Node';

const TRENDS = [
    { id: 1, label: 'Природа', image: 'http://lorempixel.com/150/100/' },
    { id: 2, label: 'Музыка', image: 'http://lorempixel.com/150/100/' },
    { id: 3, label: 'Здоровье', image: 'http://lorempixel.com/150/100/' },
    { id: 4, label: 'Политика', image: 'http://lorempixel.com/150/100/' },
    { id: 5, label: 'Танцы', image: 'http://lorempixel.com/150/100/' },
    { id: 6, label: 'Животные', image: 'http://lorempixel.com/150/100/' },
    { id: 7, label: 'Знание', image: 'http://lorempixel.com/150/100/' },
    { id: 8, label: 'Развитие', image: 'http://lorempixel.com/150/100/' },
    { id: 9, label: 'Автомобили', image: 'http://lorempixel.com/150/100/' },
    { id: 10, label: 'Успех', image: 'http://lorempixel.com/150/100/' },
    { id: 11, label: 'Работа', image: 'http://lorempixel.com/150/100/' },
    { id: 12, label: 'Игры', image: 'http://lorempixel.com/150/100/' },
];

export default {
  name: 'PageMobileSearch',
  components: {
      'trend-item': TrendItem,
      node,
  },
  data() {
      return {
          trends: TRENDS,
      };
  },
  methods: {
      openTrend(item) {
          alert(`You opened trend ${item.label}`);
      },
  },
};
</script>
