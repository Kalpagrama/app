<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width
  //- header
  div(
    :class="classes"
    :style=`{height: '40px'}`
    ).row.full-width.items-center.content-center.q-px-sm
    q-icon(
      v-if="item && item.readOnly"
      name="lock" size="16px" color="grey-9"
      :style=`{order: lockOrder}`)
  //- body
  div(
    :style=`{
      position: 'relative',
      borderRadius: '10px', overflow: 'hidden',
      height: 0, paddingBottom: '100%',
    }`
    ).row.full-width.b-40
    //- node item
    div(
      v-if="item && item.body && item.body.type === 'NODE'"
      :style=`{
        position: 'absolute', zIndex: 100,
      }`
      ).column.fit.items-start.content-start.bg-black
      .col.full-width
        node-items(
          :previewUrl="item.body.items[0].thumbUrl"
          :previewName="item.body.name" :items="item.body.items"
          :isActive="true" :isVisible="true")
      .row.full-width.justify-center.q-pa-sm
        small.text-white {{ item.body.name }}
    //- content item
    //- IMAGE
    div(
      v-if="item && item.body && item.body.type === 'IMAGE'"
      :style=`{
        position: 'absolute', zIndex: 100,
      }`
      ).row.fit.items-start.content-start.bg-black
      img(
        :src="item.body.url"
        :style=`{
          objectFit: item.cover ? 'cover' : 'contain'
        }`
        ).fit
    //- VIDEO
    //- sphere item
    //- user item
    //- joint item?
  //- footer
  div(
    :class="classes"
    :style=`{height: '40px'}`).row.full-width
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      q-btn(
        v-if="item && typesShow"
        flat dense color="grey-6" no-caps)
        q-icon(name="keyboard_arrow_down" color="green")
        span.text-white.text-bold {{ types.find(i => i.id === item.type).name }}
        q-menu(dark)
          div(:style=`{width: '100px'}`).row
            q-btn(
              @click="item.type = t.id"
              v-for="(t,ti) in types" :key="t.id"
              v-if="t.id !== item.type"
              flat dense no-caps color='grey-2').full-width {{ t.name }}
</template>

<script>
export default {
  name: 'linkCreate_item',
  props: ['item', 'types', 'typesShow', 'classes'],
  components: {
    nodeItems: () => import('components/node_lite/node_items.vue')
  },
  data () {
    return {
    }
  },
  watch: {
    item: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('item TO', to)
      }
    }
  }
}
</script>
