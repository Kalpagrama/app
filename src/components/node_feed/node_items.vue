<template lang="pug">
//- items
div(
  :style=`{position: 'relative', padding: '11px'}`).row.full-width.items-end.content-end
  div(
    v-for="(item, ii) in node.items" :key="ii"
    :style=`{
    }`
    ).col-6
    div(
      :style=`{
        position: 'relative',
        transform: ii === 0 ? 'perspective(600px) rotateY(10deg)' : 'perspective(600px) rotateY(-10deg)',
      }`
      ).row.full-width
      div(
        :style=`{
          position: 'relative',
          paddingTop: '100%',
        }`).row.full-width
        div(
          v-if="itemActive !== ii"
          @click="itemActive = ii"
          :style=`{
            position: 'absolute', zIndex: 110, top: 0,
          }`
          ).row.fit
        div(
          :style=`{
            position: 'absolute', zIndex: 100, top: 0,
          }`
          ).row.fit
          composition-player(
            v-if="item.type === 'NODE'"
            :composition="item.items[0]"
            :isActive="isActive && itemActive === ii"
            :isVisible="isVisible"
            :options=`{
              height: '100%', objectFit: 'cover', loop: true,
              showContentExplorer: true,
              showContentMeta: false,
            }`)
            //- template(v-slot:lefttop)
              q-btn(
                v-if="isActive && itemActive === ii"
                @click="$router.push('/node/'+item.oid)"
                round flat color="white" icon="filter_tilt_shift"
                :style=`{
                  position: 'absolute', left: 0, top: 0, zIndex: 1000,
                  background: 'rgba(0,0,0,0.15)'
                }`)
          //- fallback image
          img(
            v-else
            :src="item.thumbUrl"
            :style=`{
              borderRadius: '10px',
              objectFit: 'cover',
              borderRadius: '10px',
            }`
            ).fit.b-30
          //- tint
          div(
            :style=`{
              position: 'absolute', bottom: '-2px', zIndex: 2000, transform: 'translate3d(0,0,0)', height: '40%',
              //- background: 'rgb(0,0,0)',
              background: 'linear-gradient(0deg, rgba(15,15,15,0.9) 30%, rgba(0,0,0,0) 100%)',
              borderRadius: '0 0 10px 10px', overflow: 'hidden', pointerEvents: 'none',
            }`).row.full-width
          //- name
          div(
            @click="$router.push('/node/'+item.oid)"
            :style=`{
              position: 'absolute', zIndex: 2010, bottom: 0
            }`
            ).row.full-width.q-pa-sm
            .row.full-width.scroll
              div(
                :style=`{
                  maxHeight: '40px',
                }`
                ).row.no-wrap
                span(:style=`{whiteSpace: 'nowrap'}`).text-white.text-bold {{ item.name }}
      //- item.type
      div(
        v-if="node.vertices[ii] && node.vertices[ii] !== 'ASSOCIATIVE'"
        ).row.full-width.justify-center.q-pt-xs
        small.text-white {{ itemType(ii).name }}
  //- link btn
  //- TODO: btn color
  q-btn(
    round flat color="green" icon="link" size="lg"
    :style=`{position: 'absolute', zIndex: 100, bottom: 'calc(50% - 30.5px)', left: 'calc(50% - 30.5px)',}`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import compositionPlayer from 'components/composition/composition_player/index.vue'

export default {
  name: 'nodeFeed_items',
  props: ['node', 'isActive', 'isVisible'],
  components: {
    compositionPlayer
  },
  data () {
    return {
      itemActive: 0,
    }
  },
  computed: {
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
      return this.itemTypes.find(i => i.id === this.node.vertices[index])
    }
  }
}
</script>
