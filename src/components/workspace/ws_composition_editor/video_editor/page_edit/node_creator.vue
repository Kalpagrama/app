<template lang="pug">
q-btn(
  dense color="green" no-caps
  @click="start()"
  ).q-px-sm {{ $t('create_node', 'Собрать ядро') }}
  q-dialog(v-model="nodeEditorOpened" position="bottom")
    ws-node-editor(
      @close="nodeEditorOpened = false"
      :value="node"
      :style=`{
        maxWidth: '800px',
        maxHeight: $q.screen.height-60+'px',
        minHeight: $q.screen.height-60+'px',
      }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeCreator',
  props: ['composition'],
  inject: ['sidPlayer', 'sidEditor'],
  data () {
    return {
      node: null,
      nodeEditorOpened: false,
    }
  },
  computed: {
    storeEditor () {
      return window.stores[this.sidEditor]
    },
    storePlayer () {
      return window.stores[this.sidPlayer]
    },
  },
  methods: {
    async start () {
      this.$log('start')
      let nodeInput = {
        name: this.composition.name,
        wsItemType: 'WS_NODE',
        items: [this.composition],
        category: 'FUN',
        layout: 'PIP',
        stage: 'draft',
        spheres: [],
      }
      this.$log('start nodeInput', nodeInput)
      let item = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('start item', item)
      this.node = item
      this.nodeEditorOpened = true
    }
  }
}
</script>
