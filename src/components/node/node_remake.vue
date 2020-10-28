<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '60px',}`).row.justify-center.items-center.content-center
  //- remake action
  q-btn(
    @click="remake()"
    round flat color="grey-9" icon="cached").shaking
  //- remake count
  div(
    v-if="node.countRemakes > 0"
    :style=`{position: 'absolute', zIndex: 10, bottom: '0px',}`).row.full-width.justify-center
    small.text-grey-9 {{ node.countRemakes }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

export default {
  name: 'nodeRemake',
  props: ['node'],
  data () {
    return {
    }
  },
  methods: {
    async remake () {
      this.$log('remake', this.node)
      // take items, spheres, name, and create ws_node...
      let nodeInput = {
        name: this.node.name,
        wsItemType: 'WS_NODE',
        thumbUrl: this.node.items[0].thumbUrl,
        layout: 'VERTICAL', // this.node.layout,
        category: this.node.category,
        spheres: [],
        items: this.node.items.map((item, ii) => {
          return {
            id: `${Date.now().toString()}-${ii}`,
            outputType: item.outputType,
            thumbUrl: item.thumbUrl,
            operation: { items: null, operations: null, type: 'CONCAT'},
            meta: {cover: true, loop: true},
            layers: item.layers.map((layer, li) => {
              return {
                id: `${Date.now()}-${li}`,
                contentOid: layer.contentOid,
                figuresAbsolute: layer.figuresAbsolute.map(f => {
                  return {
                    t: f.t,
                    points: f.points
                  }
                })
              }
            }),
          }
        })
      }
      this.$log('remake nodeInput', nodeInput)
      let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('remake node', node)
      this.$router.push(`/workspace/node/${node.id}`).catch(e => e)
      NodeApi.updateStat(this.node.oid, 'REMADE')
    }
  }
}
</script>
