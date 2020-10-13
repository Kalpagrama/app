<template lang="pug">
q-btn(
  @click="remake()"
  round flat color="grey-9" icon="cached").shaking
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

export default {
  name: 'nodeRemake',
  props: ['link'],
  data () {
    return {
    }
  },
  methods: {
    async remake () {
      this.$log('remake', this.link)
      // take items, spheres, name, and create ws_node...
      let nodeInput = {
        name: this.link.name,
        wsItemType: 'WS_NODE',
        thumbUrl: this.link.items[0].thumbUrl,
        layout: 'VERTICAL', // this.link.layout,
        category: this.link.category,
        spheres: [],
        items: this.link.items.map((item, ii) => {
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
      let link = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('remake link', link)
      this.$router.push(`/workspace/link/${link.id}`).catch(e => e)
      NodeApi.updateStat(this.link.oid, 'REMADE')
    }
  }
}
</script>
