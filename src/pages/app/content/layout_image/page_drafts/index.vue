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
          draft-list-item(
            :draft="draft"
            mode="select"
            @draft="draftSelectHandle"
          ).q-mb-sm

</template>

<script>
import pageNodesRoot from '../../page_nodes_root/index.vue'
import draftListItem from 'src/components/draft/draft_list_item.vue'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageDrafts',
  props: ['contentKalpa', 'player'],
  components: {
    pageNodesRoot,
    draftListItem
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
    draftSelectHandle (draft) {
      this.$log('draftSelectHandle', draft, this.mode)
      this.$emit('draft', draft)
    },
  }
}
</script>
