<template lang="pug">
content-explorer(:oid="contentBookmark.oid" :query=`{viewid: 'nodes-mine'}`).b-30
  template(v-slot:header)
    div(:style=`{height: '60px'}`).row.full-width.items-between.content-between.q-px-sm
      q-btn(
        @click="$emit('close')"
        round flat color="white" icon="keyboard_arrow_left")
      .col.full-height.q-mx-xs
        div(
          :style=`{borderRadius: '10px', overflow: 'hidden'}`
          ).row.fit.items-center.content-center.b-40.q-pa-sm
          q-icon(name="select_all" color="white" size="30px").q-mx-xs
          div(:style=`{overflowX: 'auto'}`).col.q-mr-md
            span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold Pick node
  //- from view-node
  template(v-slot:nodeAction=`{node}`)
    q-btn(color="green" no-caps @click="nodePick(node)") Pick node
  //- from view-nodes-mine
  template(v-slot:nodeActionMine=`{node}`)
    q-btn(color="red" icon="check" @click="nodePick(node)")
  //- from view-nodes-all
  template(v-slot:nodeActionAll=`{node}`)
    q-btn(color="red" icon="check" @click="nodePick(node)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import compositionEditor from 'components/composition/composition_editor/index.vue'
import contentPlayer from 'components/content_player/index.vue'
import contentExplorer from 'pages/app/content/index.vue'

export default {
  name: 'itemFinder_fromContentSelect',
  components: {contentExplorer},
  props: ['contentBookmark'],
  data () {
    return {
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    nodePick (node) {
      this.$log('nodePick', node)
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
