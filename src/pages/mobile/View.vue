<template lang="pug">
  q-page.flex
    q-card.kp-node-view(flat)
        q-item.kp-node-view__header
            q-item-section.kp-avatar(avatar)
                q-avatar.kp-avatar__image
                    img(src='https://cdn.quasar-framework.org/img/avatar2.jpg')
            q-item-section
                q-item-label {{ user.name }}
        .kp-node-view__content
            img(src='https://images.unsplash.com/photo-1476820865390-c52aeebb9891')
            //q-video(src='https://www.youtube.com/embed/DxPF_SQLp78?rel=0&controls

        q-item
            q-item-section
                span.kp-node-view__sense-text {{ sense.name }}


        .kp-node-view__content
            img(src='https://images.unsplash.com/photo-1476820865390-c52aeebb9891')

    .kp-node-view__footer
        .kp-node-view__tags
            q-chip(rounded @click.native="openSphere(item)" v-for="(item,ix) in TAGS" :key="ix")
                q-avatar(color="blue" text-color="white" font-size="12px") {{ item.weight }}
                | {{ item.label }}
        .kp-node-view__share
            q-btn.kp-node-view__share-btn(flat icon="share" size="lg")
    voter.kp-node-view__voter
</template>

<style lang="stylus">

    .kp
        &-node-view
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
                grid-template-columns 5fr 1fr

            &__share
                text-align right
                padding 4px
                border-left 1px solid #c0

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

const TAGS = [
    { id: 1, label: 'Параллепипед', path: '', weight: '20K' },
    { id: 2, label: 'Счастье', path: '', weight: '150K' },
    { id: 3, label: 'Любовь', path: '', weight: '430K' },
    { id: 4, label: 'Гармония', path: '', weight: '100K' },
    { id: 5, label: 'Дети', path: '', weight: '385K' },
];

export default {
  name: 'PageMobileView',
  components: {
      voter,
  },
  data() {
      return {
          user: {
              name: 'Коля Иванов',
          },
          sense: {
              name: 'Природа',
          },
          TAGS,
      };
  },
  methods: {
      openSphere(item) {
          this.$router.push(`/sphere/${item.id}`);
      },
  },
};
</script>
