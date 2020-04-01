<template lang="pug">
.column.fit
  //- div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-md
  .col.full-width.scroll
    //- kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables" ref="contentNodesLoader")
    //-   template(v-slot:items=`{items}`)
    node-list(
      v-if="query" :nodes="query.nodeList"
      :nodeIndex="nodeIndex"
      :nodesHighlight="nodesHighlight"
      @nodeMiddle="nodeMiddle")
</template>

<script>

import { throttle } from 'quasar'

export default {
  name: 'contentExplorer_extraNodes',
  props: ['mode', 'content', 'player', 'meta'],
  data () {
    return {
      query: null,
      nodeIndex: null,
      nodesHighlight: []
    }
  },
  computed: {
    sphereOid () {
      return this.content.oid
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 10 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    }
  },
  watch: {
    'meta.now': {
      handler (to, from) {
        // this.$log('meta.now CHAGNGED', to)
        // this.nowChanged(to)
      }
    }
  },
  methods: {
    nowChanged (to) {
      this.$log('nowChanged', to)
      this.nowChanging = true
      let i = this.query.getIdx(to)
      this.$log('nowChanged i', i)
      this.nodeIndex = i
      this.nodesHighlight = [i]
      this.$wait(500).then(() => {
        this.nowChanging = false
      })
    },
    nodeMiddle (index) {
      this.$log('nodeMiddle', index)
      if (this.nowChanging) return
      this.nodeIndex = null
      let t = this.query.getT(index)
      this.$log('t', t)
      this.player.setCurrentTime(t)
    },
    async loadNodes () {
      this.$log('loadNodes')
      this.query = await this.$store.dispatch('lists/contentNodes', {contentOid: this.content.oid})
      this.$log('loadNodes query', this.query)
      this.nodeMiddle(0)
    }
  },
  created () {
    this.nowChanged = throttle(this.nowChanged, 1000)
  },
  mounted () {
    this.$log('mounted')
    this.loadNodes()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
