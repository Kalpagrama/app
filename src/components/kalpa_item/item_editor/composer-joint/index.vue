<template lang="pug">
  .row
    item-preview(v-if="joint.itemsShort[0]"
      :item="joint.itemsShort[0]"
      :isActive="true"
      :showHeader="false"
      :showSpheres="false").row
    vertex-editor(:joint="joint").row
    item-preview(
      v-if="joint.itemsShort[1]"
      :item="joint.itemsShort[1]"
      :isActive="true"
      :showHeader="false"
      :showSpheres="false"
      ).row
    q-btn(
      :label="$t('Create joint')"
      :loading="jointPublishing"
      :style=`{height: '50px', borderRadius: '0px'}`
      @click="jointPublish").row.full-width.text-green.text-bold
</template>

<script>
import itemPreview from 'src/components/kalpa_item/item_preview'
import vertexEditor from 'src/components/kalpa_item/item_editor/composer-joint/vertex_editor.vue'
import { ContentApi } from 'src/api/content'
import { ObjectCreateApi } from 'src/api/object_create'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'graph_jointCreator',
  components: {
    itemPreview,
    vertexEditor
  },
  data () {
    return {
      jointPublishing: false
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
    async jointPublish () {
      try {
        this.$log('jointPublish start')
        this.jointPublishing = true
        const itemLeftFull = await this.$rxdb.get(RxCollectionEnum.OBJ, this.joint.itemsShort[0].oid)
        let jointInput = JSON.parse(JSON.stringify(this.joint))
        jointInput.category = itemLeftFull.category
        jointInput.spheres = []
        jointInput.layout = 'VERTICAL'
        jointInput.name = jointInput.name || ''
        jointInput.items = jointInput.itemsShort
        // create...
        this.$log('jointInput', jointInput)
        let jointCreated = await ObjectCreateApi.jointCreate(jointInput)
        this.$log('jointPublish jointCreated', jointCreated)
        this.$ym('JOINT_CREATED')
        // done? emit? close?
        this.$log('jointPublish done')
        // this.$emit('created', jointCreated)
        this.$emit('close', jointCreated)
      }
      catch (e) {
        this.$log('jointPublish error', e)
        this.jointPublishing = false
      }
      finally {
        this.jointPublishing = false
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
