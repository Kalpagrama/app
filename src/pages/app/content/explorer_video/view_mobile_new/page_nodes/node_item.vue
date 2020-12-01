<template lang="pug">
node-feed(
  :node="node" :isActive="false" :isVisible="false"
  :showName="false")
  template(v-slot:items)
    .row.full-width.items-start.content-start.q-px-sm
      div(
        :style=`{
          position: 'relative',
          borderRadius: '10px',
        }`).row.full-width.b-40.q-mb-sm
        //- tint inActive
        div(
          v-if="!isFocused"
          @click="$emit('isFocused', true)"
          :style=`{
            position: 'absolute', zIndex: 100,
          }`
          ).row.fit
        //- currentTime
        div(
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
        q-btn(
          v-if="isFocused"
          @click="$emit('isFocused', false)"
          round flat color="white" icon="clear" dense
          :style=`{
            position: 'absolute', zIndex: 220, top: '-38px',
            left: 'calc(50% - 20px)',
          }`)
        //- name
        .col.q-pa-sm
          span.text-white.text-bold {{ node.name || node.vertices }}
        //- preview
        .col
          .row.full-width.items-start.content-start.justify-end
            img(
              v-if="itemRight"
              :src="itemRight.thumbUrl"
              :style=`{
                height: '60px',
                borderRadius: '10px',
              }`).b-30
</template>

<script>
export default {
  name: 'pageNodes_item',
  props: ['node', 'player', 'contentKalpa', 'isFocused'],
  components: {
  },
  data () {
    return {
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
