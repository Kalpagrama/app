<template lang="pug">
  .row
    node-feed(
      :node="item")
    q-btn(
      :label="$t('Create node')"
      :loading="publishing"
      :style=`{height: '50px', borderRadius: '0px'}`
      @click="nodePublish").row.full-width.text-green.text-bold
</template>

<script>
import { ObjectCreateApi } from 'src/api/object_create'
import { RxCollectionEnum } from 'src/system/rxdb'
import { assert } from 'src/system/common/utils'

export default {
  name: 'composerNode',
  components: {
  },
  data () {
    return {
      itemFinderShow: false,
      foundItem: null,
      publishing: false
    }
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
      default: false
    }

  },
  watch: {},
  methods: {
    async nodePublish () {
      if (this.action) {
        this.$log('nodePublish', this.joint)
        await this.action(this.joint)
      }
      if (this.publish) {
        try {
          this.$log('nodePublish start')
          this.publishing = true
          const itemLeftFull = await this.$rxdb.get(RxCollectionEnum.OBJ, this.joint.items[0].oid)
          let jointInput = JSON.parse(JSON.stringify(this.joint))
          jointInput.category = itemLeftFull.category
          jointInput.spheres = []
          jointInput.layout = 'VERTICAL'
          jointInput.name = jointInput.name || ''
          // create...
          this.$log('jointInput', jointInput)
          let jointCreated = await ObjectCreateApi.jointCreate(jointInput)
          this.$log('nodePublish jointCreated', jointCreated)
          this.$ym('JOINT_CREATED')
          // done? emit? close?
          this.$log('nodePublish done')
          // this.$emit('created', jointCreated)
          this.$emit('close', jointCreated)
        } catch (e) {
          this.$log('nodePublish error', e)
          this.publishing = false
        } finally {
          this.publishing = false
        }
      }
    }
  },
  mounted () {
    this.$log('mounted', this.joint)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
