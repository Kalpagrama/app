<template lang="pug">
//- container :style=`{height: $q.screen.height+'px'}`
q-layout(view="hHh lpR fFf").b-30
  q-header(reveal :style=`{zIndex: 30000}`).row.full-width.justify-center
    div(
      :style=`{
        height: '60px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
        zIndex: 30000,
        borderRadius: '0 0 10px 10px', overflow: 'hidden'
      }`
      ).row.full-width.items-center.content-center.justify-center.b-100
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="grey-2" icon="keyboard_arrow_left" @click="$router.back()")
      .col.full-height
        .row.fit.items-center.content-center.justify-center
          span.text-grey-2.text-bold Home
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="grey-2" icon="more_vert")
  kalpa-menu-footer(:options=`{showMenuPage: false}`)
    //- template(v-slot:menuRight)
    //-   menu-right
  //- page
  q-page-conainter
    q-page
      kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables")
        template(v-slot=`{items}`)
          list-middle(:items="items" :options=`{paddingTop: 60}`)
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
  name: 'homeExplorer',
  components: {menuRight},
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser ? this.$store.getters.currentUser.oid : null
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 100 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    }
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
