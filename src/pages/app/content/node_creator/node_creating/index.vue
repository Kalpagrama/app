<template lang="pug">
.row.full-width.justify-center.q-pb-sm
  div(
    v-show="!isHidden"
    :style=`{
      maxWidth: '600px',
      borderRadius: '10px',
      background: 'rgba(30,30,30,0.5)',
      minHeight: '100px',
    }`
    ).row.full-width.items-center.content-center.justify-center.q-pa-sm
    .row.full-width.justify-center.q-py-sm
      span.text-white {{$t('Node is creating')}}
    q-spinner(size="50px" color="white")
    .row.full-width.justify-center.q-py-sm
      q-btn(
        @click="isHidden = true"
        flat color="white" no-caps)
        span {{$t('Continue in background')}}
</template>

<script>
export default {
  name: 'nodeCreating',
  props: ['player', 'contentKalpa', 'node'],
  data () {
    return {
      isHidden: false,
    }
  },
  watch: {
    'node.uploadStage': {
      deep: false,
      handler (to, from) {
        this.$logW('node TO', to)
        if (to === 'COMPLETE') {
          if (!this.isHidden) this.$emit('created')
          this.$q.notify({
            type: 'positive',
            message: 'Ядро создано 🎉',
            position: 'top',
            actions: [
              {
                label: 'Перейти',
                color: 'white',
                handler: () => {
                  this.$router.push(`/node/${this.node.oid}`)
                }
              }
            ]
          })
        }
      }
    },
  }
}
</script>
