<style lang="sass" scoped>
.node
  cursor: pointer
  //&:hover
    background: rgba(50,50,50,0.5)
</style>

<template lang="pug">
.column.fit
  div(:style=`{position: 'relative',}`).col.full-width.scroll
    .row.full-width.items-strat.content-start.justify-center
      // header
      .row.full-width.items-center.content-center.q-py-md.q-px-lg
        span.text-white.text-bold {{$t('Notes')}}
        .col
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
      //list-feed(
      //  :query="query"
      //  :itemActivePersist="false"
      //  :style=`{
      //    maxWidth: 600+'px',
      //    //- marginBottom: '100px',
      //  }`)
      tab-list-feed(
        :scrollAreaHeight="scrollAreaHeight || $q.screen.height"
        :navHeaderText="useNavHeader ? $t('Drafts') : ''"
        :searchInputState="searchInputState"
        :searchString="searchString"
        :query="query"
        :itemHeightApprox="100"
        :itemActivePersist="false"
        showAddBtn=true
      ).row.full-width
        //- template(v-slot:prepend)
        template(v-slot:item=`{item:draft,itemIndex:draftIndex,isActive,isVisible,isPreload, scrolling}`)
          q-btn(
            v-if="true || draft.items[0] && draft.items[0].layers"
            round outline no-caps
            :color="draft.color"
            @click="player.showItem(draft), $emit('close')"
          ).row.full-width.q-mb-md.node
            // цитата + суть
            div(:style=`{ borderRadius: '10px'}`).row.full-width.q-px-xs.q-ma-xs
              small.text-grey-4 {{ getText(draft) }}
            .row.full-width.justify-center.q-px-md
              span.text-white.text-bold {{ draft.name }}
</template>

<script>
import pageNodesRoot from 'src/components/kalpa_item/item_extended/content_extended/page_nodes'
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
          'items.layers.contentOid': this.contentKalpa.oid
          // contentOids: { $elemMatch: { $eq: this.contentKalpa.oid } }
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
