<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`).row.full-width
  //- left
  div(
    @click="$emit('prev')"
    :style=`{
      position: 'absolute', zIndex: 500, left: 0,
      width: '80px',
    }`
    ).row.full-height.br
  //- right
  div(
    @click="$emit('next')"
    :style=`{
      position: 'absolute', zIndex: 500, right: 0,
      width: '80px',
    }`
    ).row.full-height.br
  //- NODE
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
    //- FOOTER:
    div(
      :style=`{
        position: 'absolute', zIndex: 2000,
        bottom: '0px',
      }`
      ).row.full-width.q-pa-sm
      node-feed(
        @click="opened = !opened"
        :node="joint"
        :isActive="opened" :isVisible="true"
        :showItems="false"
        :showName="true"
        :showActions="opened"
        :showSpheres="opened"
        :showHeader="opened"
        :style=`{
          borderRadius: '10px',
        }`).b-40
        template(v-slot:name)
          div(
            @click="opened = !opened"
            :class=`{
              'b-30': !opened,
              'b-50': opened,
            }`
            :style=`{
              minHeight: '60px',
              borderRadius: '10px',
              textAlign: 'center',
            }`
            ).row.items-center.content-center.justify-center.full-width
            span(v-if="joint.name.length > 0").text-white {{joint}}
            span(
              v-else
              :style=`{
                fontSize: '18px',
              }`).text-white.text-bold {{ joint.vertices }}
</template>

<script>
export default {
  name: 'pageJoints_jointItem',
  props: ['contentKalpa', 'joint', 'ii', 'player', 'isActive'],
  components: {
    compositionPlayer: () => import('components/composition/composition_player/index.vue'),
    nodeActions: () => import('components/node/node_actions.vue'),
  },
  data () {
    return {
      opened: false,
    }
  },
  computed: {
    item () {
      return this.joint.items.find(i => {
        if (i.type === 'NODE') {
          if (i.items[0].layers[0].contentOid !== this.contentKalpa.oid) {
            return true
          }
          else return false
        }
        else {
          return false
        }
      })
    },
    itemTypes () {
      return [
        {id: 'ESSENCE', name: 'По сути', pair: 'ESSENCE'},
        {id: 'ASSOCIATIVE', name: 'Ассоциация', pair: 'ASSOCIATIVE'},
        {id: 'CAUSE', name: 'Причина', pair: 'EFFECT'},
        {id: 'EFFECT', name: 'Следствие', pair: 'CAUSE'},
        {id: 'PROBLEM', name: 'Проблема', pair: 'SOLUTION'},
        {id: 'SOLUTION', name: 'Решение', pair: 'PROBLEM'},
        {id: 'TRUE', name: 'Опровержение', pair: 'FALSE'},
        {id: 'FALSE', name: 'Факт', pair: 'TRUE'},
        {id: 'FROM', name: 'Факт', pair: 'TO'},
        {id: 'TO', name: 'Подтверждение', pair: 'FROM'},
      ]
    },
  },
  methods: {
    itemType (index) {
      return this.itemTypes.find(i => i.id === this.joint.vertices[index])
    }
  }
}
</script>
