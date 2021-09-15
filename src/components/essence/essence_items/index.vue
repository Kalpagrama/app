<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.q-px-sm.q-pt-sm.q-pb-xl
  //- link btn
  q-btn(
    flat color="green" icon="fas fa-link" size="lg"
    :to="`/cube/${node.items[0].oid}?oid=${node.oid}`"
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
      v-if="!!i"
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
          :isSquare="true"
          :options=`{
                loop: false,
                paused: data.compositionPlayBackState[ii]
              }`
          @playing="$set(data.compositionPlayBackState,ii,'playing'), $set(data.compositionPlayBackState, ii===0?1:0, 'paused')"
          @ended="$set(data.compositionPlayBackState,ii,'paused'), $set(data.compositionPlayBackState, ii===0?1:0, 'playing')")
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
            :itemState="data"
            :isActive="isActive"
            :isVisible="isVisible"
            :nodeOid="i.items[0].oid"
            :isSquare="true"
            :options=`{
                playBackState: data.compositionPlayBackState[ii]
              }`
            @ended="$set(data.compositionPlayBackState,ii,'paused'), $set(data.compositionPlayBackState, ii===0?1:0, 'playing')")
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

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
<script>
import { ContentApi } from 'src/api/content'
import { assert } from 'src/system/common/utils'
export default {
  name: 'essenceItems',
  props: ['node', 'isActive', 'isVisible', 'itemState'],
  computed: {
    data() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      if (!this.itemState) this.itemState = {}
      let key = this.$options.name
      if (!this.itemState[key]) {
        this.$set(this.itemState, key, {
          compositionPlayBackState: ['playing', 'paused']
        })
      }
      return this.itemState[key]
    }
  },
  methods: {
    iUrl (item) {
      return ContentApi.urlSelect(item) || item.thumbUrl
    }
  },
  created () {
    // this.$log('created', JSON.parse(JSON.stringify(this.node)))
    // this.$log('created2', this.node)
  }
}
</script>
