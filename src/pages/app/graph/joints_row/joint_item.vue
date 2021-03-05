<template lang="pug">
div(
  :class=`{
    //- 'bg-green-10': itemActive,
  }`
  :style=`{
    position: 'relative',
    background: itemActive ? 'rgb(33,33,33)' : 'none',
    //- background: itemActive ? 'rgba(76,175,80,0.1)' : 'none',
    borderRadius: itemIndependent ? '10px 10px 0px 0px' : '0px 0px 10px 10px',
  }`
  ).row.full-width.items-start.content-start.q-pt-sm.q-px-sm
  slot
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="itemActive && !itemIndependent"
      :style=`{
        position: 'absolute', top: '0px', left: '0px', zIndex: 100,
        //- maxWidth: 'calc(100% - 16px)',
        pointerEvents: 'none',
        background: itemActive ? 'rgb(33,33,33)' : 'none',
        borderRadius: itemIndependent ? '10px 10px 0px 0px' : '0px 0px 10px 10px',
        //- borderLeft: '1px solid rgb(76,175,80)',
        //- borderBottom: '1px solid rgb(76,175,80)',
        //- borderRight: '1px solid rgb(76,175,80)',
        //- borderRadius: '0px 0px 10px 10px',
      }`
      ).row.fit
  //- vertices
  div(
    v-if="joint && rowActive"
    :style=`{height: '70px'}`
    ).row.full-width
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="itemActiveLocal"
        :style=`{
          position: 'relative',
        }`
        ).row.fit
        //- indicator line
        //- div(
          :style=`{
            position: 'absolute', zIndex: 1, top: '4px', left: '22px',
            width: '2px',
            borderRadius: '1px',
            height: 'calc(100% - 8px)',
          }`
          ).row.bg-green
        //- essence
        div(
          v-if="joint.vertices[0] === 'ESSENCE'"
          :style=`{
            zIndex: 100,
            textAlign: 'center',
          }`
          ).row.fit.items-center.contnet-center.justify-center
          span.text-white.text-bold {{ joint.name }}
        //- associative
        div(
          v-if="joint.vertices[0] === 'ASSOCIATIVE'"
          :style=`{
            zIndex: 100,
            textAlign: 'center',
          }`
          ).row.fit.items-center.contnet-center.justify-center
          span.text-white.text-bold Ассоциация
        //- all the other vertex types
        div(
          v-else
          :style=`{
            zIndex: 100,
          }`
          ).row.fit.items-center.content-center.justify-center
          .row.full-width.justify-center
            span.text-white.text-bold {{ $nodeItemType(joint.vertices[itemIndex === 0 ? 1 : 0]).name }}
          .row.full-width.justify-center
            span.text-white.text-bold {{ $nodeItemType(joint.vertices[itemIndex]).name }}
  //- node
  node-feed(
    v-if="item.type === 'NODE'"
    :node="item"
    :isActive="itemActive"
    :isVisible="itemActive"
    :showActions="false"
    :showHeader="false"
    :style=`{
      zIndex: 200,
    }`)
  //- content
  //- sphere
  //- user
  //- fallback preview
  div(
    v-else-if="['VIDEO', 'IMAGE', 'BOOK'].includes(item.type)"
    :style=`{
      position: 'relative',
      zIndex: 200,
    }`
    ).row.full-width
    router-link(
      :to="'/content/'+item.oid"
      :style=`{
        position: 'absolute', zIndex: 200,
        bottom: '0px',
        overflow: 'hidden',
      }`
      ).row.full-width.items-center.content-center.justify-center.no-wrap.q-pa-sm
      q-icon(name="select_all" color="white" size="30px")
      .col
        span.text-white.text-bold {{ item.name }}
    img(
      :src="item.thumbUrl"
      :style=`{
        borderRadius: '10px',
        //- maxHeight: '500px',
      }`
      ).full-width
  //- other
  div(
    v-else
    :style=`{
      zIndex: 200,
    }`
    ).row.full-width.items-start.content-start
    img(
      :src="item.thumbUrl"
      :style=`{
        borderRadius: '10px',
        maxHeight: '500px',
      }`
      ).full-width
  //- actions
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="joint && itemActive"
      :style=`{
        position: 'relative',
        zIndex: 200,
      }`
      ).row.full-width.q-py-md
      //- indicator line
      //- transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        div(
          v-if="itemActiveLocal"
          :style=`{
            position: 'absolute', zIndex: 1, top: '0px', left: '22px',
            width: '2px',
            height: '16px',
          }`
          ).row.bg-green
      node-feed(
        :node="joint"
        :isActive="false"
        :isVisible="false"
        :showName="false"
        :showItems="false"
        :showHeader="false"
        :style=`{
          zIndex: 100,
        }`)
      //- div(:style=`{position: 'relative',zIndex: 200,}`).row.full-width
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          div(
            v-if="itemActiveLocal"
            :style=`{
              position: 'absolute', zIndex: 101, top: '-66px', left: '22px',
              width: '2px',
              height: '120px',
            }`
            ).row.bg-green
</template>

<script>
export default {
  name: 'jointItemsRow_item',
  props: ['joint', 'item', 'itemIndex', 'itemActive', 'itemIndependent', 'rowActive'],
  data () {
    return {
      itemActiveLocal: false,
    }
  },
  watch: {
    itemActive: {
      handler (to, from) {
        this.$log('itemActive', to)
        if (to) {
          this.$wait(200).then(() => {
            this.itemActiveLocal = true
          })
        }
        else {
          this.itemActiveLocal = false
        }
      }
    }
  }
}
</script>
