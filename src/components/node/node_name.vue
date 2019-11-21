<template lang="pug">
div(:style=`{minHeight: '40px'}`).row.full-width.items-center.justify-center.text-center.q-px-sm.q-py-md
  router-link(:to="`/app/node/${node.oid}`")
    span.text-bold {{ node.name || 'В чем суть?' }}
</template>

<script>
export default {
  name: 'nodeName',
  props: ['node', 'nodeFull', 'active'],
  data () {
    return {
    }
  }
}
</script>
