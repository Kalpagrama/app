// сути на образ
<template lang="pug">
.row.full-width
  q-dialog(
    v-model="itemEditorShow"
    :maximized="false"
    position="standard")
    item-editor(
      :item="newNode"
      :publish="true"
      @close="$event?$go('/node/'+$event.oid):null, $event?$emit('close'):null, itemEditorShow=false")
  .row.full-width
    q-btn(round flat outline no-caps icon="add" color="green" :label="$t('Добавить новый смысл')" @click="itemEditorShow=true").col
    q-btn(round flat color="grey-5" icon="clear" @click="$emit('close')")
  .row.full-width.scroll.justify-around
    div(v-for="(node, nodeIndex) in [...sameCompositionNodes, ...sameCompositionNodes]").q-px-xs.q-pb-sm
      div(:style=`{border: '1px solid ' + (currentIndx === nodeIndex ? $getPaletteColor('green-7') : $getPaletteColor('grey-9')), borderRadius: '5px'}`).cursor-pointer
        span(:style=`{textAlign: 'center'}` @click="$go('/node/'+node.oid), $emit('close')").text-grey-4.q-px-sm {{node.name}}
        q-circular-progress(v-if="node.countVotes > 1" :value="node.rate" :min="0" :max="maxRate" show-value dark size="sm" color="green" :thickness="0.09" track-color="grey-9")
          span {{node.countVotes}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import essenceVoteBall from 'src/components/essence/essence_vote_ball.vue'
import essenceSpheres from 'src/components/essence/essence_spheres'
import essenceActions from 'src/components/essence/essence_actions.vue'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'pageEssences',
  components: {
    essenceVoteBall, essenceSpheres, essenceActions
  },
  props: ['currentIndx', 'sameCompositionNodes', 'node'],
  data () {
    return {
      newEssence: null,
      itemEditorShow: false,
    }
  },
  watch: {
    async query(to) {
      if (to) {
        this.sameCompositionNodesItemsRes = null
        this.sameCompositionNodesItemsRes = await this.$rxdb.find(to)
      }
    }
  },
  computed: {
    newNode() {
      this.$log('resetNewNode ')
      let node = cloneDeep(this.node)
      node.name = ''
      node.description = ''
      // node.spheres = []
      return node
    },
    maxRate () {
      return this.sameCompositionNodes.reduce((acc, v) => acc > v.rate ? acc : v.rate)
    }
  },
  methods: {
  },
  created () {
    this.$log('created ')
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
