<style lang="sass" scoped>
.feed-item
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start
  slot(name="tint" :item="item")
  //- action
  //- q-btn(
    round flat dense color="white" icon="more_vert"
    :style=`{position: 'absolute', top: '0px', right: '0px', zIndex: 100}`)
    q-popup-proxy(
      v-model="actionOpened"
      anchor="top right" self="top right"
      position="bottom"
      maximized dark
      @hide="actionOpened = false")
      div(
        :class=`{
          'b-30': $q.screen.lt.md
        }`
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
          minWidth: '300px',
        }`).row.full-width.items-start.content-start
        //- header
        div(
          v-if="$q.screen.lt.md"
          :style=`{
            textAlign: 'center'
          }`).row.full-width.justify-center.q-py-md
          span.text-white {{ item.name }}
        //- actions
        .row.full-width.items-start.content-start
          q-btn(
            v-for="(a,akey) in actions" :key="akey"
            @click="a.cb()"
            flat no-caps
            :color="a.color || 'white'"
            :style=`{
              height: '50px',
              ...a.styles,
            }`
            ).row.full-width {{ a.name }}
  //- default
  div(
    :style=`{
      height: '80px',
      borderRadius: '10px',
      background: 'rgb(40,40,40)',
      zIndex: 10,
      position: 'relative',
    }`
    ).row.full-width.items-start.content-start.cursor-pointer.feed-item
    //- left side
    div(
      :style=`{
        width: '80px', height: '80px',
        borderRadius: '10px',
      }`
      ).row.items-center.content-center.justify-center
      img(
        v-if="item.type !== 'SPHERE'"
        draggable="false"
        :src="item.thumbUrl"
        :style=`{
          zIndex: 101,
          width: '80px', height: '80px',
          borderRadius: '10px',
          objectFit: 'cover',
        }`)
      q-icon(
        v-else
        name="blur_on" size="50px" color="white")
    //- right side
    .col.full-height
      div(
        :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`
        ).row.fit.items-center.content-center.q-pa-sm
        span(:style=`{zIndex: 102}`).text-white {{ item.name.slice(0, 50) }}
        .row.full-width
          q-icon(
            :name="itemIcon(item)" size="90px"
            :style=`{
              color: 'rgb(45,45,45)',
              position: 'absolute', zIndex: 100, top: '-5px', right: '-30px',
            }`)
  .row.full-width
    slot(name="default" :item="item")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'kalpaFinder_item',
  props: ['item'],
  data () {
    return {
    }
  },
  computed: {
    actions () {
      return {
        // publish: {
        //   name: 'Опубликовать',
        //   color: 'green',
        //   styles: {
        //     fontWeight: 'bold'
        //   },
        //   cb: async () => {
        //     this.$log('nodePublish', this.node)
        //     this.$router.push('/workspace/node/' + this.node.id)
        //   }
        // },
        delete: {
          name: 'Удалить',
          color: 'red',
          styles: {},
          cb: async () => {
            this.$log('actionDelete', this.item)
            this.$emit('delete')
          }
        }
      }
    }
  },
  methods: {
    itemIcon (item) {
      let iconMap = {
        SPHERE: 'blur_on',
        VIDEO: 'select_all',
        IMAGE: 'select_all',
        NODE: 'filter_tilt_shift',
        USER: 'face',
        JOINT: 'link'
      }
      if (item.wsItemType) {
        if (item.wsItemType === 'WS_BOOKMARK') return iconMap[item.type]
        else if (item.wsItemType === 'WS_NODE') return 'filter_tilt_shift'
        else return 'blur_on'
      }
      else {
        return iconMap[item.type]
      }
    }
  }
}
</script>
