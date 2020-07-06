<template lang="pug">
.row.full-width.justify-center.q-py-md
  div(
    :style=`{maxWidth: '500px'}`).row.full-width.items-start.content-start
    div(:style=`{borderRadius: '10px', overflow: 'hidden',}`).row.full-width.b-70
      //- edit layout
      div(
        :style=`{
          position: 'relative',
          height: '400px', borderRadius: '10px', overflow: 'hidden',
        }`).row.full-width.b-60
        q-btn(
          flat color="green" icon="add"
          size="xl"
          :style=`{
            position: 'absolute', zIndex: 900,
          }`
          ).fit
        q-btn(
          v-if="node.items.length > 0"
          flat color="green" icon="add"
          :style=`{
            position: 'absolute', zIndex: 1000, right: 0, bottom: 0, width: '25%', height: '25%',
            borderRadius: '10px',
          }`).b-70
      //- edit essence
      div(:style=`{}`).row.full-width
        q-input(
          v-model="node.name"
          filled dark color="white"
          :label="$t('What the essence', 'В чем суть?')").full-width
    div(v-if="true && node.items.length > 0").row.full-width.q-py-xs

    div(v-if="true && node.items.length > 0").row.full-width
      //- span(v-for="s in 5" :key="s").row.full-width.q-pa-sm.b-60.q-mr-sm sphere: {{s}}
      q-btn(flat color="green" icon="add" no-caps).full-width Добавить сферу
    //- edit category & spheres
    //- publush, layout, add item, delete item, edit item
    //- delete node,
</template>

<script>

export default {
  name: 'editBuild',
  props: ['node'],
  data () {
    return {

    }
  },
  computed: {

  },

}
</script>
