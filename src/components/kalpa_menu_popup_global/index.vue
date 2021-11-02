<style lang="sass">
.menu-item
  &:hover
    background: rgb(40,40,40)
</style>

<template lang="pug">
q-btn(
  flat no-caps
  :ripple="false"
  :round="isRound"
  :color="color"
  :style=`{
    ...styles,
  }`)
  menu-popup(:offset="offset")
  //img(
  //  v-if="!$store.getters.isGuest"
  //  :src="$store.getters.currentUser.photoUrl"
  //  :style=`{
  //    width: size, minWidth: size, maxWidth: size,
  //    height: size, minHeight: size, maxHeight: size,
  //    borderRadius: '50%',
  //  }`)
  //div(
  //  v-else
  //  :style=`{
  //    width: size, minWidth: size, maxWidth: size,
  //    height: size, minHeight: size, maxHeight: size,
  //    borderRadius: '50%',
  //  }`).row.items-center.content-center.justify-center
  //  q-icon(name="menu" color="grey-7" size="24px")
  div(
    :style=`{
      width: size, minWidth: size, maxWidth: size,
      height: size, minHeight: size, maxHeight: size,
      borderRadius: '50%',
    }`).row.items-center.content-center.justify-center
    q-icon(
      name="menu"
      :color="$route.name.split('.')[0] === 'content' ? 'white' : 'grey-7'"
      size="24px"
      :style=`{marginTop: '5px'}`)
  div(
    v-if="showLabel"
    ).row.full-width.justify-center.q-mt-xs
    small(:style=`{marginTop: '-2px', whiteSpace: 'nowrap'}`) {{$t('Menu')}}
</template>

<script>
import menuPopup from './menu_popup.vue'

export default {
  name: 'kalpaMenuPopupGlobal',
  components: {
    menuPopup,
  },
  props: {
    color: {
      type: String,
      default: 'grey-8'
    },
    isRound: {
      type: Boolean,
      default: false,
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    styles: {
      type: Object,
      default () {
        return {}
      }
    },
    offset: {
      type: Array,
      default () {
        return [16, 16]
      }
    }
  },
  data () {
    return {
      size: '20px',
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
