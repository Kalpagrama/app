<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  :style=`{zIndex: 4000, maxWidth: width+'px'}`).b-30
  q-header(reveal)
    .row.full-width.justify-center
      div(:style=`{maxWidth: '800px',height: '50px',}`
        ).row.full-width.items-center.content-center.q-px-xs.b-30
        q-btn(round flat color="white" icon="insert_link" @click="$emit('close')").q-mx-sm
        span(:style=`{fontSize: '18px',}`).text-bold.text-white Link node
        q-btn(
          flat dense no-caps color="white"
          icon-right="keyboard_arrow_down"
          ).b-40.q-mx-sm
          span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-mx-sm similar to it
        .col
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  q-page-container
    q-page(:style=`{paddingTop: '20px', paddingBottom: '200px',}`).row.full-width.justify-center
      div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start.q-pa-sm
        kalpa-loader(:mangoQuery="query" :sliceSize="1000")
          template(v-slot=`{items, itemsMore}`)
            .row.full-width.items-start.content-start.justify-start
              div(
                v-for="(i,ii) in items" :key="i.id"
                :style=`{
                  borderRadius: '10px', overflow: 'hidden',
                  width: '200px', height: '200px',
                }`
                ).row.q-mr-sm.q-mb-sm.b-40
                div(
                  :style=`{
                    height: '150px',
                    borderRadius: '10px', overflow: 'hidden'
                  }`).row.full-width.b-50
                div(
                  :style=`{
                    height: '50px',
                  }`
                  ).row.full-width
            //- .row.full-width.items-start.content-start.q-pa-sm
            //-   div(
            //-     v-for="(n,ni) in items" :key="n.id"
            //-     :style=`{height: '100px',borderRadius: '10px', overflow: 'hidden',}`
            //-     ).row.full-width.items-start.content-start.q-mb-sm.b-50
            //-     img(:src="n.color" :style=`{height: '100px'}`)
            //-     .col
            //-       .row.fit.q-pa-md
            //-         span.text-bold {{ n.name }}
      //- q-page-sticky(expand position="bottom" :offset="[0,0]" :style=`{zIndex: 1000}`)
        .row.full-width.justify-center
          div(:style=`{maxWidth: '800px', height: '50px',}`).row.full-width.b-30
            q-btn(round flat color="white" icon="keyboard_arrow_down" @click="$emit('close')")
            .col
      //- q-page-sticky(position="bottom-right" :offset="[25,25]" :style=`{zIndex: 2000}`)
        q-btn(
          round push color="green" icon="add" size="lg"
          :style=`{borderRadius: '50%'}`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_node_nodeLinker',
  props: ['node'],
  data () {
    return {
    }
  },
  computed: {
    width () {
      if (this.$q.screen.width < 800) return this.$q.screen.width
      else return 800
    },
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          // stage: 'draft'
        },
        sort: [{updatedAt: 'desc'}]
      }
    }
  }
}
</script>
