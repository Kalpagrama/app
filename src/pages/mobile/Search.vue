<template lang="pug">
  q-page.flex.kp-search
    .kp-search__trends
        .kp-search__trend-list
            trend-item(v-for="(item,ix) in trends" :key="ix" :item="item" @click="openTrend")
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
                border-bottom 1px solid silver
                overflow-y hidden
                overflow-x auto

            &-list
                display inline-block
                white-space nowrap
                width auto
                max-height 100px
                padding 8px

</style>

<script>
import TrendItem from '../../components/TrendItem';

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
