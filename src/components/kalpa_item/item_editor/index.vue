<template lang="pug">
.row
  //- node
  div(
    v-if="item.type === 'NODE'"
    ).row.full-width
    item-preview(:item="item")
    .row.full-width.q-py-lg.q-px-sm
      q-btn(
        outline no-caps color="grey-6"
        :disable="true"
        :style=`{
          height: '50px',
        }`
        ).full-width.q-mb-sm
        span {{$t('Change essence')}}
  //- joint
  //- sphere
  //- user
  //- ===
  //- content VIDEO
  composer-video(
    v-else-if="['VIDEO'].includes(item.type)"
    :oid="item.oid"
    :action="action"
    :figures="null"
    :height="$q.screen.height-0"
    :fromComposition="false"
    @composition="contentComposed('VIDEO', $event)"
    @close="contentClosed('VIDEO')")
  //- content BOOK
  composer-book(
    v-else-if="['BOOK'].includes(item.type)"
    :oid="item.oid"
    :action="action"
    :figures="null"
    :height="$q.screen.height-0"
    @composition="contentComposed('BOOK', $event)"
    @close="contetnClosed('BOOK')")
  //- content IMAGE
  composer-image(
    v-else-if="['IMAGE'].includes(item.type)"
    :oid="item.oid"
    :action="action"
    :figures="null"
    :height="$q.screen.height-0"
    @composition="contentComposed('BOOK', $event)"
    @close="contetnClosed('BOOK')")
  //- ===
  //- composition VIDEO
  composer-video(
    v-else-if="item.__typename === 'Composition' && item.outputType === 'VIDEO'"
    :oid="item.layers[0].contentOid"
    :action="action"
    :figures="item.layers[0].figuresAbsolute"
    :height="$q.screen.height-0"
    :fromComposition="true"
    @composition="compositionChanged('VIDEO', $event)"
    @close="compositionClosed('VIDEO')")
  //- composition BOOK
  composer-book(
    v-else-if="item.__typename === 'Composition' && item.outputType === 'BOOK'"
    :oid="item.layers[0].contentOid"
    :action="action"
    :figures="item.layers[0].figuresAbsolute"
    :height="$q.screen.height"
    :fromComposition="true"
    @composition="compositionChanged('BOOK', $event)"
    @close="compositionClosed('BOOK')")
  //- composition AUDIO
  composer-joint(
    v-else-if="item.type === 'JOINT'"
    :joint="item"
    :action="action"
    :publish="publish"
    :height="$q.screen.height"
    @close="$emit('close', $event)")
  composer-node(
    v-else-if="item.type === 'NODE'"
    :item="item"
    :action="action"
    :publish="publish"
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
  name: 'composer',
  components: {
    composerBook,
    composerImage,
    composerVideo,
    composerJoint,
    composerNode,
    // composerAudio,
  },
  props: {
    joint: {
      type: Object,
      required: true
    },
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
    }

  },
  data () {
    return {
      content: null,
      composition: null,
    }
  },
  methods: {
    // Composition
    compositionChanged (type, composition) {
      this.$log('compositionChanged', composition)
      this.$set(this.joint.items, 1, composition)
      this.$emit('close')
    },
    compositionClosed (type) {
      this.$log('compositionClosed')
      this.$emit('close')
    },
    // Content
    contentComposed (type, composition) {
      this.$log('contentComposed', composition)
      this.$set(this.joint.items, 1, composition)
      this.$emit('close')
    },
    contentClosed (type) {
      this.$log('contentClosed')
      // its bad? delete it? cos videos and books are too looong
      if (['VIDEO', 'BOOK'].includes(type)) {
        this.$delete(this.joint.items, 1)
        this.$emit('close')
      }
      else {
        this.$emit('close')
      }
    },
    // Transforms
  },
  created () {
    this.$log('created')
    // TODO save first composition version, to Redo the shit
    // if (this.item.__typename === 'Composition') {
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
