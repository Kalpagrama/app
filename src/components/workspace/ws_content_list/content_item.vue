<template lang="pug">
q-expansion-item(
  @click="$emit('choose')"
  expand-icon-toggle
  :label="contentName"
  color="white" dark
  :group="contentIndex"
  :style=`{
    borderRadius: '10px',
    overflow: 'hidden'
  }`
  ).full-width.b-70.q-mb-sm
  div(
    v-if="true"
    :style=`{height: '500px'}`).column.full-width.q-pt-sm
    //- header
    div().row.full-width.q-px-sm
      input(
        v-model="searchString" autofocus
        placeholder="Search layer"
        :style=`{color: 'rgb(140,140,140)'}`).full-width.k-input.b-90
    //- body
    .col.full-width.scroll
      .row.full-width.items-start.content-start.q-pa-sm
        layer-item(
          v-for="(l,li) in contentLayers" :key="li"
          :content="content" :contentIndex="contentIndex"
          :layer="l" :layerIndex="li"
          @choose="$emit('layerChoose', [content, li])"
          @preview="$emit('layerPreview', [content, li])")
</template>

<script>
import layerItem from './layer_item'

export default {
  name: 'contentItem',
  props: ['content', 'contentIndex'],
  components: {layerItem},
  data () {
    return {
      searchString: ''
    }
  },
  computed: {
    contentName () {
      return this.content.name
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
