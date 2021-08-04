<template lang="pug">
  .row
    item-preview(v-if="joint.itemsShort[0]" :item="joint.itemsShort[0]").br
    vertex-editor(:joint="joint").row
    q-btn(:label="$t('Create')" @click="$emit('created', joint)").text-white
    q-btn(:label="$t('Cancel')" @click="$emit('close')").text-white

    //.row.full-width.justify-center.q-px-sm.br
      //
      //div(
      //  :style=`{
      //        maxWidth: 500+'px',
      //      }`).row.full-width
      //  q-resize-observer(@resize="rowItemWidth = $event.width")
      //  joint-item(
      //    :key="jointItem.oid"
      //    :item="jointItem"
      //    :itemActive="!jointCreatorFocused"
      //    :itemIndependent="true")
      //    node-feed(
      //      v-if="jointActive"
      //      :node="jointActive"
      //      :showItems="false"
      //      :showActions="false"
      //      :showName="false"
      //      :showAuthorAlways="false")
</template>

<script>
import itemPreview from 'src/components/kalpa_item/item_preview'
import vertexEditor from 'src/components/kalpa_item/item_editor/vertex_editor.vue'

export default {
  name: 'graph_jointCreator',
  components: {
    itemPreview,
    vertexEditor
  },
  data () {
    return {
    }
  },
  props: {
    joint: {
      type: Object,
      required: true,
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
