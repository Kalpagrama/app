<template lang="pug">
.row.full-width.justify-center
  kalpa-connect(
    :oid="node.oid"
    :style=`{
      maxWidth: '500px',
    }`
    )
</template>

<script>
export default {
  name: 'viewConnect',
  props: ['node'],
}
</script>
