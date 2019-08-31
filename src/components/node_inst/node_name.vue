<template lang="pug">
div(:style=`{minHeight: '40px'}`).row.full-width.items-center.justify-center.q-px-sm
  router-link(:to="`/app/node/${node.oid}`")
    span.text-bold {{node.name}}
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
