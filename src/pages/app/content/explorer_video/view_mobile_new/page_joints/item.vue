<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`).row.full-width
  //- left
  div(
    @click="$emit('prev')"
    :style=`{
      position: 'absolute', zIndex: 10000, left: 0,
      width: '80px',
    }`
    ).row.full-height
  //- right
  div(
    @click="$emit('next')"
    :style=`{
      position: 'absolute', zIndex: 10000, right: 0,
      width: '80px',
    }`
    ).row.full-height
  //- item NODE
  div(
    v-if="item && item.type === 'NODE'"
    :style=`{
      position: 'relative',
    }`
    ).row.fit.bg-black
    composition-player(
      :composition="item.items[0]" :isVisible="true" :isActive="isActive"
      :options=`{height: '100%', objectFit: 'contain', loop: true}`
      :style=`{
        position: 'absolute', zIndex: 100, top: 0,
      }`).fit
    img(
      :src="item.thumbUrl"
      :style=`{
        objectFit: 'contain',
      }`
      ).fit
    div(
      :style=`{
        position: 'absolute', zIndex: 1000,
        bottom: '0px',
      }`
      ).row.full-width.q-pa-sm
      div(
        :style=`{
          borderRadius: '10px',
          overflow: 'hidden',
        }`
        ).row.full-width.b-40
        div(
          @click="itemOpened = !itemOpened"
          :style=`{
            textAlign: 'center',
            minHeight: '60px',
          }`
          ).row.full-width.justify-center.content-center.q-pa-sm.b-40
          span.text-white.text-bold {{ item.name }}
        //- spheres
        div(
          v-if="itemOpened && item.spheres.length > 0").row.full-width.scroll
          .row.full-width.justify-start.no-wrap.q-pl-sm
            div(
              v-for="(s,si) in item.spheres" :key="s.oid"
              ).row.items-start.content-start.justify-start.q-pr-sm.q-pb-sm
              q-btn(
                flat color="white" dense no-caps
                :to="'/sphere/'+s.oid"
                :style=`{borderRadius: '10px', whiteSpace: 'nowrap',}`).row.b-50.q-px-sm.text-grey-4 {{ s.name }}
        //- vote
        node-actions(v-if="itemOpened" :node="item" :isActive="isActive" :isVisible="true")
    //- small.text-white {{ joint }}
</template>

<script>
export default {
  name: 'pageJoints_item',
  props: ['contentKalpa', 'joint', 'ii', 'player', 'isActive'],
  components: {
    compositionPlayer: () => import('components/composition/composition_player/index.vue'),
    nodeActions: () => import('components/node/node_actions.vue'),
  },
  data () {
    return {
      itemOpened: false,
    }
  },
  computed: {
    item () {
      // if we got two nodes...
      if (this.joint.leftItem.type === 'NODE' && this.joint.rightItem.type === 'NODE') {
        if (this.joint.leftItem.items[0].layers[0].contentOid === this.contentKalpa.oid) {
          return this.joint.rightItem
        }
        else {
          return this.joint.leftItem
        }
      }
      // if we got node and content
      // if we got two contents
      else {
        return null
      }
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
