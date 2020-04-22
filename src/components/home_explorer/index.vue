<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  container
  :style=`{height: $q.screen.height+'px'}`).bg-grey-10
  //- header
  q-header(reveal).row.full-width.justify-center.q-px-sm
    div(
      :style=`{
        height: '60px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
        zIndex: 10000,
        borderRadius: '0 0 10px 10px', overflow: 'hidden'
      }`
      ).row.full-width.items-center.content-center.justify-center.bg-grey-4.shadow-20
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="black" icon="keyboard_arrow_left" @click="$router.back()")
      .col.full-height
        .row.fit.items-center.content-center.justify-center
          span.text-black.text-bold Home
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="black" icon="more_vert")
  //- footer
  q-footer(reveal)
    div(:style=`{height: '60px'}`).row.full-width.justify-center
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius:  '10px 10px 0 0'}`
        ).row.fit.items-center.content-center.justify-between.bg-grey-8.q-px-sm
        //- q-btn(
        //-   round push color="green" icon="add" size="md"
        //-   :style=`{position: 'absolute', zIndex: 1000, top: '-26px', left: '50%', transform: 'translate(-50%, 0)',borderRadius: '50% !important'}`)
        q-btn(round flat color="grey-3" icon="menu")
          q-menu(anchor="top left" self="bottom left" :offset="[0, 20]")
            div(:style=`{width: $q.screen.width-19+'px', borderRadius: '10px', overflow: 'hidden'}`).row.bg-grey-9
              kalpa-menu
        .col.full-height
          .row.fit.items-center.content-center.justify-center.q-px-sm
            q-btn(
              round push color="green" icon="add"
              :style=`{borderRadius: '50%'}`)
        q-btn(round flat color="grey-3" icon="more_vert")
          q-menu(anchor="top left" self="bottom left" :offset="[0, 20]")
            div(:style=`{width: $q.screen.width-19+'px', borderRadius: '10px', overflow: 'hidden'}`).row.bg-grey-8
              menu-right
  //- page
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
  name: 'homeExplorer',
  components: {menuRight},
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser.oid
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 100 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    },
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
