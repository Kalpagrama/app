// частный случай itemEditor (для того чтобы разорвать рекурсию в шаблонах(когда внутри itemEditor создается другой itemEditor))
<template lang="pug">
.row
  composer-joint(
    v-if="item.type === 'JOINT'"
    :joint="item"
    :action="action"
    :publish="publish"
    :height="$q.screen.height"
    @close="$emit('close', $event)")
  composer-node(
    v-else-if="item.type === 'NODE'"
    :item="item"
    :isActive="true"
    :isVisible="true"
    :action="action"
    :publish="publish"
    :showActions="false"
    :showAuthorAlways="true"
    :showHeader="showHeader"
    :lockName="lockName"
    :showItems="showItems"
    :height="$q.screen.height"
    @close="$emit('close', $event)")
</template>

<script>
import composerJoint from 'src/components/kalpa_item/item_editor/composer_joint'
import composerNode from 'src/components/kalpa_item/item_editor/composer_node'

export default {
  name: 'essenceEditor',
  components: {
    composerJoint,
    composerNode,
    // composerAudio,
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    action: {
      type: Function,
      required: false
    },
    publish: {
      type: Boolean,
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showItems: {
      type: Boolean,
      default: true
    },
    lockName: {
      type: Boolean,
      default: false
    },

  },
  data () {
    return {
      content: null,
      composition: null,
    }
  },
  methods: {
  },
  beforeCreate () {
    this.$log('beforeCreate')
  },
  created () {
    this.$log('created')
    // TODO save first composition version, to Redo the shit
    // if (this.item.type === 'COMPOSITION') {
    //   this.composition = JSON.parse(JSON.stringify(this.item))
    // }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
