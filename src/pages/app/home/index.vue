<style lang="sass">
.q-dialog
  &__backdrop
    background: none
</style>

<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  :style=`{height: $q.screen.height+'px', maxHeight: '100vh'}`).window-height
  q-header(reveal).row.full-width.justify-center.q-px-sm
    div(
      :style=`{
        height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px',
        zIndex: 10000,
        borderRadius: '0 0 10px 10px', overflow: 'hidden'
      }`
      ).row.full-width.items-center.content-center.justify-center.bg-grey-4
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="black" icon="keyboard_arrow_left" @click="$router.back()")
      .col.full-height
        div(@click="essenceClick()").row.fit.items-center.content-center.justify-center
          span.text-black.text-bold Как прыгать котиком?
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="black" icon="more_vert")
  //- fixed bottom menu
  div(:style=`{
    position: 'fixed', zIndex: 1000, bottom: '8px', left: '50%', transform: 'translate(-50%, 0%)',
    width: '80%', height: '40px', borderRadius: '25px', maxWidth: '300px'}`).row.items-center.content-center
    //- q-btn(
    //-   round push color="green" icon="add"
    //-   :style=`{borderRadius: '50%'}`)
    div(:style=`{borderRadius: '25px'}`).col.full-height.bg-white.q-mx-sm
    q-btn(
      round push color="green" icon="add" @click="compositionFinderDialogShow = true"
      :style=`{position: 'relative', borderRadius: '50%'}`)
  //- div(
  //-   :style=`{
  //-     position: 'fixed',
  //-     zIndex: 3000,
  //-     top: 70+'px',
  //-     left: '0px',
  //-     height: $q.screen.height-70+'px',
  //-     width: 750+'px',
  //-     paddingBottom: '8px'
  //-   }`
  //-   ).row.full-width.justify-center.q-px-sm
  //-   div(
  //-     :style=`{
  //-       maxWidth: '750px',
  //-       borderRadius: '10px',
  //-       overflow: 'hidden'
  //-     }`
  //-     ).column.fit.bg-grey-9
  q-dialog(v-model="compositionFinderDialogShow" maximized position="bottom")
    div(:style=`{height: $q.screen.height+'px', paddingTop: '68px'}` @click.self="compositionFinderDialogShow = false"
      ).row.full-width.items-start.content-start.justify-center
      composition-finder(
        @composition="compositionFound"
        :height="$q.screen.height - 76"
        :style=`{
          maxWidth: $store.state.ui.maxWidthPage+'px',
          borderRadius: '10px', overflow: 'hidden'
        }`
        ).bg-grey-8
  q-page-conainter
    q-page.fit
      list-masonry()
</template>

<script>

export default {
  name: 'pageAppHome',
  components: {},
  props: [],
  data () {
    return {
      compositionFinderDialogShow: false
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
    compositionFound (c) {
      this.$log('compositionFound', c)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
