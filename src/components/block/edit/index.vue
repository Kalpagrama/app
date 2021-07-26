<style lang="sass">
.sphere-item
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    // height: $q.screen.height + 'px',
    ...styles,
  }`
  ).row.full-width.items-start.content-start
  div(
    :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: borderRadius,
      ...styles,
    }`).row.full-width.items-start.content-start
    slot(name="wrapper-inside")
    //graph
    div().row.full-width.full-height.br
      q-btn(
        label="graph"
        :style=`{height: graphHeight + 'px',}`
      ).row.full-width.full-heigh
    //- name
    div(ref="nameRef" :style=`{height: '60px'}`).row.full-width
      q-input(
        v-model="block.name"
        borderless dark
        ref="nameInput"
        type="textarea" autogrow
      :placeholder="$t('What do you see?')"
        :autofocus="true"
        :input-style=`{
          paddingTop: '16px',
          paddingBottom: '10px',
          paddingLeft: '20px',
          paddingRight: '10px',
          //- textAlign: 'center',
          fontWeight: 'bold',
          fontSize: fontSize+'px',
          lineHeight: 1.3,
          minHeight: '60px',
        }`
      ).full-width
    // category and spheres
    div(ref="spheresRef").row.full-width.full-height.q-pt-sm
      edit-spheres(
        :node="block")
        template(v-slot:left)
          edit-category(
            :node="block"
            :class=`{
                br: !block.category && categoryError,
              }`
            :style=`{
                borderRadius: '10px',
              }`)
        template(v-slot:spheres-right)
          .div(v-if="false").row
            //- Delete from notes
            q-btn(
              outline no-caps color="red"
              :style=`{}`
              @click="cancel"
            ).q-mr-sm
              span {{$t('Cancel')}}
            //- Save to notes
            q-btn(
              outline no-caps color="white"
              :style=`{}`
            ).q-mr-sm
              span {{$t('Save as draft')}}
</template>

<script>

import editSpheres from 'src/pages/app/content/node_editor/edit_spheres.vue'
import editCategory from 'src/pages/app/content/node_editor/edit_category.vue'

export default {
  name: 'blockEdit',
  components: {
    editSpheres,
    editCategory
  },
  props: {
    block: {type: Object, required: true},
    styles: {type: Object},
    borderRadius: {type: String, default: '10px'},
    height: {type: Number, required: true}
  },
  data () {
    return {
      graphHeight: this.height
    }
  },
  computed: {
    fontSize () {
      let l = this.block.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    }
  },
  mounted () {
    // this.$log('mounted', this.node.name)
    this.graphHeight = this.height - this.$refs.spheresRef.clientHeight - this.$refs.nameRef.clientHeight
  }
}
</script>
