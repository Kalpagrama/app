<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.q-px-sm.q-pt-sm.q-pb-xl
  //- link btn
  q-btn(
    flat color="green" icon="fas fa-link" size="lg"
    :to="`/graph/${node.items[0].oid}?oid=${node.oid}`"
    :style=`{
      position: 'absolute', zIndex: 1000,
      left: 'calc(50% - 30px)',
      top: 'calc(50% - 56px)',
      width: '60px', height: '60px',
    }`)
  //- items
  div(
    v-for="(i,ii) in node.items" :key="i"
    ).col-6
    div(
      :style=`{
        position: 'relative', paddingBottom: 'calc(100% + 0px)',
        perspective: '1000px',
      }`).row.full-width
      div(
        :class=`{
        }`
        :style=`{
          position: 'absolute', zIndex: 1, top: '0px', overflow: 'visible',
          transform: ii === 0 ? 'rotateY(10deg)' : 'rotateY(-10deg)',
        }`).row.fit
        //- ===
        //- composition
        composition(
          v-if="i.__typename === 'Composition'"
          :composition="i"
          :isActive="isActive"
          :isVisible="isVisible"
          :nodeOid="null"
          :isSquare="true")
        //- ===
        //- node
        div(
          v-else-if="i.type === 'NODE'"
          :style=`{
            position: 'relative', overflow: 'visible',
          }`).row.full-width
          div(:style=`{position: 'absolute', zIndex: 300, left: '0px', bottom: '-28px',}`).row.full-width
            router-link(
              :to="'/node/'+i.oid"
              :style=`{height: '28px', paddingLeft: '14px',}`).row.full-width.items-center.content-center.justify-center
              //- q-icon(name="adjust" color="white" size="14px").q-mr-xs
              small.text-white {{ i.name }}
          composition(
            :composition="i.items[0]"
            :isActive="isActive"
            :isVisible="isVisible"
            :nodeOid="i.items[0].oid"
            :isSquare="true")
        //- media content
        //- IMAGE, VIDEO, BOOK, AUDIO
        div(
          v-else-if="['IMAGE', 'VIDEO', 'BOOK', 'AUDIO'].includes(i.type)"
          :style=`{
            position: 'relative', overflow: 'visible',
          }`).row.fit
          div(:style=`{position: 'absolute', zIndex: 300, left: '0px', bottom: '0px',}`).row.full-width
            router-link(
              :to="'/content/'+i.oid"
              :style=`{
                height: '28px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.5)',
              }`
              ).row.full-width.items-center.content-center.q-px-md
              q-icon(name="select_all" color="white" size="14px").q-mr-xs
              small.text-white {{$t('Explore content')}}
              .col
              small.text-white {{i.countStat.countNodes + i.countStat.countJoints}}
              q-icon(name="whatshot" color="white" size="14px").q-ml-xs
          img(
            draggable="false"
            :src="iUrl(i)"
            :style=`{
              objectFit: 'cover',
              borderRadius: '10px',
            }`
            ).fit.b-50
        //- user/sphere...
        //- ===
        //- other
        img(
          v-else
          :src="iUrl(i)"
          :style=`{
            objectFit: 'cover',
            borderRadius: '10px',
            //- transform: 'rotateY(2deg)',
          }`
          ).fit
</template>

<script>
import { ContentApi } from 'src/api/content'

export default {
  name: 'nodeItems',
  props: ['node', 'isActive', 'isVisible'],
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    iUrl (item) {
      return ContentApi.urlSelect(item) || item.thumbUrl
    }
  }
}
</script>
