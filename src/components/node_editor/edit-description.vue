<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: 800+'px'}`).row.full-width
    div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      q-input(
        :value="value" @input="$emit('input', $event)"
        filled dark dense type="textarea" autogrow
        placeholder="Description, #spheres, @mentions"
        color="grey-8"
        :style=`{
          background: 'rgb(35,35,35)'
        }`
        ).full-width
</template>

<script>
export default {
  name: 'editDescription',
  props: ['value'],
  data () {
    return {
      description: '',
    }
  }
}
</script>
