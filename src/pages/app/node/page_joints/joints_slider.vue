<template lang="pug">
div(
  v-touch-swipe.left.right.mouse="onSwipe"
  ref="scroll-wrapper"
  :style=`{
    overflow: scrollOverflow,
  }`
  ).row.full-width.b-30.scroll
  div(v-if="itemsRes").row.full-width.no-wrap
    div(
      v-for="(joint,jointIndex) in itemsRes.items"
      :key="joint.oid"
      :style=`{
        minWidth: '100%',
        maxWidth: '100%',
      }`
      ).row.q-px-sm
      .row.full-width.items-start.content-start
        img(
          draggable="false"
          :src="joint.populatedObject.items.find(i => i.oid !== oid).thumbUrl"
          :style=`{
            borderRadius: '10px',
          }`
          ).full-width
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'jointSlider',
  props: ['oid', 'joint'],
  data () {
    return {
      itemsRes: null,
      scrollOverflow: 'hidden',
    }
  },
  computed: {
    query () {
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
    onSwipe (e) {
      this.$log('onSwipe', e)
      let scrollTargetRef = this.$refs['scroll-wrapper']
      let width = scrollTargetRef.clientWidth
      this.$tween.to(scrollTargetRef, 0.3, {
        scrollLeft: e.direction === 'left' ? scrollTargetRef.scrollLeft + width : scrollTargetRef.scrollLeft - width
      })
    }
  },
  async mounted () {
    this.$log('mounted')
    this.itemsRes = await this.$rxdb.find(this.query, true)
    this.itemsRes.setProperty('currentId', this.joint.oid)
    this.itemsRes.gotoCurrent()
  }
}
</script>
