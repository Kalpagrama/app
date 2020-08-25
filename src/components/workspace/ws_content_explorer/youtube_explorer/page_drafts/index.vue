<template lang="pug">
kalpa-loader(:mangoQuery="nodesQuery" :sliceSize="1000" @items="nodesLoaded")
  template(v-slot=`{items, itemsMore}`)
    .row.full-width.justify-center
      div(
        :style=`{maxWidth: '600px',}`
        :class=`{'q-px-sm': $q.screen.width < 800}`
        ).row.full-width.items-start.content-start.q-py-sm
        div(
          v-for="(n, ni) in items" :key="n.id"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
          }`).row.full-width.b-40.q-mb-sm
          div(
            @click="nodeClick(n, ni)"
            :style=`{
              height: '60px',
              cursor: 'pointer',
              borderRadius: '10px', overflow: 'hidden',
            }`).row.full-width.b-50
            span {{ n }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

export default {
  name: 'wsContentExplorer_pageDrafts',
  props: ['mode', 'contentWorkspace', 'contentKalpa', 'pageHeight'],
  data () {
    return {
    }
  },
  computed: {
    nodesQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          contentOid: this.contentKalpa.oid,
          stage: 'draft',
        },
        sort: [{updatedAt: 'desc'}],
      }
      // // name
      // if (this.searchString.length > 0) {
      //   let nameRegExp = new RegExp(this.searchString, 'i')
      //   res.selector.name = {$regex: nameRegExp}
      // }
      return res
    }
  },
  methods: {
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      let t = n.items[0].layers[0].figuresAbsolute[0].t
      this.$log('t', t)
      this.$emit('setCurrentTime', t)
    },
    nodesLoaded (nodes) {
      this.$log('nodesLoaded!', nodes)
      let bars = nodes.reduce((acc, val) => {
        let layer = val.items[0].layers[0]
        if (layer.contentOid === this.contentKalpa.oid) {
          acc.push(layer.figuresAbsolute[0].t)
        }
        return acc
      }, [])
      this.$log('bars', bars)
      this.$emit('bars', bars)
    }
  }
}
</script>
