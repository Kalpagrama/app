<template lang="pug">
q-page(
  :style=`{
    paddingTop: 60+'px',
  }`
  ).row.full-width.justify-center.q-px-sm
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000}`
    ).b-30
    .row.full-width.items-start.content-start.b-30.q-px-sm
      slot(name="top" :feed="feed")
      //- search
      .row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.justify-start
          div(:style=`{maxWidth: '700px',}`).row.full-width
            slot(name="search-prepend")
            div(:style=`{maxWidth: '700px',}`).col
              ws-search(
                @searchString="searchString = $event"
                @contentKalpa="contentKalpaFound")
            q-btn(
              @click="viewCreate"
              round flat color="grey-4" icon="add")
            q-btn(
              round flat color="grey-4" icon="tune")
  div(
    :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`
    ).row.full-width.items-start.content-start.q-pt-sm
    div(
      @click="viewClick(view)"
      v-for="(view, viewii) in collection.items" :key="view.id"
      :style=`{
        background: 'rgb(35,35,35)',
        borderRadius: '10px',
      }`
      ).row.full-width.items-center.content-center.q-pa-sm.q-mb-xs
      span.text-white.text-bold {{ view }}
</template>

<script>
export default {
  name: 'viewViews',
  props: ['collection'],
  data () {
    return {
      searchString: '',
    }
  },
  methods: {
    viewCreate () {
      this.$log('viewCreate')
      if (!this.collection.items) this.collection.items = []
      let viewInput = {
        id: Date.now().toString(),
        name: '',
        items: [],
        links: [],
      }
      this.collection.items.push(viewInput)
      this.viewClick(viewInput)
    },
    viewClick (view) {
      this.$log('viewClick', view)
      this.$router.push(`/workspace/collection-view/${this.collection.id}/${view.id}`)
    },
    contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
    }
  }
}
</script>
