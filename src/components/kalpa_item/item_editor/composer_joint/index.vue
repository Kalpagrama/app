<template lang="pug">
.row
  //- item finder
  q-dialog(
    v-model="itemFinderShow"
    position="standard"
    :maximized="true")
    kalpa-finder(
      :height="$q.screen.height"
      :headerTitle="$t('Pick new element for joint')",
      @item="itemFound"
      @close="itemFinderShow = false"
    ).b-30
  item-preview(v-if="joint.items[0]"
    :item="joint.items[0]"
    :isActive="true"
    :showHeader="false"
    :showSpheres="false"
    :showActions="false"
  ).row
  vertex-editor(:joint="joint").row
  div(:style=`{minHeight: '200px'}`).row.full-width.relative-position
    item-preview(
      v-if="joint.items[1]"
      :item="joint.items[1]"
      :isActive="true"
      :showHeader="false"
      :showSpheres="false"
      :showActions="false"
    ).row
    div(v-else).row.full-width.q-px-sm.q-pb-sm
      q-btn(
        @click="$store.getters.isGuest ? $store.commit('ui/stateSet', ['authGuard', {message: 'Чтобы добавить связь авторизуйтесь'}]) : itemFinderShow = true"
        flat color="white" no-caps icon="add" size="lg" stack
      :style=`{minHeight: '200px'}`
      ).full-width.b-40
        span(:style=`{fontSize: '18px'}`) {{$t('Pick element for join')}}
    q-btn(v-if="joint.items[1]" flat round icon="close" color="red" :style=`{zIndex: 100}` @click="itemDelete").absolute-top-right
  q-btn(
    :label="$t('Create joint')"
    :loading="jointPublishing"
    :style=`{height: '50px', borderRadius: '0px'}`
    @click="$store.getters.isGuest ? $store.commit('ui/stateSet', ['authGuard', {message: 'Чтобы добавить связь авторизуйтесь'}]) : jointPublish()").row.full-width.text-green.text-bold
</template>

<script>
import itemPreview from 'src/components/kalpa_item/item_preview'
import vertexEditor from 'src/components/kalpa_item/item_editor/composer_joint/vertex_editor.vue'
import { ObjectCreateApi } from 'src/api/object_create'
import { RxCollectionEnum } from 'src/system/rxdb'
import { assert } from 'src/system/common/utils'
import { VertexTypeEnum } from 'src/system/common/enums'

export default {
  name: 'composerJoint',
  components: {
    itemPreview,
    vertexEditor
  },
  data () {
    return {
      itemFinderShow: false,
      foundItem: null,
      jointPublishing: false
    }
  },
  props: {
    joint: {
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
    itemFound (item) {
      assert(item.type.in('NODE', 'VIDEO', 'BOOK'), 'bad joint second item:' + item.type)
      this.joint.items[1] = JSON.parse(JSON.stringify(item))
      this.itemFinderShow = false
    },
    itemDelete () {
      this.joint.items[1] = null
    },
    async jointPublish () {
      assert(this.joint.vertices.length === 2)
      assert(this.joint.items.length === 2)
      this.$log('before swap', JSON.stringify(this.joint.vertices))
      if (this.joint.vertices[0].in(VertexTypeEnum.EFFECT, VertexTypeEnum.SOLUTION, VertexTypeEnum.TO, VertexTypeEnum.DISPROOF, VertexTypeEnum.PROOF, VertexTypeEnum.ANSWER)) {
        // swap items
        let tmp = this.joint.vertices[0]
        this.joint.vertices[0] = this.joint.vertices[1]
        this.joint.vertices[1] = tmp
        tmp = this.joint.items[0]
        this.joint.items[0] = this.joint.items[1]
        this.joint.items[1] = tmp
        this.$log('after swap', JSON.stringify(this.joint.vertices))
        this.$log('after swap', JSON.parse(JSON.stringify(this.joint.items)))
      }
      if (this.action) {
        this.$log('jointPublish', this.joint)
        await this.action(this.joint)
      }
      if (this.publish) {
        try {
          this.$log('jointPublish start')
          this.jointPublishing = true
          const itemLeftFull = await this.$rxdb.get(RxCollectionEnum.OBJ, this.joint.items[0].oid)
          let jointInput = JSON.parse(JSON.stringify(this.joint))
          jointInput.category = itemLeftFull.category
          jointInput.spheres = []
          jointInput.layout = 'VERTICAL'
          jointInput.name = jointInput.name || ''
          // create...
          this.$log('jointInput', jointInput)
          let jointCreated = await ObjectCreateApi.jointCreate(jointInput)
          this.$log('jointPublish jointCreated', jointCreated)
          this.$ym('JOINT_CREATED')
          // done? emit? close?
          this.$log('jointPublish done')
          // this.$emit('created', jointCreated)
          this.$emit('close', jointCreated)
        } catch (e) {
          this.$log('jointPublish error', e)
          this.jointPublishing = false
        } finally {
          this.jointPublishing = false
        }
      }
    }
  },
  mounted () {
    this.$log('mounted', this.joint)
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
