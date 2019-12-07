<style lang="stylus">
.q-drawer {
  background: none !important
}
</style>

<template lang="pug">
.column.fit.bg-grey-3
  div(:style=`{height: '60px'}`).row.full-width.items-center
    //- div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
    //-   q-btn(round flat icon="keyboard_arrow_left" @click="cancel()")
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold {{$t('Workspace')}}
    div(:style=`{height: '60px'}`).row.items-center.justify-center.q-px-sm
      q-btn(round flat icon="style" color="grey-9")
      q-btn(round flat icon="settings" color="grey-9" @click="coll = 'settings'")
  .col.full-width.scroll
    ws-items(@itemClick="itemClick")
  div.row.full-width
    k-menu-mobile
</template>

<script>
import wsItems from './ws_items'
import wsSpheres from './ws_spheres'
import wsSettings from './ws_settings'

export default {
  name: 'workspace',
  components: {wsItems, wsSpheres, wsSettings},
  props: ['width', 'height'],
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    itemClick ([type, item]) {
      this.$log('itemClick', type, item)
      switch (type) {
        case 'note': {
          break
        }
        case 'fragment': {
          break
        }
        case 'content': {
          break
        }
        case 'node': {
          break
        }
      }
    },
    cancel () {
      this.$log('cancel')
    }
  }
}
</script>
