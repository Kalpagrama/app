<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width
  //- item finder
  q-dialog(
    v-model="itemFinderShow_data"
    position="bottom"
    :maximized="true")
    kalpa-finder(
      :height="$q.screen.height"
      @item="onItemFound"
      @close="itemFinderShow_data = false"
    ).b-30
  //- item editor
  q-dialog(
    v-model="itemEditorShow"
    position="standard"
    :maximized="true"
    :no-esc-dismiss="true")
      item-editor(
        :item="itemFound"
        @composition="($event ? $set_deprecated(node.items, 0, $event) : $delete(node.items, 0)), itemEditorShow=false"
        @close="itemEditorShow=false"
        )
  item-preview(
    v-if="node.items[0]"
    :item="node.items[0]"
    :isVisible="isVisible"
    :isActive="isActive"
    )
  //composition(
  //  v-if="node.items[0]"
  //  :composition="node.items[0]"
  //  :isVisible="isVisible"
  //  :isActive="isActive"
  //  :nodeOid="node.oid")
  q-responsive(v-else-if="!node.items.length" :ratio="16/8").full-width
    q-btn(stack no-caps round outline icon="add" color="green" size="lg"
      :label="$t('pick element for node')"
      @click="itemFinderShow_data = true").fit
  q-btn(v-if="node.items[0]" flat icon="close" color="red" :style=`{zIndex: 100}` @click="$delete(node.items, 0)").absolute-top-right
</template>

<script>
import itemPreview from 'src/components/kalpa_item/item_preview/index.vue'
import { RxCollectionEnum } from 'src/system/rxdb'
import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'
import { ObjectTypeEnum } from 'src/system/common/enums'

export default {
  name: 'compositionEditor',
  components: {
    itemPreview
  },
  data() {
    return {
      itemFound: null,
      itemFinderShow_data: this.itemFinderShow,
    }
  },
  props: {
    node: {type: Object, required: true},
    itemFinderShow: {type: Boolean, default: false},
    itemEditorShow: {type: Boolean, default: false},
    isVisible: {type: Boolean, default: false},
    isActive: {type: Boolean, default: false},
  },
  methods: {
    async onItemFound (item) {
      this.$log('itemFound112', item)
      this.itemFinderShow_data = false
      this.itemFound = item
      if (item.type === ObjectTypeEnum.NODE) {
        assert(item.oid)
        let fullItem = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid, {clientFirst: true})
        this.node.items.push(fullItem.items[0])
      } else if (item.type.in(ObjectTypeEnum.VIDEO, ObjectTypeEnum.BOOK, ObjectTypeEnum.IMAGE)) {
        this.itemEditorShow = true
      } else {
        throw new Error('not impl type=' + item.type)
      }
    },
  }
}
</script>
