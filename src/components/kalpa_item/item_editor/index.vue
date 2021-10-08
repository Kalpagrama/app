<template lang="pug">
.row
  //- content VIDEO
  composer-video(
    v-if="['VIDEO'].includes(item.type)"
    :oid="item.oid"
    :action="action"
    :figures="null"
    :height="$q.screen.height-0"
    :fromComposition="false"
    @composition="$emit('composition', $event), $emit('close')"
    @close="$emit('composition', null), $emit('close')")
  //- content BOOK
  composer-book(
    v-else-if="['BOOK'].includes(item.type)"
    :oid="item.oid"
    :action="action"
    :figures="null"
    :height="$q.screen.height-0"
    @composition="$emit('composition', $event), $emit('close')"
    @close="contetnClosed('BOOK')")
  //- content IMAGE
  composer-image(
    v-else-if="['IMAGE'].includes(item.type)"
    :oid="item.oid"
    :action="action"
    :figures="null"
    :height="$q.screen.height-0"
    @composition="$emit('composition', $event), $emit('close')"
    @close="$emit('close')")
  //- ===
  //- composition VIDEO
  composer-video(
    v-else-if="item.type === 'COMPOSITION' && item.outputType === 'VIDEO'"
    :oid="item.layers[0].contentOid"
    :action="action"
    :figures="item.layers[0].figuresAbsolute"
    :height="$q.screen.height-0"
    :fromComposition="true"
    @composition="$emit('composition', $event), $emit('close')"
    @close="$emit('close')")
  //- composition BOOK
  composer-book(
    v-else-if="item.type === 'COMPOSITION' && item.outputType === 'BOOK'"
    :oid="item.layers[0].contentOid"
    :action="action"
    :figures="item.layers[0].figuresAbsolute"
    :height="$q.screen.height"
    :fromComposition="true"
    @composition="$emit('composition', $event), $emit('close')"
    @close="$emit('close')")
  //- composition AUDIO
  composer-joint(
    v-else-if="item.type === 'JOINT'"
    :joint="item"
    :action="action"
    :publish="publish"
    :height="$q.screen.height"
    @close="$emit('close', $event)")
  //- node
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
import composerBook from 'src/components/kalpa_item/item_editor/composer_book.vue'
import composerImage from 'src/components/kalpa_item/item_editor/composer_image.vue'
import composerVideo from 'src/components/kalpa_item/item_editor/composer_video.vue'
import composerJoint from 'src/components/kalpa_item/item_editor/composer_joint'
import composerNode from 'src/components/kalpa_item/item_editor/composer_node'
// import composerAudio from './composer_audio.vue'

export default {
  name: 'itemEditor',
  components: {
    composerBook,
    composerImage,
    composerVideo,
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
