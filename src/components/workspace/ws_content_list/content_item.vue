<template lang="pug">
q-expansion-item(
  @before-show="isOpened = true"
  @after-hide="isOpened = false"
  :label="contentName"
  color="white" dark
  :dense="false"
  :group="contentIndex"
  :style=`{
    borderRadius: '10px',
    overflow: 'hidden'
  }`
  ).full-width.b-70.q-mb-xs
  div(
    v-if="isOpened"
    :style=`{height: '330px'}`).column.full-width
    //- header: actions for workspace
    div(
      v-if="ctx === 'workspace'"
      ).row.full-width.q-pa-sm
      q-btn(no-caps push color="green" @click="$emit('choose')") Edit content
      .col
      q-btn(no-caps flat color="red" @click="$emit('delete')").b-80 Delete
    div(
      v-if="ctx === 'nodeEditor'"
      ).row.full-width.q-pa-sm
      q-btn(no-caps flat color="white").b-80 Take only content
      .col
      q-btn(no-caps flat color="white").b-80 Take all layers
    //- header: find layer
    div().row.full-width.q-px-sm
      q-input(
        v-model="searchString" autofocus
        filled dark dense color="grey-2" placeholder="Find layer"
        :style=`{}`).full-width.b-90
    //- body
    .col.full-width.scroll
      .row.full-width.items-start.content-start.q-pa-sm
        layer-item(
          v-for="(l,li) in contentLayers" :key="li"
          :ctx="ctx" :content="content" :contentIndex="contentIndex"
          :layer="l" :layerIndex="li"
          @choose="$emit('layerChoose', [content, li])"
          @preview="$emit('layerPreview', [content, li])")
</template>

<script>
import layerItem from './layer_item'

export default {
  name: 'contentItem',
  props: ['ctx', 'content', 'contentIndex'],
  components: {layerItem},
  data () {
    return {
      isOpened: false,
      searchString: ''
    }
  },
  computed: {
    contentName () {
      if (this.$q.screen.xs) {
        return this.content.name.slice(0, 40)
      }
      else {
        return this.content.name
      }
    },
    contentLayers () {
      return this.content.layers.filter(l => {
        if (l.spheres.length > 0) {
          if (this.searchString.length > 0) {
            let nameRegExp = new RegExp(this.searchString, 'i')
            return nameRegExp.test(l.spheres[0].name)
          }
          else return true
        }
        else {
          return false
        }
      })
    }
  }
}
</script>
