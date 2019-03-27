<template lang="pug">
  q-page.flex
    q-card.kp-grain-view(flat)
        q-item.kp-grain-view__header
            q-item-section.kp-avatar(avatar)
                q-avatar.kp-avatar__image
                    img(src='https://cdn.quasar-framework.org/img/avatar2.jpg')
            q-item-section
                q-item-label Маша Мимими
        .kp-grain-view__content
            img(src='https://images.unsplash.com/photo-1476820865390-c52aeebb9891')
            //q-video(src='https://www.youtube.com/embed/DxPF_SQLp78?rel=0&controls
        q-item
            q-item-section
                spank.kp-grain-view__sense-text {{ 'randomText()' }}


        .kp-grain-view__content
            img(src='https://images.unsplash.com/photo-1476820865390-c52aeebb9891')


    voter.kp-grain-view__voter
</template>

<style lang="stylus">

    .kp
        &-grain-view
            max-width 99vw
            margin 0px auto

            &__voter
                display block

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

            &__footer
                display grid
                grid-template-columns 1fr 1fr 1fr

            &__sense
                position: relative;
                display: block;
                height: 40px;
                width: 300px;
                padding 5px
                background: none
                margin: -20px auto;
                &-text
                    text-align center
                    font-size 20px
                    padding 0
                    background white
                    border-radius 6px

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
import voter from '../../components/Voter';

export default {
  name: 'PageMobileView',
  components: {
      voter,
  },
};
</script>
