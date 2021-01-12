<template lang="pug">
div(
  v-if="node.items.length === 1"
  ).row.full-width
  kalpa-loader(
    :immediate="true"
    :query="jointsQuery" :limit="12"
    @items="jointsUpdated"
    v-slot=`{items, next, nexting}`)
  .row.full-width.justify-center.q-py-md
    q-btn(
      :to="'/links/'+node.oid"
      flat color="grey-6" no-caps size="md"
      icon-right="launch"
      :style=`{
        height: '50px',
      }`
      ).b-40
      span.q-mr-sm Связи {{ jointsCount }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'widgetJoints',
  props: ['node'],
  data () {
    return {
      joints: []
    }
  },
  computed: {
    jointsCount () {
      if (this.joints.length > 0) return ' - ' + this.joints.length
      else return ''
    },
    jointsQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.node.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  },
  methods: {
    jointsUpdated (joints) {
      this.$log('jointsUpdated', joints)
      this.joints = joints
    }
  }
}
</script>
