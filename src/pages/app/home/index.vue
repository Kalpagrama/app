<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  :style=`{height: $q.screen.height+'px'}`).bg-grey-10
  //- q-header(reveal).row.full-width.justify-center.q-px-sm
  //-   div(
  //-     :style=`{
  //-       height: '60px',
  //-       maxWidth: $store.state.ui.maxWidthPage+'px',
  //-       zIndex: 10000,
  //-       borderRadius: '0 0 10px 10px', overflow: 'hidden'
  //-     }`
  //-     ).row.full-width.items-center.content-center.justify-center.bg-grey-4.shadow-20
  //-     div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
  //-       q-btn(round flat color="black" icon="keyboard_arrow_left" @click="$router.back()")
  //-     .col.full-height
  //-       div(@click="essenceClick()").row.fit.items-center.content-center.justify-center
  //-         span.text-black.text-bold Как прыгать котиком?
  //-     div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
  //-       q-btn(round flat color="black" icon="more_vert")
  //- page
  q-page-conainter
    q-page.fit
      kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables")
        template(v-slot=`{items}`)
          node-list(:nodes="items")
</template>

<script>
export default {
  name: 'pageAppHome',
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
    // this.$store.commit('ui/stateSet', ['maxWidthPage', 1000])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
