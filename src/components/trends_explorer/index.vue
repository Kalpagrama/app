<style lang="sass">
.q-footer
  background: none
</style>

<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px'}`).bg-grey-10
  kalpa-menu-right
    menu-right
  q-header(
    reveal
    :style=`{zIndex: 200}`).row.full-width.justify-center.bg-grey-8
    //- top
    .row.full-width.justify-center
      div(
        :style=`{
          height: '60px', background: 'rgba(33,33,33, 0.8)',
          maxWidth: $store.state.ui.maxWidthPage+'px'
        }`).row.full-width.items-center
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="grey-5" icon="keyboard_arrow_left" @click="$router.back()")
        .col.full-height
          .row.fit.items-center.content-center.justify-center
            q-btn(round flat color="white" icon="whatshot")
            span.text-white.text-bold Trends
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="grey-5" icon="more_vert")
  kalpa-menu-footer
    template(v-slot:menuRight)
      menu-right
  q-page-conainter
    q-page
      kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables")
        template(v-slot=`{items}`)
          list-middle(:items="items" :style=`{paddingTop: '68px'}`)
            template(v-slot:item=`{item, index, indexMiddle}`)
              node(
                ctx="list" layout="PIP"
                :node="item" :index="index" :essence="true"
                :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
                :visible="true" :active="index === indexMiddle" :mini="false")
</template>

<script>
import menuRight from './menu_right'

export default {
  name: 'trendsExplorer',
  components: {menuRight},
  props: ['sphere'],
  data () {
    return {
      categoriesDialogShow: false
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
    },
  },
  watch: {
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
    // this.$q.addressbarColor.set('#222')
    document.body.style.background = '#222'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
