<template lang="pug">
q-layout(view="hHh Lpr lff" :style=`{zIndex: 4000, maxWidth: width+'px'}`).b-30
  q-header(reveal)
    .row.full-width.justify-center
      div(:style=`{maxWidth: '800px'}`).row.full-width.b-30
        //- div(:style=`{}`).row.full-width.items-center.content-center.q-pa-sm
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
          //- span(:style=`{fontSize: '18px'}`).text-white.text-bold Item finder
        //- .row.full-width.q-px-md
          div(:style=`{position: 'relative',borderRadius: '10px',overflow: 'hidden'}`).row.full-width
            q-input(
              v-model="searchString"
              placeholder="Find item"
              filled dark dense color="grey-6").full-width
        .row.full-width.q-px-sm
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
          .col
            .row.full-width
              q-tabs(
                v-model="type"
                no-caps active-color="white" align="left" switch-indicator
                ).full-width.text-grey-8
                q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
  q-page-container
    component(
      v-if="type"
      :is="`from-${type}`"
      @item="$emit('item', $event)")
</template>

<script>
import fromContent from './from_content.vue'
import fromSphere from './from_sphere.vue'
import fromFragment from './from_fragment.vue'

export default {
  name: 'wsNodeEditor_editItems_itemFinder',
  components: {fromContent, fromSphere, fromFragment},
  data () {
    return {
      type: null,
    }
  },
  computed: {
    types () {
      return [
        {id: 'content', name: 'by Content'},
        {id: 'sphere', name: 'by Sphere'},
        {id: 'fragment', name: 'Fragments'},
        // {id: 'draft', name: 'Drafts'},
        // {id: 'published', name: 'Published'},
      ]
    },
    width () {
      if (this.$q.screen.width < 800) return this.$q.screen.width
      else return 800
    },
  },
  async mounted () {
    this.$log('mounted')
    await this.$wait(1000)
    this.type = 'content'
  }
}
</script>
