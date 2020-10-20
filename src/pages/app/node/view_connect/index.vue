<template lang="pug">
.row.full-width.justify-center.q-px-sm
  //- kalpa-connect(
    :oid="node.oid"
    :style=`{
      maxWidth: '600px',
    }`)
    template(v-slot:default)
      div().row.full-width
        img(
          draggable="false"
          :src="node.thumbUrl"
          :style=`{
            height: '100px',
            borderRadius: '10px', overflow: 'hidden',
          }`)
        .col.full-height
          .row.fit.items-center.content-center.q-px-md
            span.text-white {{ node.name }}
</template>

<script>
export default {
  name: 'viewConnect',
  props: ['node'],
}
</script>
