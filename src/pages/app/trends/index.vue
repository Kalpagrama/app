<template lang="pug">
q-layout(view="hHh lpR fFf").bg-grey-3
  //- q-header(
  //-   v-if="true"
  //-   reveal
  //-   ).row.full-width.justify-center.q-px-sm.bg-grey-3
  //-   k-colls-tabs(
  //-     :coll="coll" :colls="colls"
  //-     @coll="coll = $event"
  //-     :style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', borderRadius: '0 0 10px 10px'}`).bg-white
  q-footer(reveal).row.full-width.justify-center.bg-grey-3.lt-sm
    slot(name="menuMobile")
  q-page-conainter.row.full-width.justify-center.items-start.content-start
    div(
      :style=`{maxWidth: '300px'}`
      ).row.full-height.bg-black.gt-xs
      slot(name="menuDesktop")
    .col
      .row.full-width.items-start.content-start.q-pa-sm
        h1 trends
</template>

<script>
export default {
  name: 'pageAppTrends',
  props: [],
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      if (this.$route.params.category) return this.categories[this.$route.params.category].sphere.oid
      else return false
      // return this.categories.FUN.sphere.oid
      // else return false
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
  watch: {
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
    this.$q.addressbarColor.set('#eee')
    document.body.style.background = '#eee'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
