<template lang="pug">
.row.full-width.items-start.content-start.br
  div()
  .col
    .row.full-width
      //- author and timestamp
      .row.full-width
      //- body
      .row.full-width
        small.text-white {{ comment }}
      //- TODO: actions
      .row.full-width
</template>

<script>
export default {
  name: 'commentItem',
  props: ['comment'],
  data () {
    return {
    }
  }
}
</script>
