<style lang="sass">
.q-field--outlined .q-field__control
  border-radius: 10px !important
  border: none !important
</style>

<template lang="pug">
div(
  :style=`{
    borderRadius: '12px',
    border: nodeEditing ? '2px solid rgb(76,175,79)' : '2px solid rgba(40,40,40,0)',
    background: 'rgb(35,35,35)',
  }`
  ).row.full-width.items-start.content-start
  //- actions...
  div(:style=`{height: '60px', position: 'relative'}`).row.full-width.items-end.content-end
    //- pick
    q-btn(
      v-if="pick"
      @click="pick(node)"
      round flat color="red" dense no-caps
      :style=`{
        position: 'absolute', zIndex: 210,
        top: '0px', right: '0px',
      }`).q-px-sm.shaking
      span.text-bold Выбрать
    q-btn(flat dense color="grey-7" icon="edit" @click="$emit('edit')").q-mx-sm
    //- actions center
    div(:style=`{position: 'relative',}`).col.full-height
      div(:style=`{pointerEvents: 'none', paddingBottom: '6px'}`).row.fit.items-end.content-end.justify-between.q-px-sm
        span.text-grey-7 {{ $time(start) }}
        span.text-grey-7 {{ $time(duration) }}
        span.text-grey-7 {{ $time(end) }}
      composition-bar(
        v-if="nodeSelected"
        :composition="item" :player="player"
        :actionsPosition="'top'"
        :barStyles=`{
          background: 'rgba(50,50,50, 0.5)',
        }`
        :style=`{
          position: 'absolute', zIndex: 200,
          top: '0px',
          maxHeight: '22px',
        }`)
    q-btn(flat dense color="grey-7" icon="drag_indicator").q-mx-sm
      //- :breakpoint="1023"
      q-popup-proxy(
        anchor="bottom right" self="top right"
        position="bottom"
        maximized dark)
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
            span.text-white {{ node.name }}
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
  //- node.name editor...
  div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width
    q-input(
      v-model="node.name"
      :outlined="focused"
      :borderless="!focused"
      color="green"
      placeholder="В чем суть?"
      type="textarea" autogrow
      @focus="focused = true, $emit('select')"
      @blur="focused = false"
      :dark="focused"
      :input-style=`{
        color: 'white !important',
        textColor: 'white !important',
        //- background: 'rgb(45,45,45)'
      }`
      :style=`{
        color: 'white !important',
        textColor: 'white !important',
        //- background: 'rgb(45,45,45)',
        borderRadius: '10px',
        paddingLeft: focused ? '4px' : '16px'
      }`
      ).full-width
  //- spheres editor
  .row.full-width
    ws-sphere-editor(
      v-if="node"
      :item="node"
      :style=`{
        borderRadius: '10px',
        background: 'rgb(35,35,35)',
      }`)
</template>

<script>
import compositionBar from 'components/composition/composition_bar/index.vue'

export default {
  name: 'typeDraftsItem',
  inject: ['pick'],
  props: ['player', 'contentKalpa', 'contentBookmark', 'node', 'nodeIndex', 'nodeSelected', 'nodeEditing'],
  components: {compositionBar},
  data () {
    return {
      focused: false,
    }
  },
  computed: {
    start () {
      return this.node.items[0].layers[0].figuresAbsolute[0].t
    },
    end () {
      return this.item.layers[0].figuresAbsolute[1].t
    },
    duration () {
      return this.end - this.start
    },
    item () {
      return this.node.items[0]
    },
    actions () {
      return {
        publish: {
          name: 'Опубликовать',
          color: 'green',
          styles: {
            fontWeight: 'bold'
          },
          cb: async () => {
            this.$log('nodePublish', this.node)
            this.$router.push('/workspace/node/' + this.node.id)
          }
        },
        delete: {
          name: 'Удалить',
          color: 'red',
          styles: {},
          cb: async () => {
            this.$log('nodeDelete', this.node)
            await this.node.remove()
          }
        }
      }
    }
  }
}
</script>
