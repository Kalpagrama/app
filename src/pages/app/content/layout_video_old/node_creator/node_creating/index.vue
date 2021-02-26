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
      span.text-white Ядро создается
    q-spinner(size="50px" color="white")
    .row.full-width.justify-center.q-py-sm
      q-btn(
        @click="isHidden = true"
        flat color="white" no-caps)
        span Продолжить в фоне
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
    node: {
      deep: true,
      handler (to, from) {
        this.$log('node TO', to.uploadStage, to.uploadStageProgress)
        if (to.uploadStage === 'COMPLETE' && to.uploadStageProgress === 100) {
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
                  this.$router.push(`/node/${to.oid}`)
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
