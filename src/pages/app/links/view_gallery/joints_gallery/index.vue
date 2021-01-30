<template lang="pug">
.row.full-width.justify-center
  kalpa-loader(
    v-if="oid"
    :immediate="true"
    :query="jointsQuery" :limit="12"
    @items="jointsUpdated"
    v-slot=`{items, next, nexting}`)
    .row.full-width.items-start.content-start
      q-infinite-scroll(@load="next" :offset="$q.screen.height")
      div(
        v-if="jointsLoaded && joints.length === 0"
        :style=`{
          marginTop: '100px',
        }`
        ).row.full-width.justify-center
        span.text-grey-6 Связей пока нет.
        //- span.text-grey-6 Стань первым, добавь связь.
        .row.full-width.justify-center.q-py-md
          q-btn(
            @click="$emit('create')"
            color="green" outline no-caps size="lg")
            span Добавить связь
      joint-item(
        v-for="(j,ji) in items" :key="j.oid"
        :joint="j.populatedObject"
        :oid="oid"
        @open="$emit('joint', j)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'jointsGallery',
  props: ['oid'],
  components: {
    jointItem: () => import('./joint_item.vue'),
  },
  data () {
    return {
      joints: [],
      jointsLoaded: false,
    }
  },
  computed: {
    jointsQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  },
  methods: {
    jointsUpdated (joints) {
      this.$log('jointsUpdated', joints)
      if (joints) {
        this.joints = joints
        this.jointsLoaded = true
        // if (this.joints.length === 0) {
        //   this.$emit('empty')
        // }
      }
    }
  }
}
</script>
