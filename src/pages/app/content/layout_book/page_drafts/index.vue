<style lang="sass" scoped>
.node
  cursor: pointer

  &:hover
// background: rgba(50,50,50,0.5)
</style>

<template lang="pug">
.column.fit
  div(:style=`{position: 'relative',}`).col.full-width.scroll
    .row.full-width.items-strat.content-start.justify-center
      list-feed(
        ref="list-feed"
        :query="query"
        :itemMiddlePersist="false"
        :style=`{
          maxWidth: 600+'px',
          //- marginBottom: '100px',
        }`
        @ready="listFeedReady")
        //- template(v-slot:prepend)
        template(v-slot:item=`{item:draft,itemIndex:draftIndex,isActive,isVisible}`)
          q-btn(
            v-if="true || draft.items[0] && draft.items[0].layers"
            round outline no-caps
            :style=`{ border: '3px solid grey'}`
            @click="player.showItem(draft), $emit('close')"
          ).row.full-width.q-mb-md.node
            // цитата + суть
            div(:style=`{ borderRadius: '10px'}`).row.full-width.q-px-md.b-50
              small.text-grey-4 {{ getText(draft) }}
            .row.full-width.justify-center.q-px-md
              span.text-white.text-bold {{ draft.name }}
</template>

<script>
import pageNodesRoot from '../../page_nodes_root/index.vue'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageDrafts',
  props: ['contentKalpa', 'player'],
  components: {
    pageNodesRoot
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          contentOids: { $elemMatch: { $eq: this.contentKalpa.oid } }
        },
        sort: [{ createdAt: 'desc' }]
      }
      return res
    }
  },
  data () {
    return {}
  },
  methods: {
    getText (draft) {
      this.$log('draft=', draft)
      let text = draft.items[0].layers[0].figuresAbsolute[0].epubCfiText
      if (text?.length > 220) {
        return text.slice(0, 220) + '...'
      } else {
        return text
      }
    }
  }
}
</script>
