<style lang="sass">
.q-header
  background: none !important
.q-footer
  background: none !important
</style>

<template lang="pug">
//- container :style=`{height: $q.screen.height+'px'}`
q-layout(view="hHh lpR fFf").b-30
  kalpa-menu-right
    menu-right
  q-header(
    reveal
    :style=`{zIndex: 2000}`).row.full-width.justify-center
    .row.full-width.justify-center
      div(
        :style=`{
          height: '60px', borderRadius: '0 0 10px 10px', overflow: 'hidden',
          maxWidth: $store.state.ui.maxWidthPage+'px'
        }`).row.full-width.items-center.b-100
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        .col.full-height
          .row.fit.items-center.content-center.justify-center
            //- q-btn(round flat color="white" icon="whatshot")
            span(:style=`{}`).text-white.text-bold {{ '✳ ' + sphere.name}}
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="white" icon="more_vert")
  kalpa-menu-footer(:options=`{showMenuPage: true}`)
    template(v-slot:menuRight=`{inDrawer}`)
      menu-right(:inDrawer="inDrawer")
  q-page-conainter
    q-page
      kalpa-loader(v-if="sphereOid" type="LST_SPHERE_NODES" :variables="variables")
        template(v-slot=`{items}`)
          list-middle(:items="items")
            template(v-slot:item=`{item, index, indexMiddle}`)
              node(
                ctx="list" layout="PIP"
                :node="item" :index="index" :essence="true"
                :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
                :visible="index >= indexMiddle-1 && index <= indexMiddle+1"
                :active="index === indexMiddle"
                :mini="false")
</template>

<script>
import menuRight from './menu_right'

export default {
  name: 'trendsExplorer',
  components: {menuRight},
  props: ['sphere'],
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      return this.sphere.oid
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 200 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    }
  },
  watch: {
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
    this.$q.addressbarColor.set('rgb(30,30,30)')
    document.body.style.background = 'rgb(30,30,30)'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
