<template lang="pug">
.row.full-width.justify-center.q-px-sm
  kalpa-connect(
    :oid="node.oid"
    :style=`{
      maxWidth: '600px',
    }`
    )
</template>

<script>
export default {
  name: 'viewConnect',
  props: ['node'],
}
</script>
