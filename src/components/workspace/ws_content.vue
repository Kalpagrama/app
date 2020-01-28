<template lang="pug">
.row.fit.bg-black
  .col.full-height
    .row.fit.items-center.justify-center
      span.text-bold.text-green Some content
  div(
    v-if="false"
    :style=`{maxWidth: '500px', borderLeft: '1px solid #4caf50'}`
    ).column.fit
    div(
      :style=`{height: '60px'}`
      ).row.full-width.items-center.content-center.q-px-md
      span.text-bold.text-green Content meta
    .col.full-width.scroll
      .row.full-width.items-start.content-start
        div(
          v-for="(i,ii) in 100" :key="ii"
          :style=`{height: '60px'}`
          ).row.full-width.items-center.q-px-md.q-mb-small
          span.text-white item: {{ ii }}
</template>

<script>
export default {
  name: 'wsContent',
  props: [],
  data () {
    return {
    }
  }
}
</script>
