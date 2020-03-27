<style lang="sass">
.q-footer
  background: none
</style>

<template lang="pug">
q-layout(
  view="hHh lpR fFf" container
  :style=`{height: $q.screen.height+'px', minHeight: $q.screen.height+'px'}`).bg-grey-10
  q-dialog(v-model="categoriesDialogShow")
    div(:style=`{width: '250px', height: $q.screen.height-200+'px', borderRadius: '10px', overflow: 'hidden'}`).row
      categories
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
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius:  '10px 10px 0 0'}`
        ).row.fit.items-center.content-center.justify-between.bg-grey-8
        .col.full-height
          .row.fit.items-center.content-center.q-px-sm
            q-btn(flat no-caps color="white" @click="categoriesDialogShow = true")
              span(:style=`{textTransform: 'capitalize'}`).text-white {{ '#'+categories[$route.params.category].name }}
        q-btn(round flat color="white" icon="menu" @click="$store.commit('ui/stateSet', ['menuAppShow', true])").q-mr-sm
  q-page-conainter.row.fit.justify-center.items-start.content-start.bg-grey-10
    div(
      v-if="$q.screen.width > $store.state.ui.maxWidthPage+260+260"
      :style=`{
        position: 'fixed', width: '200px', top: '200px',
        height: $q.screen.height-300+'px',
        left: ($q.screen.width-$store.state.ui.maxWidthPage)/2-200-60+'px',
        borderRadius: '10px'
      }`
      ).row.bg-grey-9
      categories
    q-page.q-pt-xl
      kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables")
        template(v-slot:items=`{items}`)
          node-list(:nodes="items")
</template>

<script>
import categories from './categories'

export default {
  name: 'pageAppTrends',
  components: {categories},
  props: [],
  data () {
    return {
      categoriesDialogShow: false
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
    this.$q.addressbarColor.set('#222')
    document.body.style.background = '#222'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
