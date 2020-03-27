<style lang="sass">
.q-footer
  background: none
</style>

<template lang="pug">
q-layout(
  view="hHh lpR fFf" container
  :style=`{height: $q.screen.height+'px', minHeight: $q.screen.height+'px'}`).bg-grey-10
  q-header(
    reveal
    :style=`{zIndex: 200}`).row.full-width.justify-center.bg-grey-8
    //- top
    .row.full-width.justify-center
      div(
        :style=`{
          height: '60px',
          maxWidth: $store.state.ui.maxWidthPage+'px'
        }`).row.full-width.items-center
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        .col.full-height
          .row.fit.items-center.content-center.justify-center
            q-btn(round flat color="white" icon="whatshot")
            span.text-white.text-bold Trends
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="white" icon="more_vert" @click="$router.back()")
    //- categories
    div(v-if="false").row.full-width.justify-center
      div(
        :style=`{
          height: '60px',
          maxWidth: $store.state.ui.maxWidthPage+'px',
          textTransform: 'capitalize', whiteSpace: 'nowrap'}`
        ).row.full-width.scroll
          kalpa-buttons(:value="categoriesFiltered" :id="$route.params.category" idKey="id" @id="$router.push({params: {category: $event}})").no-wrap
  q-footer(
    reveal)
    div(:style=`{height: '60px'}`).row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius:  '10px 10px 0 0'}`).row.fit.items-center.content-center.bg-grey-8
  q-page-conainter.row.fit.justify-center.items-start.content-start.bg-grey-10
    div(
      v-if="$q.screen.width > $store.state.ui.maxWidthPage+260+260"
      :style=`{
        position: 'fixed', width: '200px', top: '200px',
        height: $q.screen.height-300+'px',
        left: ($q.screen.width-$store.state.ui.maxWidthPage)/2-200-60+'px',
        borderRadius: '10px'
      }`
      ).column.bg-grey-9
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-lg
        span.text-white.text-bold Categories
      .col.full-width.scroll
        .row.full-width.items-start.content-start
        div(
          v-for="(c,ci) in categoriesFiltered" :key="ci"
          v-if="c.id !== 'ALL'"
          :style=`{height: '45px'}`
          ).row.full-width.items-center.content-center.q-px-md
          q-btn(
            no-caps
            :flat="c.id !== $route.params.category"
            :color="c.id === $route.params.category ? 'green' : 'grey-9'"
            :to="'/trends/'+c.id"
            :style=`{borderRadius: '10px', textTransform: 'capitalize'}`)
            span.text-white {{c.name}}
    kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables")
      template(v-slot:items=`{items}`)
        node-list(:nodes="items")
</template>

<script>
export default {
  name: 'pageAppTrends',
  props: [],
  data () {
    return {
      // category: 'FUN'
    }
  },
  computed: {
    categories () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        acc[val.type] = val
        return acc
      }, {})
    },
    categoriesFiltered () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        acc.push({id: val.type, name: val.name})
        return acc
      }, [])
    },
    sphereOid () {
      // return this.categories[this.category].sphere.oid
      if (this.$route.params.category) return this.categories[this.$route.params.category].sphere.oid
      else return false
      // return this.categories.FUN.sphere.oid
      // else return false
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
    '$route.params.category': {
      immediate: true,
      handler (to, from) {
        this.$log('$route.params.category')
        // TODO set first category?
        if (!to) this.$router.replace({params: {category: 'FUN'}})
      }
    }
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
