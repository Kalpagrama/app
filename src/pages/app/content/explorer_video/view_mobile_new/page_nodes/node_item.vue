<template lang="pug">
node-feed(
  :node="node" :isActive="isActive" :isVisible="isVisible"
  :showName="isOpened")
  template(v-slot:items v-if="!isOpened && node.items.length === 1")
    .row.full-width.items-start.content-start.q-px-sm
      div(
        :style=`{
          position: 'relative',
          borderRadius: '10px',
        }`).row.full-width.b-40.q-mb-sm
        //- tint inActive
        //- div(
          v-if="!isFocused"
          @click="$emit('isFocused', [item, true])"
          :style=`{
            position: 'absolute', zIndex: 100,
          }`
          ).row.fit
        //- currentTime
        //- div(
          v-if="isFocused"
          :style=`{
            position: 'absolute', zIndex: 200,
            borderRadius: '10px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.2)',
          }`
          ).row.fit
          div(
            :style=`{
              position: 'absolute', zIndex: 210, left: '0px',
              width: (player.currentTime-start)/duration*100+'%',
              background: 'rgba(255,255,255,0.5)',
            }`
            ).row.full-height
        //- currentTime stop
        //- q-btn(
          v-if="isFocused"
          @click="$emit('isFocused', [item, false])"
          round flat color="white" icon="clear" dense
          :style=`{
            position: 'absolute', zIndex: 220, top: '-38px',
            left: 'calc(50% - 20px)',
          }`)
        //- name
        //- .col.br
        img(
            :src="item.thumbUrl"
            :style=`{
              height: '60px',
            }`
            )
        .col
          .row.full-width.justify-center
            span(
              @click="isOpened = true"
              :style=`{fontSize: '30px', marginRight: '100px'}`).text-white.text-bold.q-mt-sm {{ node.name || node.vertices }}
        //- preview
        //- div(:style=`{order: -1}`).col
          .row.full-width.items-start.content-start.justify-end
        //- img(
          v-if="item"
          :src="item.thumbUrl"
          :style=`{
            order: -1,
            height: '220px',
            borderRadius: '10px',
          }`).b-30
</template>

<script>
export default {
  name: 'pageNodes_item',
  props: ['node', 'player', 'contentKalpa', 'isFocused', 'isActive', 'isVisible'],
  components: {
  },
  data () {
    return {
      isOpened: false,
    }
  },
  computed: {
    itemRight () {
      return this.node.items.find(i => {
        if (i.layers) {
          return i.layers[0].contentOid !== this.contentKalpa.oid
        }
        else {
          return true
        }
      })
    },
    item () {
      return this.node.items.find(i => {
        if (i.layers) {
          return i.layers[0].contentOid === this.contentKalpa.oid
        }
        else {
          return true
        }
      })
    },
    start () {
      return this.item.layers[0].figuresAbsolute[0].t
    },
    end () {
      return this.item.layers[0].figuresAbsolute[1].t
    },
    duration () {
      return this.end - this.start
    }
  }
}
</script>
