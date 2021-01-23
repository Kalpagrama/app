<template lang="pug">
q-page(
  :style=`{
    position: 'relative',
    paddingTop: '0px',
  }`
  ).row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
    slot
    .row.full-width.items-center.content-center.justify-between.q-pa-sm
      span.text-grey-7.text-bold Похожее
      q-btn(
        round flat color="grey-7" icon="tune")
    .row.full-width.q-px-sm
      div(
        v-for="n in 10" :key="n"
        :style=`{
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
        }`
        ).row.full-width.q-pa-md.q-mb-md
        small.text-grey-7 {{ n }}
      //- kalpa-loader(
        :immediate="true"
        :query="query" :limit="1000"
        @items="nodesUpdated"
        v-slot=`{items,next,nexting}`)
      //- div(
        v-for="(n,ni) in nodes" :key="n.id"
        :style=`{
          minHeight: '50px',
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm
        div(
          @click="nodeClick(n,ni)"
          ).col.cursor-pointer
          .row.full-width.q-pa-sm
            span.text-white {{ n.name }}
            .row.full-width
              small.text-grey-8 {{ $time(n.items[0].layers[0].figuresAbsolute[0].t) }}
        .row.full-height.items-center.content-center
          kalpa-menu-actions(:actions="nodeActions(n)")
</template>

<script>
export default {
  name: 'pageSimilar',
  data () {
    return {
    }
  }
}
</script>
