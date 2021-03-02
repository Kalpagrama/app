<template lang="pug">
div.row.full-width.items-start.content-start
  //- vertices
  div(
    v-if="joint"
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
        div(
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
    :showHeader="false")
  //- content
  //- sphere
  //- user
  //- fallback preview
  div(
    v-else
    ).row.full-width.items-start.content-start
    img(
      :src="item.thumbUrl"
      :style=`{
      }`
      ).full-width
  //- actions
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="joint && itemActiveLocal"
      :style=`{
        position: 'relative',
      }`
      ).row.full-width.q-py-md
      //- indicator line
      transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
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
  props: ['joint', 'item', 'itemIndex', 'itemActive'],
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
