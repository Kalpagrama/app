<style lang="sass">
.q-footer
  background: none
</style>

<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  container
  :style=`{height: $q.screen.height+'px'}`).bg-grey-10
  //- menu
  div(
    v-if="$q.screen.width > $store.state.ui.maxWidthPage+$store.state.ui.maxWidthMenu*2"
    :style=`{
      position: 'fixed',
      top: '0px',
      zIndex: 1000,
      width: $store.state.ui.maxWidthMenu+'px',
      height: $q.screen.height+'px',
      right: ($q.screen.width-$store.state.ui.maxWidthPage)/2-$store.state.ui.maxWidthMenu+'px',
      paddingTop: '68px',
    }`).row.items-start.content-start.q-px-sm.q-pb-sm
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden'
      }`
      ).column.full-width.bg-grey-9
      div(:style=`{height: '50px'}`).row.full-width.items-center.content-content-center.q-px-md
        span.text-white.text-bold Trending now
      .col.full-width
        sphere-list-top(:oid="$route.params.oid" @oid="$router.push({params: {oid: $event}})")
  //- header
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
  //- footer
  q-footer(
    reveal)
    div(:style=`{height: '60px'}`).row.full-width.justify-center
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius:  '10px 10px 0 0'}`
        ).row.fit.items-center.content-center.justify-between.bg-grey-8.q-px-sm
        q-btn(
          round push color="green" icon="add" size="lg"
          :style=`{position: 'absolute', top: '-40px', left: '50%', transform: 'translate(-50%, 0)',borderRadius: '50% !important'}`)
        q-btn(round flat color="grey-4" icon="menu").q-mr-sm
        .col.full-height
          .row.fit.items-center.content-center.q-px-sm
        q-btn(round flat color="grey-4" icon="more_vert").q-mr-sm
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
export default {
  name: 'pageApp-trends',
  props: ['sphere'],
  data () {
    return {
      categoriesDialogShow: false
    }
  },
  computed: {
    sphereOid () {
      return this.$route.params.oid
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
    // document.body.style.background = '#222'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
