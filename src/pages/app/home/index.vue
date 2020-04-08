<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  :style=`{height: $q.screen.height+'px'}`)
  q-header(reveal).row.full-width.justify-center.q-px-sm
    div(
      :style=`{
        height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px',
        zIndex: 10000,
        borderRadius: '0 0 10px 10px', overflow: 'hidden'
      }`
      ).row.full-width.items-center.content-center.justify-center.bg-grey-7
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
      .col.full-height
        div(@click="essenceClick()").row.fit.items-center.content-center.justify-center
          span.text-white.text-bold Как прыгать котиком?
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="white" icon="more_vert")
  //- fixed bottom menu
  div(:style=`{
    position: 'fixed', zIndex: 1000, bottom: '6px', left: '50%', transform: 'translate(-50%, 0%)',
    width: '80%', height: '50px', borderRadius: '25px', maxWidth: '300px'}`).row.items-center.content-center
    q-btn(
      round push color="green" icon="add"
      :style=`{borderRadius: '50%'}`)
    div(:style=`{borderRadius: '25px'}`).col.full-height.bg-white.q-mx-sm
    q-btn(
      round push color="green" icon="add"
      :style=`{borderRadius: '50%'}`)
  q-page-conainter
    q-page
      list-masonry()
</template>

<script>

export default {
  name: 'pageAppHome',
  components: {},
  props: [],
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
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
