<style lang="sass">
.menu-item
  &:hover
    background: rgb(40,40,40)
</style>

<template lang="pug">
q-btn(
  flat no-caps
  :round="isRound"
  :color="color"
  :style=`{
    ...styles,
  }`)
  menu-popup()
  img(
    v-if="$store.getters.currentUser().profile.role !== 'GUEST'"
    :src="$store.getters.currentUser().profile.photoUrl"
    :style=`{
      width: '24px', minWidth: '24px', maxWidth: '24px',
      height: '24px', minHeight: '24px', maxHeight: '24px',
      borderRadius: '50%',
    }`)
  div(
    v-else
    :style=`{
      width: '24px', minWidth: '24px', maxWidth: '24px',
      height: '24px', minHeight: '24px', maxHeight: '24px',
      borderRadius: '50%',
    }`).row.items-center.content-center.justify-center
    q-icon(name="menu" color="grey-7" size="24px")
  div(
    v-if="showLabel"
    :style=`{
      //- marginTop: '-4px',
    }`).row.full-width.justify-center
    small {{$tt('Menu')}}
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
    }
  },
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
