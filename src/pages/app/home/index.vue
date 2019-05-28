<template lang="pug">
.column.fit
  div(style=`height: 50px`).row.full-width.items-center.q-px-sm.bg-white
    .col.full-height.q-py-sm.q-pr-sm
      div(style=`borderRadius: 5px`).row.fit.items-center.bg-grey-2.q-pa-xs
        q-icon(name="search" size="18px").q-mr-xs
        span.text-grey-9 Search kalpagramma
    div(style=`height: 30px; width: 30px; borderRadius: 50%` @click="$store.commit('ui/state', ['show_right_drawer', true])").row.items-center.justify-center.bg-primary
  .col.scroll.bg-grey-3
    div(v-if="show_refresh" style=`height: 50px`).row.full-width
      q-spinner(size="50px" color="primary")
    apollo-query(:query="query")
      template(v-slot="{ result: { loading, error, data } }")
        //- recycle-scroller(v-if="data" :items="data.newsFeed" :item-size="10" key-field="oid" v-slot="{item}")
          //- q-pull-to-refresh(@refresh="refresh" :no-mouse="false" icon="menu" color="primary")
          node-card(:item="item" style=`height: 500px`)
        template(v-if="data && data.newsFeed")
          node-card(v-for="(item, itemi) in data.newsFeed" :key="item.oid" :item="item")
</template>

<script>
import nodeCard from './node_card'
export default {
  name: 'pageAppHome',
  components: { nodeCard },
  data () {
    return {
      show_refresh: false,
      filter: {},
      page: 12,
      queryFull: `full () { name }`,
      query: gql`query newsFeed{
        newsFeed(pagination: {direction: FORWARD, limit: 50}) {
          type
          thumbUrl(preferWidth: 400, preferHeight: 225)
          name
          oid
        }
      }`
    }
  },
  methods: {
    async refresh () {
      this.$log('refresh')
      this.show_refresh = true
      await this.$wait(3000)
      this.show_refresh = false
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
