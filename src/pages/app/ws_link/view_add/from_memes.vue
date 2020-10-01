<template lang="pug">
.row.full-width.items-start.content-start
  //- header
  div(
    :style=`{position: 'sticky', zIndex: 1000, top: '0px',}`
    ).row.full-width.q-px-sm
    div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      q-input(
        v-model="searchString"
        filled dark dense
        placeholder="Search Meme"
        :debounce="600"
        ).full-width
  //- items
  .row.full-width.q-pt-sm
    .row.full-width.justify-center.q-pa-md
      span.text-white no memes :(
</template>

<script>
export default {
  name: 'viewAdd_fromMemes',
  data () {
    return {
      searchString: ''
    }
  }
}
</script>
