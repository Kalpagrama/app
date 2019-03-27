<template lang="pug">
  q-page.flex.kp-profile
    .kp-profile__header(@click="toggle")
        q-card.kp-profile__visitcard(flat dense v-show="mode > 0")

            .kp-profile__face
                img.kp-profile__image(src='https://placebeard.it/95x95')

            .kp-profile__info
                .kp-profile__username Username
                .kp-profile__quote Умный текст про то, что я хочу выглядеть умным

        q-card.kp-profile__filter(v-show="mode < 2")
            q-btn-group
                q-btn Ядра
                q-btn Оценки
                q-btn Связи
    grain-list.kp-profile__grains(:source="cards" :class="{'kp-profile_mode-0': mode === 0}" v-show="mode < 2")
</template>

<style lang="stylus">
    .kp-profile
        display block
        width 100%

        &__header
            display block
            border-bottom 1px solid #c0

        &__visitcard
            display grid
            grid-template-columns 95px auto
            grid-gap 16px
            height 130px
            padding 16px
            border-bottom 1px solid #c0

        &__face
            display block

        &__image
            width 95px
            height 95px
            border 1px solid silver
            background #f0
            border-radius 50%
            overflow hidden

        &__info
            padding-top 8px

        &__username
            font-size 18px

        &__quote
            color gray
            font-size 14px

        &__filter
            text-align center

        &__grains
            top 170px

        &_mode-0
            top 40px


</style>

<script>
import GrainList from '../../components/GrainList';

export default {
  name: 'PageMobileProfile',
  components: {
      'grain-list': GrainList,
  },
  data() {
      return {
          cards: [],
          mode: 1,
      };
  },
  beforeMount() {
      for (let i = 0; i < 20; i += 1) {
        this.cards.push(i);
      }
  },
  computed: {
      isVisible() {
          return this.mode > 0;
      },
  },
  methods: {
      scrollProfile(e) {
          console.log(e);
      },
      toggle() {
          this.mode += 1;
          if (this.mode === 3) this.mode = 0;
      },
  },
};
</script>
