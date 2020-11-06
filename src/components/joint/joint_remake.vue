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
  props: ['joint'],
  data () {
    return {
    }
  },
  methods: {
    async remake () {
      this.$log('remake', this.joint)
      // take items, spheres, name, and create ws_node...
      let nodeInput = {
        name: this.joint.name,
        thumbUrl: '',
        layout: 'VERTICAL',
        category: 'FUN',
        spheres: [],
        items: this.joint.items.map((item, ii) => {
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
      let joint = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('remake joint', joint)
      this.$router.push(`/workspace/joint/${joint.id}`).catch(e => e)
      NodeApi.updateStat(this.joint.oid, 'REMADE')
    }
  }
}
</script>
