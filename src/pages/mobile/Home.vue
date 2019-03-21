<template lang="pug">
  q-page
    q-card.kp-grain(flat bordered v-for="(card, ix) in cards" :key="ix")
        q-item.kp-grain__header
            q-item-section.kp-avatar(avatar)
                q-avatar.kp-avatar__image
                    img(src='https://cdn.quasar-framework.org/img/avatar2.jpg')
            q-item-section
                q-item-label Маша Мимими
        .kp-grain__content
            q-video(src='https://www.youtube.com/embed/DxPF_SQLp78?rel=0&controls=0&showinfo=0')

        q-item
            q-item-section Текст сути

        .kp-grain__content
            img(src='https://cdn.quasar-framework.org/img/parallax2.jpg')

        q-item
            q-item-section подвал

</template>

<style lang="stylus">
    .kp
        &-grain
            max-width 99vw
            margin 6px auto

            &__header
                padding 0 8px
                max-height 40px !important
                overflow hidden

            &__content
                display block
                min-height 56vw
                max-height 56vw

                & img
                    width 100%
                    height 56vw

        &-avatar
            min-width 40px
            max-width 40px
            margin-right 8px
            overflow hidden

            &__image
                width 28px
                height 28px

</style>

<script>
export default {
  name: 'PageMobileHome',
  data() {
      return {
          cards: [],
      };
  },
  beforeMount() {
      for (let i = 0; i < 10; i += 1) {
        this.cards.push(i);
      }
  },
};
</script>
