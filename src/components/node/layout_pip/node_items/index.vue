<template lang="pug">
div(:style=`{position: 'relative',}`).row.full-width
  //- items preview: first item from meta => shaping the size
  img(
    v-if="true"
    @load="previewLoad"
    @error="previewErrored"
    :src="previewUrl" draggable="false"
    :style=`{
      userSelect: 'none', objectFit: 'contain',
      maxHeight: $q.screen.height-200+'px',
      opacity: 1,
    }`
    ).full-width
  //- items in pip
  list-pip(:items="items" :prevBtnShow="active")
    template(v-slot:item=`{item,itemIsFirst,itemIsLast,itemIndex,itemActive,itemNexting,next,prev,started,ended}`)
      composition(
        :ctx="ctx" :preview="item.thumbUrl" :value="item"
        :visible="visible"
        :loop="itemIsFirst && itemIsLast"
        :active="active && itemActive"
        :mini="mini || !itemActive || itemNexting"
        :itemsCount="items.length"
        :class=`{
          'full-height': itemActive || itemNexting,
        }`
        @previewClick="next()"
        @started="started(ii)"
        @ended="ended(ii)"
        :style=`{
          position: 'relative',
          borderRadius: $store.state.ui.borderRadius+'px',
          overflow: 'hidden',
        }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeLayoutPip-nodeItems',
  props: ['ctx', 'node', 'nodeFull', 'visible', 'active', 'mini'],
  data () {
    return {
      itemIndex: 0,
      nextMaxWidth: 25,
      nextMaxHeight: 50,
      nowMaxWidth: 100,
      nowMaxHeight: 100,
      // preview
      previewLoaded: false,
      previewError: null
    }
  },
  computed: {
    previewUrl () {
      return this.node.meta.items[0].thumbUrl
    },
    items () {
      if (!this.nodeFull) return []
      else return this.nodeFull.items
    }
  },
  watch: {
    active: {
      handler (to, from) {
        this.$log('active CHANGED', to)
        // alert('nodeItems active CHANGED: ' + to)
      }
    },
  },
  methods: {
    previewLoad () {
      // this.$log('previewLoad')
      this.previewLoaded = true
    },
    previewErrored (e) {
      this.$log('previewErrored', e)
      this.previewError = e
    },
    async nodeSave () {
      this.$log('nodeSave')
      let node = JSON.parse(JSON.stringify(this.nodeFull))
      this.$log('node', node)
      let compositions = []
      await Promise.all(
        node.items.map(async (item) => {
          let composition = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
          this.$log('composition', composition)
          if (composition) {
            let compositionInput = JSON.parse(JSON.stringify(composition))
            // prepare composition
            // add id to composition... or add it to workspace...
            // TODO: save compositions to WORKSPACE as is? or only in the node...
            // add id to every layer...
            compositionInput.thumbOid = compositionInput.thumbUrl
            compositionInput.layers.map((l, li) => {
              l.id = `${Date.now().toString()}-${li}`
              return l
            })
            compositions.push(compositionInput)
          }
        })
      )
      let nodeInput = {
        wsItemType: 'WS_NODE',
        thumbOid: this.previewUrl,
        name: node.name,
        layout: node.layout,
        category: node.category,
        items: compositions,
        stage: 'saved',
        spheres: []
      }
      this.$log('compositions', compositions)
      this.$log('nodeInput', nodeInput)
      // create node in ws
      let item = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeAddStart item', item)
      if (!item) return
      // notify and maybe show...
      this.$q.notify({
        type: 'positive',
        message: 'Node saved!',
        actions: [
          {
            label: 'Show',
            color: 'white',
            handler: () => {
              this.$log('nodeShow start')
              this.$router.push(`/workspace/node/${item.id}`)
            }
          },
          {
            label: 'Close',
            color: 'white',
            handler: () => {
              this.$log('Close')
            }
          }
        ]
      })
    },
  }
}
</script>
