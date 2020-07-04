<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '400px', borderRadius: '10px', overflow: 'hidden',
  }`).row.full-width.b-80
  //- set first item
  q-btn(
    v-if="node.items.length === 0"
    @click="$emit('itemFind')"
    flat color="green" icon="add"
    size="xl"
    :style=`{
      position: 'absolute', zIndex: 900,
    }`
    ).fit
  //- list pip
  list-pip(
    v-if="node.items.length > 0"
    :items="node.items")
    template(v-slot:item=`{item,itemIsFirst,itemIsLast,itemIndex,itemActive,itemNexting,next,prev,started,ended}`)
      div(:style=`{position: 'relative'}`).row.fit
        div(
          v-if="!itemActive"
          :style=`{position: 'absolute', zIndex: 999, borderRadius: '10px', overflow: 'hidden', opacity: 0.2}` @click="next()").row.fit.cursor-pointer.bg-green
        //- name
        q-btn(
          v-if="itemActive && item.name.length > 0"
          flat color="white" no-caps
          :style=`{
            position: 'absolute', zIndex: 999, top: '8px', left: '8px',
            background: 'rgba(0,0,0,0.5)',
          }`
          ) {{ item.name }}
        //- tools
        div(
          v-if="itemActive"
          :style=`{position: 'absolute', zIndex: 999, top: 'calc(50% - 70px)', right: 0,width: '40px',}`).row.justify-center
          q-btn(
            @click="$emit('itemDelete', itemIndex)"
            round flat dense color="grey-5" icon="delete_outline").full-width
          q-btn(
            @click="$emit('itemEdit', item)"
            color="green" icon="edit").full-width.q-py-md
          q-btn(
            @click="$emit('itemMove')"
            round flat dense color="grey-5" icon="sort"
            :style=`{transform: 'scaleX(-1)'}`
            ).full-width
        //- editor
        ws-composition-editor(
          :sid="`wce-${itemIndex}`"
          :value="item"
          :options=`{
            isPreview: true,
            mode: 'player',
            mini: !itemActive,
            active: itemActive,
          }`
          :style=`{
            height: '100%',
          }`)
  //- set next item
  q-btn(
    v-if="false && node.items.length > 0"
    @click="$emit('itemFind')"
    flat color="green" icon="add"
    :style=`{
      position: 'absolute', zIndex: 1000, right: 0, bottom: 0, width: '25%', height: '25%',
      borderRadius: '10px',
    }`).b-90
</template>

<script>
export default {
  name: 'editItemsPip',
  components: {},
  props: ['node'],
  data () {
    return {
    }
  },
}
</script>
